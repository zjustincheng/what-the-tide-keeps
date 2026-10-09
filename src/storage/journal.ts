// What people have told the hero, written down so it outlasts his memory: each answer once, by speaker.
export type Entry = Readonly<{ speaker: string; topic: string; lines: readonly string[]; place: string }>;

const KEY = 'tide-keeps.journal.v1';
let session: Entry[] | undefined;

export function loadJournal(): readonly Entry[] {
  if (!session) {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      session = Array.isArray(saved) ? saved.filter((entry): entry is Entry => typeof entry?.speaker === 'string' && typeof entry?.topic === 'string' && Array.isArray(entry?.lines)) : [];
    } catch { session = []; }
  }
  return session;
}

// Returns whether the entry was new.
export function writeDown(entry: Entry): boolean {
  const journal = loadJournal();
  if (journal.some(other => other.speaker === entry.speaker && other.topic === entry.topic)) return false;
  session = [...journal, entry];
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* Kept for this visit only. */ }
  return true;
}
