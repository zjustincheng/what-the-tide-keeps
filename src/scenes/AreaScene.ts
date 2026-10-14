import Phaser from 'phaser';
import { characterDepth, characterFootprint } from '../presentation/townsfolk';
import { createBattle, MEMBERS } from '../rules/battle';
import type { BattleOptions } from '../rules/battle';
import { held, hollow, MEMORY_IDS } from '../rules/memory';
import { conversation, holds, lineup, replies, roster, techniques } from '../rules/world';
import type { Condition, Context, Effect } from '../rules/world';
import type { Conversation } from '../content/dialogue';
import { loadGrimoire } from '../storage/grimoire';
import { loadMemory } from '../storage/memory';
import { loadWorld, saveWorld } from '../storage/world';
import type { BattleView } from '../ui/BattleView';
import type { ResurrectionView } from '../ui/ResurrectionView';
import type { AnchorView } from '../ui/AnchorView';
import type { CookView } from '../ui/CookView';
import type { JournalView } from '../ui/JournalView';
import type { BestiaryView } from '../ui/BestiaryView';
import type { DiceView } from '../ui/DiceView';
import { forage, INGREDIENTS } from '../rules/cooking';
import { destinations, waystoneIn, WAYSTONES } from '../rules/waystones';
import type { EquipmentView } from '../ui/EquipmentView';
import type { PartyView } from '../ui/PartyView';
import type { ShellView } from '../ui/ShellView';
import type { ArmView } from '../ui/ArmView';
import type { ClimbView } from '../ui/ClimbView';
import type { EndingView } from '../ui/EndingView';
import type { KeepsakeView } from '../ui/KeepsakeView';
import type { SoundtrackView } from '../ui/SoundtrackView';
import type { ShopView } from '../ui/ShopView';
import type { FishingView } from '../ui/FishingView';
import type { SettingsView } from '../ui/SettingsView';
import { CinematicView } from '../ui/CinematicView';
import type { MemoriesView } from '../ui/MemoriesView';
import { STORIES } from '../presentation/stories';
import type { Story, StoryId } from '../presentation/stories';
import { seenStories, rememberStory } from '../storage/presentation';
import { atmosphere } from '../presentation/atmosphere';
import { SPOTS } from '../rules/fishing';
import { loadGear } from '../storage/gear';
import { loadBooks } from '../storage/books';
import { loadSettings, saveSettings } from '../storage/settings';
import type { Area } from './areas';
import { music } from '../audio/music';
import type { Surface } from '../audio/effects';
import { settle } from '../rules/spells';
import { createSprites } from './sprites';
import { hunting } from '../rules/pursuit';
import { loadPursuit } from '../storage/pursuit';
import { element, PICKED, save } from './area/shared';
import type { Direction, Point } from './area/shared';
import { moveFoes, nightTurns, refreshFoes, revealFoes } from './area/foes';
import type { Foe } from './area/foes';
import { markExits, shadeExits } from './area/exits';
import type { ExitMarker } from './area/exits';
import { Dialogue, portrait } from './area/dialogue';
import { Aftermath } from './area/aftermath';
import { Traversal } from './area/traversal';
import { Hunt } from './area/hunt';
import { TownLife } from './area/townLife';
import { DayNight } from './area/dayNight';
import { Hollows } from './area/hollows';
import { beginBattle, beginKrakenTutorial } from './area/battles';
import { openBestiary, openEquipment, openFishing, openJournal, openParty, openSettings, wake } from './area/panels';

type Prop = { sprite: Phaser.Physics.Arcade.Sprite; hiddenIf: Condition[]; shadow?: Phaser.GameObjects.Ellipse; transition?: Phaser.Tweens.Tween };
type Overlay = CinematicView | MemoriesView | BattleView | ResurrectionView | AnchorView | EquipmentView | ShopView | FishingView | SettingsView | CookView | JournalView | DiceView | BestiaryView | PartyView | ShellView | ArmView | ClimbView | EndingView | KeepsakeView | SoundtrackView;
type Panel = MemoriesView | CookView | JournalView | DiceView | BestiaryView | PartyView | ShellView | ArmView | ClimbView | EndingView | KeepsakeView | SoundtrackView;

// Creatures that breathe on the map even though they are only props.
const BREATHING = new Set(['sheep', 'badger', 'rat', 'hyena']);
// Places where the hero has been told how to leap, this session.
const HINTED = new Set<string>();
// How often hiding costs every hero a point of mana, in milliseconds.
const HIDE_DRAIN = 2500;

