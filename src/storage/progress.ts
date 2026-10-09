// Everything a playthrough has saved. Preferences (volume, the party display) are kept when starting over.
const PROGRESS = ['tide-keeps.world.v1', 'tide-keeps.memory.v1', 'tide-keeps.grimoire.v1', 'tide-keeps.gear.v1', 'tide-keeps.books.v1', 'tide-keeps.journal.v1', 'tide-keeps.bestiary.v1'];

export function eraseProgress(): boolean {
  try { for (const key of PROGRESS) localStorage.removeItem(key); return true; }
  catch { return false; }
}
