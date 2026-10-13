import type Phaser from 'phaser';
import type { Hollow } from '../../content/secrets';
import { loadWorld } from '../../storage/world';
import { music } from '../../audio/music';
import type { AreaScene } from '../AreaScene';

type Hidden = { hollow: Hollow; cells: [number, number][]; cracks: Phaser.GameObjects.Graphics };

// The cells a hollow covers: its room, and its door if that stands outside the room.
const cells = ({ room: [x, y, w, h], door }: Hollow): [number, number][] => [
  ...Array.from({ length: w * h }, (_, i) => [x + (i % w), y + Math.floor(i / w)] as [number, number]),
  ...(door ? [[door[0], door[1]] as [number, number]] : []),
];

// Walls that only look solid. Each is drawn like the wall around it but can be walked through; the face that opens onto
// the map carries a thin crack, the only tell. Walk into it and the whole cover crumbles away, and stays gone.
export class Hollows {
  private hidden: Hidden[] = [];

  constructor(private scene: AreaScene) {
    const { walls } = scene;
    const flags = loadWorld().flags;
    for (const hollow of scene.area.hollows ?? []) {
      const covered = cells(hollow);
      // Already broken through: the room stands open.
      if (flags.includes(hollow.flag)) { for (const [x, y] of covered) walls.removeTileAt(x, y); continue; }
      for (const [x, y] of covered) walls.getTileAt(x, y)?.setCollision(false, false, false, false);
      // The crack runs along the edges that face open ground.
      const inside = (x: number, y: number) => covered.some(([cx, cy]) => cx === x && cy === y);
      // A dark seam with a pale lip on one side, so it shows on light walls and dark ones alike.
      const cracks = scene.add.graphics().setDepth(2.5);
      for (const [x, y] of covered) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (inside(nx, ny) || walls.getTileAt(nx, ny)?.collides) continue;
        // A broken line just inside that edge, zigzagging along it.
        const ex = x * 16 + (dx > 0 ? 13 : dx < 0 ? 2 : 0), ey = y * 16 + (dy > 0 ? 13 : dy < 0 ? 2 : 0);
        const seam = dx ? [[ex, ey + 2], [ex - dx * 2, ey + 6], [ex, ey + 9], [ex - dx, ey + 13]] : [[ex + 2, ey], [ex + 6, ey - dy * 2], [ex + 9, ey], [ex + 13, ey - dy]];
        for (const [color, alpha, shift] of [[0xd8ccb0, 0.35, 1], [0x0e0c0a, 0.85, 0]] as const) {
          cracks.lineStyle(1, color, alpha).beginPath().moveTo(seam[0][0] + (dx ? 0 : shift), seam[0][1] + (dx ? shift : 0));
          for (const [sx, sy] of seam.slice(1)) cracks.lineTo(sx + (dx ? 0 : shift), sy + (dx ? shift : 0));
          cracks.strokePath();
        }
      }
      this.hidden.push({ hollow, cells: covered, cracks });
    }
  }

  // Someone standing in a hollow has found it.
  update() {
    if (!this.hidden.length) return;
    const body = this.scene.player.body as Phaser.Physics.Arcade.Body;
    const tx = Math.floor(body.center.x / 16), ty = Math.floor(body.center.y / 16);
    const found = this.hidden.find(({ cells }) => cells.some(([x, y]) => x === tx && y === ty));
    if (found) this.reveal(found);
  }

  private reveal(found: Hidden) {
    const scene = this.scene, walls = scene.walls;
    this.hidden = this.hidden.filter(other => other !== found);
    found.cracks.destroy();
    music.effect('barrier');
    scene.cameras.main.shake(140, 0.003);
    const tiles = found.cells.map(([x, y]) => walls.getTileAt(x, y)).filter((tile): tile is Phaser.Tilemaps.Tile => Boolean(tile));
    // The cover crumbles: it fades, with a little falling grit, then it's gone.
    scene.tweens.addCounter({ from: 1, to: 0, duration: 450, onUpdate: tween => tiles.forEach(tile => { tile.alpha = tween.getValue()!; }),
      onComplete: () => found.cells.forEach(([x, y]) => walls.removeTileAt(x, y)) });
    for (const [x, y] of found.cells) for (let i = 0; i < 3; i++) {
      const bit = scene.add.rectangle(x * 16 + 3 + ((i * 5 + x) % 11), y * 16 + 4 + ((i * 3 + y) % 9), 2, 2, 0x5a5048).setDepth(5);
      scene.tweens.add({ targets: bit, y: bit.y + 10, alpha: 0, duration: 520, delay: i * 50, onComplete: () => bit.destroy() });
    }
    scene.notice('A HIDDEN WAY', 2200);
    scene.effect({ set: found.hollow.flag });
  }
}
