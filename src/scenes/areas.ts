import type Phaser from 'phaser';
import { church } from '../content/church';
import { farm } from '../content/farm';
import type { Dialogue } from '../content/dialogue';
import { churchLore, downsLore, fieldsLore, fortLore, innLore, townLore, weirLore } from '../content/lore';
import { border } from '../content/border';
import { fields } from '../content/fields';
import { town } from '../content/town';
import { hall, inn, millInside, tannery } from '../content/interiors';
import { barrow, downs } from '../content/downs';
import { fen, weir } from '../content/fen';
import { feastHall, harbour, square } from '../content/capital';
import { abbey, barracks, battlefield, drove, fort, keep, ossuary, pass, rookery, tarn } from '../content/highlands';
import { apothecary, causeway, farBank, hospice, wickmere } from '../content/marsh';
import type { Encounter } from '../rules/battle';
import type { Condition, Effect, Flag } from '../rules/world';
import type { SpotId } from '../rules/fishing';
import type { ThemeId } from '../audio/themes';
import type { Surface } from '../audio/effects';
import type { IngredientId } from '../rules/cooking';

export type Area = {
  key: string;
  map: string;
  tileset: string;
  region: string;
  place: string;
  // Where the hero may walk; the whole map when omitted. Larger maps scroll with the hero.
  bounds?: [x: number, y: number, width: number, height: number];
  // Fog: enemies see the hero from less far off, and their mana can't be seen until they are close.
  fog?: true;
  dialogue: Dialogue;
  // People on the map. One whose hiddenIf condition holds has left.
  // lit: carries a lantern, which shows after dark.
  npcs: { point: string; texture: string; hiddenIf?: Condition[]; lit?: true }[];
  // Enemies respawn on every visit unless hiddenIf holds; defeat applies once the fight is won.
  // An ambusher's signature flickers out as the hero comes near, and it strikes first.
  // waves: how many times it comes on before the fight is won.
  enemies: { point: string; encounter: Encounter; hiddenIf?: Condition[]; defeat?: Effect; ambush?: true; waves?: number }[];
  // SVG art in public/assets to load, beyond the map, tiles, and enemies.
  assets?: string[];
  // Objects on the map that disappear once any hiddenIf condition holds. Solid ones block the way.
  props?: { point: string; texture: string; solid?: boolean; hiddenIf: Condition[] }[];
  // Points that lead elsewhere when the hero interacts with them. A barred exit only opens once requires holds.
  exits: Record<string, { to: string; spawn: string; prompt: string; requires?: Condition; barred?: { speaker: string; lines: string[] } }>;
  // Points where the hero can fish.
  fishing?: Record<string, SpotId>;
  // Places to rest: resting heals every wound and brings the area's enemies back.
  // cost: coins for wood and a place by the fire; the church cot is free.
  // noCooking: a bed or a cot, where the hero can sleep but not cook.
  camps?: Record<string, { prompt: string; lines: string[]; cost?: number; noCooking?: true }>;
  // Things growing wild that can be picked, by point; they grow back after the hero rests.
  forage?: Record<string, IngredientId>;
  // What the ground is made of, for footsteps: ground everywhere, except floor tiles listed in surfaces (by tile number in the map).
  ground: Surface;
  surfaces?: Partial<Record<number, Surface>>;
  decorate?: (scene: Phaser.Scene) => void;
  // The theme that plays here.
  music: ThemeId;
  // The colour grade over the map: saturation shift, brightness multiplier, and vignette strength.
  grade?: { saturation?: number; brightness?: number; vignette?: number };
};

// The church is safe ground. Its two practice enemies exist only for the automated tests, at /?practice.
const PRACTICE = typeof location !== 'undefined' && new URLSearchParams(location.search).has('practice');

export const CHURCH: Area = {
  key: 'church', map: 'church', tileset: 'church', music: 'church', region: 'THE CAPITAL', place: 'Church of the Covenant',
  bounds: [32, 48, 448, 304], dialogue: { ...church, ...churchLore }, ground: 'stone',
  // Candlelight keeps a little warmth in the church; everywhere else is colder.
  grade: { saturation: -0.35, brightness: 0.78, vignette: 0.5 },
  npcs: [{ point: 'priest', texture: 'priest' }, { point: 'novice', texture: 'novice' }],
  enemies: PRACTICE ? [{ point: 'encounter', encounter: 'locust' }, { point: 'exile', encounter: 'acolyte' }] : [],
  exits: {
    door: { to: 'farmland', spawn: 'spawn', prompt: 'Step outside' },
    // The side door opens on the capital.
    'west-door': { to: 'square', spawn: 'from-church', prompt: 'Go out into the city' },
  },
  camps: { spawn: { prompt: 'Rest on the cot', noCooking: true, lines: ['You lie down on the cot. The priest\'s candle burns down a finger\'s width while you rest, and you get up whole.'] } },
  decorate(scene) {
    // Soft window light, hand placed in the same coordinates as the Tiled room.
    const light = scene.add.graphics().setDepth(2);
    for (const x of [88, 168, 344, 424]) {
      light.fillStyle(0xc2d1a0, 0.055);
      light.fillPoints([{ x: x - 5, y: 48 }, { x: x + 6, y: 48 }, { x: x + 62, y: 175 }, { x: x + 24, y: 175 }], true);
    }
    for (const [x, y] of [[200, 88], [312, 88], [88, 72], [424, 72], [200, 296], [312, 296]]) {
      const glow = scene.add.circle(x, y, 15, 0xf6c77a, 0.06).setDepth(3);
      scene.tweens.add({ targets: glow, alpha: 0.035, duration: 1100 + (x % 5) * 130, yoyo: true, repeat: -1 });
    }
    // Slow, deterministic dust motes avoid random changes to the playable map.
    for (let i = 0; i < 18; i++) {
      const mote = scene.add.rectangle(70 + (i * 71) % 370, 65 + (i * 37) % 240, 1, 1, 0xd2d0a2, 0.25).setDepth(5);
      scene.tweens.add({ targets: mote, y: mote.y - 12, alpha: 0.05, duration: 3200 + i * 130, yoyo: true, repeat: -1 });
    }
  },
};

// Caches that only appear once their guardian is dead.
const GUARDED: Partial<Record<string, Flag>> = { 'shrine-cache': 'warden-slain', 'ford-cache': 'leech-slain' };

