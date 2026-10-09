import { createMemory, MEMORY_IDS } from '../rules/memory';
import type { Memory, MemoryId } from '../rules/memory';

const KEY = 'tide-keeps.memory.v1';
let session: Memory | undefined;

function parse(raw: string | null): Memory | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const { lost, pending, anchors = [] } = saved as Record<string, unknown>;
  if (!Array.isArray(lost) || typeof pending !== 'boolean') return undefined;
  const ids = MEMORY_IDS.filter(id => lost.includes(id));
  // Keep the order memories were lost in, dropping anything unknown.
  const kept = lost.filter((id, index): id is MemoryId => ids.includes(id) && lost.indexOf(id) === index);
  return { lost: kept, pending, anchors: Array.isArray(anchors) ? MEMORY_IDS.filter(id => anchors.includes(id) && !kept.includes(id)) : [] };
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
