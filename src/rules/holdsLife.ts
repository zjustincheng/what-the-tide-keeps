import type { Context } from './world';
import type { Conversation } from '../content/dialogue';

export function holdsState(context: Context) {
  const familiar = context.remembered?.includes('training') ?? !context.lost.includes('training');
  return { open: context.world.flags.includes('cuckoo-slain'), familiar,
    name: familiar ? 'Scarrow' : 'Terraces you cannot place' };
}

export function heroAtCamp(context: Context): Conversation {
  const recovered = context.world.flags.includes('lab-remembered');
  const open = context.world.flags.includes('cuckoo-slain');
  const familiar = holdsState(context).familiar;
  return { speaker: 'BY THE PORTERS’ FIRE', lines: [
    familiar ? 'You turn your hands toward the fire. Your fingers find the old guard’s grip before you think to stop them.' : 'You turn your hands toward the fire. There should be a drill for keeping watch, a rhythm your body knows. You cannot find it.',
    recovered ? 'The order named you. Before the brand, before the feast, someone had already decided what you were allowed to remember.' : 'Above the shelter, windows shine along the cliff. Somewhere up there are copies of things people hoped nobody would read.',
    recovered ? 'You remember a cage, a child, and keys in your hand. You leave your hand open beside the fire.' : 'You listen to a porter count the steps to the house. He has carried other people’s belongings up them all his life. He has never been invited in.',
    open ? 'A courier calls the next departure from the terrace. For the first time since you arrived, someone below answers someone above.' : 'The wind moves through the empty messenger perches. No wings answer it.',
  ] };
}
