// The Talon Ring, in the hold: bouts the houses pay to watch. You pay to go in, and then it's all four, one straight after
// another, with no rest between: whatever the last bout took, you carry into the next. Losing in the ring isn't dying:
// the ringmaster calls the fight, and the party walks out hurt.
import type { Encounter, Escort } from './battle';
import type { Flag, Found } from './world';

export type Bout = Readonly<{ name: string; encounter: Encounter; company?: readonly Escort[]; prize: number; flag: Flag; find?: Found; text: string }>;
const HORNET: Escort = { name: 'Hornet', art: 'hornet', health: 30, weapon: 'sting', damage: 4 };
const KESTREL: Escort = { name: 'Kestrel', art: 'duellist', health: 44, weapon: 'blade', damage: 6 };
export const BOUTS: readonly Bout[] = [
  { name: 'Hornets, two at a time', encounter: 'hornet', company: [HORNET], prize: 15, flag: 'ring-1', text: 'Two cliff hornets at once. The crowd likes to see you not know which way to turn.' },
  { name: 'Something from the cracks', encounter: 'spider', prize: 25, flag: 'ring-2', text: 'They let a crag spider out of a crate. It shows no mana. That\'s the joke.' },
  { name: 'The kestrel brothers', encounter: 'duellist', company: [KESTREL], prize: 35, flag: 'ring-3', text: 'Two of the house\'s duellists, together, wearing the charms that lie.' },
  { name: 'The champion', encounter: 'champion', prize: 60, flag: 'ring-champion', find: 'champions-torc', text: 'The ring\'s champion: a shrike who keeps what he kills on the thorns outside the gate.' },
];
// What it costs to go in. It isn't given back.
export const RING_FEE = 20;

// What the next bout is, after one is won: undefined when that was the last.
export function boutAfter(index: number): number | undefined {
  return index + 1 < BOUTS.length ? index + 1 : undefined;
}
// What winning a bout leaves behind: its prize, its flag the first time, and the torc the first time the champion falls.
export function boutWon<W extends Readonly<{ coins: number; flags: readonly Flag[]; found: readonly Found[] }>>(world: W, index: number): W {
  const bout = BOUTS[index];
  return { ...world, coins: world.coins + bout.prize,
    flags: world.flags.includes(bout.flag) ? world.flags : [...world.flags, bout.flag],
    found: bout.find && !world.found.includes(bout.find) ? [...world.found, bout.find] : world.found };
}
