// The Talon Ring, in the hold: bouts the houses pay to watch, fought in order. Losing in the ring isn't dying:
// the ringmaster calls the fight, and the party walks out hurt.
import type { Encounter } from './battle';
import type { Flag, Found } from './world';

export type Bout = Readonly<{ name: string; encounter: Encounter; waves: number; prize: number; flag: Flag; find?: Found; text: string }>;
export const BOUTS: readonly Bout[] = [
  { name: 'Hornets, two at a time', encounter: 'hornet', waves: 2, prize: 15, flag: 'ring-1', text: 'Two cliff hornets, one after the other. The crowd likes to see the second one come on.' },
  { name: 'Something from the cracks', encounter: 'spider', waves: 1, prize: 25, flag: 'ring-2', text: 'They\'ll let a crag spider out of a crate. It shows no mana. That\'s the joke.' },
  { name: 'The kestrel brothers', encounter: 'duellist', waves: 2, prize: 35, flag: 'ring-3', text: 'Two of the house\'s duellists, one after the other, wearing the charms that lie.' },
  { name: 'The champion', encounter: 'champion', waves: 1, prize: 60, flag: 'ring-champion', find: 'champions-torc', text: 'The ring\'s champion: a shrike who keeps what he kills on the thorns outside the gate.' },
];

// The next bout open to the party: each must be won before the next.
export function nextBout(flags: readonly Flag[]): number | undefined {
  const index = BOUTS.findIndex(bout => !flags.includes(bout.flag));
  return index < 0 ? undefined : index;
}