export const FARMLAND: Area = {
  key: 'farmland', map: 'farmland', tileset: 'fields', music: 'fields', region: 'THE FARMLAND', place: 'The fields',
  dialogue: { ...fields, ...fieldsLore }, assets: ['bear', 'nymph', 'votive'],
  ground: 'grass', surfaces: { 3: 'dirt', 16: 'wood', 17: 'water', 27: 'leaves' },
  npcs: [{ point: 'bear', texture: 'bear', hiddenIf: [{ flag: 'bear-free' }] }, { point: 'miller', texture: 'miller' }, { point: 'heron', texture: 'heron' }, { point: 'shepherd', texture: 'shepherd' },
    { point: 'pilgrim', texture: 'pilgrim', hiddenIf: [{ flag: 'warden-slain' }] }, { point: 'pilgrim-shrine', texture: 'pilgrim', hiddenIf: [{ not: { flag: 'warden-slain' } }] },
    { point: 'carter', texture: 'carter' }, { point: 'beekeeper', texture: 'beekeeper' }],
  enemies: [
    // The reeve's fields: clearing both earns the writ that frees the bear.
    // The reeve's two pests stay dead once cleared; the others are just the fields being the fields.
    { point: 'locust', encounter: 'locust', hiddenIf: [{ flag: 'pests-field' }], defeat: { set: 'pests-field' } }, { point: 'locust-road', encounter: 'locust' },
    { point: 'weevil-yard', encounter: 'weevil', hiddenIf: [{ flag: 'pests-yard' }], defeat: { set: 'pests-yard' } }, { point: 'weevil-orchard', encounter: 'weevil' }, { point: 'weevil-woods', encounter: 'weevil', ambush: true },
    // The boar's hooded followers leave the roads once he is beaten.
    { point: 'exile', encounter: 'acolyte', hiddenIf: [{ flag: 'boar-defeated' }] },
    { point: 'swarm', encounter: 'swarm', hiddenIf: [{ flag: 'swarm-slain' }], defeat: { set: 'swarm-slain' } },
    // Guardians of the harder keepsakes. Their caches appear only once they are dead.
    { point: 'warden', encounter: 'warden', hiddenIf: [{ flag: 'warden-slain' }], defeat: { set: 'warden-slain' } },
    { point: 'leech', encounter: 'leech', hiddenIf: [{ flag: 'leech-slain' }], defeat: { set: 'leech-slain' } },
  ],
  props: [
    { point: 'bell', texture: 'bell', hiddenIf: [{ has: 'bell' }, { flag: 'lamb-thanked' }] },
    ...([['camp-cache', 'cracked-mirror'], ['orchard-cache', 'crow-feather'], ['shrine-cache', 'covenant-token'], ['ford-cache', 'yoke-peg']] as const)
      .map(([point, keepsake]) => ({ point, texture: 'cache', hiddenIf: [{ owns: keepsake }, ...(GUARDED[point] ? [{ not: { flag: GUARDED[point]! } }] : [])] })),
    { point: 'camp-fields', texture: 'campfire', hiddenIf: [] },
    // The seal's fish cart by the crossroads fire, and the beekeeper's hives in the orchard.
    { point: 'carter-cart', texture: 'fishcart', solid: true, hiddenIf: [] },
    { point: 'hive-1', texture: 'hive', solid: true, hiddenIf: [] }, { point: 'hive-2', texture: 'hive', solid: true, hiddenIf: [] },
    { point: 'gibbet', texture: 'gibbet', solid: true, hiddenIf: [] },
    // The woods can only be entered across the ford, through the leech.
    { point: 'log', texture: 'log', solid: true, hiddenIf: [] },
    ...[1, 2, 3, 4, 5, 6].map(i => ({ point: `water-${i}`, texture: 'dark-water', solid: true, hiddenIf: [{ flag: 'leech-slain' as const }] })),
    { point: 'bones', texture: 'bones', hiddenIf: [] },
    { point: 'camp-woods', texture: 'campfire', hiddenIf: [] },
    ...(['woods', 'orchard', 'yard'] as const).map(where => ({ point: `sheep-${where}`, texture: 'sheep', solid: true, hiddenIf: [{ flag: `sheep-${where}` as const }] })),
  ],
  fishing: { 'pond-spot': 'pond', 'stream-spot': 'stream' },
  forage: { 'forage-1': 'herb', 'forage-2': 'mushroom', 'forage-3': 'berry', 'forage-4': 'herb', 'forage-5': 'mushroom' },
  camps: {
    'camp-fields': { prompt: 'Rest by the fire', cost: 4, lines: ['The shepherds\' fire ring at the crossroads. You sit until the ache goes out of you.', 'When you look up, the fields have filled up again.'] },
    'camp-woods': { prompt: 'Rest by the fire', cost: 3, lines: ['You get the old fire going again and rest under the grey tent.', 'Something is moving in the trees again.'] },
  },
  exits: {
    door: { to: 'church', spawn: 'from-road', prompt: 'Return to the church' },
    south: { to: 'town', spawn: 'spawn', prompt: 'Walk on to Millbrook' },
    east: { to: 'border-road', spawn: 'from-fields', prompt: 'Take the field track to the border' },
    'mill-door': { to: 'mill-inside', spawn: 'spawn', prompt: 'Enter the mill' },
    downs: { to: 'downs', spawn: 'from-fields', prompt: 'Climb onto the downs' },
    upstream: { to: 'fen', spawn: 'from-fields', prompt: 'Follow the stream up into the fen' },
  },
  decorate(scene) {
    // A grey ground fog over the fields.
    for (let i = 0; i < 12; i++) {
      const haze = scene.add.rectangle(60 + (i * 211) % 960, 90 + (i * 137) % 640, 190, 28, 0xb8c0c4, 0.07).setDepth(5);
      scene.tweens.add({ targets: haze, x: haze.x + 40, alpha: 0.03, duration: 6200 + i * 700, yoyo: true, repeat: -1 });
    }
    // Crows working the wheat and circling the gibbet.
    for (let i = 0; i < 7; i++) {
      const crow = scene.add.image(240 + (i * 97) % 300, 90 + (i * 53) % 220, 'crow').setDepth(6).setAlpha(0.85);
      scene.tweens.add({ targets: crow, x: crow.x + 40 - (i % 3) * 30, y: crow.y + 18 - (i % 2) * 36, duration: 3800 + i * 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  },
};

export const TOWN: Area = {
  key: 'town', map: 'town', tileset: 'town', music: 'town', region: 'THE FARMLAND', place: 'Millbrook',
  dialogue: { ...town, ...townLore }, enemies: [], ground: 'stone', surfaces: { 3: 'grass', 4: 'dirt' },
  npcs: [...['reeve', 'innkeeper', 'shopkeeper', 'child', 'fishmonger', 'fox', 'scribe'].map(name => ({ point: name, texture: name })),
    // The night market opens behind the tannery after dark.
    { point: 'night-trader', texture: 'marten', hiddenIf: [{ night: false }], lit: true }],
  props: [{ point: 'stocks', texture: 'stocks', solid: true, hiddenIf: [] }, { point: 'lectern', texture: 'lectern', solid: true, hiddenIf: [] }],
  exits: {
    north: { to: 'farmland', spawn: 'from-town', prompt: 'Return to the fields' },
    south: { to: 'border-road', spawn: 'spawn', prompt: 'Take the border road' },
    'hall-door': { to: 'hall', spawn: 'spawn', prompt: "Enter the reeve's hall" },
    'inn-door': { to: 'inn', spawn: 'spawn', prompt: 'Enter the inn', requires: { any: [{ flag: 'inn-room' }, { flag: 'boar-defeated' }, { flag: 'reeve-pardon' }] },
      barred: { speaker: 'THE INN', lines: ['The innkeeper is standing in the doorway, and she doesn\'t move.'] } },
    'tannery-door': { to: 'tannery', spawn: 'spawn', prompt: 'Enter the tannery' },
  },
  decorate(scene) {
    // Smoke from the tannery, drifting over the carnivore quarter.
    for (let i = 0; i < 3; i++) {
      const smoke = scene.add.circle(456 + i * 6, 220, 4 + i, 0xbfb8a8, 0.12).setDepth(5);
      scene.tweens.add({ targets: smoke, y: 180 - i * 8, alpha: 0, scale: 2, duration: 2600 + i * 500, delay: i * 700, repeat: -1 });
    }
  },
};

export const BORDER_ROAD: Area = {
  key: 'border-road', map: 'border-road', tileset: 'border', music: 'wilds', region: 'THE FARMLAND', place: 'The border road',
  dialogue: border, enemies: [{ point: 'follower', encounter: 'acolyte', hiddenIf: [{ flag: 'boar-defeated' }] }], ground: 'grass', surfaces: { 2: 'dirt' },
  npcs: [{ point: 'driver', texture: 'driver' }, { point: 'guard', texture: 'guard' }, { point: 'sister', texture: 'sow', hiddenIf: [{ flag: 'boar-defeated' }] }],
  camps: { 'camp-border': { prompt: 'Rest by the fire', cost: 4, lines: ['The carters let you sit at their fire. Nobody talks much.'] } },
  props: [
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ point: `bramble-${i}`, texture: 'brambles', solid: true, hiddenIf: [{ flag: 'hedge-open' as const }] })),
    { point: 'camp-border', texture: 'campfire', hiddenIf: [] },
    // The sister's barricade across the lane to the farm, until she lets the hero through.
    ...[1, 2, 3, 4].map(i => ({ point: `barricade-${i}`, texture: 'barricade', solid: true, hiddenIf: [{ flag: 'lane-open' as const }, { flag: 'boar-defeated' as const }] })),
  ],
  exits: {
    north: { to: 'town', spawn: 'from-border', prompt: 'Return to Millbrook' },
    east: { to: 'farmland', spawn: 'from-border', prompt: 'Take the field track' },
    south: { to: 'boar-farm', spawn: 'spawn', prompt: 'Follow the smoke' },
    // The pass to the highlands opens once the carts move again.
    pass: { to: 'pass', spawn: 'from-border', prompt: 'Take the track up to the pass', requires: { flag: 'boar-defeated' },
      barred: { speaker: 'THE GUARD', lines: ['The guard steps across the track. "Nobody goes up to the pass while the carts are stopped. Orders."'] } },
  },
};

