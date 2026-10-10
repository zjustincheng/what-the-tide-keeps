// The ending follows from what the hero still remembers and what he chose at the island.
import type { Flag, World } from './world';

export type Ending = 'good' | 'bad';
export const ENDING_TITLES: Record<Ending, string> = { good: 'The door stays open', bad: 'The seat beside him' };

export function epilogue(world: Pick<World, 'flags'>, ending: Ending, hasName: boolean): string[] {
  const has = (flag: Flag) => world.flags.includes(flag);
  if (ending === 'bad') return [
    'The human fills your cup as he did at the feast. You sit beside him, and the light turns over the sea.',
    'The rulers are dead. The heroes are gone. The fish boats stop coming inland. The nations look out at one another and begin to starve.',
    'He tells you what you did for him once. You listen as if it happened to someone else.',
    'The door of the cell stands open. Neither of you goes through it.',
  ];
  return [
    'You lower your hand. He is still a child in the white room, and you open the door a second time.',
    'What the tide took comes back from him: the feast, the trial, your companions, the kraken, and the years between. The Hollow strength goes with it.',
    'The inquisitor follows the transfer order and lighthouse records to the island. He hears the human out, then carries the evidence back to the nations. They clear your party\'s name.',
    'The sentence is lifted. The basin is emptied, and the resurrections stop. Nothing more is taken from the human, or from you.',
    'The fish trade does not begin again. The sea is named in the new Covenant, and the old one is left behind.',
    has('cages-opened') ? 'Those you freed from the works are gone by morning, taken aboard a boat with no lights.' : 'By morning the works are quiet. The cages stand open.',
    hasName ? 'Someone asks your name. This time, you answer.' : 'Someone asks your name. You have not found it yet.',
    'By morning the human is gone. The cell is empty. The door is open. The tide leaves no answer.',
  ];
}
