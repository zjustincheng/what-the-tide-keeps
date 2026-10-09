import type { Encounter } from '../rules/battle';

// What the hero has seen of each kind of enemy: that he met it, the moves he saw it make, and how many he has beaten.
export type Entry = Readonly<{ defeated: number; moves: readonly string[] }>;
export type Bestiary = Readonly<Partial<Record<Encounter, Entry>>>;

const KEY = 'tide-keeps.bestiary.v1';
let session: Bestiary | undefined;

export function loadBestiary(): Bestiary {
  if (!session) {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      session = typeof saved === 'object' && saved ? saved as Bestiary : {};
    } catch { session = {}; }
  }
  return session;
}

function save(next: Bestiary) {
  session = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Kept for this visit only. */ }
}

// Met it, and perhaps saw it make a move. Hidden moves (???) aren't written down until they have a name.
export function sighted(encounter: Encounter, move?: string) {
  const entry = loadBestiary()[encounter] ?? { defeated: 0, moves: [] };
  if (loadBestiary()[encounter] && (!move || move === '???' || entry.moves.includes(move))) return;
  save({ ...loadBestiary(), [encounter]: { ...entry, moves: move && move !== '???' && !entry.moves.includes(move) ? [...entry.moves, move] : entry.moves } });
}

export function beaten(encounter: Encounter) {
  const entry = loadBestiary()[encounter] ?? { defeated: 0, moves: [] };
  save({ ...loadBestiary(), [encounter]: { ...entry, defeated: entry.defeated + 1 } });
}
