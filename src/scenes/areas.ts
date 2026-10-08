import type Phaser from 'phaser';
import { church } from '../content/church';
import { farm } from '../content/farm';
import type { Dialogue } from '../content/dialogue';
import { border } from '../content/border';
import { fields } from '../content/fields';
import { town } from '../content/town';
import type { Encounter } from '../rules/battle';
import type { Condition, Effect } from '../rules/world';
import type { SpotId } from '../rules/fishing';

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
  // Points that lead elsewhere when the hero interacts with them.
  exits: Record<string, { to: string; spawn: string; prompt: string }>;
  // Points where the hero can fish.
  fishing?: Record<string, SpotId>;
  // Places to rest: resting heals every wound and brings the area's enemies back.
  camps?: Record<string, { prompt: string; lines: string[] }>;
  decorate?: (scene: Phaser.Scene) => void;
};

export const CHURCH: Area = {
  key: 'church', map: 'church', tileset: 'church', region: 'THE CAPITAL', place: 'Church of the Covenant', time: 'Before dawn',
  bounds: [32, 48, 448, 304], dialogue: church,
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

export const FARMLAND: Area = {
  key: 'farmland', map: 'farmland', tileset: 'fields', region: 'THE FARMLAND', place: 'The fields', time: 'Dawn',
  dialogue: fields, assets: ['bear', 'nymph'],
  npcs: [{ point: 'bear', texture: 'bear', hiddenIf: [{ flag: 'bear-free' }] }, { point: 'miller', texture: 'miller' }, { point: 'heron', texture: 'heron' }, { point: 'shepherd', texture: 'shepherd' }],
  enemies: [
    // The reeve's fields: clearing both earns the writ that frees the bear.
    { point: 'locust', encounter: 'locust', defeat: { set: 'pests-field' } }, { point: 'locust-road', encounter: 'locust' },
    { point: 'weevil-yard', encounter: 'weevil', defeat: { set: 'pests-yard' } }, { point: 'weevil-orchard', encounter: 'weevil' }, { point: 'weevil-woods', encounter: 'weevil' },
    { point: 'exile', encounter: 'acolyte' },
    { point: 'swarm', encounter: 'swarm', hiddenIf: [{ flag: 'swarm-slain' }], defeat: { set: 'swarm-slain' } },
  ],
  props: [
    { point: 'bell', texture: 'bell', hiddenIf: [{ has: 'bell' }, { flag: 'lamb-thanked' }] },
    ...([['camp-cache', 'cracked-mirror'], ['orchard-cache', 'crow-feather'], ['shrine-cache', 'covenant-token'], ['ford-cache', 'yoke-peg']] as const)
      .map(([point, keepsake]) => ({ point, texture: 'cache', hiddenIf: [{ owns: keepsake }] })),
    { point: 'camp-fields', texture: 'campfire', hiddenIf: [] },
    { point: 'camp-woods', texture: 'campfire', hiddenIf: [] },
    ...(['woods', 'orchard', 'yard'] as const).map(where => ({ point: `sheep-${where}`, texture: 'sheep', solid: true, hiddenIf: [{ flag: `sheep-${where}` as const }] })),
  ],
  fishing: { 'pond-spot': 'pond', 'stream-spot': 'stream' },
  camps: {
    'camp-fields': { prompt: 'Rest by the fire', lines: ['A shepherd\'s fire ring at the crossroads. You rest until the ache goes out of you.', 'Out in the fields, the things you drove off creep back.'] },
    'camp-woods': { prompt: 'Rest by the fire', lines: ['You coax the old camp fire back to life and sleep under the grey tent.', 'In the dark between the trees, something that was gone is not gone anymore.'] },
  },
  exits: {
    door: { to: 'church', spawn: 'from-road', prompt: 'Return to the church' },
    south: { to: 'town', spawn: 'spawn', prompt: 'Walk on to Millbrook' },
    east: { to: 'border-road', spawn: 'from-fields', prompt: 'Take the field track to the border' },
  },
  decorate(scene) {
    // A low dawn haze drifting across the fields.
    for (let i = 0; i < 10; i++) {
      const haze = scene.add.rectangle(60 + (i * 211) % 960, 90 + (i * 137) % 640, 170, 26, 0xe6d9a8, 0.05).setDepth(5);
      scene.tweens.add({ targets: haze, x: haze.x + 30, alpha: 0.02, duration: 5200 + i * 700, yoyo: true, repeat: -1 });
    }
  },
};

export const TOWN: Area = {
  key: 'town', map: 'town', tileset: 'town', region: 'THE FARMLAND', place: 'Millbrook', time: 'Morning',
  dialogue: town, enemies: [],
  npcs: ['reeve', 'innkeeper', 'shopkeeper', 'child', 'fishmonger', 'fox'].map(name => ({ point: name, texture: name })),
  exits: {
    north: { to: 'farmland', spawn: 'from-town', prompt: 'Return to the fields' },
    south: { to: 'border-road', spawn: 'spawn', prompt: 'Take the border road' },
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
  key: 'border-road', map: 'border-road', tileset: 'border', region: 'THE FARMLAND', place: 'The border road', time: 'Midday',
  dialogue: border, enemies: [{ point: 'follower', encounter: 'acolyte' }],
  npcs: [{ point: 'driver', texture: 'driver' }, { point: 'guard', texture: 'guard' }],
  camps: { 'camp-border': { prompt: 'Rest by the fire', lines: ['The carters\' fire, banked and waiting. They let you sit by it. Nobody speaks, but nobody leaves either.'] } },
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
  key: 'boar-farm', map: 'boar-farm', tileset: 'ash', region: 'THE FARMLAND', place: 'The burned farm', time: 'Afternoon',
  dialogue: farm, npcs: [], assets: ['badger', 'rat'],
  enemies: [{ point: 'boar', encounter: 'boar', hiddenIf: [{ flag: 'boar-defeated' }], defeat: { set: 'boar-defeated' } }],
  props: [
    { point: 'badger', texture: 'badger', solid: true, hiddenIf: [] },
    { point: 'rat', texture: 'rat', solid: true, hiddenIf: [] },
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

export const AREAS = [CHURCH, FARMLAND, TOWN, BORDER_ROAD, BOAR_FARM];
