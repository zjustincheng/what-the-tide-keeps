// Shared drawing helpers for the placeholder tilesets: grain so no surface is flat, stairs that read as stairs,
// and variants of each ground tile, scattered over the maps so a field reads as a field and not a grid.
export const rect = (x, y, w, h, c, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o === undefined ? '' : ` fill-opacity="${o}"`}/>`;

// A small seeded generator, so every run draws the same tiles and the same maps.
export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

// Fine grain over a tile: a scatter of single light and dark pixels, too faint to read as pattern.
export function grain(seed, count = 12) {
  const r = rng(seed + 101);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * 16), y = Math.floor(r() * 16), light = r() < 0.45;
    out += rect(x, y, 1, 1, light ? '#ffffff' : '#000000', light ? 0.07 : 0.12);
  }
  return out;
}

// Lay a list of tiles out eight to a row, each with its own grain.
export function sheet(tiles) {
  return tiles.map((s, i) => `<g transform="translate(${i % 8 * 16} ${Math.floor(i / 8) * 16})">${s}${grain(i)}</g>`).join('');
}
export const rows = tiles => Math.ceil(tiles.length / 8);

// Stairs climbing toward the top of the tile: two deep steps, each a lit stone tread over a shadowed riser, running the full
// width so a stair several tiles wide reads as one flight. Joints in the treads, staggered from step to step, make them
// read as laid stone rather than ruled lines. (side and sideDark are kept for callers; the flight has no walls of its own.)
export function stairs({ tread, riser, lip }) {
  let out = rect(0, 0, 16, 16, riser);
  for (let step = 0; step < 2; step++) {
    const y = step * 8;
    out += rect(0, y, 16, 5, tread) + rect(0, y, 16, 1, lip);
    // The riser below: dark, darkest right under the tread's edge.
    out += rect(0, y + 5, 16, 3, riser) + rect(0, y + 5, 16, 1, '#000000', 0.25);
    // The far step is a little darker: it is further up, out of the light.
    if (step === 0) out += rect(0, y, 16, 5, '#000000', 0.08);
    // Joints between the stones of each tread, offset on alternate steps.
    for (const x of step ? [3, 11] : [7, 15]) out += rect(x, y + 1, 1, 4, '#000000', 0.18);
    // Wear where feet go.
    out += rect(5, y + 2, 6, 2, '#ffffff', 0.04);
  }
  return out;
}

// Ground variants: the same base tile with a different scatter of detail on it.
// marks: [colour, width, height][] — small shapes dropped in at seeded places.
export function scatter(base, seed, marks, count = 5) {
  const r = rng(seed + 7);
  let out = base;
  for (let i = 0; i < count; i++) {
    const [colour, w, h] = marks[Math.floor(r() * marks.length)];
    out += rect(1 + Math.floor(r() * (15 - w)), 1 + Math.floor(r() * (15 - h)), w, h, colour);
  }
  return out;
}

// Swap a share of one ground tile in a floor layer for its variants, by position, the same every run.
export function vary(floor, W, base, variants, seed = 1, share = 0.35) {
  const r = rng(seed);
  for (let i = 0; i < floor.length; i++) {
    const roll = r();
    if (floor[i] === base && roll < share) floor[i] = variants[Math.floor(roll / share * variants.length) % variants.length];
  }
}
