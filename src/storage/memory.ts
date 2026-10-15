import { createMemory, MEMORY_IDS } from '../rules/memory';
import { COMPANION_MEMORY_IDS, COMPANIONS, INITIAL_MINDS } from '../rules/companionMemory';
import type { Minds } from '../rules/companionMemory';
import type { Memory, MemoryId } from '../rules/memory';

const KEY = 'tide-keeps.memory.v1';
let session: Memory | undefined;

// What each companion remembers, keeping only what makes sense. Saves from before companions remembered anything start where the story does.
function minds(saved: unknown): Minds {
  if (typeof saved !== 'object' || saved === null) return INITIAL_MINDS;
  return Object.fromEntries(COMPANIONS.flatMap(who => {
    const mind = (saved as Record<string, unknown>)[who] as Record<string, unknown> | undefined;
    if (!mind || !Array.isArray(mind.lost)) return [];
    const lost = COMPANION_MEMORY_IDS.filter(id => (mind.lost as unknown[]).includes(id));
    const reminded = Array.isArray(mind.reminded) ? COMPANION_MEMORY_IDS.filter(id => lost.includes(id) && (mind.reminded as unknown[]).includes(id)) : [];
    return [[who, { lost, reminded, ...(mind.bonded === true ? { bonded: true } : {}) }]];
  }));
}

function parse(raw: string | null): Memory | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const { lost, pending, anchors = [], reminded = [], keepsakeMemories = [], owed, companions, fought, pages } = saved as Record<string, unknown>;
  if (!Array.isArray(lost) || typeof pending !== 'boolean') return undefined;
  const bound = Array.isArray(keepsakeMemories) ? MEMORY_IDS.filter(id => keepsakeMemories.includes(id)) : [];
  const ids = MEMORY_IDS.filter(id => lost.includes(id));
  // Keep the order memories were lost in, dropping anything unknown.
  const kept = lost.filter((id, index): id is MemoryId => !bound.includes(id) && ids.includes(id) && lost.indexOf(id) === index);
  const back = Array.isArray(reminded) ? MEMORY_IDS.filter(id => reminded.includes(id) && kept.includes(id)) : [];
  // Pages: two different lines of a known memory, each one of its four.
  const written = typeof pages === 'object' && pages !== null ? Object.fromEntries(MEMORY_IDS.flatMap(id => {
    const lines = (pages as Record<string, unknown>)[id];
    return Array.isArray(lines) && lines.length === 2 && lines.every(line => Number.isInteger(line) && line >= 0 && line < 4) && lines[0] !== lines[1] ? [[id, [Math.min(lines[0], lines[1]), Math.max(lines[0], lines[1])]]] : [];
  })) : {};
  return { ...(Object.keys(written).length ? { pages: written } : {}), lost: kept, pending, keepsakeMemories: bound, companions: minds(companions), fought: Array.isArray(fought) ? COMPANIONS.filter(who => fought.includes(who)) : [], owed: typeof owed === 'number' && owed > 1 ? Math.min(3, Math.floor(owed)) : undefined, reminded: back, anchors: Array.isArray(anchors) ? MEMORY_IDS.filter(id => !bound.includes(id) && anchors.includes(id) && (!kept.includes(id) || back.includes(id))) : [] };
}

export function loadMemory(): Memory {
  if (!session) {
    try { session = parse(localStorage.getItem(KEY)); } catch { /* Unavailable or malformed storage must not prevent play. */ }
    session ??= createMemory();
  }
  return session;
}

export function saveMemory(memory: Memory): boolean {
  session = memory;
  try { localStorage.setItem(KEY, JSON.stringify(memory)); return true; }
  catch { return false; }
}
