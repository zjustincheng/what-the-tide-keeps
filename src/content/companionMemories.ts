import type { Companion } from '../rules/memory';
import type { CompanionMemoryId } from '../rules/companionMemory';

// What each companion's memories are called, and what forgetting each one costs them.
const CRAFT: Record<Companion, { name: string; cost: string }> = {
  bear: { name: 'How to hold a line', cost: 'His maul hits 2 softer.' },
  vulture: { name: 'Her eye', cost: 'Her talons hit 2 softer.' },
  frog: { name: 'Her measures', cost: 'Her dart hits 2 softer.' },
  octopus: { name: 'The copy', cost: 'Its grapple hits 2 softer.' },
};

export function companionMemory(who: Companion, id: CompanionMemoryId): { name: string; cost: string } {
  if (id === 'craft') return CRAFT[who];
  if (id === 'hero') return { name: 'You', cost: 'You are a stranger to them. They can\'t remind you of anything.' };
  if (id === 'feast') return { name: 'The feast', cost: 'They no longer believe the party was framed.' };
  return { name: 'The kraken', cost: 'Their dodging is 10% tighter.' };
}
