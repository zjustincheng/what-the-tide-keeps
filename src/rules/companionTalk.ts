// What a companion says once the tide has taken something from them: pure rules, no Phaser, DOM, or storage.
// Only what they lost since the story began counts here. The vulture starts not knowing the hero and the frog starts
// doubting the frame; their own camp talks are written around that already.
import type { Conversation } from '../content/dialogue';
import type { Companion } from './memory';
import { INITIAL_MINDS, remembers } from './companionMemory.ts';
import type { CompanionMemoryId, Minds } from './companionMemory';

// Lost to the tide since the start, and not given back by a reminder or a bond.
export function newlyForgotten(minds: Minds, who: Companion, id: CompanionMemoryId): boolean {
  return !remembers(minds, who, id) && !(INITIAL_MINDS[who]?.lost ?? []).includes(id);
}

const SPEAKER: Record<Companion, string> = { bear: 'THE BEAR', vulture: 'THE VULTURE', frog: 'THE FROG', octopus: 'THE OCTOPUS' };

// Forgetting the hero: the companion sits with a stranger who seems to know them.
const STRANGER: Partial<Record<Companion, string[]>> = {
  bear: [
    'The bear sits across the fire from you, not beside you. He watches your hands.',
    '“You know my name. I am sorry I do not know yours.” He says it gently, and does not move any closer.',
    'He sleeps with his back to the dark and his face to you.',
  ],
  frog: [
    'The frog checks your pulse before she sits, the way she would anyone brought in from the road.',
    '“You were in the ward book, I think. Or someone like you.” She keeps her bag between you all night.',
  ],
  octopus: [
    'It sits at the very edge of the light. “You keep looking at me as if I should know you. I don’t.”',
    '“I’ll fight beside you. The sea teaches you to do that with strangers.”',
  ],
};
// Forgetting the feast: the companion no longer knows why they were sure the party was framed.
const DOUBT: Partial<Record<Companion, string[]>> = {
  bear: [
    '“Everyone says we killed them. I used to say we did not.” He turns the bread over in his paws.',
    '“I cannot remember why I was so sure.”',
  ],
  octopus: [
    '“I was so sure about the feast. The cupbearer’s hands, no fur.” It stares into the fire. “Now I can see the table and nothing on it.”',
    '“Tell me again we didn’t do it. I’d like to hear someone say it.”',
  ],
  vulture: [],
  frog: [],
};
// Forgetting the kraken, or their own craft: a line in their usual talk, reaching for something that isn't there.
const REACHING: Record<Companion, Partial<Record<CompanionMemoryId, string>>> = {
  bear: { kraken: 'He flexes his shoulder as if it should know something it doesn’t.', craft: '“I used to know how to stand so nothing got past me. I keep reaching for it.”' },
  vulture: { kraken: '“There was a wall, and water, and someone counting the waves. I’ve lost the count.”', craft: 'She sights along a talon at a bird that isn’t there, and frowns. “My eye’s gone dull.”' },
  frog: { kraken: '“I held a cup for someone, after the kraken. My hands remember the weight. Not the face.”', craft: 'She measures a dose twice and still isn’t sure. “Tenths of a drop. I used to just know.”' },
  octopus: { kraken: '“I was on the wall. I know I was. I can’t feel the rhythm of it anymore.”', craft: 'It tries to copy the crackle of the fire with one arm, and gives up. “I used to be able to throw anything back.”' },
};

// Their talk at the fire, after the tide: a stranger's, a doubter's, or their own with what they reach for and can't find.
export function forgettingAtCamp(who: Companion, minds: Minds, usual: Conversation | undefined): Conversation | undefined {
  if (!usual) return usual;
  if (newlyForgotten(minds, who, 'hero') && STRANGER[who]) return { speaker: SPEAKER[who], lines: STRANGER[who]! };
  if (newlyForgotten(minds, who, 'feast') && DOUBT[who]?.length) return { speaker: SPEAKER[who], lines: DOUBT[who]! };
  const reaching = (['kraken', 'craft'] as const).filter(id => newlyForgotten(minds, who, id)).map(id => REACHING[who][id]!);
  return reaching.length ? { ...usual, lines: [...usual.lines, ...reaching] } : usual;
}
