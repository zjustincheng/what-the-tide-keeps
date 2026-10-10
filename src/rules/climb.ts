// Climbing: a side-on wall of handholds, climbed hold to hold with the arrows while things fall down it.
// A falling stone that catches you knocks you down the wall; the third one knocks you off. Reach the top to finish the climb.
// Pure rules: the wall, a move, a hit. The view does the timing and the drawing.

// The wall is this many columns wide. Rows count up from the bottom (0) to the top (height - 1).
export const COLUMNS = 5;
// A hit knocks you down this many rows; this many hits and you come off the wall.
export const KNOCK = 3, HITS = 3;

export type Hold = Readonly<{ col: number; row: number }>;
export type Wall = Readonly<{ height: number; holds: readonly Hold[] }>;
export type Climb = Readonly<{ wall: Wall; at: Hold; hits: number; done: 'top' | 'fell' | null }>;
export type Way = 'up' | 'down' | 'left' | 'right';

// A small seeded generator, so every climb of the same wall is the same wall.
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

// A wall of holds, all of them joined: the route up wanders a column or two to the side now and then, and spurs come off it,
// some leading nowhere. Every hold touches another, above, below, or beside it, so every hold can be reached and none is
// across a gap.
export function makeWall(seed: number, height: number): Wall {
  const next = rng(seed);
  const holds: Hold[] = [];
  const has = (col: number, row: number) => holds.some(hold => hold.col === col && hold.row === row);
  const add = (col: number, row: number) => { if (col >= 0 && col < COLUMNS && !has(col, row)) holds.push({ col, row }); };
  let col = Math.floor(COLUMNS / 2);
  for (let row = 0; row < height; row++) {
    add(col, row);
    // The route sidesteps along this row before it goes up again.
    if (row > 0 && row < height - 1 && next() < 0.55) {
      const way = col === 0 ? 1 : col === COLUMNS - 1 ? -1 : next() < 0.5 ? -1 : 1;
      for (let step = 0, steps = next() < 0.35 ? 2 : 1; step < steps && col + way >= 0 && col + way < COLUMNS; step++) { col += way; add(col, row); }
    }
    // A spur: a hold beside one in this row, which may or may not go anywhere.
    if (next() < 0.5) { const inRow = holds.filter(hold => hold.row === row); const from = inRow[Math.floor(next() * inRow.length)]; add(from.col + (next() < 0.5 ? -1 : 1), row); }
  }
  return { height, holds };
}

export function holdAt(wall: Wall, col: number, row: number): boolean {
  return wall.holds.some(hold => hold.col === col && hold.row === row);
}

export function startClimb(wall: Wall): Climb {
  return { wall, at: { col: Math.floor(COLUMNS / 2), row: 0 }, hits: 0, done: null };
}

// One move: to the hold right next to this one, that way. With no hold there, nothing happens.
export function move(climb: Climb, way: Way): Climb {
  if (climb.done) return climb;
  const { wall, at } = climb;
  const [dc, dr] = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] }[way];
  const to = { col: at.col + dc, row: at.row + dr };
  if (!holdAt(wall, to.col, to.row)) return climb;
  return { ...climb, at: to, done: to.row === wall.height - 1 ? 'top' : null };
}

// A falling stone down a column: if you're in it, you're knocked down to the nearest hold a few rows below, or off the wall.
export function strike(climb: Climb, col: number): Climb {
  if (climb.done || climb.at.col !== col) return climb;
  const hits = climb.hits + 1;
  if (hits >= HITS) return { ...climb, hits, done: 'fell' };
  const target = Math.max(0, climb.at.row - KNOCK);
  // Down to the nearest hold at or below where the stone puts you, near the same column.
  const below = climb.wall.holds.filter(hold => hold.row <= target).sort((a, b) => b.row - a.row || Math.abs(a.col - climb.at.col) - Math.abs(b.col - climb.at.col))[0];
  return { ...climb, hits, at: below ?? { col: Math.floor(COLUMNS / 2), row: 0 } };
}

// Every hold you can climb to from the start, for checking a wall has a way up.
export function reachableHolds(wall: Wall): Set<string> {
  let climb = startClimb(wall);
  const seen = new Set([`${climb.at.col},${climb.at.row}`]);
  const queue = [climb.at];
  while (queue.length) {
    const at = queue.pop()!;
    climb = { ...startClimb(wall), at };
    for (const way of ['up', 'down', 'left', 'right'] as const) {
      const next = move(climb, way).at;
      const key = `${next.col},${next.row}`;
      if (!seen.has(key)) { seen.add(key); queue.push(next); }
    }
  }
  return seen;
}
