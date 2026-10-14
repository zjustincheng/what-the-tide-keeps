import type { Companion, MemoryId } from '../rules/memory';

// What a friend tells the hero at a fire, in the order it happened. He puts it back together himself.
// His home and his name were gone before anyone knew him: nobody can tell him those.
export type Remindable = Exclude<MemoryId, 'home' | 'name'>;
export const FRAGMENTS: Record<Remindable, readonly [string, string, string, string]> = {
  feast: [
    'The kraken hung from the rafters, salt still drying on it. For one night, nobody asked what kind of animal you were.',
    'The rulers raised their cups together: no nation above another, no citizen hunted for what they are.',
    'The bear told the same joke twice and lifted his cup. “To coming back.”',
    'A hooded servant filled your cup again. Then the room leaned, and the rulers were dead in their chairs.',
  ],
  trial: [
    'The church official took the high seat and read the charge: the five who killed the kraken, the last with the rulers.',
    'You tried to speak. Your mouth was too dry. He wrote down that you said nothing.',
    '“You will serve as a hero.” The hammer came down, and the brand went into your wrist.',
    'Guards took the five of you through five different doors. You never saw where the others went.',
  ],
  kraken: [
    'The harbour bell would not stop. Families carried what they could up the hill road in the dark.',
    '“Bear, hold the front. Vulture, watch its arms. Frog, stay close. Octopus, with me.”',
    'The vulture counted the waves out loud, and on three, all five of you braced as one.',
    'Everything struck at once, and the kraken’s crown went under. “All five,” the bear said.',
  ],
  bear: [
    'The first time you met, he was the only one who didn’t ask what you were.',
    'On the road he walked on the outside, between you and whatever came out of the dark.',
    'On the harbour wall he caught the kraken’s falling arm before it reached you.',
    'At the feast he lifted his cup: “To coming back.” He meant all five of you.',
  ],
  vulture: [
    'She came to you from the old battlefield, where she had buried sixty-one of her own.',
    'She never sat with her back to a door, and she taught you not to either.',
    'On the harbour wall she counted the waves out loud so the rest of you could brace.',
    'At the feast she watched the doors all night. Afterward, she said she should have watched the cups.',
  ],
  frog: [
    'She bound your arm the first night, and told you the dose was in tenths of a drop.',
    'She kept a count of every wound the five of you took, in a small book, in a small hand.',
    'After the kraken you were shaking too hard to hold a cup. She held it and counted your breaths.',
    'At the feast she argued with the octopus over the last of the bread, and won.',
  ],
  octopus: [
    'It came up out of the harbour the first time without a word, the colour of the stones.',
    'On the pier, waiting for the sea to rise, it taught you a knot: over, under, back through.',
    'In the fight it parted the water so the rest of you could stand.',
    'At the feast it argued with the frog over the last of the bread, and lost on purpose.',
  ],
  training: [
    'Someone taught you to stand so still that a room forgets you are in it.',
    'Then to let your colour go, a little at a time, until the wall behind you shows through.',
    'Then to wait, longer than feels possible, for the one moment they look away.',
    'And only then to strike, once, and be gone before they turn.',
  ],
};

// How each friend tells it: as it starts, when he puts it together wrong, and when he has it.
export const TELLING: Record<Companion, { open: string; wrong: string; done: string }> = {
  bear: { open: 'Sit. I’ll tell it the way it happened. Stop me if it sounds wrong.', wrong: 'No. Not like that. Go back a little.', done: 'There. That’s how it went.' },
  vulture: { open: 'I’ll tell it. I’ve told it to myself enough times.', wrong: 'No. Count again.', done: 'That’s the order. I’d know.' },
  frog: { open: 'I’ll give it to you a little at a time. Put it back in order.', wrong: 'Not quite. Some of that was right. Keep it.', done: 'That’s it. Hold on to it.' },
  octopus: { open: 'Pieces first. That’s how the sea gives things back.', wrong: 'Close. The tide moved some of it. Again.', done: 'There. Now it’s yours, not just mine.' },
};

// Places that stir a memory the hero has lost: something here he almost knows.
export const STIRS: Record<Remindable, { places: readonly string[]; line: string }> = {
  feast: { places: ['feast-hall'], line: 'The long tables. The rafters. Your throat goes dry, and you don’t know why.' },
  trial: { places: ['square'], line: 'The square. You look at your wrist before you know you’ve done it.' },
  kraken: { places: ['harbour', 'kraken-grave'], line: 'The seawall. Your hands know where to brace, and you don’t remember learning it.' },
  bear: { places: ['farmland', 'mill-inside'], line: 'Somewhere near here, someone big stood between you and the dark. You can’t think who.' },
  vulture: { places: ['battlefield'], line: 'Sixty-one. The number comes to you here, and won’t leave.' },
  frog: { places: ['hospice', 'apothecary'], line: 'The smell of tinctures. You almost turn to say something to someone who isn’t there.' },
  octopus: { places: ['open-water', 'sea-pens'], line: 'The colour of the water against the stones. You have seen something take that colour.' },
  training: { places: ['ring'], line: 'They circle, and your weight shifts before theirs does. You don’t know where you learned that.' },
};