// One explorable map: the church, a route, or a town. Areas differ only in their data.
// The work of an area is shared out among the helpers in ./area: talking, what talking leads to, leaping and climbing,
// the Inquisitor's hunt, town life, the time of day, enemies, battles, and panels. They reach back into the scene for what it holds.
export class AreaScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  floor!: Phaser.Tilemaps.TilemapLayer;
  walls!: Phaser.Tilemaps.TilemapLayer;
  points: Point[] = [];
  foes: Foe[] = [];
  props: Prop[] = [];
  exitMarkers: ExitMarker[] = [];
  overlay?: Overlay;
  arrival = 'spawn';
  leaving = false;
  // Hiding the party's mana: slower and silent, unseen by enemies, and a first strike on anyone walked into.
  sneaking = false;
  cleanup = new AbortController();
  dialogue!: Dialogue;
  aftermath!: Aftermath;
  traversal!: Traversal;
  hunt!: Hunt;
  town!: TownLife;
  private dayNight!: DayNight;
  private hollows!: Hollows;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private held = new Set<Direction>();
  private nearby?: Point;
  private talked = new Set<string>();
  private shadow!: Phaser.GameObjects.Ellipse;
  private people: Phaser.Physics.Arcade.Sprite[] = [];
  // Guards who throw out anyone they can see, and what a guard said on the way down.
  private sentries: { sprite: Phaser.GameObjects.Sprite; range: number }[] = [];
  private thrownOut?: string[];
  private waystone?: Phaser.GameObjects.Image;
  private forage: { point: string; sprite: Phaser.GameObjects.Image }[] = [];
  private lastDrain = 0;
  private lastStep = 0;
  private foot = 1;
  private noticeTimer?: ReturnType<typeof setTimeout>;

  constructor(readonly area: Area) { super(area.key); }

  get talking() { return Boolean(this.dialogue.active); }

  // The ground under the hero's feet.
  surface(): Surface {
    const tile = this.floor.getTileAtWorldXY(this.player.x, this.player.y + 8);
    return (tile && this.area.surfaces?.[tile.index]) ?? this.area.ground;
  }

  init(data: { spawn?: string; caught?: string[] }) {
    // Scene instances are reused, so every visit starts from a clean slate.
    this.arrival = data?.spawn ?? 'spawn';
    this.thrownOut = data?.caught;
    this.cleanup = new AbortController();
    this.dialogue = new Dialogue(this);
    this.aftermath = new Aftermath(this);
    this.hunt = new Hunt(this);
    this.town = new TownLife(this);
    this.held = new Set(); this.foes = []; this.props = []; this.people = []; this.forage = []; this.sentries = []; this.exitMarkers = []; this.talked = new Set();
    this.nearby = undefined; this.overlay = undefined; this.leaving = false; this.sneaking = false;
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.svg(`${this.area.tileset}-tiles`, `${base}assets/${this.area.tileset}-tiles.svg`);
    this.load.tilemapTiledJSON(`${this.area.map}-map`, `${base}maps/${this.area.map}.json`);
    // Companions' art is needed everywhere, for their portraits in the health display.
    for (const key of [...this.area.enemies.map(enemy => enemy.encounter), ...this.area.assets ?? [], 'bear', 'vulture', 'frog', 'octopus', 'inquisitor']) if (!this.textures.exists(key)) this.load.svg(key, `${base}assets/${key}.svg`);
  }

  create() {
    const map = this.make.tilemap({ key: `${this.area.map}-map` });
    const tiles = map.addTilesetImage(this.area.tileset, `${this.area.tileset}-tiles`)!;
    this.floor = map.createLayer('Floor', tiles)!;
    const furniture = map.createLayer('Furniture', tiles)!;
    furniture.setCollisionByProperty({ collides: true });
    this.walls = furniture;
    const gapTile = Object.entries(tiles.tileProperties as Record<string, { gap?: boolean }>).filter(([, props]) => props?.gap).map(([id]) => tiles.firstgid + Number(id))[0];
    this.points = map.getObjectLayer('Points')!.objects.map(p => ({ name: p.name, x: p.x!, y: p.y! }));
    const spawn = this.point(this.arrival);
    createSprites(this);
    this.shadow = this.add.ellipse(spawn.x, spawn.y + 9, 14, 6, 0x122b22, 0.6).setDepth(3.5);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'hero');
    this.player.setDepth(characterDepth(this.player));
    this.player.setSize(9, 7).setOffset(5, 17).setCollideWorldBounds(true);
    this.traversal = new Traversal(this, gapTile, spawn);
    this.hollows = new Hollows(this);
    this.physics.world.setBounds(...this.area.bounds ?? [0, 0, map.widthInPixels, map.heightInPixels]);
    // Maps larger than the view scroll with the hero.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels).startFollow(this.player, true, 0.15, 0.15);
    this.physics.add.collider(this.player, furniture);
    for (const { point, texture, hiddenIf = [], peek } of this.area.npcs) {
      const at = this.point(point);
      const shadow = this.add.ellipse(at.x, at.y + 9, 15, 6, 0x142a23, 0.6).setDepth(3.5);
      const npc = this.physics.add.staticSprite(at.x, at.y, texture);
      // Someone hiding badly: smaller, and in shadow.
      if (peek) npc.setScale(0.7).setTint(0x8a8e88);
      characterFootprint(npc);
      npc.setDepth(characterDepth(npc));
      this.physics.add.collider(this.player, npc);
      // People breathe, each at their own pace, and look at the hero as he passes. A hider holds their breath.
      if (!peek) this.breathe(npc);
      shadow.setVisible(!peek);
      this.people.push(npc);
      // People who can leave, like a freed companion, come and go with story state.
      this.props.push({ sprite: npc, hiddenIf, shadow });
    }
    refreshFoes(this, this.context());
    this.exitMarkers = markExits(this, map.widthInPixels, map.heightInPixels);
    // Sentries stand where they can see, with their sight drawn faintly on the ground.
    for (const { point, range, texture } of this.area.sentries ?? []) {
      const at = this.point(point);
      this.add.ellipse(at.x, at.y + 4, range * 2, range * 2, 0xc8b878, 0.06).setStrokeStyle(1, 0xc8b878, 0.25).setDepth(2);
      const sprite = this.physics.add.staticSprite(at.x, at.y, texture).setDepth(4);
      sprite.setDepth(characterDepth(sprite));
      this.physics.add.collider(this.player, sprite);
      this.breathe(sprite);
      this.sentries.push({ sprite, range });
    }
    for (const { point, texture, solid, hiddenIf } of this.area.props ?? []) {
      const at = this.point(point);
      const sprite = solid ? this.physics.add.staticSprite(at.x, at.y, texture) : this.physics.add.sprite(at.x, at.y, texture);
      if (solid) this.physics.add.collider(this.player, sprite);
      // Loose things glint so they can be found without a marker.
      else this.tweens.add({ targets: sprite, alpha: 0.55, duration: 900, yoyo: true, repeat: -1 });
      if (BREATHING.has(texture)) this.breathe(sprite);
      sprite.setDepth(BREATHING.has(texture) ? characterDepth(sprite) : 3);
      this.props.push({ sprite, hiddenIf });
    }
    for (const [point, ingredient] of Object.entries(this.area.forage ?? {})) {
      if (PICKED.has(`${this.area.key}:${point}`)) continue;
      const at = this.point(point);
      const sprite = this.add.image(at.x, at.y, ingredient).setDepth(3);
      this.tweens.add({ targets: sprite, scaleY: 1.06, duration: 1600 + (at.x % 500), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.forage.push({ point, sprite });
    }
    // The area's waystone, if it has one: grey while asleep, lit once woken.
    if (waystoneIn(this.area.key)) {
      const at = this.point('waystone');
      const stone = this.physics.add.staticImage(at.x, at.y - 4, 'waystone').setDepth(3);
      stone.setSize(12, 8).setOffset(3, 16);
      this.physics.add.collider(this.player, stone);
      this.waystone = stone;
      this.refreshWaystone();
    }
    this.refreshProps(true);
    this.area.decorate?.(this);
    atmosphere(this, this.area);
    this.dayNight = new DayNight(this);
    this.town.begin(furniture);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT', false) as typeof this.keys;
    this.bindControls();
    element('location-region').textContent = this.area.region;
    element('location-place').textContent = `/ ${this.town.title(this.context())}`;
    element('game').setAttribute('aria-label', `${this.area.place} map. Move with WASD or arrow keys. Press E or Space to interact.`);
    this.cameras.main.fadeIn(650, 16, 27, 24);
    // The first time in a place with gaps to leap, say how.
    const climbable = Object.keys(this.area.climbs ?? {}).length > 0;
    const gaps = gapTile !== undefined && Boolean(this.walls.findTile(tile => tile.index === gapTile));
    // Shown once, when nothing else is being said; if something is, it waits for the next visit.
    if ((gaps || climbable) && !HINTED.has(this.area.key)) this.time.delayedCall(900, () => {
      if (!element('sneaking').hidden) return;
      HINTED.add(this.area.key);
      this.notice([
        ...(climbable ? ['Walls with handholds can be climbed: go to the foot of one. Dodge what falls.'] : []),
        ...(gaps ? ['Shift (or Leap) to jump a gap. Loose ground won\'t hold you for long.'] : []),
      ].join(' '), 6000);
    });
    music.play(this.area.music);
    this.hunt.prepare();
    this.renderMemory();
    // A wipe that was not yet paid for, such as one interrupted by a reload, is still owed.
    if (loadMemory().pending) wake(this);
    else if (this.thrownOut) { const lines = this.thrownOut; this.thrownOut = undefined; this.time.delayedCall(450, () => this.say({ speaker: 'THROWN OUT', lines }, undefined)); }
    else if (this.area.key === 'lamp' && !seenStories().includes('human') && !loadWorld().flags.some(flag => ['human-seated', 'human-beaten', 'human-spared', 'human-challenged'].includes(flag))) this.showStory(STORIES.human, () => this.showAreaTitle(this.town.title(this.context())));
    else if (this.area.key === 'church' && !loadWorld().flags.length && !loadWorld().deaths && !seenStories().includes('waking')) this.showStory(STORIES.prologue, () => beginKrakenTutorial(this), true);
    else if (this.area.key === 'church') this.showAreaTitle('The Church');
    else this.showAreaTitle(this.town.title(this.context()));
    this.town.remember(this.context());
    this.events.once('shutdown', () => {
      this.leaving = true; this.aftermath.drop();
      // Leaving an area keeps the time it is.
      if (!loadMemory().pending) save.ok = saveWorld(loadWorld());
      this.cleanup.abort();
      this.hunt.destroy();
      this.town.destroy();
      this.overlay?.destroy();
      this.setExplorationEnabled(true);
      this.closeDialogue();
    });
  }

  context(): Context {
    const memory = loadMemory();
    return { world: loadWorld(), lost: memory.lost, remembered: held(memory), studied: loadGrimoire(), minds: memory.companions };
  }

  point(name: string): Point {
    return this.points.find(p => p.name === name)!;
  }

  // Props follow story state: brambles that let go, a bell already picked up, a cup left behind.
  refreshProps(instant = false) {
    const context = this.context();
    shadeExits(this, context);
    this.town.refresh(context);
    if (this.town.isTown) element('location-place').textContent = `/ ${this.town.title(context)}`;
    for (const prop of this.props) {
      const { sprite, hiddenIf, shadow } = prop;
      const hidden = hiddenIf.some(condition => holds(context, condition));
      shadow?.setVisible(!hidden);
      if (hidden && sprite.active) {
        prop.transition?.stop();
        sprite.disableBody(true, false);
        if (instant) sprite.setVisible(false).setAlpha(0);
        else prop.transition = this.tweens.add({ targets: sprite, alpha: 0, duration: 350, onComplete: () => sprite.setVisible(false) });
      } else if (!hidden && !sprite.active) {
        prop.transition?.stop();
        sprite.enableBody(false, 0, 0, true, true);
        if (instant) sprite.setAlpha(1);
        else prop.transition = this.tweens.add({ targets: sprite, alpha: { from: sprite.alpha, to: 1 }, duration: 350 });
      }
    }
  }

  private refreshWaystone() {
    const here = waystoneIn(this.area.key);
    if (here && this.waystone) this.waystone.setTexture(loadWorld().flags.includes(WAYSTONES[here].flag) ? 'waystone-woken' : 'waystone');
  }

  // A slow rise and fall, staggered so a crowd doesn't breathe in step.
  private breathe(sprite: Phaser.GameObjects.Sprite) {
    this.tweens.add({ targets: sprite, scaleY: 1.04, scaleX: 0.985, duration: 1300 + (this.people.length * 173) % 700, delay: (sprite.x * 7) % 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private bindControls() {
    const signal = this.cleanup.signal;
    window.addEventListener('keydown', event => {
      // Keys pressed inside a panel belong to it, even once that press has closed it.
      if (this.overlay || (event.target instanceof Element && event.target.closest('.battle'))) return;
      if (event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
      if (['e', 'E', ' ', 'Enter'].includes(event.key)) this.interact(event);
      const free = !event.repeat && !this.talking;
      if (['h', 'H'].includes(event.key) && free) this.toggleHud();
      if (['q', 'Q'].includes(event.key) && free) this.toggleSneak();
      if (event.key === 'Shift' && free) this.traversal.leap();
      if (['j', 'J'].includes(event.key) && free) openJournal(this);
      if (['b', 'B'].includes(event.key) && free) openBestiary(this);
      if (['p', 'P'].includes(event.key) && free) openParty(this);
      // Number keys pick a reply.
      const pick = this.dialogue.options[Number(event.key) - 1];
      if (this.talking && pick && !event.repeat) { event.preventDefault(); this.dialogue.choose(pick); }
      // Escape closes a conversation; with none open, it opens settings.
      if (event.key === 'Escape') { if (this.talking) this.closeDialogue(); else if (!event.repeat) openSettings(this); }
      // Tab opens equipment only from the map, so it still moves focus everywhere else on the page.
      const onMap = [element('game'), document.body].includes(document.activeElement as HTMLElement);
      if (event.key === 'Tab' && !event.shiftKey && onMap && free) { event.preventDefault(); this.openEquipment(); }
    }, { signal });
    element('settings').addEventListener('click', () => openSettings(this), { signal });
    element('hud').addEventListener('click', event => { if ((event.target as Element).closest('.hud-toggle')) this.toggleHud(); }, { signal });
    element('continue').addEventListener('click', () => this.interact(), { signal });
    element('touch-interact').addEventListener('click', () => this.interact(), { signal });
    element('touch-sneak').addEventListener('click', () => { if (!this.talking && !this.overlay) this.toggleSneak(); }, { signal });
    element('touch-leap').addEventListener('click', () => { if (!this.talking && !this.overlay) this.traversal.leap(); }, { signal });
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
      const direction = button.dataset.direction as Direction;
      button.addEventListener('pointerdown', event => {
        if (this.overlay) return;
        event.preventDefault(); button.setPointerCapture(event.pointerId); this.held.add(direction);
      }, { signal });
      const release = () => this.held.delete(direction);
      button.addEventListener('pointerup', release, { signal });
      button.addEventListener('pointercancel', release, { signal });
      button.addEventListener('lostpointercapture', release, { signal });
    });
    window.addEventListener('blur', () => { this.held.clear(); this.input.keyboard?.resetKeys(); this.player.setVelocity(0); }, { signal });
  }

  private interact(event?: KeyboardEvent) {
    if (this.overlay || this.leaving) return;
    if (event?.repeat) return;
    const name = this.nearby?.name;
    const ferry = this.area.key === 'creek' && name === 'seal';
    if (hunting(loadPursuit()) && !this.talking && !ferry && (!name || !(name in this.area.exits))) {
      this.notice('No time to stop. Keep moving — he follows through doors.', 2200);
      return;
    }
    // Let native buttons handle their own Enter/Space activation once.
    if (event && document.activeElement instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
    if (this.talking) {
      // With replies on offer, the hero must choose one; Escape still walks away.
      if (!this.dialogue.options.length) this.dialogue.next();
      return;
    }
    if (!name) return;
    if (this.area.climbs?.[name]) this.traversal.climb(name);
    else if (this.traversal.climbDown(name) !== undefined) { this.traversal.descend(name); element('prompt').textContent = ''; }
    else if (name === 'waystone' && waystoneIn(this.area.key)) this.touchWaystone();
    else if (this.area.forage?.[name]) this.pick(name);
    else if (this.area.camps?.[name]) this.sitAtCamp(name);
    else if (this.area.fishing?.[name]) openFishing(this, this.area.fishing[name]);
    else if (name in this.area.exits) {
      const exit = this.area.exits[name];
      // A barred way is explained instead of taken.
      if (!exit.requires || holds(this.context(), exit.requires)) this.travel(exit, /door|out/.test(name));
      else if (hunting(loadPursuit())) this.notice('That way is barred. Find another exit.');
      else this.say({ speaker: exit.barred?.speaker ?? 'THE WAY', lines: exit.barred?.lines ?? ['It will not open.'] }, undefined);
    } else {
      const said = conversation(this.area.dialogue, name, this.context());
      const portrait = this.area.dialogue[name].portrait ?? this.area.npcs.find(npc => npc.point === name)?.texture;
      // Someone already spoken to this visit goes straight to the replies, rather than saying it all again.
      const again = this.talked.has(name) && replies(said.choices, this.context()).length > 0 && (!said.then || Object.keys(said.then).every(key => key === 'shop'));
      this.talked.add(name);
      // Dimming only marks what was asked in this conversation; talking again starts fresh.
      this.dialogue.asked.clear();
      // Effects land as the conversation opens, so closing it early never loses them.
      this.effect(said.then);
      this.say(again ? { ...said, lines: ['Was there something else?'] } : said, portrait, again);
      element('prompt').textContent = '';
      this.player.setVelocity(0);
    }
  }

  private touchWaystone() {
    const here = waystoneIn(this.area.key)!;
    const world = loadWorld();
    if (!world.flags.includes('old-roads')) this.say({ speaker: 'A WAYSTONE', lines: ['A standing stone carved with a road that goes nowhere. It is cold, and it doesn\'t answer.'] });
    else if (!world.flags.includes(WAYSTONES[here].flag)) {
      this.effect({ set: WAYSTONES[here].flag });
      music.effect('find');
      this.refreshWaystone();
      this.say({ speaker: 'A WAYSTONE', lines: ['You put your hand on the stone the way the pilgrim showed you. The carved road fills with pale light. It is awake.'] });
    } else {
      const ways = destinations(world, here);
      this.say({ speaker: 'A WAYSTONE', lines: [ways.length ? 'The carved road is lit. You can feel the other woken stones, far off, like warmth on one side of your face.' : 'The stone is awake, but no other stone answers yet. Wake more of them.'],
        choices: ways.map(id => ({ text: `Walk the old road to ${WAYSTONES[id].name.replace(/^The /, 'the ')}.`, ends: true, lines: [], then: { travel: id } as Effect })) }, undefined);
    }
    element('prompt').textContent = '';
  }

  // Picking what grows wild; it comes back after the next rest.
  private pick(point: string) {
    const ingredient = this.area.forage![point];
    const picked = 2;
    save.ok = saveWorld(forage(loadWorld(), ingredient, picked));
    PICKED.add(`${this.area.key}:${point}`);
    const spot = this.forage.find(spot => spot.point === point);
    if (spot) { this.forage = this.forage.filter(other => other !== spot); this.tweens.add({ targets: spot.sprite, alpha: 0, scale: 0.4, duration: 300, onComplete: () => spot.sprite.destroy() }); }
    music.effect('find');
    this.say({ speaker: 'FORAGING', lines: [`You pick ${picked} ${INGREDIENTS[ingredient].plural}. They'll do for cooking at a fire.`] }, 'hero');
    element('prompt').textContent = '';
  }

  // Resting is told like a conversation; the rest itself, and paying for it, happen when it ends.
  // Resting heals, but doesn't skip the day or the night: the hour is the same when you get up. A fire can be cooked at as well, a bed or a cot cannot.
  private sitAtCamp(point: string) {
    const camp = this.area.camps![point];
    const coins = loadWorld().coins;
    const cost = camp.cost ?? 0;
    const sleep = [...(cost ? [`You pay ${cost} coins for wood and a place by the fire.`] : []), ...camp.lines];
    this.aftermath.campPoint = point;
    const price = cost ? ` (${cost} coins)` : '';
    const night = Boolean(loadWorld().night);
    const restHere = cost && coins < cost
      ? { text: `Rest.${price}`, lines: [`Wood and a place by the fire cost ${cost} coins. You have ${coins}.`] }
      : { text: `Rest.${price}`, ends: true, lines: sleep, then: { camp: true } as Effect };
    this.say({ speaker: camp.noCooking ? 'REST' : 'THE FIRE', lines: [camp.noCooking ? (night ? 'It is dark out.' : 'It is still light out.') : `The fire is going${night ? ', and it is the only light for a long way' : ''}. You could cook something, or rest.`], choices: [
      ...this.town.campChoices(this.context()),
      ...(camp.noCooking ? [] : [{ text: 'Cook something.', ends: true, lines: [], then: { cook: true } as Effect }]),
      restHere,
    ] }, 'hero');
    element('prompt').textContent = '';
    this.player.setVelocity(0);
  }

  // Left out, the portrait stays whoever was speaking.
  say(conversation: Conversation, portrait?: string, returning = false) { this.dialogue.say(conversation, portrait, returning); }

  effect(then?: Effect) { this.aftermath.effect(then); }

  beginBattle(foe: Foe) { beginBattle(this, foe); }

  openEquipment() { openEquipment(this); }

  closeDialogue() {
    // Focus left on the hidden Continue button would strand the keyboard, so it returns to the map.
    if (element('dialogue').contains(document.activeElement)) element('game').focus({ preventScroll: true });
    this.dialogue.clear();
    this.aftermath.run();
  }

  travel({ to, spawn }: { to: string; spawn: string }, door = false) {
    if (door) music.effect('door');
    this.leaving = true;
    this.player.setVelocity(0);
    element('prompt').textContent = '';
    this.cameras.main.fadeOut(250, 16, 27, 24);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(to, { spawn }));
  }

  setExplorationEnabled(enabled: boolean) {
    document.querySelector('.game-frame')!.classList.toggle('in-battle', !enabled);
    element('game').inert = !enabled;
    element('dialogue').inert = !enabled;
    element('settings').inert = !enabled;
    // The health display sits under battles and menus, so it steps out of the way for screen readers too.
    element('hud').inert = !enabled;
    element('hud').setAttribute('aria-hidden', String(!enabled));
    document.querySelector<HTMLElement>('.touch-controls')!.inert = !enabled;
    if (this.input.keyboard) this.input.keyboard.enabled = enabled;
  }

  // Everything on the map stops, for a battle, a panel, or a story.
  halt() {
    this.player.setVelocity(0);
    this.held.clear();
    this.physics.pause();
    element('prompt').textContent = '';
    this.setExplorationEnabled(false);
  }

  resumeExploration() {
    this.held.clear();
    this.input.keyboard?.resetKeys();
    this.setExplorationEnabled(true);
    this.physics.resume();
    if (hunting(loadPursuit())) music.play('boss-inquisitor');
    element('game').focus({ preventScroll: true });
  }

  // A panel over the map: cooking, the journal, or a game of bones.
  openPanel(make: () => Panel) {
    if (this.overlay || this.leaving) return;
    this.halt();
    music.effect('open');
    this.overlay = make();
  }

  closePanel() {
    this.overlay?.destroy(); this.overlay = undefined; this.renderMemory(); this.resumeExploration();
  }

  showStory(story: Story, after?: () => void, chained = false) {
    if (this.overlay || this.leaving) return;
    this.player.setVelocity(0); this.held.clear(); this.input.keyboard?.resetKeys();
    this.physics.pause(); this.setExplorationEnabled(false);
    this.overlay = new CinematicView(story, () => {
      const outgoing = this.overlay;
      this.overlay = undefined;
      if (story.id in STORIES) rememberStory(story.id as StoryId);
      if (chained) {
        // The next overlay is installed before this one is removed.
        after?.();
        if (outgoing instanceof CinematicView) outgoing.destroy(false);
      } else {
        outgoing?.destroy();
        this.resumeExploration();
        after?.();
      }
    }, !chained);
  }

  showAreaTitle(title: string) {
    const card = document.createElement('div');
    card.className = 'area-title-card';
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    card.textContent = title;
    document.querySelector('.game-frame')?.append(card);
    setTimeout(() => card.remove(), 2600);
  }

  // A short message over the map, in the same place as the hiding badge.
  notice(text: string, ms = 1800) {
    const badge = element('sneaking');
    badge.textContent = text; badge.hidden = false;
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => { badge.textContent = 'MANA HIDDEN'; badge.hidden = !this.sneaking; }, ms);
  }

  toggleSneak() {
    if (hunting(loadPursuit()) && !this.sneaking) { this.notice('He already knows your trail. Run with your mana showing.'); return; }
    // Hiding needs mana to hold down.
    if (!this.sneaking && (createBattle('locust', [], this.partyOptions()).party.find(member => member.id === 'chameleon')?.mana ?? 0) <= 0) { this.notice('No mana left to hide.'); return; }
    this.sneaking = !this.sneaking;
    this.lastDrain = this.time.now;
    this.player.setAlpha(this.sneaking ? 0.55 : 1);
    element('sneaking').textContent = 'MANA HIDDEN';
    element('sneaking').hidden = !this.sneaking;
    music.effect(this.sneaking ? 'gather' : 'select');
  }

  // The party as it stands: memories, keepsakes, grimoires, companions, supplies, wounds, and spent mana.
  // Everyone who has joined, or, for a fight, only those who fight: three at most, with one on the bench.
  partyOptions(fighting = false, lieutenant = false): BattleOptions {
    const world = loadWorld();
    const memory = loadMemory();
    return { hollow: hollow(memory), lostMemories: memory.lost.filter(id => !held(memory).includes(id)), gear: loadGear(), books: settle(loadBooks(), roster(world)), roster: this.area.solo ? ['chameleon'] : fighting ? lineup(world, lieutenant) : roster(world), tempered: world.tempered ?? [], supplies: world.supplies, wounds: world.wounds, drained: world.drained, techniques: techniques(world), minds: memory.companions };
  }

  private toggleHud() {
    saveSettings({ hud: loadSettings().hud === 'compact' ? 'full' : 'compact' });
    music.effect('select');
    this.renderMemory();
  }

  renderMemory() {
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
      return `<div class="hud-member" data-hud-member="${member.id}"><img alt="" src="${portrait(this.textures, member.id === 'chameleon' ? 'hero' : member.id)}" />
        <div><span class="hud-name">${MEMBERS[member.id].name}</span>
        <div class="health-bar" role="meter" aria-label="${MEMBERS[member.id].name} health" aria-valuemin="0" aria-valuemax="${member.maxHealth}" aria-valuenow="${member.health}" aria-valuetext="${member.health} of ${member.maxHealth}" data-level="${level}" style="--health:${share * 100}%"><span></span></div>
        <span class="hud-numbers">${member.health} / ${member.maxHealth}</span>
        <div class="mana-bar" role="meter" aria-label="${MEMBERS[member.id].name} mana" aria-valuemin="0" aria-valuemax="${member.maxMana}" aria-valuenow="${member.mana}" aria-valuetext="${member.mana} of ${member.maxMana} mana" style="--mana:${member.mana / member.maxMana * 100}%"><span></span></div>
        <span class="hud-numbers">◇ ${member.mana} / ${member.maxMana}</span></div></div>`;
    }).join('');
    // A memory found, not lost: the laboratory, which no death took.
    element('memory-status').textContent = `${held(loadMemory()).length} of ${MEMORY_IDS.length} memories remain${loadWorld().flags.includes('lab-remembered') ? ' · one found: the laboratory' : ''}${save.ok ? '' : ' · not saved'}`;
  }

  // Whether a point is something the hero can use, step through, or talk to.
  private reachable(name: string, context: Context) {
    const area = this.area;
    return name in area.exits || name in (area.climbs ?? {}) || this.traversal.climbDown(name) !== undefined || name in (area.fishing ?? {}) || name in (area.camps ?? {})
      || this.forage.some(spot => spot.point === name) || (name === 'waystone' && Boolean(waystoneIn(area.key)))
      || (name in area.dialogue && !area.dialogue[name].hiddenIf?.some(condition => holds(context, condition)));
  }

  // What pressing E would do here.
  private promptFor(name: string): string {
    const area = this.area;
    const camp = area.camps?.[name], spot = area.fishing?.[name], ingredient = area.forage?.[name];
    return area.climbs?.[name]?.prompt
      ?? (this.traversal.climbDown(name) !== undefined ? 'Climb back down' : undefined)
      ?? area.exits[name]?.prompt
      ?? (camp ? `${camp.prompt}${camp.cost ? ` (${camp.cost} coins)` : ''}` : undefined)
      ?? (spot ? `Fish ${SPOTS[spot].name.replace(/^The /, 'the ')}` : undefined)
      ?? (ingredient ? `Pick ${INGREDIENTS[ingredient].plural}` : undefined)
      ?? (name === 'waystone' ? 'Touch the waystone' : undefined)
      ?? area.dialogue[name].prompt
      ?? 'Examine ' + name;
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    if (this.overlay || this.leaving) { this.player.setVelocity(0); return; }
    this.hunt.update(time, delta);
    this.town.update(delta, this.talking || hunting(loadPursuit()));
    if (!this.talking) {
      const turned = this.dayNight.pass(delta, time);
      // When night falls or lifts, the world changes around the hero: the market opens, enemies hide.
      if (turned) { this.notice(turned === 'night' ? 'NIGHT FALLS' : 'DAWN'); this.refreshProps(); nightTurns(this, turned === 'night'); }
    }
    const pressed = (direction: Direction, ...keys: string[]) => this.held.has(direction) || keys.some(key => this.keys[key].isDown);
    let x = Number(pressed('right', 'D', 'RIGHT')) - Number(pressed('left', 'A', 'LEFT'));
    let y = Number(pressed('down', 'S', 'DOWN')) - Number(pressed('up', 'W', 'UP'));
    const traversal = this.traversal;
    if (this.talking || traversal.leaping) { x = 0; y = 0; }
    if (x || y) traversal.facing = Math.abs(x) >= Math.abs(y) ? { dx: Math.sign(x), dy: 0 } : { dx: 0, dy: Math.sign(y) };
    const motion = new Phaser.Math.Vector2(x, y).normalize().scale(this.sneaking ? 42 : 70);
    if (!traversal.leaping) { this.player.setVelocity(motion.x, motion.y); traversal.slideAroundCorners(x, y); traversal.footing(time); this.hollows.update(); }
    // Holding the party's mana down costs mana: a point from everyone every few seconds. When the hero runs dry, it shows again.
    if (this.sneaking && time - this.lastDrain > HIDE_DRAIN) {
      this.lastDrain = time;
      const world = loadWorld();
      const party = createBattle('locust', [], this.partyOptions()).party;
      const drained = { ...world.drained };
      for (const member of party) if (member.mana > 0) drained[member.id] = (drained[member.id] ?? 0) + 1;
      save.ok = saveWorld({ ...world, drained });
      this.renderMemory();
      if ((party.find(member => member.id === 'chameleon')?.mana ?? 0) <= 1) { this.toggleSneak(); this.notice('Out of mana. It shows again.'); }
    }
    moveFoes(this, time);
    for (const person of this.people) if (person.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, person.x, person.y) < 80) person.setFlipX(this.player.x < person.x);
    // A sentry sees anyone whose mana isn't hidden, and they are thrown out.
    if (!this.talking && !this.leaving && this.area.caught && !this.sneaking && this.sentries.some(({ sprite, range }) => Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y) < range)) {
      const { to, spawn, lines } = this.area.caught;
      music.effect('hit');
      this.leaving = true; this.player.setVelocity(0); this.cameras.main.shake(200, 0.006); this.cameras.main.fadeOut(500, 16, 27, 24);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(to, { spawn, caught: lines }));
      return;
    }
    revealFoes(this, time);
    // Footsteps while walking, alternating feet.
    if ((x || y) && !this.sneaking && time - this.lastStep > 290) { this.lastStep = time; this.foot = -this.foot; music.effect(`step-${this.surface()}`, this.foot); }
    if (x) this.player.setFlipX(x < 0);
    this.player.setDepth(characterDepth(this.player));
    this.shadow.setPosition(this.player.x, this.player.y + 9);
    this.dayNight.follow(this.player.x, this.player.y);
    // A restrained walking bob, or slow breathing when standing still, while the physics body stays steady.
    this.player.setOrigin(0.5, 0.5 + (x || y ? Math.sin(time / 85) * 0.025 : Math.sin(time / 520) * 0.012) + traversal.lift);
    const context = this.context();
    // The nearest thing in reach wins, so a door and the person beside it never steal each other's prompt.
    this.nearby = this.points.filter(p => this.reachable(p.name, context))
      .map(p => ({ p, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) }))
      .filter(({ distance }) => distance < 29).sort((a, b) => a.distance - b.distance)[0]?.p;
    if (!this.talking) element('prompt').textContent = this.nearby ? `E · ${this.promptFor(this.nearby.name)}` : '';
  }
}
