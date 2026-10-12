// Timers measure active exploration, so menus, loading and hidden tabs cannot
// finish a pursuit. This state belongs to the run, not to any individual map.
export type Pursuit = Readonly<{ phase: 'idle' | 'warning' | 'chasing'; remaining: number }>;
export const WARNING_TIME = 5000;
export const CHASE_TIME = 45000;
// Infrequent checks keep the hunter an occasional threat during exploration.
export const ENCOUNTER_CHECK = 60000;
export const ENCOUNTER_CHANCE = .05;
export const initialPursuit = (): Pursuit => ({ phase: 'idle', remaining: ENCOUNTER_CHECK });
export const hunting = (state: Pursuit) => state.phase !== 'idle';
export const warnPursuit = (): Pursuit => ({ phase: 'warning', remaining: WARNING_TIME });
export const endPursuit = (random = Math.random()): Pursuit => ({ phase: 'idle', remaining: 300000 + Math.max(0, Math.min(1, random)) * 180000 });

export function advancePursuit(state: Pursuit, elapsed: number, roll?: number): Pursuit {
  const remaining = Math.max(0, state.remaining - Math.max(0, elapsed));
  if (remaining > 0) return { ...state, remaining };
  if (state.phase === 'idle') return (roll ?? Math.random()) < ENCOUNTER_CHANCE ? warnPursuit() : { phase: 'idle', remaining: ENCOUNTER_CHECK };
  if (state.phase === 'warning') return { phase: 'chasing', remaining: CHASE_TIME };
  return endPursuit();
}

export function pursuitAllowed(flags: readonly string[], region: string): boolean {
  return flags.includes('hyena-slain') && !flags.some(flag => ['inquisitor-spoke', 'human-beaten', 'human-spared', 'human-seated'].includes(flag))
    && region !== 'THE OCEAN' && region !== 'THE ISLAND';
}

export function parsePursuit(value: unknown): Pursuit {
  if (!value || typeof value !== 'object') return initialPursuit();
  const { phase, remaining } = value as Record<string, unknown>;
  if (!['idle', 'warning', 'chasing'].includes(String(phase)) || typeof remaining !== 'number' || !Number.isFinite(remaining) || remaining < 0) return initialPursuit();
  const maximum = phase === 'idle' ? 480000 : phase === 'warning' ? WARNING_TIME : CHASE_TIME;
  return { phase: phase as Pursuit['phase'], remaining: Math.min(maximum, remaining) };
}

export type Cell = Readonly<{ x: number; y: number }>;
// Breadth-first routing lets the hunter follow paths around walls instead of
// pushing forever against the first corner. Also used to choose reachable spawns.
export function pursuitPath(start: Cell, target: Cell, width: number, height: number, walkable: (x: number, y: number) => boolean): Cell[] {
  const inside = ({ x, y }: Cell) => x >= 0 && y >= 0 && x < width && y < height;
  if (!inside(start) || !inside(target) || !walkable(target.x, target.y)) return [];
  const key = ({ x, y }: Cell) => y * width + x;
  const queue: Cell[] = [start];
  const previous = new Map<number, Cell | undefined>([[key(start), undefined]]);
  for (let index = 0; index < queue.length; index++) {
    const cell = queue[index];
    if (key(cell) === key(target)) {
      const path: Cell[] = [];
      let cursor: Cell | undefined = cell;
      while (cursor && key(cursor) !== key(start)) { path.unshift(cursor); cursor = previous.get(key(cursor)); }
      return path;
    }
    for (const next of [{ x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y }, { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 }]) {
      if (!inside(next) || previous.has(key(next)) || !walkable(next.x, next.y)) continue;
      previous.set(key(next), cell); queue.push(next);
    }
  }
  return [];
}
