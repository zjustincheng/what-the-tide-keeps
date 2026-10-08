import type Phaser from 'phaser';
import { church } from '../content/church';
import type { Dialogue } from '../content/dialogue';
import { road } from '../content/road';
import type { Encounter } from '../rules/battle';

export type Area = {
  key: string;
  map: string;
  tileset: string;
  region: string;
  place: string;
  time: string;
  bounds: [x: number, y: number, width: number, height: number];
  dialogue: Dialogue;
  npcs: { point: string; texture: string }[];
  enemies: { point: string; encounter: Encounter }[];
  // Points that lead elsewhere when the hero interacts with them.
  exits: Record<string, { to: string; spawn: string; prompt: string }>;
  decorate?: (scene: Phaser.Scene) => void;
};

export const CHURCH: Area = {
  key: 'church', map: 'church', tileset: 'church', region: 'THE CAPITAL', place: 'Church of the Covenant', time: 'Before dawn',
  bounds: [32, 48, 448, 304], dialogue: church,
  npcs: [{ point: 'priest', texture: 'priest' }],
  enemies: [{ point: 'encounter', encounter: 'locust' }, { point: 'exile', encounter: 'acolyte' }],
  exits: { door: { to: 'farm-road', spawn: 'spawn', prompt: 'Step outside' } },
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

export const FARM_ROAD: Area = {
  key: 'farm-road', map: 'farm-road', tileset: 'farm', region: 'THE FARMLAND', place: 'The farm road', time: 'Dawn',
  bounds: [0, 0, 512, 384], dialogue: road, npcs: [],
  enemies: [{ point: 'locust', encounter: 'locust' }, { point: 'locust-road', encounter: 'locust' }, { point: 'weevil', encounter: 'weevil' }],
  exits: { door: { to: 'church', spawn: 'from-road', prompt: 'Return to the church' } },
  decorate(scene) {
    // A low dawn haze drifting across the fields.
    for (let i = 0; i < 4; i++) {
      const haze = scene.add.rectangle(40 + i * 130, 120 + (i % 2) * 140, 150, 26, 0xe6d9a8, 0.05).setDepth(5);
      scene.tweens.add({ targets: haze, x: haze.x + 30, alpha: 0.02, duration: 5200 + i * 700, yoyo: true, repeat: -1 });
    }
  },
};

export const AREAS = [CHURCH, FARM_ROAD];
