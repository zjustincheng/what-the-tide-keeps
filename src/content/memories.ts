import type { MemoryId } from '../rules/memory';

// Narrative text for the hero's memories and what forgetting each one costs.
export const memories: Record<MemoryId, { name: string; cost: string }> = {
  feast: { name: 'The feast', cost: 'He stops being sure the party was framed, and can no longer say so to anyone.' },
  trial: { name: 'The trial', cost: 'He no longer knows why he is branded and cannot argue his innocence.' },
  kraken: { name: 'The kraken', cost: 'Everyone\'s dodging gets tighter (-10% timing): he forgets what the party learned against the kraken.' },
  bear: { name: 'The bear', cost: "The bear can't remind him of anything he loses." },
  vulture: { name: 'The vulture', cost: "The vulture can't remind him of anything he loses." },
  frog: { name: 'The poison dart frog', cost: "The frog can't remind him of anything he loses." },
  octopus: { name: 'The mimic octopus', cost: "The octopus can't remind him of anything he loses." },
  training: { name: 'His training', cost: 'His attacks out of hiding hit 2 softer.' },
  home: { name: 'His home', cost: 'A safe house and the people in it treat him as a stranger.' },
  name: { name: 'His name', cost: 'Everyone calls him "hero" and the game stops showing his name.' },
};

export const perks = {
  mana: 'Hollow · +2 mana. Enemies see more of him.',
  force: 'Hollow · +2 damage on every attack.',
} as const;
