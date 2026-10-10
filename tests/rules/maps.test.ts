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

// Leaping clears narrow gaps, so it must only open what it is meant to: the parkour rewards listed here.
// Everything else on every map has to be just as reachable, or unreachable, as it is on foot. And every reward must be reachable by leaping.
const LEAP_ONLY: Record<string, readonly string[]> = {
  'gorge.json': ['harrier-1', 'satchel', 'courier', 'carving', 'forage-1'],
  'spires.json': ['nest', 'letters', 'spider-1', 'forage-1'],
  'rows.json': ['register', 'counting', 'wisp-1', 'rows-spot', 'window'],
  'falls.json': ['hollow', 'tally', 'harrier-1'],
};
test('leaping opens only the places meant for it, and reaches every one of them', async () => {
  const { reachable } = await import('../../src/rules/leap.ts');
  const problems: string[] = [];
  for (const file of readdirSync('public/maps')) {
    const map = JSON.parse(readFileSync(`public/maps/${file}`, 'utf8'));
    const { width, height } = map;
    const props = new Map<number, Record<string, boolean>>(map.tilesets[0].tiles.map((tile: { id: number; properties: { name: string; value: boolean }[] }) =>
      [tile.id + 1, Object.fromEntries(tile.properties.map(({ name, value }) => [name, value]))]));
    const furniture: number[] = map.layers[1].data;
    const ground = (tx: number, ty: number) => {
      if (tx < 0 || ty < 0 || tx >= width || ty >= height) return 'wall' as const;
      const tile = props.get(furniture[ty * width + tx] & 0x1fffffff);
      return tile?.gap ? 'gap' as const : tile?.collides ? 'wall' as const : 'open' as const;
    };
    const points: { name: string; x: number; y: number }[] = map.layers[2].objects;
    const starts = points.filter(point => point.name === 'spawn' || point.name.startsWith('from-'))
      .map(point => ({ tx: Math.floor(point.x / 16), ty: Math.floor(point.y / 16) })).filter(tile => ground(tile.tx, tile.ty) === 'open');
    if (!starts.length) continue;
    const walking = reachable(ground, starts, false), leaping = reachable(ground, starts, true);
    // A point counts as reached if its tile or one beside it is, since people and things stand against walls.
    const reached = (set: Set<string>, point: { x: number; y: number }) => {
      const tx = Math.floor(point.x / 16), ty = Math.floor(point.y / 16);
      return [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => set.has(`${tx + dx},${ty + dy}`));
    };
    const meant = LEAP_ONLY[file] ?? [];
    for (const point of points) {
      const onFoot = reached(walking, point), byLeap = reached(leaping, point);
      if (meant.includes(point.name)) {
        if (!byLeap) problems.push(`${file}: ${point.name} can't be reached even by leaping`);
        if (onFoot) problems.push(`${file}: ${point.name} is meant to need a leap, but can be walked to`);
      } else if (byLeap && !onFoot) problems.push(`${file}: leaping reaches ${point.name}, which should need no leap`);
    }
  }
  assert.deepEqual(problems, []);
});

// A climb is only fair if a full grip can finish it: every handhold must be within half a grip's reach of a ledge,
// so any face can be climbed from one ledge to the next without the grip running out.
test('every wall of handholds can be climbed ledge to ledge on one grip', async () => {
  const { REACH } = await import('../../src/rules/climb.ts');
  const problems: string[] = [];
  for (const file of readdirSync('public/maps')) {
    const map = JSON.parse(readFileSync(`public/maps/${file}`, 'utf8'));
    const { width, height } = map;
    const props = new Map<number, Record<string, boolean>>(map.tilesets[0].tiles.map((tile: { id: number; properties: { name: string; value: boolean }[] }) =>
      [tile.id + 1, Object.fromEntries(tile.properties.map(({ name, value }) => [name, value]))]));
    const [floor, furniture] = [map.layers[0].data as number[], map.layers[1].data as number[]];
    const at = (tx: number, ty: number) => ty * width + tx;
    const inside = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < width && ty < height;
    const climb = (tx: number, ty: number) => inside(tx, ty) && !furniture[at(tx, ty)] && Boolean(props.get(floor[at(tx, ty)] & 0x1fffffff)?.climb);
    const firm = (tx: number, ty: number) => inside(tx, ty) && !climb(tx, ty) && !props.get(furniture[at(tx, ty)] & 0x1fffffff)?.collides;
    // Distance from the nearest ledge, through handholds.
    const distance = new Map<string, number>();
    const queue: [number, number][] = [];
    for (let ty = 0; ty < height; ty++) for (let tx = 0; tx < width; tx++)
      if (climb(tx, ty) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => firm(tx + dx, ty + dy))) { distance.set(`${tx},${ty}`, 1); queue.push([tx, ty]); }
    while (queue.length) {
      const [tx, ty] = queue.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${tx + dx},${ty + dy}`;
        if (climb(tx + dx, ty + dy) && !distance.has(key)) { distance.set(key, distance.get(`${tx},${ty}`)! + 1); queue.push([tx + dx, ty + dy]); }
      }
    }
    for (let ty = 0; ty < height; ty++) for (let tx = 0; tx < width; tx++) {
      if (!climb(tx, ty)) continue;
      const far = distance.get(`${tx},${ty}`);
      if (far === undefined) problems.push(`${file}: the handholds at ${tx},${ty} lead to no ledge`);
      else if (far * 2 > REACH + 1) problems.push(`${file}: the handholds at ${tx},${ty} are ${far} from a ledge, too far for one grip`);
    }
  }
  assert.deepEqual(problems, []);
});
