// Whether the hero has met a heavy blow before. The first one is taught: slower to start, and forgiving.
const KEY = 'tide-keeps.parried.v1';
let taught = false;
export function parried(): boolean {
  if (taught) return true;
  try { taught = localStorage.getItem(KEY) === 'true'; } catch { /* Teach again next visit, then. */ }
  return taught;
}
export function rememberParry() {
  taught = true;
  try { localStorage.setItem(KEY, 'true'); } catch { /* Keep it for this visit. */ }
}
