import Phaser from 'phaser';
import { createBattle, drainedAfter, enemyMana, ENEMIES, MEMBERS, woundsAfter } from '../rules/battle';
import type { BattleOptions } from '../rules/battle';
import type { Encounter } from '../rules/battle';
import { anchor, forget, held, hollow, MEMORY_IDS, wipe } from '../rules/memory';
import { apply, conversation, drop, fill, fleeing, holds, replies, rest, roster } from '../rules/world';
import type { Condition, Context, Effect, ShopId } from '../rules/world';
import type { Choice, Conversation } from '../content/dialogue';
import { loadGrimoire, saveGrimoire } from '../storage/grimoire';
import { loadMemory, saveMemory } from '../storage/memory';
import { loadWorld, saveWorld } from '../storage/world';
import { BattleView } from '../ui/BattleView';
import { ResurrectionView } from '../ui/ResurrectionView';
import { AnchorView } from '../ui/AnchorView';
import { EquipmentView } from '../ui/EquipmentView';
import { ShopView } from '../ui/ShopView';
import { FishingView } from '../ui/FishingView';
import { SettingsView } from '../ui/SettingsView';
import { addCatch, SPOTS } from '../rules/fishing';
import type { SpotId } from '../rules/fishing';
import { SHOPS } from '../content/shops';
import { BOUNTY } from '../rules/economy';
import { loadGear, saveGear } from '../storage/gear';
import { loadBooks, saveBooks } from '../storage/books';
import { loadSettings, saveSettings } from '../storage/settings';
import type { Area } from './areas';
import { music } from '../audio/music';
import type { Surface } from '../audio/effects';
import { battleTheme } from '../audio/themes';
import { reclaim, settle } from '../rules/spells';
import { createSprites } from './sprites';

type Direction = 'up' | 'down' | 'left' | 'right';
type Point = { name: string; x: number; y: number };
type Prop = { sprite: Phaser.Physics.Arcade.Sprite; hiddenIf: Condition[]; shadow?: Phaser.GameObjects.Ellipse };
type Foe = { encounter: Encounter; defeat?: Effect; fledAt?: number; ambush?: boolean; hidden?: boolean; sprite: Phaser.Physics.Arcade.Sprite; signature: Phaser.GameObjects.Container;
  home: { x: number; y: number }; phase: number; point: string };
// Ordinary enemies come after the hero once he is in sight, a little slower than he walks; bosses and guardians hold their ground.
// sight and speed are in pixels and pixels per second. The hero walks at 70.
const CHASE: Partial<Record<Encounter, { sight: number; speed: number }>> = {
  locust: { sight: 90, speed: 44 }, weevil: { sight: 80, speed: 36 }, acolyte: { sight: 96, speed: 40 }, hound: { sight: 120, speed: 58 },
  wisp: { sight: 100, speed: 50 }, raider: { sight: 110, speed: 52 }, ghoul: { sight: 90, speed: 34 }, inquisitor: { sight: 170, speed: 40 },
};
// How far a chaser will follow from where it stands before giving up and going back.
const LEASH = 200;
// Creatures that breathe on the map even though they are only props.
const BREATHING = new Set(['sheep', 'badger', 'rat', 'hyena']);
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
// Physics bodies sized to each enemy's drawn silhouette: width, height, x offset, y offset.
const BODY: Record<Encounter, [number, number, number, number]> = { locust: [22, 20, 5, 8], acolyte: [20, 20, 6, 9], weevil: [22, 16, 5, 10], boar: [30, 22, 5, 10], swarm: [30, 24, 9, 8], warden: [22, 26, 5, 4], leech: [28, 24, 2, 4], hound: [24, 16, 4, 12], pack: [26, 18, 3, 12], wisp: [14, 14, 9, 9], drowned: [20, 26, 6, 4],
  raider: [20, 20, 6, 9], ghoul: [20, 22, 6, 7], vulture: [22, 22, 5, 8], pair: [22, 22, 5, 8], hyena: [24, 20, 4, 10], inquisitor: [22, 26, 5, 4] };
// Whether the last save succeeded, shared by every area.
let saved = true;
// The way out of a conversation, offered whenever the hero comes back to the replies.
const LEAVE: Choice = { text: 'Leave.', lines: [], ends: true };
// Speaker portraits, cut once from each sprite.
const PORTRAITS = new Map<string, string>();

