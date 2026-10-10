import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// A map that uses a tile its sheet doesn't draw shows a blank square in the game. Every map's tiles must exist.
test('every map uses only tiles its tile sheet actually draws', () => {
  for (const file of readdirSync('public/maps')) {
    const map = JSON.parse(readFileSync(`public/maps/${file}`, 'utf8'));
    const tileset = map.tilesets[0];
    const sheet = readFileSync(`public/assets/${tileset.image.split('/').pop()}`, 'utf8');
    const drawn = (sheet.match(/<g /g) ?? []).length;
    // The top bits of a tile id say whether it is flipped; the rest is the tile.
    const used = Math.max(...map.layers.slice(0, 2).flatMap((layer: { data: number[] }) => layer.data.map(tile => tile & 0x1fffffff)));
    assert.ok(used <= drawn, `${file} uses tile ${used}, but its sheet draws only ${drawn}`);
    assert.ok(used <= tileset.tilecount, `${file} uses tile ${used}, but its tileset claims ${tileset.tilecount}`);
  }
});

// Every place you can arrive in a map must be walkable to every other: a hull or a wall drawn across a path
// strands the hero where he lands. Arrival points are 'spawn' and the 'from-…' points.
test('every arrival point in every map can walk to every other, and to every way out at the edge', () => {
  const stranded: string[] = [];
  for (const file of readdirSync('public/maps')) {
    const map = JSON.parse(readFileSync(`public/maps/${file}`, 'utf8'));
    const { width, height } = map;
    const solidIds = new Set<number>(map.tilesets[0].tiles.map((tile: { id: number }) => tile.id + 1));
    const furniture: number[] = map.layers[1].data;
    const open = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && !solidIds.has(furniture[y * width + x] & 0x1fffffff);
    const arrivals = map.layers[2].objects.filter((point: { name: string }) => point.name === 'spawn' || point.name.startsWith('from-'));
    if (arrivals.length < 2) continue;
    // The walkable tile under each arrival, or the nearest open neighbour if it sits on an edge.
    const tileOf = (point: { x: number; y: number }) => {
      const tx = Math.floor(point.x / 16), ty = Math.floor(point.y / 16);
      return [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dy]) => [tx + dx, ty + dy]).find(([x, y]) => open(x, y));
    };
    const start = tileOf(arrivals[0]);
    if (!start) { stranded.push(`${file}: ${arrivals[0].name} is inside a wall`); continue; }
    const seen = new Set([start.join()]);
    const queue = [start];
    while (queue.length) {
      const [x, y] = queue.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${x + dx},${y + dy}`;
        if (!seen.has(key) && open(x + dx, y + dy)) { seen.add(key); queue.push([x + dx, y + dy]); }
      }
    }
    for (const point of arrivals.slice(1)) {
      const tile = tileOf(point);
      if (!tile || !seen.has(tile.join())) stranded.push(`${file}: ${point.name} can't be reached from ${arrivals[0].name}`);
    }
    // Ways out at the map's edge must be reachable too, close enough to take: within a tile.
    const edge = map.layers[2].objects.filter((point: { name: string; x: number; y: number }) => !point.name.startsWith('from-') && (point.x < 16 || point.y < 16 || point.x > width * 16 - 16 || point.y > height * 16 - 16));
    for (const point of edge) {
      const tx = Math.floor(point.x / 16), ty = Math.floor(point.y / 16);
      const near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${tx + dx},${ty + dy}`));
      if (!near) stranded.push(`${file}: the way out at ${point.name} can't be reached`);
    }
  }
  assert.deepEqual(stranded, []);
});
