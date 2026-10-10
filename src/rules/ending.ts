// The ending: what happens after the lamp room, told from what the hero did on the way. Pure: flags in, lines out.
import type { Flag, World } from './world';

export type Ending = 'dark' | 'kept';
export const ENDING_TITLES: Record<Ending, string> = { dark: 'The light goes out', kept: 'The light keeps turning' };

export function epilogue(world: Pick<World, 'flags'>, ending: Ending, hasName: boolean): string[] {
  const has = (flag: Flag) => world.flags.includes(flag);
  const lines: (string | false)[] = ending === 'dark' ? [
    'He turns the lens away from the sea and closes the oil cock, and the flame goes small, and blue, and out.',
    'All along the coast, people look up at the place where it was.',
    has('cages-opened') ? 'The ones you let out of the works walk down to the jetty and wait. A seal\'s boat comes at dawn, without lights, and takes them off.'
      : 'Nobody opened the cages in the works. A church boat comes for the marines. It doesn\'t come for anyone else.',
    'Inland, the barrels stop. In the fort town they break open the church\'s stores and find salt and nothing else. In Millbrook they lock their doors at night, and look at their neighbours\' teeth.',
    has('elder-thanked') ? 'Some of them go down to the sea and ask. The elder answers them. Not with fish. With terms.'
      : 'Some of them go down to the sea and ask. The sea doesn\'t answer yet.',
    'The basin in the church won\'t fill again. The priest says there is salt enough left for a few more raisings, and then there isn\'t.',
    has('bear-free') && 'The bear goes back to the mill and grinds whatever is brought to him, and doesn\'t ask who brought it.',
    has('vulture-free') && 'The vulture clears the battlefield one last time, and then stops, and lets the grass have it.',
    has('frog-free') && 'The frog opens the hospice to anyone who comes, and asks nobody what is in them.',
    has('octopus-free') && 'The octopus goes home to the reef, and comes back, and goes home again, carrying words both ways.',
    has('quarrymen-freed') && 'Nobody cuts stone for the light any more. The quarry floods over the winter.',
    has('ratling-home') && 'In the lanes, a rat takes the church\'s lock off the pump with a bar, and nobody comes to put it back.',
    has('inquisitor-spoke') && 'The inquisitor comes to the island a month later. He reads the works\' daybook and the white house\'s files all night. In the morning he sails for the capital with them, and for a while nobody hears from the church at all.',
    hasName ? 'People ask your name. You tell them.' : 'People ask your name. You don\'t have one to give them, and you find you don\'t mind.',
    'You can still die. Sooner or later, you won\'t come back from it. You walk more carefully now, and further.',
  ] : [
    'You take him down the stair in irons. He doesn\'t fight. At the bottom he looks back up at the lens, still turning, and doesn\'t say anything.',
    'The church burns a new mark over your brand, the one it gives the pardoned. The ledger closes on your name.',
    'The barrels keep coming. The light keeps turning. Nobody inland goes hungry, and nobody asks.',
    has('cages-opened') ? 'The ones you let out of the works\' cages are caught again within the week. The pens are full by spring.'
      : 'The cages in the works are full again by spring.',
    'They keep him in the white house. In the long white room. You know which cage.',
    has('bear-free') && 'The bear won\'t eat from the barrels any more. He doesn\'t say why. He gets thin.',
    has('frog-free') && 'The frog closes the hospice and goes back to the river. She doesn\'t say goodbye.',
    has('octopus-free') && 'The octopus goes back into the sea, and doesn\'t come back out.',
    has('inquisitor-spoke') && 'The inquisitor reads the order he took from the archive one more time, and burns it.',
    'The basin is always full. Whenever you die, you\'ll wake on the cot, a little less each time, for as long as the church has a use for you.',
    hasName ? 'They call you by your name now. It sounds like a stranger\'s.' : 'They call you "hero". You answer to it.',
  ];
  return lines.filter((line): line is string => Boolean(line));
}
