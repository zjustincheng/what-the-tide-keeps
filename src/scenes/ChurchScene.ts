import Phaser from 'phaser';
import { conversations } from '../content/church';
import { BattleView } from '../ui/BattleView';

type Direction = 'up' | 'down' | 'left' | 'right';
type Point = { name: string; x: number; y: number };
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export class ChurchScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private points: Point[] = [];
  private held = new Set<Direction>();
  private nearby?: Point;
  private active?: { speaker: string; lines: string[] };
  private line = 0;
  private cleanup = new AbortController();
  private spawn = { x: 88, y: 124 };
  private shadow!: Phaser.GameObjects.Ellipse;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private signature!: Phaser.GameObjects.Container;
  private battle?: BattleView;

  constructor() { super('church'); }

  preload() {
    this.load.svg('church-tiles', `${import.meta.env.BASE_URL}assets/church-tiles.svg`);
    this.load.tilemapTiledJSON('church-map', `${import.meta.env.BASE_URL}maps/church.json`);
    this.load.svg('locust', `${import.meta.env.BASE_URL}assets/locust.svg`);
  }

  create() {
    const map = this.make.tilemap({ key: 'church-map' });
    const tiles = map.addTilesetImage('church', 'church-tiles')!;
    map.createLayer('Floor', tiles);
    const furniture = map.createLayer('Furniture', tiles)!;
    furniture.setCollisionByProperty({ collides: true });
    this.points = map.getObjectLayer('Points')!.objects.map(p => ({ name: p.name, x: p.x!, y: p.y! }));
    this.spawn = this.points.find(p => p.name === 'spawn')!;
    this.createCharacters();
    this.shadow = this.add.ellipse(this.spawn.x, this.spawn.y + 3, 14, 6, 0x122b22, 0.6);
    this.player = this.physics.add.sprite(this.spawn.x, this.spawn.y, 'hero');
    this.player.setSize(9, 7).setOffset(5, 17).setCollideWorldBounds(true);
    this.physics.world.setBounds(32, 48, 448, 304);
    this.physics.add.collider(this.player, furniture);
    const priest = this.points.find(p => p.name === 'priest')!;
    this.add.ellipse(priest.x, priest.y + 4, 15, 6, 0x142a23, 0.6);
    const npc = this.physics.add.staticSprite(priest.x, priest.y, 'priest');
    npc.setSize(10, 8).setOffset(5, 16);
    this.physics.add.collider(this.player, npc);
    const encounter = this.points.find(p => p.name === 'encounter')!;
    this.enemy = this.physics.add.staticSprite(encounter.x, encounter.y, 'locust').setDepth(4);
    this.enemy.setSize(22, 20).setOffset(5, 8);
    const ring = this.add.ellipse(0, 4, 37, 20).setStrokeStyle(1, 0xd2b675, 0.7);
    const mana = this.add.text(0, -23, '◇ 2', { fontFamily: 'monospace', fontSize: '8px', color: '#dbc58b' }).setOrigin(0.5);
    this.signature = this.add.container(encounter.x, encounter.y, [ring, mana]).setDepth(5);
    this.tweens.add({ targets: ring, alpha: 0.35, duration: 1000, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.player, this.enemy, () => this.beginBattle());

    // Soft window light, hand placed in the same coordinates as the Tiled room.
    const light = this.add.graphics().setDepth(2);
    for (const x of [88,168,344,424]) {
      light.fillStyle(0xc2d1a0, 0.055);
      light.fillPoints([{ x:x-5,y:48 },{ x:x+6,y:48 },{ x:x+62,y:175 },{ x:x+24,y:175 }],true);
    }
    for (const [x,y] of [[200,88],[312,88],[88,72],[424,72],[200,296],[312,296]]) {
      const glow = this.add.circle(x,y,15,0xf6c77a,0.06).setDepth(3);
      this.tweens.add({targets:glow,alpha:0.035,duration:1100+(x%5)*130,yoyo:true,repeat:-1});
    }
    // Slow, deterministic dust motes avoid random changes to the playable map.
    for(let i=0;i<18;i++) {
      const mote=this.add.rectangle(70+(i*71)%370,65+(i*37)%240,1,1,0xd2d0a2,0.25).setDepth(5);
      this.tweens.add({targets:mote,y:mote.y-12,alpha:0.05,duration:3200+i*130,yoyo:true,repeat:-1});
    }
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT', false) as typeof this.keys;
    this.bindControls();
    this.cameras.main.fadeIn(650, 16, 27, 24);
    this.events.once('shutdown', () => {
      this.cleanup.abort();
      this.battle?.destroy();
      this.setExplorationEnabled(true);
      this.closeDialogue();
    });
  }

  private createCharacters() {
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
      if(this.battle) return;
      if(event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)) event.preventDefault();
      if(['e','E',' ','Enter'].includes(event.key)) this.interact(event);
      if(event.key==='Escape') this.closeDialogue();
    },{signal});
    element('continue').addEventListener('click',()=>this.interact(),{signal});
    element('touch-interact').addEventListener('click',()=>this.interact(),{signal});
    element('restart').addEventListener('click',()=>{
      if(this.battle) return;
      this.closeDialogue();this.held.clear();this.player.setVelocity(0);this.player.setPosition(this.spawn.x,this.spawn.y);
      const encounter = this.points.find(p => p.name === 'encounter')!;
      this.enemy.enableBody(true, encounter.x, encounter.y, true, true);
      this.signature.setVisible(true);
      element('game').focus({preventScroll:true});
    },{signal});
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>{
      const direction=button.dataset.direction as Direction;
      button.addEventListener('pointerdown',event=>{
        if(this.battle) return;
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
    if(this.battle) return;
    if(event?.repeat) return;
    // Let native buttons handle their own Enter/Space activation once.
    if(event && document.activeElement instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
    if(this.active) {
      this.line++;
      if(this.line>=this.active.lines.length) this.closeDialogue();
      else element('dialogue-text').textContent=this.active.lines[this.line];
    } else if(this.nearby) {
      this.active=conversations[this.nearby.name];this.line=0;
      element('speaker').textContent=this.active.speaker;
      element('dialogue-text').textContent=this.active.lines[0];
      element('dialogue').hidden=false;
      element('prompt').textContent='';
      this.player.setVelocity(0);
    }
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

  private beginBattle() {
    if(this.battle || this.active || !this.enemy.active) return;
    this.player.setVelocity(0);
    this.held.clear();
    this.input.keyboard?.resetKeys();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    this.battle = new BattleView(this.textures.getBase64('hero'), won => {
      this.battle = undefined;
      if(won) {
        this.enemy.disableBody(true, true);
        this.signature.setVisible(false);
      } else {
        this.player.setPosition(this.spawn.x, this.spawn.y);
      }
      this.held.clear();
      this.input.keyboard?.resetKeys();
      this.setExplorationEnabled(true);
      this.physics.resume();
      element('game').focus({preventScroll:true});
    });
  }

  update(time: number) {
    if(!this.player) return;
    if(this.battle) return;
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
    this.nearby=this.points.filter(p=>p.name in conversations)
      .find(p=>Phaser.Math.Distance.Between(this.player.x,this.player.y,p.x,p.y)<29);
    if(!this.active) element('prompt').textContent=this.nearby
      ? `E · ${this.nearby.name==='priest'?'Speak to the priest':this.nearby.name==='door'?'Look outside':'Examine '+this.nearby.name}` : '';
  }
}