export const BOAR_FARM: Area = {
  key: 'boar-farm', map: 'boar-farm', tileset: 'ash', music: 'wilds', region: 'THE FARMLAND', place: 'The burned farm',
  dialogue: farm, assets: ['badger', 'rat'],
  // The boar talks before he fights; once challenged, he stands up to fight.
  npcs: [{ point: 'boar', texture: 'boar', hiddenIf: [{ flag: 'boar-challenged' }, { flag: 'boar-defeated' }] }], ground: 'dirt', surfaces: { 1: 'grass' },
  enemies: [{ point: 'boar', encounter: 'boar', hiddenIf: [{ flag: 'boar-defeated' }, { not: { flag: 'boar-challenged' } }], defeat: { set: 'boar-defeated' } }],
  props: [
    // The boar's followers leave, one way or another, once the hero decides what becomes of them.
    { point: 'badger', texture: 'badger', solid: true, hiddenIf: [{ flag: 'followers-spared' }, { flag: 'followers-reported' }] },
    { point: 'rat', texture: 'rat', solid: true, hiddenIf: [{ flag: 'followers-spared' }, { flag: 'followers-reported' }] },
    { point: 'tusk-cache', texture: 'cache', hiddenIf: [{ not: { flag: 'followers-spared' } }, { owns: 'boar-tusk' }] },
    { point: 'cup', texture: 'cup', hiddenIf: [{ not: { flag: 'boar-defeated' } }] },
    { point: 'ruin-cache', texture: 'cache', hiddenIf: [{ owns: 'snare-primer' }] },
  ],
  exits: { north: { to: 'border-road', spawn: 'from-farm', prompt: 'Return to the border road' } },
  decorate(scene) {
    // Embers still rising from the farmhouse.
    for (let i = 0; i < 6; i++) {
      const ember = scene.add.rectangle(80 + (i * 37) % 100, 120, 1, 1, 0xd8743a, 0.8).setDepth(5);
      scene.tweens.add({ targets: ember, y: 60, alpha: 0, duration: 2200 + i * 300, delay: i * 400, repeat: -1 });
    }
  },
};

// Building interiors: small rooms in the dark, lit warmer than the fields outside.
const INDOORS: Pick<Area, 'region' | 'tileset' | 'grade' | 'enemies' | 'music' | 'ground' | 'surfaces'> = { region: 'THE FARMLAND', tileset: 'interior', music: 'hearth', grade: { saturation: -0.3, brightness: 0.74, vignette: 0.55 }, enemies: [],
  ground: 'wood', surfaces: { 3: 'stone', 19: 'straw', 23: 'straw' } };
export const INN: Area = { ...INDOORS, key: 'inn', map: 'inn', place: 'Millbrook · The inn', dialogue: { ...inn, ...innLore },
  npcs: [{ point: 'drinker', texture: 'drinker' }, { point: 'patron', texture: 'patron' }, { point: 'marine', texture: 'marine' }],
  camps: { bed: { prompt: 'Sleep in the bed', noCooking: true, lines: ['You lie down in a real bed for the first time you can remember. Your wounds close and your mana returns.'] } },
  exits: { out: { to: 'town', spawn: 'from-inn', prompt: 'Go back outside' } } };
export const HALL: Area = { ...INDOORS, key: 'hall', map: 'hall', place: "Millbrook · The reeve's hall", dialogue: hall,
  npcs: [{ point: 'clerk', texture: 'clerk' }], exits: { out: { to: 'town', spawn: 'from-hall', prompt: 'Go back outside' } } };
export const TANNERY: Area = { ...INDOORS, key: 'tannery', map: 'tannery', place: 'Millbrook · The tannery', dialogue: tannery,
  npcs: [{ point: 'tanner', texture: 'tanner' }], exits: { out: { to: 'town', spawn: 'from-tannery', prompt: 'Go back outside' } } };
export const MILL: Area = { ...INDOORS, key: 'mill-inside', map: 'mill-inside', place: 'The mill', dialogue: millInside,
  npcs: [], exits: { out: { to: 'farmland', spawn: 'from-mill', prompt: 'Go back outside' } } };

