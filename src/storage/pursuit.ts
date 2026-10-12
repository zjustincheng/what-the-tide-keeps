import { initialPursuit, parsePursuit } from '../rules/pursuit';
import type { Pursuit } from '../rules/pursuit';

const KEY = 'tide-keeps.pursuit.v1';
let state: Pursuit | undefined;
export function loadPursuit(): Pursuit {
  if (!state) {
    try { state = parsePursuit(JSON.parse(localStorage.getItem(KEY) ?? 'null')); }
    catch { state = initialPursuit(); }
  }
  return state;
}
export function keepPursuit(next: Pursuit) { state = next; }
export function savePursuit() {
  try { localStorage.setItem(KEY, JSON.stringify(loadPursuit())); }
  catch { /* A chase still works when storage is unavailable. */ }
}
