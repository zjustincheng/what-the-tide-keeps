import type Phaser from 'phaser';
import { holds } from '../../rules/world';
import type { Context } from '../../rules/world';
import type { AreaScene } from '../AreaScene';
import type { Point } from './shared';

export type ExitMarker = { name: string; marker: Phaser.GameObjects.Image };
type Solid = (x: number, y: number) => boolean;

// Every way out is marked with a small arrow just in front of it, pointing the way through: through a door in a wall,
// or off the edge of the map. A barred way is marked in grey until it opens.
export function markExits(scene: AreaScene, width: number, height: number): ExitMarker[] {
  const { walls, area } = scene;
  const solid = (x: number, y: number) => x < 0 || y < 0 || x >= width || y >= height || Boolean(walls.getTileAtWorldXY(x, y)?.collides);
  const offMap = (x: number, y: number) => x < 0 || y < 0 || x >= width || y >= height;
  // Which way the way out goes: off the map if it's right there; otherwise toward the wall it's set in,
  // the side that is solid where the other side is open, looking one tile away and then two.
  const facing = (x: number, y: number): number | undefined => {
    const ways: [number, number, number][] = [[0, -16, -Math.PI / 2], [0, 16, Math.PI / 2], [-16, 0, Math.PI], [16, 0, 0]];
    const edge = ways.find(([dx, dy]) => offMap(x + dx, y + dy));
    if (edge) return edge[2];
    for (const reach of [1, 2]) {
      const [north, south, west, east] = ways.map(([dx, dy]) => solid(x + dx * reach, y + dy * reach));
      if (north !== south) return north ? -Math.PI / 2 : Math.PI / 2;
      if (west !== east) return west ? Math.PI : 0;
    }
    return undefined;
  };
  const markers: ExitMarker[] = [];
  for (const name of Object.keys(area.exits)) {
    const at = scene.point(name);
    if (!at) continue;
    // An exit point set inside the rock faces away from its open side.
    const inside = solid(at.x, at.y);
    const open = inside ? [[0, 16], [-16, 0], [16, 0], [0, -16]].find(([dx, dy]) => !solid(at.x + dx, at.y + dy)) : undefined;
    const set = area.exits[name].facing;
    const angle = set ? { north: -Math.PI / 2, south: Math.PI / 2, east: 0, west: Math.PI }[set] : open ? Math.atan2(-open[1], -open[0]) : facing(at.x, at.y) ?? Math.PI / 2;
    // Just in front of the way, on the walkable side, pointing through it, and centred across the doorway.
    const back = open ? 16 : 6;
    const [ax, ay] = doorway(walls, at, angle, solid, width, height);
    const x = ax - Math.round(Math.cos(angle) * back), y = ay - Math.round(Math.sin(angle) * back);
    const marker = scene.add.image(x, y, 'exit-arrow').setDepth(7).setRotation(angle).setAlpha(0.95).setScale(0.8);
    scene.tweens.add({ targets: marker, x: x + Math.round(Math.cos(angle) * 4), y: y + Math.round(Math.sin(angle) * 4),
      alpha: 0.45, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    markers.push({ name, marker });
  }
  return markers;
}

// Where an exit's arrow belongs: across the way, the middle of the opening it leads through (a gap in a wall,
// a road off the map's edge), or failing that the middle of the door drawn in the wall ahead; along the way,
// at the point itself, or up against that door when the point stands back from it.
function doorway(walls: Phaser.Tilemaps.TilemapLayer, at: Point, angle: number, solid: Solid, width: number, height: number): [number, number] {
  const dx = Math.round(Math.cos(angle)), dy = Math.round(Math.sin(angle));
  const across = { x: Math.abs(dy), y: Math.abs(dx) };
  const centre = (tx: number, ty: number, lo: number, hi: number) =>
    across.x ? [(tx + (lo + hi + 1) / 2) * 16, at.y] as [number, number] : [at.x, (ty + (lo + hi + 1) / 2) * 16] as [number, number];
  let tx = Math.floor(at.x / 16), ty = Math.floor(at.y / 16);
  if (solid(tx * 16 + 8, ty * 16 + 8)) return [at.x, at.y];
  for (let step = 0; step < 3; step++) {
    // A narrow opening on this line, walled on both sides.
    const run = (side: number) => { let n = 0; while (n < 4 && !solid((tx + across.x * side * (n + 1)) * 16 + 8, (ty + across.y * side * (n + 1)) * 16 + 8)) n++; return n; };
    const lo = run(-1), hi = run(1);
    if (lo + hi + 1 <= 4) return centre(tx, ty, -lo, hi);
    const nx = tx + dx, ny = ty + dy;
    if (nx < 0 || ny < 0 || nx * 16 >= width || ny * 16 >= height) return [at.x, at.y];
    if (solid(nx * 16 + 8, ny * 16 + 8)) {
      // A door: a short run of one tile in the wall ahead. The arrow stands at its foot.
      const index = walls.getTileAt(nx, ny)?.index;
      const same = (side: number) => { let n = 0; while (n < 4 && walls.getTileAt(nx + across.x * side * (n + 1), ny + across.y * side * (n + 1))?.index === index) n++; return n; };
      const left = same(-1), right = same(1);
      if (index === undefined || left + right + 1 > 4) return [at.x, at.y];
      const [cx, cy] = centre(nx, ny, -left, right);
      return across.x ? [cx, dy < 0 ? ny * 16 + 16 : ny * 16] : [dx < 0 ? nx * 16 + 16 : nx * 16, cy];
    }
    tx = nx; ty = ny;
  }
  return [at.x, at.y];
}

// Gold where a way can be taken, grey where something still bars it.
export function shadeExits(scene: AreaScene, context: Context) {
  for (const { name, marker } of scene.exitMarkers) {
    const requires = scene.area.exits[name].requires;
    marker.setTint(!requires || holds(context, requires) ? 0xe8c870 : 0x8a8a84);
  }
}
