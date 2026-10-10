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

// A wall of holds: two or three to a row, and always a hold in the next row up beside or above one you can reach in this row,
// so there is always a way up, though not always straight.
export function makeWall(seed: number, height: number): Wall {
  const next = rng(seed);
  const holds: Hold[] = [];
  let reach = [Math.floor(COLUMNS / 2)];
  for (let row = 0; row < height; row++) {
    const cols = new Set<number>(row === 0 ? [Math.floor(COLUMNS / 2)] : []);
    // One hold straight above somewhere this row can be reached from.
    cols.add(reach[Math.floor(next() * reach.length)]);
    while (cols.size < 2 + Math.floor(next() * 2)) cols.add(Math.floor(next() * COLUMNS));
    for (const col of cols) holds.push({ col, row });
    // Left and right reach along a whole row, so every hold in this row can be climbed up from.
    reach = [...cols];
  }
  return { height, holds };
}

export function holdAt(wall: Wall, col: number, row: number): boolean {
  return wall.holds.some(hold => hold.col === col && hold.row === row);
}

export function startClimb(wall: Wall): Climb {
  return { wall, at: { col: Math.floor(COLUMNS / 2), row: 0 }, hits: 0, done: null };
}

// One move: to the next hold that way. Left and right reach along the row to the nearest hold; up and down reach the hold
// directly above or below, or failing that one a column to either side.
export function move(climb: Climb, way: Way): Climb {
  if (climb.done) return climb;
  const { wall, at } = climb;
  let to: Hold | undefined;
  if (way === 'left' || way === 'right') {
    const step = way === 'left' ? -1 : 1;
    for (let col = at.col + step; col >= 0 && col < COLUMNS && !to; col += step) if (holdAt(wall, col, at.row)) to = { col, row: at.row };
  } else {
    const row = at.row + (way === 'up' ? 1 : -1);
    to = [at.col, at.col - 1, at.col + 1].filter(col => holdAt(wall, col, row)).map(col => ({ col, row }))[0];
  }
  if (!to) return climb;
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
