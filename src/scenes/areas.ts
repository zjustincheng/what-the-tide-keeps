import type Phaser from 'phaser';
import { church } from '../content/church';
import { farm } from '../content/farm';
import type { Dialogue } from '../content/dialogue';
import { border } from '../content/border';
import { fields } from '../content/fields';
import { town } from '../content/town';
import { hall, inn, millInside, tannery } from '../content/interiors';
import type { Encounter } from '../rules/battle';
import type { Condition, Effect, Flag } from '../rules/world';
import type { SpotId } from '../rules/fishing';
import type { ThemeId } from '../audio/themes';

export type Area = {
  key: string;
  map: string;
  tileset: string;
  region: string;
  place: string;
  time: string;
  // Where the hero may walk; the whole map when omitted. Larger maps scroll with the hero.
  bounds?: [x: number, y: number, width: number, height: number];
  dialogue: Dialogue;
  // People on the map. One whose hiddenIf condition holds has left.
  npcs: { point: string; texture: string; hiddenIf?: Condition[] }[];
  // Enemies respawn on every visit unless hiddenIf holds; defeat applies once the fight is won.
  enemies: { point: string; encounter: Encounter; hiddenIf?: Condition[]; defeat?: Effect }[];
  // SVG art in public/assets to load, beyond the map, tiles, and enemies.
  assets?: string[];
  // Objects on the map that disappear once any hiddenIf condition holds. Solid ones block the way.
  props?: { point: string; texture: string; solid?: boolean; hiddenIf: Condition[] }[];
  // Points that lead elsewhere when the hero interacts with them. A barred exit only opens once requires holds.
  exits: Record<string, { to: string; spawn: string; prompt: string; requires?: Condition; barred?: { speaker: string; lines: string[] } }>;
  // Points where the hero can fish.
  fishing?: Record<string, SpotId>;
  // Places to rest: resting heals every wound and brings the area's enemies back.
  camps?: Record<string, { prompt: string; lines: string[] }>;
  decorate?: (scene: Phaser.Scene) => void;
  // The theme that plays here.
  music: ThemeId;
  // The colour grade over the map: saturation shift, brightness multiplier, and vignette strength.
  grade?: { saturation?: number; brightness?: number; vignette?: number };
};

export const CHURCH: Area = {
  key: 'church', map: 'church', tileset: 'church', music: 'church', region: 'THE CAPITAL', place: 'Church of the Covenant', time: 'Before dawn',
  bounds: [32, 48, 448, 304], dialogue: church,
  // Candlelight keeps a little warmth in the church; everywhere else is colder.
  grade: { saturation: -0.35, brightness: 0.78, vignette: 0.5 },
  npcs: [{ point: 'priest', texture: 'priest' }],
  enemies: [{ point: 'encounter', encounter: 'locust' }, { point: 'exile', encounter: 'acolyte' }],
  exits: { door: { to: 'farmland', spawn: 'spawn', prompt: 'Step outside' } },
  camps: { spawn: { prompt: 'Rest on the cot', lines: ['You lie down on the cot. The priest\'s candle burns down while you sleep, and you wake whole.'] } },
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
  key: 'farmland', map: 'farmland', tileset: 'fields', music: 'fields', region: 'THE FARMLAND', place: 'The fields', time: 'Dawn',
  dialogue: fields, assets: ['bear', 'nymph', 'votive'],
  npcs: [{ point: 'bear', texture: 'bear', hiddenIf: [{ flag: 'bear-free' }] }, { point: 'miller', texture: 'miller' }, { point: 'heron', texture: 'heron' }, { point: 'shepherd', texture: 'shepherd' }],
  enemies: [
    // The reeve's fields: clearing both earns the writ that frees the bear.
    { point: 'locust', encounter: 'locust', defeat: { set: 'pests-field' } }, { point: 'locust-road', encounter: 'locust' },
    { point: 'weevil-yard', encounter: 'weevil', defeat: { set: 'pests-yard' } }, { point: 'weevil-orchard', encounter: 'weevil' }, { point: 'weevil-woods', encounter: 'weevil' },
    { point: 'exile', encounter: 'acolyte' },
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
    { point: 'gibbet', texture: 'gibbet', solid: true, hiddenIf: [] },
    { point: 'bones', texture: 'bones', hiddenIf: [] },
    { point: 'camp-woods', texture: 'campfire', hiddenIf: [] },
    ...(['woods', 'orchard', 'yard'] as const).map(where => ({ point: `sheep-${where}`, texture: 'sheep', solid: true, hiddenIf: [{ flag: `sheep-${where}` as const }] })),
  ],
  fishing: { 'pond-spot': 'pond', 'stream-spot': 'stream' },
  camps: {
    'camp-fields': { prompt: 'Rest by the fire', lines: ['The shepherds\' fire ring at the crossroads. You sleep until the ache goes out of you.', 'By morning the fields have filled up again.'] },
    'camp-woods': { prompt: 'Rest by the fire', lines: ['You get the old fire going again and sleep under the grey tent.', 'Something is moving in the trees again.'] },
  },
  exits: {
    door: { to: 'church', spawn: 'from-road', prompt: 'Return to the church' },
    south: { to: 'town', spawn: 'spawn', prompt: 'Walk on to Millbrook' },
    east: { to: 'border-road', spawn: 'from-fields', prompt: 'Take the field track to the border' },
    'mill-door': { to: 'mill-inside', spawn: 'spawn', prompt: 'Enter the mill' },
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
  key: 'town', map: 'town', tileset: 'town', music: 'town', region: 'THE FARMLAND', place: 'Millbrook', time: 'Morning',
  dialogue: town, enemies: [],
  npcs: ['reeve', 'innkeeper', 'shopkeeper', 'child', 'fishmonger', 'fox'].map(name => ({ point: name, texture: name })),
  props: [{ point: 'stocks', texture: 'stocks', solid: true, hiddenIf: [] }],
  exits: {
    north: { to: 'farmland', spawn: 'from-town', prompt: 'Return to the fields' },
    south: { to: 'border-road', spawn: 'spawn', prompt: 'Take the border road' },
    'hall-door': { to: 'hall', spawn: 'spawn', prompt: "Enter the reeve's hall" },
    'inn-door': { to: 'inn', spawn: 'spawn', prompt: 'Enter the inn', requires: { any: [{ flag: 'inn-room' }, { flag: 'boar-defeated' }] },
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
  key: 'border-road', map: 'border-road', tileset: 'border', music: 'wilds', region: 'THE FARMLAND', place: 'The border road', time: 'Midday',
  dialogue: border, enemies: [{ point: 'follower', encounter: 'acolyte' }],
  npcs: [{ point: 'driver', texture: 'driver' }, { point: 'guard', texture: 'guard' }],
  camps: { 'camp-border': { prompt: 'Rest by the fire', lines: ['The carters let you sit at their fire. Nobody talks much.'] } },
  props: [
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ point: `bramble-${i}`, texture: 'brambles', solid: true, hiddenIf: [{ flag: 'hedge-open' as const }] })),
    { point: 'camp-border', texture: 'campfire', hiddenIf: [] },
  ],
  exits: {
    north: { to: 'town', spawn: 'from-border', prompt: 'Return to Millbrook' },
    east: { to: 'farmland', spawn: 'from-border', prompt: 'Take the field track' },
    south: { to: 'boar-farm', spawn: 'spawn', prompt: 'Follow the smoke' },
  },
};

