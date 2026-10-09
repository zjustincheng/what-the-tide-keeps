// The day turns while the hero is out exploring, and stands still in conversations, menus, and fights.
// The clock runs 0 to 1 from dawn to dawn: day, then dusk, then night, the way Don't Starve divides it.
export const DAY_MS = 8 * 60 * 1000;
export const DUSK = 0.5;
export const NIGHT = 0.75;

export type Phase = 'day' | 'dusk' | 'night';

export function phase(clock: number): Phase {
  return clock >= NIGHT ? 'night' : clock >= DUSK ? 'dusk' : 'day';
}

export function advance(clock: number, ms: number): number {
  return (clock + ms / DAY_MS) % 1;
}

// How dark it is, 0 to 1: dusk dims toward half-dark, night is full dark, and the last stretch of night lightens toward dawn.
export function darkness(clock: number): number {
  if (clock < DUSK) return 0;
  if (clock < NIGHT) return ((clock - DUSK) / (NIGHT - DUSK)) * 0.5;
  const dawn = 0.95;
  return clock < dawn ? 1 : 1 - (clock - dawn) / (1 - dawn);
}

// What the header says.
export function timeName(clock: number): string {
  if (clock < 0.06) return 'Dawn';
  if (clock < 0.25) return 'Morning';
  if (clock < DUSK) return 'Afternoon';
  if (clock < NIGHT) return 'Dusk';
  return clock < 0.95 ? 'Night' : 'Before dawn';
}
