import Phaser from 'phaser';
import { createBattle, enemyMana, ENEMIES } from '../rules/battle';
import type { Encounter } from '../rules/battle';
import { forget, held, hollow, MEMORY_IDS, wipe } from '../rules/memory';
import { apply, conversation, drop, holds } from '../rules/world';
import type { Condition, Context, Effect } from '../rules/world';
import type { Conversation } from '../content/dialogue';
import { loadGrimoire, saveGrimoire } from '../storage/grimoire';
import { loadMemory, saveMemory } from '../storage/memory';
import { loadWorld, saveWorld } from '../storage/world';
import { BattleView } from '../ui/BattleView';
import { ResurrectionView } from '../ui/ResurrectionView';
import type { Area } from './areas';
import { createSprites } from './sprites';

type Direction = 'up' | 'down' | 'left' | 'right';
type Point = { name: string; x: number; y: number };
type Prop = { sprite: Phaser.Physics.Arcade.Sprite; hiddenIf: Condition[] };
type Foe = { encounter: Encounter; defeat?: Effect; sprite: Phaser.Physics.Arcade.Sprite; signature: Phaser.GameObjects.Container };
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
// Physics bodies sized to each enemy's drawn silhouette: width, height, x offset, y offset.
const BODY: Record<Encounter, [number, number, number, number]> = { locust: [22, 20, 5, 8], acolyte: [20, 20, 6, 9], weevil: [22, 16, 5, 10], boar: [30, 22, 5, 10] };
// Whether the last save succeeded, shared by every area.
let saved = true;

