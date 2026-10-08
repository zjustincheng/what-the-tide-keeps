import Phaser from 'phaser';
import { conversation } from '../content/dialogue';
import { createBattle, enemyMana, ENEMIES } from '../rules/battle';
import type { Encounter } from '../rules/battle';
import { forget, held, hollow, MEMORY_IDS, wipe } from '../rules/memory';
import { loadMemory, saveMemory } from '../storage/memory';
import { BattleView } from '../ui/BattleView';
import { ResurrectionView } from '../ui/ResurrectionView';
import type { Area } from './areas';

type Direction = 'up' | 'down' | 'left' | 'right';
type Point = { name: string; x: number; y: number };
type Foe = { encounter: Encounter; sprite: Phaser.Physics.Arcade.Sprite; signature: Phaser.GameObjects.Container };
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
// Physics bodies sized to each enemy's drawn silhouette: width, height, x offset, y offset.
const BODY: Record<Encounter, [number, number, number, number]> = { locust: [22, 20, 5, 8], acolyte: [20, 20, 6, 9], weevil: [22, 16, 5, 10] };
// Whether the last save succeeded, shared by every area.
let saved = true;

// One explorable map: the church, a route, or a town. Areas differ only in their data.
export class AreaScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private points: Point[] = [];
  private held = new Set<Direction>();
  private nearby?: Point;
  private active?: { speaker: string; lines: string[] };
  private line = 0;
  private cleanup = new AbortController();
  private arrival = 'spawn';
  private leaving = false;
  private shadow!: Phaser.GameObjects.Ellipse;
  private foes: Foe[] = [];
  private overlay?: BattleView | ResurrectionView;

  constructor(private area: Area) { super(area.key); }

  init(data: { spawn?: string }) {
    // Scene instances are reused, so every visit starts from a clean slate.
    this.arrival = data?.spawn ?? 'spawn';
    this.cleanup = new AbortController();
    this.held = new Set(); this.foes = [];
    this.nearby = undefined; this.active = undefined; this.overlay = undefined; this.leaving = false;
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.svg(`${this.area.tileset}-tiles`, `${base}assets/${this.area.tileset}-tiles.svg`);
    this.load.tilemapTiledJSON(`${this.area.map}-map`, `${base}maps/${this.area.map}.json`);
    for (const { encounter } of this.area.enemies) if (!this.textures.exists(encounter)) this.load.svg(encounter, `${base}assets/${encounter}.svg`);
  }

  create() {
    const map = this.make.tilemap({ key: `${this.area.map}-map` });
    const tiles = map.addTilesetImage(this.area.tileset, `${this.area.tileset}-tiles`)!;
    map.createLayer('Floor', tiles);
    const furniture = map.createLayer('Furniture', tiles)!;
    furniture.setCollisionByProperty({ collides: true });
    this.points = map.getObjectLayer('Points')!.objects.map(p => ({ name: p.name, x: p.x!, y: p.y! }));
    const spawn = this.point(this.arrival);
    this.createCharacters();
    this.shadow = this.add.ellipse(spawn.x, spawn.y + 3, 14, 6, 0x122b22, 0.6);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'hero');
    this.player.setSize(9, 7).setOffset(5, 17).setCollideWorldBounds(true);
    this.physics.world.setBounds(...this.area.bounds);
    this.physics.add.collider(this.player, furniture);
    for (const { point, texture } of this.area.npcs) {
      const at = this.point(point);
      this.add.ellipse(at.x, at.y + 4, 15, 6, 0x142a23, 0.6);
      const npc = this.physics.add.staticSprite(at.x, at.y, texture);
      npc.setSize(10, 8).setOffset(5, 16);
      this.physics.add.collider(this.player, npc);
    }
    for (const { point, encounter } of this.area.enemies) this.createFoe(this.point(point), encounter);
    this.area.decorate?.(this);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT', false) as typeof this.keys;
    this.bindControls();
    element('location-region').textContent = this.area.region;
    element('location-place').textContent = `/ ${this.area.place}`;
    element('location-time').textContent = this.area.time;
    element('game').setAttribute('aria-label', `${this.area.place} map. Move with WASD or arrow keys. Press E or Space to interact.`);
    this.cameras.main.fadeIn(650, 16, 27, 24);
    this.renderMemory();
    // A wipe that was not yet paid for, such as one interrupted by a reload, is still owed.
    if (loadMemory().pending) this.wake();
    this.events.once('shutdown', () => {
      this.cleanup.abort();
      this.overlay?.destroy();
      this.setExplorationEnabled(true);
      this.closeDialogue();
    });
  }

  private point(name: string): Point {
    return this.points.find(p => p.name === name)!;
  }

  private createFoe(at: Point, encounter: Encounter) {
    const [width, height, x, y] = BODY[encounter];
    const sprite = this.physics.add.staticSprite(at.x, at.y, encounter).setDepth(4);
    sprite.setSize(width, height).setOffset(x, y);
    // Veiled mana reads as a faint, cool shimmer; open mana as a warm ring.
    const veiled = ENEMIES[encounter].veiled;
    const ring = this.add.ellipse(0, veiled ? 5 : 4, veiled ? 34 : 37, veiled ? 18 : 20).setStrokeStyle(1, veiled ? 0x9dbbb4 : 0xd2b675, veiled ? 0.65 : 0.7);
    const mana = this.add.text(0, veiled ? -24 : -23, `◇ ${enemyMana(createBattle(encounter))}`, { fontFamily: 'monospace', fontSize: '8px', color: veiled ? '#b7d3c7' : '#dbc58b' }).setOrigin(0.5);
    const signature = this.add.container(at.x, at.y, [ring, mana]).setDepth(5);
    this.tweens.add({ targets: ring, alpha: veiled ? 0.15 : 0.35, duration: veiled ? 1400 : 1000, yoyo: true, repeat: -1 });
    const foe = { encounter, sprite, signature };
    this.foes.push(foe);
    this.physics.add.overlap(this.player, sprite, () => this.beginBattle(foe));
  }

  private createCharacters() {
    if (this.textures.exists('hero')) return;
    const hero = this.make.graphics({ x:0, y:0 });
    const block=(x:number,y:number,w:number,h:number,c:number)=>hero.fillStyle(c).fillRect(x,y,w,h);
    // A curled tail, green crest, pale eye and the branded convict's cloak.
    block(1,16,7,5,0x688a54);block(0,13,3,6,0x688a54);block(2,13,3,2,0x9bad64);
    block(7,19,3,5,0x35382d);block(13,19,3,5,0x35382d);
    block(5,10,12,11,0x6e644b);block(7,11,8,9,0xa19766);block(6,18,10,3,0x827653);
    block(7,3,10,9,0x88a567);block(9,1,6,3,0x9aaf6e);block(15,6,4,5,0x88a567);
    block(13,4,4,4,0xd7d1a0);block(15,5,2,2,0x213b2e);block(10,12,3,3,0x513a2b);block(11,12,1,3,0xd1a470);
    hero.generateTexture('hero',20,26);hero.destroy();
    const priest=this.make.graphics({x:0,y:0});
    priest.fillStyle(0x27382e).fillRect(3,21,14,3);
    priest.fillStyle(0x889080).fillRect(4,10,12,13);
    priest.fillStyle(0xb8b69b).fillRect(7,10,6,13);
    priest.fillStyle(0xc3b28a).fillRect(8,12,4,3);
    priest.fillStyle(0x978f78).fillRect(5,3,11,9).fillRect(4,0,3,6).fillRect(14,0,3,6);
    priest.fillStyle(0xd0c3a0).fillRect(7,5,7,7);
    priest.fillStyle(0x2b3b31).fillRect(8,6,1,2).fillRect(12,6,1,2);
    priest.generateTexture('priest',20,26);priest.destroy();
  }

  private bindControls() {
    const signal=this.cleanup.signal;
    window.addEventListener('keydown',event=>{
      if(this.overlay) return;
      if(event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)) event.preventDefault();
      if(['e','E',' ','Enter'].includes(event.key)) this.interact(event);
      if(event.key==='Escape') this.closeDialogue();
    },{signal});
    element('continue').addEventListener('click',()=>this.interact(),{signal});
    element('touch-interact').addEventListener('click',()=>this.interact(),{signal});
    // Returning to the cot always restarts the church, which also resets its encounters.
    element('restart').addEventListener('click',()=>{
      if(this.overlay) return;
      this.scene.start('church');
      element('game').focus({preventScroll:true});
    },{signal});
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>{
      const direction=button.dataset.direction as Direction;
      button.addEventListener('pointerdown',event=>{
        if(this.overlay) return;
        event.preventDefault();button.setPointerCapture(event.pointerId);this.held.add(direction);
      },{signal});
      const release=()=>this.held.delete(direction);
      button.addEventListener('pointerup',release,{signal});
      button.addEventListener('pointercancel',release,{signal});
      button.addEventListener('lostpointercapture',release,{signal});
    });
    window.addEventListener('blur',()=>{this.held.clear();this.input.keyboard?.resetKeys();this.player.setVelocity(0);},{signal});
  }

  private interact(event?: KeyboardEvent) {
    if(this.overlay || this.leaving) return;
    if(event?.repeat) return;
    // Let native buttons handle their own Enter/Space activation once.
    if(event && document.activeElement instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
    if(this.active) {
      this.line++;
      if(this.line>=this.active.lines.length) this.closeDialogue();
      else element('dialogue-text').textContent=this.active.lines[this.line];
    } else if(this.nearby && this.nearby.name in this.area.exits) {
      this.travel(this.area.exits[this.nearby.name]);
    } else if(this.nearby) {
      this.active=conversation(this.area.dialogue, this.nearby.name, loadMemory().lost);this.line=0;
      element('speaker').textContent=this.active.speaker;
      element('dialogue-text').textContent=this.active.lines[0];
      element('dialogue').hidden=false;
      element('prompt').textContent='';
      this.player.setVelocity(0);
    }
  }

  private travel({ to, spawn }: { to: string; spawn: string }) {
    this.leaving = true;
    this.player.setVelocity(0);
    element('prompt').textContent = '';
    this.cameras.main.fadeOut(250, 16, 27, 24);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(to, { spawn }));
  }

  private closeDialogue() {
    this.active=undefined;element('dialogue').hidden=true;
  }

  private setExplorationEnabled(enabled: boolean) {
    document.querySelector('.game-frame')!.classList.toggle('in-battle', !enabled);
    element('game').inert = !enabled;
    element('dialogue').inert = !enabled;
    element('restart').inert = !enabled;
    document.querySelector<HTMLElement>('.touch-controls')!.inert = !enabled;
    if(this.input.keyboard) this.input.keyboard.enabled = enabled;
  }

  private beginBattle(foe: Foe) {
    if(this.overlay || this.active || this.leaving || !foe.sprite.active) return;
    this.player.setVelocity(0);
    this.held.clear();
    this.input.keyboard?.resetKeys();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    this.overlay = new BattleView(this.textures.getBase64('hero'), won => {
      this.overlay = undefined;
      if(won) {
        foe.sprite.disableBody(true, true);
        foe.signature.setVisible(false);
        this.resumeExploration();
      } else {
        // Every wipe wakes the party at the church, wherever it fell.
        saved = saveMemory(wipe(loadMemory()));
        this.scene.start('church');
      }
    }, foe.encounter, hollow(loadMemory()));
  }

  private wake() {
    this.player.setVelocity(0);
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    this.overlay = new ResurrectionView(loadMemory(), id => {
      this.overlay?.destroy();
      this.overlay = undefined;
      saved = saveMemory(forget(loadMemory(), id));
      this.renderMemory();
      this.cameras.main.fadeIn(900, 16, 27, 24);
      this.resumeExploration();
    });
  }

  private renderMemory() {
    element('memory-status').textContent = `Some things are already missing · ${held(loadMemory()).length} of ${MEMORY_IDS.length} memories remain${saved ? '' : ' · not saved'}`;
  }

  private resumeExploration() {
    this.held.clear();
    this.input.keyboard?.resetKeys();
    this.setExplorationEnabled(true);
    this.physics.resume();
    element('game').focus({preventScroll:true});
  }

  update(time: number) {
    if(!this.player) return;
    if(this.overlay || this.leaving) { this.player.setVelocity(0); return; }
    const pressed=(direction:Direction,...keys:string[])=>this.held.has(direction)||keys.some(key=>this.keys[key].isDown);
    let x=Number(pressed('right','D','RIGHT'))-Number(pressed('left','A','LEFT'));
    let y=Number(pressed('down','S','DOWN'))-Number(pressed('up','W','UP'));
    if(this.active){x=0;y=0;}
    const motion=new Phaser.Math.Vector2(x,y).normalize().scale(70);
    this.player.setVelocity(motion.x,motion.y);
    if(x) this.player.setFlipX(x<0);
    this.player.setDepth(4);
    this.shadow.setPosition(this.player.x,this.player.y+9);
    // A restrained walking bob, while the physics body stays steady.
    this.player.setOrigin(0.5,0.5+(x||y?Math.sin(time/85)*0.025:0));
    this.nearby=this.points.filter(p=>p.name in this.area.dialogue || p.name in this.area.exits)
      .find(p=>Phaser.Math.Distance.Between(this.player.x,this.player.y,p.x,p.y)<29);
    if(!this.active) element('prompt').textContent=this.nearby
      ? `E · ${this.area.exits[this.nearby.name]?.prompt ?? this.area.dialogue[this.nearby.name].prompt ?? 'Examine '+this.nearby.name}` : '';
  }
}
