// Climbing: handhold walls (ivy on stone, chipped ice) can be climbed any way, slowly, while grip lasts.
// Grip drains on the wall, faster while moving, and comes back on any firm ledge. When it runs out, the hero falls.
// Pure rules, in seconds; the scene does the meter and the fall.

// How long a full grip lasts climbing, and hanging still; and how fast it comes back on a ledge.
export const CLIMB_SECONDS = 4.5, HANG_SECONDS = 9, REFILL_SECONDS = 0.7;
// How fast the hero climbs, in pixels a second, against walking's 70.
export const CLIMB_SPEED = 34;

// Grip after some time, from 1 (full) to 0 (gone).
export function grip(current: number, seconds: number, { climbing, moving }: { climbing: boolean; moving: boolean }): number {
  if (!climbing) return Math.min(1, current + seconds / REFILL_SECONDS);
  return Math.max(0, current - seconds / (moving ? CLIMB_SECONDS : HANG_SECONDS));
}

// How many tiles of wall a full grip covers, climbing straight: every climb between ledges must be shorter than this.
export const REACH = Math.floor((CLIMB_SPEED * CLIMB_SECONDS) / 16);
