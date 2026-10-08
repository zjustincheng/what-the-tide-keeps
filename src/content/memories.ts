import type { MemoryId } from '../rules/memory';

// Narrative text for the hero's memories and what forgetting each one costs.
export const memories: Record<MemoryId, { name: string; cost: string }> = {
  feast: { name: 'The feast', cost: 'He stops being sure the party was framed.' },
  trial: { name: 'The trial', cost: 'He no longer knows why he is branded and cannot argue his innocence.' },
  kraken: { name: 'The kraken', cost: 'He loses his technique for the shared meter.' },
  bear: { name: 'The bear', cost: "The bear's reminders stop working on him." },
  vulture: { name: 'The vulture', cost: "The vulture's reminders stop working on him." },
  frog: { name: 'The poison dart frog', cost: "The frog's reminders stop working on him." },
  octopus: { name: 'The mimic octopus', cost: "The octopus's reminders stop working on him." },
  training: { name: 'His training', cost: 'He loses the bonus damage when revealing hidden mana.' },
  home: { name: 'His home', cost: 'A safe house and the people in it treat him as a stranger.' },
  name: { name: 'His name', cost: 'Everyone calls him "hero" and the game stops showing his name.' },
};

export const perks = {
  mana: 'Hollow · +2 mana. Enemies see more of him.',
  force: 'Hollow · +1 damage on every attack.',
} as const;
