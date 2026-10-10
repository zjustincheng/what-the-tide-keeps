// Leaping: a short hop that clears a gap of up to two tiles. Pure rules, in tiles; the scene does the arc and the fall.
// Only tiles marked as gaps can be leapt: a drop, a flooded cellar, a crack in the ice. Walls stop a leap before it starts.
export type Ground = 'open' | 'gap' | 'wall';
export type Tile = Readonly<{ tx: number; ty: number }>;

// How far a leap carries, in tiles from where it starts: over two gap tiles onto the third.
export const LEAP = 3;

// Where a leap from a tile lands, heading one way. On open ground it is a single hop forward.
// Over a gap, it lands on the first open tile beyond it, if that is in reach; if not, it comes down in the gap, and the hero falls.
// A wall in the way, or no ground at all, means no leap.
export function landing(ground: (tx: number, ty: number) => Ground, from: Tile, dx: number, dy: number): (Tile & { falls: boolean }) | undefined {
  for (let step = 1; step <= LEAP; step++) {
    const at = { tx: from.tx + dx * step, ty: from.ty + dy * step };
    const here = ground(at.tx, at.ty);
    if (here === 'wall') return step === 1 ? undefined : { ...previous(from, dx, dy, step), falls: true };
    if (here === 'open') return { ...at, falls: false };
  }
  return { tx: from.tx + dx * LEAP, ty: from.ty + dy * LEAP, falls: true };
}
const previous = (from: Tile, dx: number, dy: number, step: number): Tile => ({ tx: from.tx + dx * (step - 1), ty: from.ty + dy * (step - 1) });

// Every tile reachable from a start, walking and leaping: for checking that leaps open only what they are meant to.
export function reachable(ground: (tx: number, ty: number) => Ground, starts: readonly Tile[], leaping: boolean): Set<string> {
  const seen = new Set<string>();
  const queue = [...starts];
  const key = (t: Tile) => `${t.tx},${t.ty}`;
  for (const start of starts) seen.add(key(start));
  while (queue.length) {
    const at = queue.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { tx: at.tx + dx, ty: at.ty + dy };
      const steps: Tile[] = ground(next.tx, next.ty) === 'open' ? [next] : [];
      if (leaping) { const lands = landing(ground, at, dx, dy); if (lands && !lands.falls) steps.push(lands); }
      for (const step of steps) if (!seen.has(key(step))) { seen.add(key(step)); queue.push(step); }
    }
  }
  return seen;
}
