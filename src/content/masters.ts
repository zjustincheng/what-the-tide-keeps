import type { Choice, Dialogue } from './dialogue';
import { withReplies } from './companionQuests.ts';

// The old masters: three fighters who stopped, each of whom can teach one way of not being hit. Nothing marks them;
// each mentions the next. What they teach is kept like the grimoire, through every death (techniques in src/rules/battle.ts).

const wolf: Choice[] = [
  { text: 'Teach me to fight.', if: { all: [{ not: { flag: 'learned-riposte' } }, { not: { flag: 'captain-slain' } }] }, lines: [
    '"Teach you?" He looks at the north gate. "The captain is still holding my old yard up at the keep. When he isn\'t, come back, and we\'ll see what\'s left of you."',
  ] },
  { text: 'Teach me to fight.', if: { all: [{ not: { flag: 'learned-riposte' } }, { flag: 'captain-slain' }] }, lines: [
    'He gets up slowly, and holds out a stick the way you hold a blade. "Hit me."',
    'You try. He isn\'t there. The stick taps your wrist on its way past, light, like a reminder.',
    '"We didn\'t dodge to get away. Nobody gets away, on a battlefield. You step aside so close it can\'t stop, and while it\'s still going past you, you answer it."',
    '"The captain up there was a boy in my yard. I taught him that. I\'d like someone to have it who isn\'t him."',
    'He sits back down. "There\'s an old hare in the Millbrook inn who stood on the harbour wall. Ask him how he stood."',
    'Learned: Riposte. A perfect dodge of a blow strikes the enemy back.',
  ], then: { set: 'learned-riposte' } },
];

const marine: Choice[] = [
  { text: 'How did you stand on the wall?', if: { all: [{ not: { flag: 'learned-footing' } }, { forgot: 'kraken' }] }, lines: [
    '"You don\'t remember the wall." He looks at you for a long time. "Then I can\'t show you. It only works if you know what it was for."',
  ] },
  { text: 'How did you stand on the wall?', if: { all: [{ not: { flag: 'learned-footing' } }, { remembers: 'kraken' }] }, lines: [
    '"The water came over in sheets. You couldn\'t get out of the way of it. Nobody could."',
    '"So we stopped trying to get out of the way. You plant your feet wide and take it on the turn. It takes half of you, not all of you. Half, you can live with."',
    'He makes you stand in the doorway with your feet apart and shoves your shoulder, hard, from one side and then the other, until you stop going over.',
    '"You stood like that, that night. I watched you do it. I\'m only giving it back."',
    '"If you ever go to sea, there\'s a shark in Wrecktown with one fin cut short. He fought in the clan pits. He knows how to breathe."',
    'Learned: Footing. A dodge that comes too early or too late still grazes, from further off.',
  ], then: { set: 'learned-footing' } },
];

const shark: Choice[] = [
  { text: 'Where did you learn to fight?', if: { all: [{ not: { flag: 'learned-breath' } }, { not: { flag: 'shark-slain' } }] }, lines: [
    '"In the pits." He doesn\'t look up from the knife. "And I don\'t teach anybody with a bounty hunter at the next rail. Deal with him first."',
  ] },
  { text: 'Where did you learn to fight?', if: { all: [{ not: { flag: 'learned-breath' } }, { flag: 'shark-slain' }] }, lines: [
    '"The one you put down was my sister\'s boy. He fought the way I taught him: all teeth, no breathing. That\'s why you won."',
    '"In the clan pits nobody lets you stop. So every time you make one miss, clean, you take the breath it gave you. That\'s the whole trick. Breathe when it misses."',
    'He has you hold your breath, then swings the knife past your face, slow, again and again, until you breathe out every time it goes by without deciding to.',
    '"There was an old wolf in the land\'s war who fought the same way, they say. Breathing, and answering. Probably dead."',
    'Learned: Second breath. A perfect dodge gives back a point of mana.',
  ], then: { set: 'learned-breath' } },
];

export const withWolf = (dialogue: Dialogue) => withReplies(dialogue, 'veteran', wolf);
export const withMarine = (dialogue: Dialogue) => withReplies(dialogue, 'marine', marine);
export const withShark = (dialogue: Dialogue) => withReplies(dialogue, 'pirate', shark);
