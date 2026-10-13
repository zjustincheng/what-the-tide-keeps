import type { NoteEvent } from './themes';

// Nobody plays exactly on the grid. Each note lands a few milliseconds early or late and a little louder or softer,
// differently on every pass through the loop, and the first beat of a bar leans a little. Drums and bass stay tighter.
const scatter = (seed: number) => { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); };
export function feel(event: NoteEvent, beatsPerBar: number, seed: number): { shift: number; velocity: number } {
  const tight = event.voice === 'drum' || event.voice === 'snare' || event.voice === 'bass';
  const shift = (scatter(seed) - 0.5) * (tight ? 0.006 : 0.02);
  const lean = event.beat % beatsPerBar === 0 ? 1.06 : 1;
  return { shift, velocity: Math.min(0.5, event.velocity * lean * (1 + (scatter(seed + 7919) - 0.5) * (tight ? 0.08 : 0.16))) };
}