// One explorable map: the church, a route, or a town. Areas differ only in their data.
export class AreaScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private points: Point[] = [];
  private held = new Set<Direction>();
  private nearby?: Point;
  private active?: Conversation;
  private line = 0;
  private cleanup = new AbortController();
  private arrival = 'spawn';
  private leaving = false;
  private shadow!: Phaser.GameObjects.Ellipse;
  private foes: Foe[] = [];
  private props: Prop[] = [];
  private overlay?: BattleView | ResurrectionView;

  constructor(private area: Area) { super(area.key); }

  init(data: { spawn?: string }) {
    // Scene instances are reused, so every visit starts from a clean slate.
    this.arrival = data?.spawn ?? 'spawn';
    this.cleanup = new AbortController();
    this.held = new Set(); this.foes = []; this.props = [];
    this.nearby = undefined; this.active = undefined; this.overlay = undefined; this.leaving = false;
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.svg(`${this.area.tileset}-tiles`, `${base}assets/${this.area.tileset}-tiles.svg`);
    this.load.tilemapTiledJSON(`${this.area.map}-map`, `${base}maps/${this.area.map}.json`);
    for (const key of [...this.area.enemies.map(enemy => enemy.encounter), ...this.area.assets ?? []]) if (!this.textures.exists(key)) this.load.svg(key, `${base}assets/${key}.svg`);
  }

  create() {
    const map = this.make.tilemap({ key: `${this.area.map}-map` });
    const tiles = map.addTilesetImage(this.area.tileset, `${this.area.tileset}-tiles`)!;
    map.createLayer('Floor', tiles);
    const furniture = map.createLayer('Furniture', tiles)!;
    furniture.setCollisionByProperty({ collides: true });
    this.points = map.getObjectLayer('Points')!.objects.map(p => ({ name: p.name, x: p.x!, y: p.y! }));
    const spawn = this.point(this.arrival);
    createSprites(this);
    this.shadow = this.add.ellipse(spawn.x, spawn.y + 3, 14, 6, 0x122b22, 0.6);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'hero');
    this.player.setSize(9, 7).setOffset(5, 17).setCollideWorldBounds(true);
    this.physics.world.setBounds(...this.area.bounds ?? [0, 0, map.widthInPixels, map.heightInPixels]);
    // Maps larger than the view scroll with the hero.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels).startFollow(this.player, true, 0.15, 0.15);
    this.physics.add.collider(this.player, furniture);
    for (const { point, texture } of this.area.npcs) {
      const at = this.point(point);
      this.add.ellipse(at.x, at.y + 4, 15, 6, 0x142a23, 0.6);
      const npc = this.physics.add.staticSprite(at.x, at.y, texture);
      npc.setSize(10, 8).setOffset(5, 16);
      this.physics.add.collider(this.player, npc);
    }
    const context = this.context();
    for (const enemy of this.area.enemies) if (!enemy.hiddenIf?.some(condition => holds(context, condition))) this.createFoe(this.point(enemy.point), enemy);
    for (const { point, texture, solid, hiddenIf } of this.area.props ?? []) {
      const at = this.point(point);
      const sprite = solid ? this.physics.add.staticSprite(at.x, at.y, texture) : this.physics.add.sprite(at.x, at.y, texture);
      if (solid) this.physics.add.collider(this.player, sprite);
      // Loose things glint so they can be found without a marker.
      else this.tweens.add({ targets: sprite, alpha: 0.55, duration: 900, yoyo: true, repeat: -1 });
      sprite.setDepth(3);
      this.props.push({ sprite, hiddenIf });
    }
    this.refreshProps(true);
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

  private context(): Context {
    return { world: loadWorld(), lost: loadMemory().lost, studied: loadGrimoire() };
  }

  // Props follow story state: brambles that let go, a bell already picked up, a cup left behind.
  private refreshProps(instant = false) {
    const context = this.context();
    for (const { sprite, hiddenIf } of this.props) {
      const hidden = hiddenIf.some(condition => holds(context, condition));
      if (hidden && sprite.active) {
        sprite.disableBody(true, false);
        if (instant) sprite.setVisible(false);
        else this.tweens.add({ targets: sprite, alpha: 0, scale: 0.6, duration: 700, delay: 300, onComplete: () => sprite.setVisible(false) });
      } else if (!hidden && !sprite.active) {
        sprite.enableBody(false, 0, 0, true, true);
        if (!instant) this.tweens.add({ targets: sprite, alpha: { from: 0, to: 1 }, duration: 700 });
      }
    }
  }

  private point(name: string): Point {
    return this.points.find(p => p.name === name)!;
  }

  private createFoe(at: Point, { encounter, defeat }: Area['enemies'][number]) {
    const [width, height, x, y] = BODY[encounter];
    const sprite = this.physics.add.staticSprite(at.x, at.y, encounter).setDepth(4);
    sprite.setSize(width, height).setOffset(x, y);
    // Veiled mana reads as a faint, cool shimmer; open mana as a warm ring.
    const veiled = ENEMIES[encounter].veiled;
    const ring = this.add.ellipse(0, veiled ? 5 : 4, veiled ? 34 : 37, veiled ? 18 : 20).setStrokeStyle(1, veiled ? 0x9dbbb4 : 0xd2b675, veiled ? 0.65 : 0.7);
    const mana = this.add.text(0, veiled ? -24 : -23, `◇ ${enemyMana(createBattle(encounter))}`, { fontFamily: 'monospace', fontSize: '8px', color: veiled ? '#b7d3c7' : '#dbc58b' }).setOrigin(0.5);
    const signature = this.add.container(at.x, at.y, [ring, mana]).setDepth(5);
    this.tweens.add({ targets: ring, alpha: veiled ? 0.15 : 0.35, duration: veiled ? 1400 : 1000, yoyo: true, repeat: -1 });
    const foe = { encounter, sprite, signature, defeat };
    this.foes.push(foe);
    this.physics.add.overlap(this.player, sprite, () => this.beginBattle(foe));
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
      const context=this.context();
      this.active=conversation(this.area.dialogue, this.nearby.name, context);this.line=0;
      // Effects land as the conversation opens, so closing it early never loses them.
      if(this.active.then) {
        const next=apply(context, this.active.then);
        saved=saveWorld(next.world)&&saveGrimoire(next.studied);
        this.refreshProps();
      }
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
        if(foe.defeat) {
          const next=apply(this.context(), foe.defeat);
          saved=saveWorld(next.world);
          this.refreshProps();
        }
        this.resumeExploration();
      } else {
        // Every wipe wakes the party at the church, wherever it fell.
        saved = saveMemory(wipe(loadMemory())) && saveWorld(drop(loadWorld()));
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
    const context=this.context();
    this.nearby=this.points.filter(p=>p.name in this.area.exits || (p.name in this.area.dialogue
      && !this.area.dialogue[p.name].hiddenIf?.some(condition=>holds(context, condition))))
      .find(p=>Phaser.Math.Distance.Between(this.player.x,this.player.y,p.x,p.y)<29);
    if(!this.active) element('prompt').textContent=this.nearby
      ? `E · ${this.area.exits[this.nearby.name]?.prompt ?? this.area.dialogue[this.nearby.name].prompt ?? 'Examine '+this.nearby.name}` : '';
  }
}