// One explorable map: the church, a route, or a town. Areas differ only in their data.
export class AreaScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private points: Point[] = [];
  private held = new Set<Direction>();
  private nearby?: Point;
  private active?: Conversation;
  private line = 0;
  private portraitKey?: string;
  private blips: ReturnType<typeof setTimeout>[] = [];
  // The ground under the hero's feet.
  surface(): Surface {
    const tile=this.floor.getTileAtWorldXY(this.player.x, this.player.y+8);
    return (tile && this.area.surfaces?.[tile.index]) ?? this.area.ground;
  }
  private lastStep = 0;
  private floor!: Phaser.Tilemaps.TilemapLayer;
  private foot = 1;
  // Replies on offer under the speaker's last line.
  private options: Choice[] = [];
  // The replies to return to after an answer, and what has been asked in this conversation.
  private menu?: Choice[];
  private returning = false;
  private asked = new Set<string>();
  private talked = new Set<string>();
  private cleanup = new AbortController();
  private arrival = 'spawn';
  private leaving = false;
  private shadow!: Phaser.GameObjects.Ellipse;
  private foes: Foe[] = [];
  private props: Prop[] = [];
  private people: Phaser.Physics.Arcade.Sprite[] = [];
  private walls!: Phaser.Tilemaps.TilemapLayer;
  private overlay?: BattleView | ResurrectionView | AnchorView | EquipmentView | ShopView | FishingView | SettingsView;
  // A shop to open once the current conversation ends.
  private pendingShop?: ShopId;
  // A campfire to rest at once the current conversation ends.
  private pendingRest?: string;
  private pendingFight?: Foe;

  constructor(private area: Area) { super(area.key); }

  init(data: { spawn?: string }) {
    // Scene instances are reused, so every visit starts from a clean slate.
    this.arrival = data?.spawn ?? 'spawn';
    this.cleanup = new AbortController();
    this.held = new Set(); this.foes = []; this.props = []; this.people = []; this.asked = new Set(); this.talked = new Set();
    this.nearby = undefined; this.active = undefined; this.overlay = undefined; this.leaving = false; this.pendingShop = undefined; this.pendingRest = undefined; this.pendingFight = undefined;
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.svg(`${this.area.tileset}-tiles`, `${base}assets/${this.area.tileset}-tiles.svg`);
    this.load.tilemapTiledJSON(`${this.area.map}-map`, `${base}maps/${this.area.map}.json`);
    // Companions' art is needed everywhere, for their portraits in the health display.
    for (const key of [...this.area.enemies.map(enemy => enemy.encounter), ...this.area.assets ?? [], 'bear', 'vulture']) if (!this.textures.exists(key)) this.load.svg(key, `${base}assets/${key}.svg`);
  }

  create() {
    const map = this.make.tilemap({ key: `${this.area.map}-map` });
    const tiles = map.addTilesetImage(this.area.tileset, `${this.area.tileset}-tiles`)!;
    this.floor = map.createLayer('Floor', tiles)!;
    const furniture = map.createLayer('Furniture', tiles)!;
    furniture.setCollisionByProperty({ collides: true });
    this.walls = furniture;
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
    for (const { point, texture, hiddenIf = [] } of this.area.npcs) {
      const at = this.point(point);
      const shadow = this.add.ellipse(at.x, at.y + 4, 15, 6, 0x142a23, 0.6);
      const npc = this.physics.add.staticSprite(at.x, at.y, texture);
      npc.setSize(10, 8).setOffset(5, 16);
      this.physics.add.collider(this.player, npc);
      // People breathe, each at their own pace, and look at the hero as he passes.
      this.breathe(npc);
      this.people.push(npc);
      // People who can leave, like a freed companion, come and go with story state.
      this.props.push({ sprite: npc, hiddenIf, shadow });
    }
    const context = this.context();
    this.refreshFoes(context);
    for (const { point, texture, solid, hiddenIf } of this.area.props ?? []) {
      const at = this.point(point);
      const sprite = solid ? this.physics.add.staticSprite(at.x, at.y, texture) : this.physics.add.sprite(at.x, at.y, texture);
      if (solid) this.physics.add.collider(this.player, sprite);
      // Loose things glint so they can be found without a marker.
      else this.tweens.add({ targets: sprite, alpha: 0.55, duration: 900, yoyo: true, repeat: -1 });
      if (BREATHING.has(texture)) this.breathe(sprite);
      sprite.setDepth(3);
      this.props.push({ sprite, hiddenIf });
    }
    this.refreshProps(true);
    this.area.decorate?.(this);
    this.grade();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT', false) as typeof this.keys;
    this.bindControls();
    element('location-region').textContent = this.area.region;
    element('location-place').textContent = `/ ${this.area.place}`;
    element('location-time').textContent = this.area.time;
    element('game').setAttribute('aria-label', `${this.area.place} map. Move with WASD or arrow keys. Press E or Space to interact.`);
    this.cameras.main.fadeIn(650, 16, 27, 24);
    music.play(this.area.music);
    this.renderMemory();
    // A wipe that was not yet paid for, such as one interrupted by a reload, is still owed.
    if (loadMemory().pending) this.wake();
    this.events.once('shutdown', () => {
      this.pendingShop = undefined; this.pendingRest = undefined;
      this.cleanup.abort();
      this.overlay?.destroy();
      this.setExplorationEnabled(true);
      this.closeDialogue();
    });
  }

  // The world is drained and cold: a desaturating, darkening grade with a heavy vignette.
  // Without WebGL, a dark wash over the view stands in for it.
  private grade() {
    const { saturation = -0.5, brightness = 0.72, vignette = 0.45 } = this.area.grade ?? {};
    const camera = this.cameras.main;
    if (this.renderer.type === Phaser.WEBGL && camera.postFX) {
      const color = camera.postFX.addColorMatrix();
      color.saturate(saturation);
      color.brightness(brightness, true);
      camera.postFX.addVignette(0.5, 0.5, 0.82, vignette);
    } else {
      this.add.rectangle(0, 0, camera.width, camera.height, 0x05090a, 0.38).setOrigin(0).setScrollFactor(0).setDepth(50);
    }
  }

  private context(): Context {
    return { world: loadWorld(), lost: loadMemory().lost, studied: loadGrimoire() };
  }

  // Props follow story state: brambles that let go, a bell already picked up, a cup left behind.
  private refreshProps(instant = false) {
    const context = this.context();
    for (const { sprite, hiddenIf, shadow } of this.props) {
      const hidden = hiddenIf.some(condition => holds(context, condition));
      shadow?.setVisible(!hidden);
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

  // A slow rise and fall, staggered so a crowd doesn't breathe in step.
  private breathe(sprite: Phaser.GameObjects.Sprite) {
    this.tweens.add({ targets: sprite, scaleY: 1.04, scaleX: 0.985, duration: 1300 + (this.people.length * 173) % 700, delay: (sprite.x * 7) % 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private point(name: string): Point {
    return this.points.find(p => p.name === name)!;
  }

  // Enemies the story now allows, such as a boss the hero has just challenged, step out; each point holds one.
  // One that steps out mid-visit, right beside the hero, starts its fight as soon as the conversation ends.
  private refreshFoes(context = this.context(), midVisit = false) {
    for (const enemy of this.area.enemies)
      if (!this.foes.some(foe => foe.point === enemy.point) && !enemy.hiddenIf?.some(condition => holds(context, condition))) {
        this.createFoe(this.point(enemy.point), enemy);
        const foe = this.foes[this.foes.length - 1];
        if (midVisit && Phaser.Math.Distance.Between(this.player.x, this.player.y, foe.sprite.x, foe.sprite.y) < 80) this.pendingFight = foe;
      }
  }

  private createFoe(at: Point, { encounter, defeat, ambush, point }: Area['enemies'][number]) {
    const [width, height, x, y] = BODY[encounter];
    // Chasers move, so they need a body that collides with the walls; the rest stand where they are.
    const sprite = (CHASE[encounter] ? this.physics.add.sprite(at.x, at.y, encounter) : this.physics.add.staticSprite(at.x, at.y, encounter)).setDepth(4);
    sprite.setSize(width, height).setOffset(x, y);
    if (CHASE[encounter]) { sprite.setImmovable(true).setCollideWorldBounds(true); this.physics.add.collider(sprite, this.walls); }
    // Veiled mana reads as a faint, cool shimmer; open mana as a warm ring.
    const veiled = ENEMIES[encounter].veiled;
    const ring = this.add.ellipse(0, veiled ? 5 : 4, veiled ? 34 : 37, veiled ? 18 : 20).setStrokeStyle(1, veiled ? 0x9dbbb4 : 0xd2b675, veiled ? 0.65 : 0.7);
    const mana = this.add.text(0, veiled ? -24 : -23, `◇ ${enemyMana(createBattle(encounter))}`, { fontFamily: 'monospace', fontSize: '8px', color: veiled ? '#b7d3c7' : '#dbc58b' }).setOrigin(0.5);
    const signature = this.add.container(at.x, at.y, [ring, mana]).setDepth(5);
    this.tweens.add({ targets: ring, alpha: veiled ? 0.15 : 0.35, duration: veiled ? 1400 : 1000, yoyo: true, repeat: -1 });
    const foe: Foe = { encounter, sprite, signature, defeat, ambush, home: { x: at.x, y: at.y }, phase: this.foes.length * 1.7, point };
    this.foes.push(foe);
    this.physics.add.overlap(this.player, sprite, () => this.beginBattle(foe));
  }

  private bindControls() {
    const signal=this.cleanup.signal;
    window.addEventListener('keydown',event=>{
      // Keys pressed inside a panel belong to it, even once that press has closed it.
      if(this.overlay || (event.target instanceof Element && event.target.closest('.battle'))) return;
      if(event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)) event.preventDefault();
      if(['e','E',' ','Enter'].includes(event.key)) this.interact(event);
      if(['h','H'].includes(event.key) && !event.repeat && !this.active) this.toggleHud();
      // Number keys pick a reply.
      const pick=this.options[Number(event.key)-1];
      if(this.active && pick && !event.repeat) { event.preventDefault(); this.choose(pick); }
      // Escape closes a conversation; with none open, it opens settings.
      if(event.key==='Escape') { if(this.active) this.closeDialogue(); else if(!event.repeat) this.openSettings(); }
      // Tab opens equipment only from the map, so it still moves focus everywhere else on the page.
      const onMap=[element('game'),document.body].includes(document.activeElement as HTMLElement);
      if(event.key==='Tab' && !event.shiftKey && onMap && !this.active && !event.repeat) { event.preventDefault(); this.openEquipment(); }
    },{signal});
    element('settings').addEventListener('click',()=>this.openSettings(),{signal});
    element('hud').addEventListener('click',event=>{ if((event.target as Element).closest('.hud-toggle')) this.toggleHud(); },{signal});
    element('continue').addEventListener('click',()=>this.interact(),{signal});
    element('touch-interact').addEventListener('click',()=>this.interact(),{signal});
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
      // With replies on offer, the hero must choose one; Escape still walks away.
      if(this.options.length) return;
      this.line++;
      if(this.line>=this.active.lines.length) this.closeDialogue();
      else this.showLine();
    } else if(this.nearby && this.area.camps?.[this.nearby.name]) {
      // Resting is told like a conversation; the rest itself, and paying for it, happen when it ends.
      const camp=this.area.camps[this.nearby.name];
      const coins=loadWorld().coins;
      if(camp.cost && coins<camp.cost) this.say({ speaker: 'REST', lines: [`Wood and a place by the fire cost ${camp.cost} coins. You have ${coins}.`] }, 'hero');
      else {
        this.pendingRest=this.nearby.name;
        this.say({ speaker: 'REST', lines: [...(camp.cost ? [`You pay ${camp.cost} coins for wood and a place by the fire.`] : []), ...camp.lines] }, 'hero');
      }
      element('prompt').textContent='';
      this.player.setVelocity(0);
    } else if(this.nearby && this.area.fishing?.[this.nearby.name]) {
      this.openFishing(this.area.fishing[this.nearby.name]);
    } else if(this.nearby && this.nearby.name in this.area.exits) {
      const exit=this.area.exits[this.nearby.name];
      // A barred way is explained instead of taken.
      if(exit.requires && !holds(this.context(), exit.requires)) this.say({ speaker: exit.barred?.speaker ?? 'THE WAY', lines: exit.barred?.lines ?? ['It will not open.'] }, undefined);
      else this.travel(exit, /door|out/.test(this.nearby.name));
    } else if(this.nearby) {
      const said=conversation(this.area.dialogue, this.nearby.name, this.context());
      const point=this.nearby.name;
      const portrait=this.area.dialogue[point].portrait ?? this.area.npcs.find(npc=>npc.point===point)?.texture;
      // Someone already spoken to this visit goes straight to the replies, rather than saying it all again.
      const again=this.talked.has(point) && replies(said.choices, this.context()).length>0 && (!said.then || Object.keys(said.then).every(key=>key==='shop'));
      this.talked.add(point);
      // Dimming only marks what was asked in this conversation; talking again starts fresh.
      this.asked.clear();
      // Effects land as the conversation opens, so closing it early never loses them.
      this.effect(said.then);
      this.say(again ? { ...said, lines: ['Was there something else?'] } : said, portrait, again);
      element('prompt').textContent='';
      this.player.setVelocity(0);
    }
  }

  // Speak with a portrait in its own box above the text, as in Omori; objects and places show only a name.
  private say(conversation: Conversation, portrait=this.portraitKey, returning=false) {
    this.active=conversation;this.line=0;this.portraitKey=portrait;this.returning=returning;
    element('speaker').textContent=conversation.speaker;
    const frame=element('portrait');
    frame.hidden=!portrait;
    element('dialogue').classList.toggle('with-portrait',Boolean(portrait));
    if(portrait) (frame.querySelector('img') as HTMLImageElement).src=this.portrait(portrait);
    element('dialogue').hidden=false;
    this.showLine();
  }

  // Show the current line; under the last one, offer whatever replies the hero can still give.
  private showLine() {
    const active=this.active!;
    const text=fill(active.lines[this.line], this.context());
    element('dialogue-text').textContent=text;
    this.speak(text);
    this.options=this.line===active.lines.length-1 ? replies(active.choices, this.context()) : [];
    if(this.options.length) {
      if(!this.returning || !this.menu) this.menu=active.choices;
      // Coming back to the replies always offers a way out.
      if(this.returning && !this.options.some(option=>option.ends)) this.options=[...this.options, LEAVE];
    }
    const box=element('choices');
    box.replaceChildren(...this.options.map((option,index)=>{
      const button=document.createElement('button');
      button.type='button';button.textContent=`${index+1}. ${option.text}`;
      // Questions already asked this visit are dimmed, not removed.
      if(this.asked.has(`${active.speaker}:${option.text}`)) button.dataset.asked='true';
      button.addEventListener('click',()=>this.choose(option));
      return button;
    }));
    box.hidden=!this.options.length;
    element('continue').hidden=this.options.length>0;
    (box.querySelector('button') as HTMLButtonElement|null)?.focus({preventScroll:true});
  }

  // A bust cut from the sprite: the head and shoulders, scaled up with hard pixels. Cached per texture.
  private portrait(key: string): string {
    const cached=PORTRAITS.get(key);
    if(cached) return cached;
    const source=this.textures.get(key).getSourceImage() as CanvasImageSource & { width: number; height: number };
    const width=source.width, height=Math.round(source.height*0.6);
    const scale=Math.max(1,Math.floor(96/width));
    const canvas=document.createElement('canvas');
    canvas.width=width*scale;canvas.height=height*scale;
    const context=canvas.getContext('2d')!;
    context.imageSmoothingEnabled=false;
    context.drawImage(source,0,0,width,height,0,0,canvas.width,canvas.height);
    const url=canvas.toDataURL();
    PORTRAITS.set(key,url);
    return url;
  }

  private choose(option: Choice) {
    music.effect('select');
    this.effect(option.then);
    if(!option.lines.length) { this.closeDialogue(); return; }
    this.asked.add(`${this.active!.speaker}:${option.text}`);
    // After an answer, the hero can ask something else from the same replies, unless this one ends it.
    const back=option.choices ?? (option.ends ? undefined : this.menu);
    this.say({ speaker: this.active!.speaker, lines: option.lines, choices: back }, this.portraitKey, Boolean(back && !option.choices));
  }

  private effect(then?: Effect) {
    if(!then) return;
    if(then.shop) this.pendingShop=then.shop;
    if(then.find || then.learn || then.give) music.effect('find');
    if(then.earn || then.pay) music.effect('coins');
    if(then.rest) music.effect('rest');
    const before=roster(loadWorld());
    const next=apply(this.context(), then);
    saved=saveWorld(next.world)&&saveGrimoire(next.studied);
    this.refreshFoes(undefined, true);
    // A companion who has just joined takes their own grimoire back.
    for(const member of roster(next.world).filter(member=>!before.includes(member))) saved=saveBooks(reclaim(loadBooks(), member)) && saved;
    this.refreshProps();
    this.renderMemory();
  }

  // People blip as they talk, a few blips per line, each voice at its own pitch. Objects just click.
  private speak(text: string) {
    for(const timer of this.blips) clearTimeout(timer);
    this.blips=[];
    if(!this.portraitKey) { music.effect('select'); return; }
    const voice=[...this.active!.speaker].reduce((sum,letter)=>sum+letter.charCodeAt(0),0)%12-6;
    const count=Math.min(6,Math.max(2,Math.ceil(text.length/22)));
    for(let i=0;i<count;i++) this.blips.push(setTimeout(()=>music.effect('blip', voice+[0,2,-1,3,1,-2][i]),i*75));
  }

  private travel({ to, spawn }: { to: string; spawn: string }, door = false) {
    if(door) music.effect('door');
    this.leaving = true;
    this.player.setVelocity(0);
    element('prompt').textContent = '';
    this.cameras.main.fadeOut(250, 16, 27, 24);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(to, { spawn }));
  }

  private closeDialogue() {
    // Focus left on the hidden Continue button would strand the keyboard, so it returns to the map.
    if(element('dialogue').contains(document.activeElement)) element('game').focus({preventScroll:true});
    this.active=undefined;this.options=[];this.portraitKey=undefined;this.menu=undefined;this.returning=false;element('dialogue').hidden=true;element('choices').hidden=true;element('continue').hidden=false;
    const fight=this.pendingFight;this.pendingFight=undefined;
    if(fight && !this.leaving) { this.time.delayedCall(250, () => this.beginBattle(fight)); }
    const shop=this.pendingShop;this.pendingShop=undefined;
    if(shop) this.openShop(shop);
    const camp=this.pendingRest;this.pendingRest=undefined;
    // Resting heals every wound and brings the area's enemies back, so the area starts over around the fire.
    if(camp && !this.leaving) {
      music.effect('rest'); const cost=this.area.camps?.[camp]?.cost ?? 0; saved=saveWorld(rest({ ...loadWorld(), coins: Math.max(0, loadWorld().coins-cost) }));
      const sleep=()=>{ this.leaving=true; this.cameras.main.fadeOut(400,16,27,24); this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.restart({spawn:camp})); };
      // Once the vulture has shown how, a memory can be written down before sleeping.
      if(loadWorld().flags.includes('anchors-known')) this.writeDown(sleep); else sleep();
    }
  }

  private setExplorationEnabled(enabled: boolean) {
    document.querySelector('.game-frame')!.classList.toggle('in-battle', !enabled);
    element('game').inert = !enabled;
    element('dialogue').inert = !enabled;
    element('settings').inert = !enabled;
    // The health display sits under battles and menus, so it steps out of the way for screen readers too.
    element('hud').inert = !enabled;
    element('hud').setAttribute('aria-hidden', String(!enabled));
    document.querySelector<HTMLElement>('.touch-controls')!.inert = !enabled;
    if(this.input.keyboard) this.input.keyboard.enabled = enabled;
  }

  private beginBattle(foe: Foe) {
    // A foe just fled from gives the party a moment to get clear.
    if(this.overlay || this.active || this.leaving || !foe.sprite.active || (foe.fledAt !== undefined && this.time.now - foe.fledAt < 2500)) return;
    this.player.setVelocity(0);
    this.held.clear();
    this.input.keyboard?.resetKeys();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    music.play(battleTheme(foe.encounter));
    this.overlay = new BattleView(this.textures.getBase64('hero'), (won, battle) => {
      this.overlay = undefined;
      if(won) {
        foe.sprite.disableBody(true, true);
        foe.signature.setVisible(false);
        music.play(this.area.music);
        // The spoils, and whatever supplies were not used up.
        saved = saveWorld({ ...loadWorld(), coins: loadWorld().coins + BOUNTY[foe.encounter], supplies: battle.supplies, wounds: woundsAfter(battle), drained: drainedAfter(battle) });
        this.renderMemory();
        if(foe.defeat) {
          const next=apply(this.context(), foe.defeat);
          saved=saveWorld(next.world);
          this.refreshProps();
        }
        this.resumeExploration();
      } else if(battle.phase === 'fled') {
        // A getaway: half the coins dropped, the parting blow's wound kept, and some distance put between them.
        music.play(this.area.music);
        saved = saveWorld({ ...fleeing(loadWorld()), supplies: battle.supplies, wounds: woundsAfter(battle), drained: drainedAfter(battle) });
        const away = new Phaser.Math.Vector2(this.player.x - foe.sprite.x, this.player.y - foe.sprite.y).normalize().scale(36);
        this.player.setPosition(this.player.x + (away.x || 0), this.player.y + (away.y || 36));
        foe.fledAt = this.time.now;
        this.renderMemory();
        this.resumeExploration();
      } else {
        // Every wipe wakes the party at the church, wherever it fell.
        saved = saveMemory(wipe(loadMemory())) && saveWorld(drop(loadWorld()));
        this.scene.start('church');
      }
    }, foe.encounter, { ...this.partyOptions(), ambush: Boolean(foe.ambush && foe.hidden) });
  }

  // A shop opens after its keeper has spoken, if there is anything left to sell.
  private openShop(shop: ShopId) {
    const world = loadWorld();
    if(this.overlay || this.leaving || SHOPS[shop].wares.every(ware => 'deed' in ware && world.flags.includes(ware.deed))) return;
    this.player.setVelocity(0);
    this.held.clear();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    music.effect('open');
    this.overlay = new ShopView(shop, world,
      next => { saved = saveWorld(next); this.renderMemory(); },
      () => { this.overlay?.destroy(); this.overlay = undefined; this.refreshProps(); this.resumeExploration(); });
  }

  private openFishing(spot: SpotId) {
    if(this.overlay || this.leaving) return;
    this.player.setVelocity(0);
    this.held.clear();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    this.overlay = new FishingView(spot,
      fish => { const world = loadWorld(); saved = saveWorld({ ...world, fish: addCatch(world.fish, fish) }); },
      () => { this.overlay?.destroy(); this.overlay = undefined; this.resumeExploration(); });
  }

  private openSettings() {
    if(this.overlay || this.leaving) return;
    this.closeDialogue();
    this.player.setVelocity(0);
    this.held.clear();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    const close = () => { this.overlay?.destroy(); this.overlay = undefined; this.resumeExploration(); };
    music.effect('open');
    this.overlay = new SettingsView({
      close,
      equipment: () => { close(); this.openEquipment(); },
      // Returning to the cot always restarts the church, which also resets its encounters.
      restart: () => { close(); this.scene.start('church'); },
    });
  }

  private openEquipment() {
    if(this.overlay || this.leaving) return;
    this.player.setVelocity(0);
    this.held.clear();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    music.effect('open');
    this.overlay = new EquipmentView(loadGear(), settle(loadBooks(), roster(loadWorld())), loadWorld().found, roster(loadWorld()), hollow(loadMemory()), this.textures.getBase64('hero'),
      (gear, books) => { saved = saveGear(gear) && saveBooks(books); },
      () => { this.overlay?.destroy(); this.overlay = undefined; this.renderMemory(); this.resumeExploration(); });
  }

  private writeDown(then: () => void) {
    this.player.setVelocity(0);
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    this.overlay = new AnchorView(loadMemory(), id => {
      this.overlay?.destroy();
      this.overlay = undefined;
      if(id) { saved = saveMemory(anchor(loadMemory(), id)); music.effect('select'); }
      this.setExplorationEnabled(true);
      this.physics.resume();
      then();
    });
  }

  private wake() {
    this.player.setVelocity(0);
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
    music.play('wake');
    this.overlay = new ResurrectionView(loadMemory(), id => {
      this.overlay?.destroy();
      this.overlay = undefined;
      saved = saveMemory(forget(loadMemory(), id));
      this.renderMemory();
      this.cameras.main.fadeIn(900, 16, 27, 24);
      music.play(this.area.music);
      this.resumeExploration();
    });
  }

  // The party as it stands: memories, keepsakes, grimoires, companions, supplies, wounds, and spent mana.
  private partyOptions(): BattleOptions {
    const world = loadWorld();
    return { hollow: hollow(loadMemory()), gear: loadGear(), books: settle(loadBooks(), roster(world)), roster: roster(world), supplies: world.supplies, wounds: world.wounds, drained: world.drained };
  }

  private toggleHud() {
    saveSettings({ hud: loadSettings().hud === 'compact' ? 'full' : 'compact' });
    music.effect('select');
    this.renderMemory();
  }

  private renderMemory() {
    element('purse').textContent = `${loadWorld().coins} coins`;
    // The party as the next fight will find it.
    const party = createBattle('locust', [], this.partyOptions()).party;
    // Health at the top left of the map: a portrait, a bar, and the numbers for each hero.
    // Full shows names and numbers; compact shrinks it to portraits with thin bars.
    const compact = loadSettings().hud === 'compact';
    element('hud').dataset.mode = compact ? 'compact' : 'full';
    element('hud').innerHTML = `<button class="hud-toggle" type="button" aria-expanded="${!compact}" aria-label="${compact ? 'Show' : 'Hide'} party details" title="${compact ? 'Show' : 'Hide'} party details (H)">${compact ? '▸' : '▾'}</button>` + party.map(member => {
      const share = member.health / member.maxHealth;
      const level = share <= 0.25 ? 'low' : share <= 0.5 ? 'wounded' : 'healthy';
      return `<div class="hud-member" data-hud-member="${member.id}"><img alt="" src="${this.portrait(member.id === 'chameleon' ? 'hero' : member.id)}" />
        <div><span class="hud-name">${MEMBERS[member.id].name}</span>
        <div class="health-bar" role="meter" aria-label="${MEMBERS[member.id].name} health" aria-valuemin="0" aria-valuemax="${member.maxHealth}" aria-valuenow="${member.health}" aria-valuetext="${member.health} of ${member.maxHealth}" data-level="${level}" style="--health:${share * 100}%"><span></span></div>
        <span class="hud-numbers">${member.health} / ${member.maxHealth}</span>
        <div class="mana-bar" role="meter" aria-label="${MEMBERS[member.id].name} mana" aria-valuemin="0" aria-valuemax="${member.maxMana}" aria-valuenow="${member.mana}" aria-valuetext="${member.mana} of ${member.maxMana} mana" style="--mana:${member.mana / member.maxMana * 100}%"><span></span></div>
        <span class="hud-numbers">◇ ${member.mana} / ${member.maxMana}</span></div></div>`;
    }).join('') + (party.some(member => member.health < member.maxHealth || member.mana < member.maxMana) ? '<p class="hud-hint">Rest at a fire to heal and recover mana</p>' : '');
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
    // Enemies come alive: they bob where they stand, turn to face the hero, and the ordinary ones give chase.
    for(const foe of this.foes) {
      if(!foe.sprite.active) continue;
      const toHero=Phaser.Math.Distance.Between(this.player.x,this.player.y,foe.sprite.x,foe.sprite.y);
      const chase=CHASE[foe.encounter];
      if(chase) {
        const fromHome=Phaser.Math.Distance.Between(foe.sprite.x,foe.sprite.y,foe.home.x,foe.home.y);
        // Talking stops the world; a foe just fled from gives the hero a moment and goes home.
        const resting=this.active || (foe.fledAt!==undefined && this.time.now-foe.fledAt<2500);
        const hunting=!resting && toHero<chase.sight && fromHome<LEASH;
        if(hunting) this.physics.moveTo(foe.sprite,this.player.x,this.player.y,chase.speed);
        else if(!this.active && fromHome>3) this.physics.moveTo(foe.sprite,foe.home.x,foe.home.y,chase.speed*0.6);
        else foe.sprite.setVelocity(0);
        foe.signature.setPosition(foe.sprite.x,foe.sprite.y);
      }
      if(toHero<150) foe.sprite.setFlipX(this.player.x<foe.sprite.x);
      foe.sprite.setOrigin(0.5,0.5+Math.sin(time/320+foe.phase)*0.025);
    }
    for(const person of this.people) if(person.active && Phaser.Math.Distance.Between(this.player.x,this.player.y,person.x,person.y)<80) person.setFlipX(this.player.x<person.x);
    // Ambushers' signatures flicker out as the hero comes near, and come back once he is clear.
    for(const foe of this.foes) {
      if(!foe.ambush || !foe.sprite.active) continue;
      const near=Phaser.Math.Distance.Between(this.player.x,this.player.y,foe.sprite.x,foe.sprite.y)<110;
      if(near===Boolean(foe.hidden)) continue;
      foe.hidden=near;
      this.tweens.killTweensOf([foe.sprite]);
      this.tweens.add({ targets: [foe.sprite, foe.signature], alpha: near ? { from: 0.3, to: 0 } : 1, duration: near ? 500 : 700, ease: near ? 'Stepped' : 'Linear', easeParams: near ? [4] : undefined });
    }
    // Footsteps while walking, alternating feet.
    if((x||y) && time-this.lastStep>290) { this.lastStep=time; this.foot=-this.foot; music.effect(`step-${this.surface()}`, this.foot); }
    if(x) this.player.setFlipX(x<0);
    this.player.setDepth(4);
    this.shadow.setPosition(this.player.x,this.player.y+9);
    // A restrained walking bob, or slow breathing when standing still, while the physics body stays steady.
    this.player.setOrigin(0.5,0.5+(x||y?Math.sin(time/85)*0.025:Math.sin(time/520)*0.012));
    const context=this.context();
    this.nearby=this.points.filter(p=>p.name in this.area.exits || p.name in (this.area.fishing ?? {}) || p.name in (this.area.camps ?? {}) || (p.name in this.area.dialogue
      && !this.area.dialogue[p.name].hiddenIf?.some(condition=>holds(context, condition))))
      // The nearest thing in reach wins, so a door and the person beside it never steal each other's prompt.
      .map(p=>({ p, distance: Phaser.Math.Distance.Between(this.player.x,this.player.y,p.x,p.y) }))
      .filter(({ distance })=>distance<29).sort((a,b)=>a.distance-b.distance)[0]?.p;
    if(!this.active) element('prompt').textContent=this.nearby
      ? `E · ${this.area.exits[this.nearby.name]?.prompt ?? (this.area.camps?.[this.nearby.name] ? `${this.area.camps[this.nearby.name].prompt}${this.area.camps[this.nearby.name].cost ? ` (${this.area.camps[this.nearby.name].cost} coins)` : ''}` : undefined) ?? (this.area.fishing?.[this.nearby.name] ? `Fish ${SPOTS[this.area.fishing[this.nearby.name]].name.replace(/^The /, 'the ')}` : undefined) ?? this.area.dialogue[this.nearby.name].prompt ?? 'Examine '+this.nearby.name}` : '';
  }
}
