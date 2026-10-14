// Puts the drift edges from scripts/drift-edges.mjs onto the highland maps, which have been edited by hand:
// it only changes floor cells that are already snow at a drift's border (or ice at the tarn's shore), and leaves the rest alone.
// Safe to run again.
import { readFileSync, writeFileSync } from 'node:fs';
import { EDGES, N, E, S, W, NE, SE, SW, NW, tidy } from './drift-edges.mjs';

// Tile numbers as create-highlands.mjs lays them out: 7 snow, 36 its variant, 33 the old wedge, 29 ice, then the two edge sets.
const SNOW = 7, SNOW_VARIANT = 36, WEDGE = 33, ICE = 29, SNOW_EDGE = 42, ICE_EDGE = SNOW_EDGE + EDGES.length;
// Then a pine, a boulder, a cairn, and a dead tree with no ground of their own.
const STANDING = ICE_EDGE + EDGES.length, GROUNDED = [6, 8, 9, 11];
const ROWS = Math.ceil((STANDING - 1 + GROUNDED.length) / 8);
const svg = readFileSync('public/assets/highland-tiles.svg', 'utf8');
if (!svg.includes(`height="${ROWS * 16}"`)) throw new Error('The highland sheet is not the expected size: run TILES_ONLY=1 node scripts/create-highlands.mjs first.');

const FLIPS = 0xe0000000;
const kinds = {
  snow: { first: SNOW_EDGE, plain: SNOW, is: (gid) => [SNOW, SNOW_VARIANT, WEDGE].includes(gid) || (gid >= SNOW_EDGE && gid < SNOW_EDGE + EDGES.length), edge: (gid) => gid === WEDGE || (gid >= SNOW_EDGE && gid < SNOW_EDGE + EDGES.length) },
  ice: { first: ICE_EDGE, plain: ICE, is: (gid) => gid === ICE || (gid >= ICE_EDGE && gid < ICE_EDGE + EDGES.length), edge: (gid) => gid >= ICE_EDGE && gid < ICE_EDGE + EDGES.length },
};
// The tarn's ice is a lake with heather around it; elsewhere ice runs beside streams and falls, and keeps its straight banks.
const MAPS = { tarn: ['snow', 'ice'], 'border-keep': ['snow'], 'rookery-road': ['snow'], shieling: ['snow'], drove: ['snow'], pass: ['snow'], falls: ['snow'], quarry: ['snow'], abbey: ['snow'], battlefield: ['snow'], gorge: ['snow'], ossuary: [] };

for (const [name, which] of Object.entries(MAPS)) {
  const path = `public/maps/${name}.json`;
  const map = JSON.parse(readFileSync(path, 'utf8'));
  const floor = map.layers.find(layer => layer.name === 'Floor');
  const { width: w, height: h } = map;
  const base = (x, y) => (floor.data[y * w + x] & ~FLIPS) >>> 0;
  let changed = 0;
  for (const kind of which.map(k => kinds[k])) {
    const original = floor.data.slice();
    const is = (x, y) => x < 0 || y < 0 || x >= w || y >= h || kind.is((original[y * w + x] & ~FLIPS) >>> 0);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const gid = base(x, y);
      if (!kind.is(gid)) continue;
      const bits = tidy((is(x, y - 1) ? N : 0) | (is(x + 1, y) ? E : 0) | (is(x, y + 1) ? S : 0) | (is(x - 1, y) ? W : 0)
        | (is(x + 1, y - 1) ? NE : 0) | (is(x + 1, y + 1) ? SE : 0) | (is(x - 1, y + 1) ? SW : 0) | (is(x - 1, y - 1) ? NW : 0));
      // Plain snow in the middle of a drift stays as it is, variant and all.
      if (bits === 255 && !kind.edge(gid)) continue;
      const next = bits === 255 ? kind.plain : kind.first + EDGES.indexOf(bits);
      if (floor.data[y * w + x] !== next) { floor.data[y * w + x] = next; changed++; }
    }
  }
  // Props stand on whatever is under them, rather than on a square of heather of their own.
  const furniture = map.layers.find(layer => layer.name === 'Furniture');
  for (let i = 0; i < furniture.data.length; i++) {
    const gid = (furniture.data[i] & ~FLIPS) >>> 0, flips = (furniture.data[i] & FLIPS) >>> 0;
    const at = GROUNDED.indexOf(gid);
    if (at >= 0) { furniture.data[i] = (STANDING + at | flips) >>> 0; changed++; }
  }
  const tileset = map.tilesets[0];
  tileset.imageheight = ROWS * 16; tileset.tilecount = ROWS * 8;
  // Each prop in the snow blocks the way just as it does on heather.
  GROUNDED.forEach((gid, i) => {
    const props = tileset.tiles.find(tile => tile.id === gid - 1)?.properties;
    if (props && !tileset.tiles.some(tile => tile.id === STANDING + i - 1)) tileset.tiles.push({ id: STANDING + i - 1, properties: props });
  });
  tileset.tiles.sort((a, b) => a.id - b.id);
  writeFileSync(path, JSON.stringify(map, null, 2) + '\n');
  console.log(name, changed);
}