// The downs, east of the fields: the ram's lambs, the hounds who take them, and the barrow where the hounds den.
const PACK_GONE = [{ flag: 'pack-slain' as const }, { flag: 'hounds-fed' as const }];
export const DOWNS: Area = {
  key: 'downs', map: 'downs', tileset: 'downs', music: 'fields', region: 'THE FARMLAND', place: 'The downs',
  dialogue: { ...downs, ...downsLore }, assets: ['hound'], ground: 'grass', surfaces: { 3: 'dirt', 7: 'stone', 11: 'dirt', 25: 'dirt', 26: 'dirt' },
  grade: { saturation: -0.3, brightness: 0.86, vignette: 0.4 },
  npcs: [{ point: 'ram', texture: 'ram' }, { point: 'kid', texture: 'kid' }, { point: 'bard', texture: 'bard' }],
  enemies: [
    // Hounds hunt the way hounds do: unseen until they are on you.
    { point: 'hound-west', encounter: 'hound', hiddenIf: [{ flag: 'hounds-fed' }], ambush: true },
    { point: 'hound-east', encounter: 'hound', hiddenIf: [{ flag: 'hounds-fed' }], ambush: true },
    { point: 'pack', encounter: 'pack', hiddenIf: PACK_GONE, defeat: { set: 'pack-slain' } },
  ],
  props: [
    // The collar under the tower stair can be searched once the pack has gone, either way.
    { point: 'tower-cache', texture: 'cache', hiddenIf: [{ owns: 'iron-collar' }, { all: PACK_GONE.map(gone => ({ not: gone })) }] },
    { point: 'camp-downs', texture: 'campfire', hiddenIf: [] },
    { point: 'sheep-1', texture: 'sheep', solid: true, hiddenIf: [] },
    { point: 'sheep-2', texture: 'sheep', solid: true, hiddenIf: [] },
  ],
  fishing: { 'dewpond-spot': 'dewpond' },
  // Wild thyme on the chalk, hawthorn berries, and a ring of mushrooms.
  forage: { 'forage-1': 'herb', 'forage-2': 'herb', 'forage-3': 'berry', 'forage-4': 'mushroom' },
  camps: { 'camp-downs': { prompt: 'Rest by the fire', cost: 3, lines: ['The ram lets you sit at his fold fire for a few coins. The wind on the downs never stops.'] } },
  exits: {
    west: { to: 'farmland', spawn: 'from-downs', prompt: 'Go back down to the fields' },
    'barrow-door': { to: 'barrow', spawn: 'spawn', prompt: 'Squeeze past the slab into the barrow' },
    east: { to: 'drove', spawn: 'from-downs', prompt: 'Take the drove road up toward the highlands' },
  },
  decorate(scene) {
    // Wind moving through the grass in long pale bands.
    for (let i = 0; i < 10; i++) {
      const gust = scene.add.rectangle(40 + (i * 233) % 900, 60 + (i * 149) % 560, 160, 6, 0xd8d6c0, 0.05).setDepth(5);
      scene.tweens.add({ targets: gust, x: gust.x + 120, alpha: 0.01, duration: 3000 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  },
};
export const BARROW: Area = {
  key: 'barrow', map: 'barrow', tileset: 'downs', music: 'wilds', region: 'THE FARMLAND', place: 'The barrow',
  dialogue: barrow, enemies: [], ground: 'stone', surfaces: { 22: 'straw' }, grade: { saturation: -0.4, brightness: 0.62, vignette: 0.7 },
  npcs: [{ point: 'hound-mother', texture: 'hound-mother', hiddenIf: PACK_GONE }],
  exits: { out: { to: 'downs', spawn: 'from-barrow', prompt: 'Go back out into the light' } },
};

// The fen, upstream of the mill, over the drowned hamlet. The sluice drains it enough to reach the chapel.
export const FEN: Area = {
  key: 'fen', map: 'fen', tileset: 'fen', music: 'wilds', region: 'THE FARMLAND', place: 'The fen',
  dialogue: fen, ground: 'grass', surfaces: { 2: 'water', 3: 'wood', 10: 'water' }, grade: { saturation: -0.45, brightness: 0.7, vignette: 0.55 },
  npcs: [{ point: 'otter', texture: 'otter', hiddenIf: [{ flag: 'otter-reported' }] }],
  enemies: [
    // Both lights are visible: the route to the chapel runs past them, so they can be seen coming and steered around.
    { point: 'wisp-1', encounter: 'wisp' }, { point: 'wisp-2', encounter: 'wisp' },
    { point: 'drowned', encounter: 'drowned', hiddenIf: [{ flag: 'drowned-slain' }], defeat: { set: 'drowned-slain' } },
  ],
  props: [
    ...Array.from({ length: 8 }, (_, i) => ({ point: `reeds-${i + 1}`, texture: 'reeds', solid: true, hiddenIf: [{ flag: 'otter-trusted' as const }] })),
    ...Array.from({ length: 36 }, (_, i) => ({ point: `flood-${i + 1}`, texture: 'dark-water', solid: true, hiddenIf: [{ flag: 'sluice-open' as const }] })),
    { point: 'chapel-cache', texture: 'cache', hiddenIf: [{ owns: 'drowned-psalter' }, { not: { flag: 'drowned-slain' } }] },
  ],
  fishing: { 'fen-spot': 'fen' },
  forage: { 'forage-1': 'mushroom', 'forage-2': 'herb' },
  exits: {
    south: { to: 'farmland', spawn: 'from-fen', prompt: 'Follow the stream back down to the mill' },
    north: { to: 'weir', spawn: 'from-fen', prompt: 'Follow the path up to the weir' },
  },
  decorate(scene) {
    // Mist lying on the water.
    marshFog(scene, 860, 600, 14);
  },
};

// The highlands: carnivore country, militarized and distrusted. Every map shares the highland tileset except the fort town.
const HIGHLAND_GROUND: Pick<Area, 'region' | 'tileset' | 'ground' | 'surfaces'> = {
  region: 'THE HIGHLANDS', tileset: 'highland', ground: 'grass',
  surfaces: { 3: 'dirt', 5: 'stone', 7: 'snow', 13: 'stone', 16: 'wood', 18: 'stone', 21: 'stone', 24: 'stone', 26: 'dirt', 33: 'snow' },
};
const COLD = { saturation: -0.4, brightness: 0.8, vignette: 0.5 };
const snowfall = (scene: Phaser.Scene, width: number, height: number) => {
  for (let i = 0; i < 40; i++) {
    const flake = scene.add.rectangle((i * 89) % width, (i * 53) % height, 1, 1, 0xe8eef0, 0.7).setDepth(6);
    scene.tweens.add({ targets: flake, y: flake.y + 60, x: flake.x - 12, alpha: 0, duration: 3000 + (i % 7) * 400, repeat: -1, delay: i * 90 });
  }
};
export const PASS: Area = {
  ...HIGHLAND_GROUND, key: 'pass', map: 'pass', music: 'highlands', place: 'The high pass', dialogue: pass, grade: COLD,
  npcs: [],
  enemies: [
    { point: 'raider-1', encounter: 'raider', ambush: true }, { point: 'raider-2', encounter: 'raider', ambush: true }, { point: 'raider-3', encounter: 'raider', ambush: true, waves: 2 },
    // After the hyena, something far larger is on the road. It cannot be beaten yet.
    { point: 'inquisitor', encounter: 'inquisitor', hiddenIf: [{ not: { flag: 'hyena-slain' } }] },
  ],
  props: [{ point: 'courier', texture: 'courier', hiddenIf: [] }, { point: 'camp-pass', texture: 'campfire', hiddenIf: [] }],
  forage: { 'forage-1': 'herb' },
  camps: { 'camp-pass': { prompt: 'Rest by the fire', cost: 4, lines: ['A ring of stones out of the wind. You pay a passing carter for wood and rest with your back to the rock.'] } },
  exits: {
    south: { to: 'border-road', spawn: 'from-pass', prompt: 'Go back down to the border road' },
    north: { to: 'fort', spawn: 'from-pass', prompt: 'Walk up to the fort gate' },
    // The ladder down to the tarn, once it has been let down from this side.
    west: { to: 'tarn', spawn: 'from-pass', prompt: 'Climb down the rope ladder to the tarn', requires: { flag: 'ladder-down' },
      barred: { speaker: 'THE CLIFF EDGE', lines: ['The rope ladder is still coiled and tied off at the edge.'] } },
  },
  decorate: scene => snowfall(scene, 640, 1024),
};
export const FORT: Area = {
  key: 'fort', map: 'fort', tileset: 'fort', music: 'highlands', region: 'THE HIGHLANDS', place: 'The fort town', dialogue: { ...fort, ...fortLore },
  ground: 'dirt', surfaces: { 2: 'stone', 5: 'stone', 20: 'grass', 22: 'water' }, grade: COLD, enemies: [],
  npcs: [...['sergeant', 'quartermaster', 'lynx', 'veteran', 'merchant', 'fence', 'chaplain', 'raven', 'teacher'].map(name => ({ point: name, texture: name })),
    // The schoolmistress's two pupils, sitting for a lesson in the square.
    { point: 'cub-1', texture: 'cub' }, { point: 'cub-2', texture: 'cub' }, { point: 'smith', texture: 'smith' }],
  props: [{ point: 'camp-fort', texture: 'campfire', hiddenIf: [] }, { point: 'altar', texture: 'altar', solid: true, hiddenIf: [] }],
  camps: { 'camp-fort': { prompt: 'Rest by the garrison fire', cost: 4, lines: ['The garrison lets you sit at their fire for a few coins. Nobody asks about the brand.'] } },
  exits: {
    south: { to: 'pass', spawn: 'from-fort', prompt: 'Go back down the pass' },
    east: { to: 'battlefield', spawn: 'from-fort', prompt: 'Go down to the battlefield' },
    'barracks-door': { to: 'barracks', spawn: 'spawn', prompt: 'Enter the barracks' },
    north: { to: 'border-keep', spawn: 'from-fort', prompt: 'Climb to the old border fort' },
  },
  decorate: scene => snowfall(scene, 768, 576),
};
export const BARRACKS: Area = { ...INDOORS, region: 'THE HIGHLANDS', key: 'barracks', map: 'barracks', place: 'The fort · Barracks', dialogue: barracks,
  npcs: [], exits: { out: { to: 'fort', spawn: 'from-barracks', prompt: 'Go back outside' } } };
export const BATTLEFIELD: Area = {
  ...HIGHLAND_GROUND, key: 'battlefield', map: 'battlefield', music: 'highlands', place: 'The old battlefield', dialogue: battlefield,
  grade: { saturation: -0.5, brightness: 0.74, vignette: 0.55 }, assets: ['ghoul'],
  // The vulture takes the hero for a grave thief and fights him once, unless he comes carrying her own note. After that she will talk.
  npcs: [{ point: 'vulture', texture: 'vulture', hiddenIf: [{ not: { any: [{ flag: 'vulture-met' }, { has: 'note' }] } }, { flag: 'vulture-free' }] }],
  enemies: [
    { point: 'vulture', encounter: 'vulture', hiddenIf: [{ flag: 'vulture-met' }, { has: 'note' }, { flag: 'vulture-free' }], defeat: { set: 'vulture-met' } },
    // The hyena raises the dead; with her gone they stay down.
    { point: 'ghoul-1', encounter: 'ghoul', hiddenIf: [{ flag: 'hyena-slain' }], ambush: true }, { point: 'ghoul-2', encounter: 'ghoul', hiddenIf: [{ flag: 'hyena-slain' }], ambush: true },
  ],
  props: Array.from({ length: 8 }, (_, i) => ({ point: `gap-${i + 1}`, texture: 'chasm', solid: true, hiddenIf: [{ flag: 'bridge-lowered' as const }] })),
  exits: {
    west: { to: 'fort', spawn: 'from-battlefield', prompt: 'Climb back up to the fort' },
    east: { to: 'abbey', spawn: 'from-battlefield', prompt: 'Follow the drag marks to the abbey' },
    // The drovers' gate, opened from this side, down to the drove road and the downs.
    south: { to: 'drove', spawn: 'from-battlefield', prompt: 'Take the drove road down to the downs', requires: { flag: 'drove-gate-open' },
      barred: { speaker: 'THE DROVERS\' GATE', lines: ['The gate is still barred.'] } },
  },
  decorate: scene => snowfall(scene, 896, 640),
};
export const ABBEY: Area = {
  ...HIGHLAND_GROUND, key: 'abbey', map: 'abbey', music: 'wilds', place: 'The ruined abbey', dialogue: abbey, grade: COLD,
  npcs: [{ point: 'monk', texture: 'monk', hiddenIf: [{ flag: 'hyena-slain' }] }], assets: ['brute'],
  // The lesson fight: a spell and a heavy blow in the same round.
  enemies: [{ point: 'pair', encounter: 'pair', hiddenIf: [{ flag: 'pair-slain' }], defeat: { set: 'pair-slain' } }],
  props: [
    { point: 'abbey-cache', texture: 'cache', hiddenIf: [{ owns: 'famine-spoon' }] },
    // Her dead, dragged up into the monk's yard, until the hero buries them.
    ...([1, 2, 3] as const).map(i => ({ point: `dead-${i}`, texture: 'corpse', hiddenIf: [{ flag: `dead-${i}` as const }] })),
  ],
  exits: {
    west: { to: 'battlefield', spawn: 'from-abbey', prompt: 'Go back over the ravine' },
    // Down into the dark: the key, and a light she can't put out.
    stair: { to: 'ossuary', spawn: 'spawn', prompt: 'Go down into the ossuary', requires: { all: [{ flag: 'ossuary-key' }, { flag: 'lantern' }] },
      barred: { speaker: 'THE STAIR', lines: ['An iron grate across the stair, chained and locked from above with a church padlock. Someone up here has the key.', 'Below the grate is a dark you can feel on your face. You would want a real light.'] } },
  },
  decorate: scene => snowfall(scene, 640, 480),
};
export const OSSUARY: Area = {
  ...HIGHLAND_GROUND, key: 'ossuary', map: 'ossuary', music: 'wilds', place: 'The ossuary', dialogue: ossuary,
  ground: 'stone', grade: { saturation: -0.45, brightness: 0.6, vignette: 0.75 }, assets: ['ghoul'],
  npcs: [{ point: 'hyena', texture: 'hyena', hiddenIf: [{ flag: 'hyena-challenged' }, { flag: 'hyena-slain' }] }],
  enemies: [{ point: 'hyena', encounter: 'hyena', hiddenIf: [{ flag: 'hyena-slain' }, { not: { flag: 'hyena-challenged' } }], defeat: { set: 'hyena-slain' } }],
  // Beaten, she lies where she fell and will still talk.
  props: [{ point: 'den', texture: 'hyena', hiddenIf: [{ not: { flag: 'hyena-slain' } }] }],
  exits: { up: { to: 'abbey', spawn: 'from-ossuary', prompt: 'Climb back up to the abbey' } },
};

// The weir above the fen: the otters' country, the church fishery, and the smugglers' stair up to the highlands.
export const WEIR: Area = {
  key: 'weir', map: 'weir', tileset: 'fen', music: 'wilds', region: 'THE FARMLAND', place: 'The weir', dialogue: { ...weir, ...weirLore },
  ground: 'grass', surfaces: { 2: 'water', 3: 'wood', 21: 'stone' }, grade: { saturation: -0.45, brightness: 0.72, vignette: 0.55 },
  npcs: [
    { point: 'warden', texture: 'goose' }, { point: 'brother', texture: 'otter-kit', hiddenIf: [{ flag: 'brother-freed' }] },
    { point: 'elder', texture: 'otter-elder' }, { point: 'kin', texture: 'otter-kit' }, { point: 'smuggler', texture: 'mink' }, { point: 'ferry', texture: 'ferry' },
  ],
  enemies: [
    { point: 'wisp-1', encounter: 'wisp' }, { point: 'wisp-2', encounter: 'wisp', ambush: true },
    // Wetherby's drowned don't all stay down.
    { point: 'drowned-1', encounter: 'ghoul', ambush: true },
  ],
  assets: ['ghoul'],
  props: [{ point: 'cage', texture: 'cage', solid: true, hiddenIf: [{ flag: 'brother-freed' }] }],
  fishing: { 'weir-spot': 'weir' },
  forage: { 'forage-1': 'berry', 'forage-2': 'herb' },
  exits: {
    south: { to: 'fen', spawn: 'from-weir', prompt: 'Go back down to the fen' },
    // The crane ferries the church's convicts downriver once the highlands are settled.
    downriver: { to: 'causeway', spawn: 'from-weir', prompt: 'Take the ferry downriver', requires: { flag: 'hyena-slain' },
      barred: { speaker: 'THE CRANE', lines: ['"Downriver\'s shut. There\'s sickness in the river towns. I take nobody down unless the church sends them."', '"And the church hasn\'t sent anyone it wants back."'] } },
    stair: { to: 'tarn', spawn: 'from-weir', prompt: 'Climb the smugglers\' stair', requires: { flag: 'brother-freed' },
      barred: { speaker: 'THE CLIFF', lines: ['Willow roots hang over a crack in the rock. If there is a way up, only the otters know it.'] } },
  },
  decorate(scene) {
    marshFog(scene, 620, 460, 10);
  },
};
// The high tarn: a frozen lake under the pass, linking the otters' stair to the garrison road.
export const TARN: Area = {
  ...HIGHLAND_GROUND, key: 'tarn', map: 'tarn', music: 'highlands', place: 'The high tarn', dialogue: tarn, grade: COLD,
  surfaces: { ...HIGHLAND_GROUND.surfaces, 29: 'stone', 32: 'stone' },
  npcs: [{ point: 'trapper', texture: 'trapper' }],
  enemies: [
    { point: 'hound-1', encounter: 'hound', ambush: true }, { point: 'hound-2', encounter: 'hound', ambush: true },
    { point: 'raider-1', encounter: 'raider', ambush: true },
  ],
  props: [{ point: 'camp-tarn', texture: 'campfire', hiddenIf: [] }],
  fishing: { 'tarn-spot': 'tarn' },
  forage: { 'forage-1': 'mushroom' },
  camps: { 'camp-tarn': { prompt: 'Rest by the trapper\'s fire', cost: 3, lines: ['The trapper lets you rest by his fire for a few coins. The ice groans the whole time.'] } },
  exits: {
    stair: { to: 'weir', spawn: 'from-tarn', prompt: 'Go down the smugglers\' stair' },
    ladder: { to: 'pass', spawn: 'from-tarn', prompt: 'Climb the rope ladder to the pass', requires: { flag: 'ladder-down' },
      barred: { speaker: 'THE CLIFF', lines: ['A rope ladder hangs from the cliff above, pulled up and tied off out of reach.'] } },
  },
  decorate: scene => snowfall(scene, 704, 512),
};
// The drove road: the downs to the battlefield gate, the long way round to the highlands.
export const DROVE: Area = {
  ...HIGHLAND_GROUND, key: 'drove', map: 'drove', music: 'highlands', place: 'The drove road', dialogue: drove,
  grade: { saturation: -0.35, brightness: 0.84, vignette: 0.45 },
  npcs: [{ point: 'drover', texture: 'drover' }],
  forage: { 'forage-1': 'berry' },
  enemies: [
    // The raider camp fights in two waves.
    { point: 'raider-1', encounter: 'raider', ambush: true, waves: 2 }, { point: 'raider-2', encounter: 'raider', ambush: true },
    { point: 'hound-1', encounter: 'hound', ambush: true },
  ],
  props: [
    ...(['a', 'b', 'c'] as const).map(id => ({ point: `sheep-${id}`, texture: 'sheep', solid: true, hiddenIf: [] })),
    { point: 'raider-stash', texture: 'cache', hiddenIf: [{ flag: 'drover-cache' as const }] },
    ...[1, 2].map(i => ({ point: `gate-${i}`, texture: 'gate', solid: true, hiddenIf: [{ flag: 'drove-gate-open' as const }] })),
  ],
  exits: {
    west: { to: 'downs', spawn: 'from-drove', prompt: 'Go back down to the downs' },
    north: { to: 'battlefield', spawn: 'from-drove', prompt: 'Go through the gate to the battlefield', requires: { flag: 'drove-gate-open' },
      barred: { speaker: 'THE DROVERS\' GATE', lines: ['A five-bar gate across the road, barred from the far side with a heavy beam.'] } },
  },
};

// The capital: the square outside the church, the harbour below, and the hall where the feast was held. Nobody fights here.
const CITY = { saturation: -0.35, brightness: 0.8, vignette: 0.5 };
export const SQUARE: Area = {
  key: 'square', map: 'square', tileset: 'city', music: 'town', region: 'THE CAPITAL', place: 'The church square', dialogue: square,
  ground: 'stone', surfaces: { 1: 'stone', 2: 'stone', 11: 'stone' }, grade: CITY, enemies: [],
  npcs: [
    { point: 'crier', texture: 'crier' }, { point: 'broadsheets', texture: 'broadsheet' }, { point: 'lamplighter', texture: 'lamplighter' },
    { point: 'guard-square', texture: 'guard' }, { point: 'apothecary', texture: 'apothecary' }, { point: 'citizen', texture: 'citizen' },
  ],
  exits: {
    east: { to: 'church', spawn: 'from-square', prompt: 'Go back into the church' },
    south: { to: 'harbour', spawn: 'from-square', prompt: 'Go down to the harbour' },
    'hall-door': { to: 'feast-hall', spawn: 'spawn', prompt: 'Enter the hall of the Long Table', requires: { flag: 'hall-key' },
      barred: { speaker: 'THE HALL OF THE LONG TABLE', lines: ['The bronze doors are chained. A notice: CLOSED BY ORDER OF THE REGENCY.', 'Under the chain there is a smaller lock, for the staff.'] } },
  },
};
export const HARBOUR: Area = {
  key: 'harbour', map: 'harbour', tileset: 'city', music: 'town', region: 'THE CAPITAL', place: 'The harbour', dialogue: harbour,
  ground: 'stone', surfaces: { 15: 'wood', 11: 'stone' }, grade: CITY, enemies: [],
  npcs: [
    { point: 'fishwife', texture: 'fishwife' }, { point: 'crab', texture: 'crab', hiddenIf: [{ flag: 'crab-freed' }] },
    { point: 'harbourmaster', texture: 'harbourmaster' }, { point: 'steward', texture: 'steward' }, { point: 'dockhand', texture: 'carter' },
  ],
  props: [{ point: 'kraken-arm', texture: 'kraken-arm-long', solid: true, hiddenIf: [] }],
  fishing: { 'harbour-spot': 'stream' },
  exits: {
    north: { to: 'square', spawn: 'from-harbour', prompt: 'Climb the steps to the square' },
    // The tidal road up the estuary: shut by the church until it sends you, and only above water by day.
    west: { to: 'wickmere', spawn: 'from-harbour', prompt: 'Take the tidal road to Wickmere', requires: { all: [{ flag: 'hyena-slain' }, { night: false }] },
      barred: { speaker: 'THE TIDAL ROAD', lines: ['A causeway of shingle along the estuary, upriver to Wickmere. It\'s under water at high tide, and the tide comes in at dark.', 'A church marine stands at the start of it. "Sickness upriver. Only the church\'s own go up, and only by day."'] } },
  },
  decorate(scene) {
    // Gulls wheeling over the water.
    for (let i = 0; i < 6; i++) {
      const gull = scene.add.image(80 + (i * 131) % 640, 380 + (i * 37) % 80, 'crow').setDepth(6).setTint(0xe8e8e4).setAlpha(0.8);
      scene.tweens.add({ targets: gull, x: gull.x + 60 - (i % 3) * 40, y: gull.y - 20 + (i % 2) * 30, duration: 3600 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  },
};
export const FEAST_HALL: Area = {
  ...INDOORS, region: 'THE CAPITAL', music: 'church', key: 'feast-hall', map: 'feast-hall', place: 'The hall of the Long Table', dialogue: feastHall,
  grade: { saturation: -0.45, brightness: 0.66, vignette: 0.65 }, ground: 'stone',
  npcs: [{ point: 'cleaner', texture: 'cleaner' }],
  props: ([1, 2, 3] as const).map(i => ({ point: `kraken-${i}`, texture: 'kraken-arm', solid: true, hiddenIf: [] })),
  exits: { out: { to: 'square', spawn: 'from-hall', prompt: 'Go back out to the square' } },
};

// The old border fort above the fort town.
export const BORDER_KEEP: Area = {
  ...HIGHLAND_GROUND, key: 'border-keep', map: 'border-keep', music: 'highlands', place: 'The old border fort', dialogue: keep,
  grade: { saturation: -0.45, brightness: 0.74, vignette: 0.55 }, npcs: [], assets: ['lieutenant'],
  enemies: [
    { point: 'hound-1', encounter: 'hound', ambush: true }, { point: 'hound-2', encounter: 'hound', ambush: true },
    { point: 'captain', encounter: 'captain', hiddenIf: [{ flag: 'captain-slain' }], defeat: { set: 'captain-slain' } },
  ],
  props: [{ point: 'lantern', texture: 'cache', hiddenIf: [{ not: { flag: 'captain-slain' } }, { flag: 'lantern' }] }],
  exits: {
    south: { to: 'fort', spawn: 'from-keep', prompt: 'Go back down to the fort town' },
    north: { to: 'rookery-road', spawn: 'from-keep', prompt: 'Climb the rookery road' },
  },
  decorate: scene => snowfall(scene, 640, 544),
};

// The rookery road, up toward the mountain holds, where the harriers have the road now.
export const ROOKERY_ROAD: Area = {
  ...HIGHLAND_GROUND, key: 'rookery-road', map: 'rookery-road', music: 'highlands', place: 'The rookery road', dialogue: rookery,
  grade: { saturation: -0.45, brightness: 0.76, vignette: 0.55 }, npcs: [],
  enemies: [
    { point: 'harrier-1', encounter: 'harrier' }, { point: 'harrier-2', encounter: 'harrier', waves: 2 },
    { point: 'hound-1', encounter: 'hound', ambush: true },
  ],
  props: [{ point: 'frozen-courier', texture: 'courier', hiddenIf: [] }, { point: 'camp-rookery', texture: 'campfire', hiddenIf: [] }],
  forage: { 'forage-1': 'herb' },
  camps: { 'camp-rookery': { prompt: 'Rest in the couriers\' shelter', cost: 4, lines: ['You burn the last of someone\'s kindling in the couriers\' cairn. The wind never stops.'] } },
  exits: { south: { to: 'border-keep', spawn: 'from-rookery', prompt: 'Go back down to the old border fort' } },
  decorate: scene => snowfall(scene, 576, 768),
};

// The rivers and marsh: downriver from the weir, where the river meets the tide.
const MARSH_GROUND: Pick<Area, 'region' | 'tileset' | 'ground' | 'surfaces' | 'music'> = {
  region: 'THE MARSH', tileset: 'marsh', ground: 'grass', music: 'marsh',
  surfaces: { 2: 'dirt', 3: 'wood', 8: 'wood', 13: 'wood', 19: 'water', 20: 'wood' },
};
// Low fog on the water, drifting.
function marshFog(scene: Phaser.Scene, width: number, height: number, thick = 14) {
  for (let i = 0; i < thick; i++) {
    const mist = scene.add.image(20 + (i * 151) % width, 30 + (i * 97) % height, 'fogbank').setDepth(6).setAlpha(0.6).setScale(1 + (i % 3) * 0.35, 1 + (i % 2) * 0.4);
    scene.tweens.add({ targets: mist, x: mist.x - 60, alpha: 0.3, duration: 7000 + i * 430, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

export const CAUSEWAY: Area = {
  ...MARSH_GROUND, key: 'causeway', map: 'causeway', place: 'The causeway', dialogue: causeway, fog: true,
  grade: { saturation: -0.5, brightness: 0.7, vignette: 0.6 }, assets: ['wriggler'],
  npcs: [{ point: 'fisher', texture: 'coypu' }],
  enemies: [
    { point: 'mosquito-1', encounter: 'mosquito' }, { point: 'mosquito-2', encounter: 'mosquito', ambush: true }, { point: 'mosquito-3', encounter: 'mosquito' },
    { point: 'scorpion-1', encounter: 'scorpion', ambush: true }, { point: 'scorpion-2', encounter: 'scorpion', ambush: true },
    { point: 'brood', encounter: 'brood', hiddenIf: [{ flag: 'brood-slain' }], defeat: { set: 'brood-slain' } },
  ],
  props: [{ point: 'camp-causeway', texture: 'campfire', hiddenIf: [] }],
  fishing: { 'causeway-spot': 'causeway' },
  forage: { 'forage-1': 'herb', 'forage-2': 'mushroom' },
  camps: { 'camp-causeway': { prompt: 'Rest at the fisher\'s platform', cost: 3, lines: ['Somebody\'s old fire on a platform of planks. The fog comes right up to the edge of the light and stops.'] } },
  exits: {
    upriver: { to: 'weir', spawn: 'from-causeway', prompt: 'Take the ferry back upriver' },
    east: { to: 'wickmere', spawn: 'from-causeway', prompt: 'Walk on to Wickmere' },
  },
  decorate: scene => marshFog(scene, 768, 576, 18),
};

export const WICKMERE: Area = {
  ...MARSH_GROUND, key: 'wickmere', map: 'wickmere', place: 'Wickmere', dialogue: wickmere,
  grade: { saturation: -0.45, brightness: 0.74, vignette: 0.5 },
  npcs: [
    { point: 'magistrate', texture: 'magistrate' }, { point: 'newt', texture: 'newt', hiddenIf: [{ flag: 'newt-freed' }] }, { point: 'ferryman', texture: 'beaver' },
    { point: 'smoker', texture: 'smoker' }, { point: 'widow', texture: 'widow' }, { point: 'child', texture: 'vole' }, { point: 'mourner', texture: 'water-rat' },
    { point: 'herbalist', texture: 'herbalist' },
  ],
  enemies: [],
  props: [{ point: 'cage', texture: 'cage', solid: true, hiddenIf: [{ flag: 'newt-freed' }] }, { point: 'camp-wickmere', texture: 'campfire', hiddenIf: [] }],
  fishing: { 'wickmere-spot': 'wickmere' },
  camps: { 'camp-wickmere': { prompt: 'Rest by the brazier', cost: 4, lines: ['A brazier on the deck, where the smokehouse workers warm their hands. Nobody sits near you.'] } },
  exits: {
    west: { to: 'causeway', spawn: 'from-wickmere', prompt: 'Go back along the causeway' },
    south: { to: 'harbour', spawn: 'from-marsh', prompt: 'Take the tidal road down to the capital', requires: { night: false },
      barred: { speaker: 'THE TIDAL ROAD', lines: ['The shingle road down the estuary is under the tide. It comes back out at first light.'] } },
    'hospice-door': { to: 'hospice', spawn: 'spawn', prompt: 'Enter the hospice' },
    channel: { to: 'far-bank', spawn: 'from-wickmere', prompt: 'Speak the word, and walk across the channel', requires: { flag: 'channel-firm' },
      barred: { speaker: 'THE CHANNEL', lines: ['Deep, fast water between Wickmere and the far bank. The ferryman\'s boat is tied up, and he isn\'t in it.'] } },
  },
  decorate: scene => marshFog(scene, 704, 544, 8),
};

export const HOSPICE: Area = {
  ...MARSH_GROUND, key: 'hospice', map: 'hospice', music: 'church', place: 'The hospice', dialogue: hospice, ground: 'wood',
  grade: { saturation: -0.5, brightness: 0.68, vignette: 0.6 },
  npcs: [
    { point: 'sister', texture: 'sister' }, { point: 'frog', texture: 'frog', hiddenIf: [{ flag: 'frog-free' }] },
    { point: 'patient-1', texture: 'sick-badger' }, { point: 'patient-2', texture: 'sick-hare' },
  ],
  enemies: [],
  exits: { out: { to: 'wickmere', spawn: 'from-hospice', prompt: 'Go back out to the decks' } },
};

export const FAR_BANK: Area = {
  ...MARSH_GROUND, key: 'far-bank', map: 'far-bank', place: 'The far bank', dialogue: farBank, fog: true, ground: 'dirt',
  grade: { saturation: -0.5, brightness: 0.68, vignette: 0.6 },
  npcs: [],
  enemies: [
    { point: 'mosquito-1', encounter: 'mosquito', ambush: true }, { point: 'mosquito-2', encounter: 'mosquito' }, { point: 'scorpion-1', encounter: 'scorpion', ambush: true },
    { point: 'apprentice', encounter: 'apprentice', hiddenIf: [{ flag: 'apprentice-slain' }], defeat: { set: 'apprentice-slain' } },
  ],
  forage: { 'forage-1': 'herb' },
  exits: {
    ferry: { to: 'wickmere', spawn: 'from-far-bank', prompt: 'Walk back across the channel' },
    'apothecary-door': { to: 'apothecary', spawn: 'spawn', prompt: 'Wade into the apothecary', requires: { flag: 'frog-free' },
      barred: { speaker: 'THE APOTHECARY', lines: ['The door is under water to the knee. Something inside is breathing, slow and patient.', 'You wouldn\'t go in there without someone who knows poison.'] } },
  },
  decorate: scene => marshFog(scene, 640, 480, 14),
};

export const APOTHECARY: Area = {
  ...MARSH_GROUND, key: 'apothecary', map: 'apothecary', music: 'wilds', place: 'The flooded apothecary', dialogue: apothecary, ground: 'water',
  grade: { saturation: -0.5, brightness: 0.6, vignette: 0.75 },
  npcs: [{ point: 'viper', texture: 'viper', hiddenIf: [{ flag: 'viper-challenged' }, { flag: 'viper-slain' }] }],
  enemies: [{ point: 'viper', encounter: 'viper', hiddenIf: [{ flag: 'viper-slain' }, { not: { flag: 'viper-challenged' } }], defeat: { set: 'viper-slain', find: 'viper-fang' } }],
  // Beaten, she lies where she fell and will still talk.
  props: [{ point: 'den', texture: 'viper', hiddenIf: [{ not: { flag: 'viper-slain' } }] }],
  exits: { out: { to: 'far-bank', spawn: 'from-apothecary', prompt: 'Wade back out' } },
};

export const AREAS = [CHURCH, FARMLAND, TOWN, BORDER_ROAD, BOAR_FARM, INN, HALL, TANNERY, MILL, DOWNS, BARROW, FEN, PASS, FORT, BARRACKS, BATTLEFIELD, ABBEY, OSSUARY, WEIR, TARN, DROVE, SQUARE, HARBOUR, FEAST_HALL, BORDER_KEEP, ROOKERY_ROAD, CAUSEWAY, WICKMERE, HOSPICE, FAR_BANK, APOTHECARY];
