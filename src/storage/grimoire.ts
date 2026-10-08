import { SPELL } from '../rules/battle';

const KEY = 'tide-keeps.grimoire.v1';
const session = new Set<string>();

export function loadGrimoire(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (Array.isArray(saved) && saved.includes(SPELL)) session.add(SPELL);
  } catch { /* Unavailable or malformed storage must not prevent play. */ }
  return [...session];
}

export function saveGrimoire(spells: readonly string[]): boolean {
  if (spells.includes(SPELL)) session.add(SPELL);
  try { localStorage.setItem(KEY, JSON.stringify([...session])); return true; }
  catch { return false; }
}