export const BOAR_FARM: Area = {
  key: 'boar-farm', map: 'boar-farm', tileset: 'ash', music: 'wilds', region: 'THE FARMLAND', place: 'The burned farm', time: 'Afternoon',
  dialogue: farm, npcs: [], assets: ['badger', 'rat'],
  enemies: [{ point: 'boar', encounter: 'boar', hiddenIf: [{ flag: 'boar-defeated' }], defeat: { set: 'boar-defeated' } }],
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
const INDOORS: Pick<Area, 'region' | 'tileset' | 'grade' | 'enemies' | 'music'> = { region: 'THE FARMLAND', tileset: 'interior', music: 'hearth', grade: { saturation: -0.3, brightness: 0.74, vignette: 0.55 }, enemies: [] };
export const INN: Area = { ...INDOORS, key: 'inn', map: 'inn', place: 'Millbrook · The inn', time: 'Morning', dialogue: inn,
  npcs: [{ point: 'drinker', texture: 'drinker' }, { point: 'patron', texture: 'patron' }],
  camps: { bed: { prompt: 'Sleep in the bed', lines: ['You sleep in a real bed for the first time you can remember. Your wounds close and your mana returns.'] } },
  exits: { out: { to: 'town', spawn: 'from-inn', prompt: 'Go back outside' } } };
export const HALL: Area = { ...INDOORS, key: 'hall', map: 'hall', place: "Millbrook · The reeve's hall", time: 'Morning', dialogue: hall,
  npcs: [{ point: 'clerk', texture: 'clerk' }], exits: { out: { to: 'town', spawn: 'from-hall', prompt: 'Go back outside' } } };
export const TANNERY: Area = { ...INDOORS, key: 'tannery', map: 'tannery', place: 'Millbrook · The tannery', time: 'Morning', dialogue: tannery,
  npcs: [{ point: 'tanner', texture: 'tanner' }], exits: { out: { to: 'town', spawn: 'from-tannery', prompt: 'Go back outside' } } };
export const MILL: Area = { ...INDOORS, key: 'mill-inside', map: 'mill-inside', place: 'The mill', time: 'Dawn', dialogue: millInside,
  npcs: [], exits: { out: { to: 'farmland', spawn: 'from-mill', prompt: 'Go back outside' } } };

export const AREAS = [CHURCH, FARMLAND, TOWN, BORDER_ROAD, BOAR_FARM, INN, HALL, TANNERY, MILL];
