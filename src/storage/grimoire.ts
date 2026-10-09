import { STUDIABLE } from '../rules/battle';
import { BRAMBLES } from '../rules/world';

const KEY = 'tide-keeps.grimoire.v1';
// Studied enemy spells and learned favor spells share one book.
const KNOWN = [...STUDIABLE, BRAMBLES];
const session = new Set<string>();
const keep = (spells: readonly unknown[]) => { for (const spell of KNOWN) if (spells.includes(spell)) session.add(spell); };

export function loadGrimoire(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (Array.isArray(saved)) keep(saved);
  } catch { /* Unavailable or malformed storage must not prevent play. */ }
  return [...session];
}

export function saveGrimoire(spells: readonly string[]): boolean {
  keep(spells);
  try { localStorage.setItem(KEY, JSON.stringify([...session])); return true; }
  catch { return false; }
}
