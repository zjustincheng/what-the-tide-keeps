import type { Choice, Dialogue, DialogueVoice } from './dialogue';
import type { Condition } from '../rules/world';

// The other three companions' quests, built like the bear's: once their region's lieutenant is dead, each asks to go back
// to where they were kept, reads what was written about them there, and decides whether someone answers for it or they
// simply leave. Either way they give the hero something that holds his memory of them for good.

const vulture: DialogueVoice = { speaker: 'THE VULTURE', portrait: 'vulture' };
const chaplain: DialogueVoice = { speaker: 'THE GARRISON CHAPLAIN', portrait: 'chaplain' };
const frog: DialogueVoice = { speaker: 'THE FROG', portrait: 'frog' };
const sister: DialogueVoice = { speaker: 'THE SISTER', portrait: 'sister' };
const magistrate: DialogueVoice = { speaker: 'THE MAGISTRATE', portrait: 'magistrate' };
const octopus: DialogueVoice = { speaker: 'THE OCTOPUS', portrait: 'octopus' };
const elder: DialogueVoice = { speaker: 'THE ELDER', portrait: 'elder' };

// Add replies to a conversation and every one of its variants, so whatever else it offers stays available.
function withReplies(dialogue: Dialogue, point: string, extra: Choice[], aftermath: NonNullable<Dialogue[string]['variants']> = []): Dialogue {
  const original = dialogue[point];
  return { ...dialogue, [point]: { ...original, choices: [...(original.choices ?? []), ...extra],
    variants: [...aftermath, ...(original.variants ?? [])].map(variant => ({ ...variant, choices: [...(variant.choices ?? original.choices ?? []), ...extra] })) } };
}

// The vulture: the battlefield she was sent back to, and the chaplain's roll of everyone the basin returned.
const vultureReady: Condition = { all: [{ flag: 'vulture-free' }, { flag: 'hyena-slain' }, { not: { fallen: 'vulture' } }] };
const vultureOpen: Condition = { all: [vultureReady, { not: { flag: 'vulture-quest-complete' } }] };
const vultureSettled: Condition = { any: [{ flag: 'vulture-roll-read-out' }, { flag: 'vulture-roll-taken' }] };

export const vultureReturn: Dialogue = {
  'vulture-return': { speaker: 'THE VULTURE', portrait: 'vulture', prompt: 'Speak to the vulture by the graves', hiddenIf: [{ not: vultureReady }], lines: [
    'She lands on the mound where she used to sit, and looks along the rows. The left-hand markers have names. Most of the right-hand ones were hers to dig.',
    '“I buried everyone in this field. I don’t know how many times I did it.” She looks up at the fort. “The chaplain keeps a roll of who the basin sends back. I want to see my line.”',
  ], then: { set: 'vulture-field-returned' }, variants: [
    { if: { flag: 'vulture-quest-complete' }, lines: [
      'She is turning the earth over on a grave that has sunk. Nobody sent her. She does it the way she used to, quickly and properly.',
      '“I come when I want to now. That’s the difference.”',
    ] },
    { if: vultureSettled, lines: [
      'She picks a flat stone off the mound and scratches it with a talon, one short line after another. It takes a long time. At the end she makes one more mark, a little apart from the rest.',
      '“That one’s me.” She holds it out. “If you ever don’t know who I am, count them. You’ll get to the end, and you’ll know.”',
    ], choices: [{ text: 'Take the stone.', ends: true, lines: [
      'It is still warm from her. The scratches are deep enough to feel with your thumb.',
      'For a moment you are on the harbour wall, and she is calling down the waves before they come, one, two, three, and you are all still standing.',
    ], then: { set: 'vulture-quest-complete', find: 'tally-stone', keepMemory: 'vulture' } }] },
    { if: { flag: 'vulture-field-returned' }, lines: [
      '“The chaplain. The altar by the barracks door. He wrote me down every time.”',
      'She doesn’t move from the mound. She is counting the right-hand row under her breath.',
    ] },
  ] },
};

const chaplainChoices: Choice[] = [
  { text: 'Show the vulture her line.', if: { all: [vultureOpen, { flag: 'vulture-field-returned' }, { not: vultureSettled }] }, lines: [
    'The chaplain looks at her for a long moment, then takes a roll from under the altar cloth and unwinds it on the table. It goes on for a long way.',
    'VULTURE, CONVICT. RETURNED TO DUTY. A date. Then the same line again, and again. Beside most of them, in the same small hand, a note: does not know the chameleon. Does not recall the feast. Asked for her mother. Asked what year it was.',
    'And under every one: REASSIGNED: THE FIELD.',
    '“Sixty-one,” he says. “I said the rite over you sixty-one times.”',
    '“You wrote down what I lost.” She doesn’t touch the roll. “Every time. And you sent me back to the same graves, so I wouldn’t notice the ones I’d dug before.”',
    '“The order was to keep you working.” He looks at the cloth. “It was easier if you didn’t remember the field.”',
    'She turns to you. Her voice is level. “He could read it out. To the garrison, so they know what it is they’ve been eating next to. Or I take my page, and we go, and he can explain the gap.”',
  ], voices: [undefined, undefined, undefined, chaplain, vulture, chaplain, vulture], then: { set: 'vulture-roll-read' }, choices: [
    { text: 'Have him read it out.', ends: true, lines: [
      'He reads it at the barracks door, at evening roll, all sixty-one, and the notes beside them. It takes a long time. Nobody leaves.',
      'At the end he writes SENTENCE SERVED under her last line and strikes her name from the duty board. The sergeant watches him do it and says nothing.',
      'The vulture listens to all of it without moving. When it is over she says, to no one in particular, “Now it’s theirs to remember.”',
    ], voices: [{ speaker: 'AT THE BARRACKS' }, { speaker: 'AT THE BARRACKS' }, vulture], then: { set: 'vulture-roll-read-out' } },
    { text: 'Take the page.', ends: true, lines: [
      'She cuts her line out of the roll with one talon, all of it, and folds it small. The chaplain doesn’t stop her.',
      '“I’ll bury it with the rest.” She tucks it under her wing. “It belongs in that field more than I do.”',
      'At the door she stops. “There’s a stone I want. Down by the graves. Walk with me?”',
    ], voices: [undefined, vulture, vulture], then: { set: 'vulture-roll-taken' } },
    { text: 'Not yet.', ends: true, lines: ['She rolls it up herself and gives it back to him. “It has kept this long.”'] },
  ] },
];

export function withVultureReplies(dialogue: Dialogue): Dialogue {
  return withReplies(dialogue, 'chaplain', chaplainChoices, [
    { if: { flag: 'vulture-roll-read-out' }, lines: [
      'He is trimming the candles. He doesn’t look up for a while.',
      '“They still talk about it at roll. Sixty-one. I didn’t know it sounded like that, said out loud.”',
    ] },
    { if: { flag: 'vulture-roll-taken' }, lines: [
      'The roll lies on the altar with a clean cut down the middle of it.',
      '“I could write it out again from memory,” he says. “I won’t.”',
    ] },
  ]);
}

// The frog: the hospice where she healed behind a grate, and the ward book the magistrate read every week.
const frogReady: Condition = { all: [{ flag: 'frog-free' }, { flag: 'viper-slain' }, { not: { fallen: 'frog' } }] };
const frogOpen: Condition = { all: [frogReady, { not: { flag: 'frog-quest-complete' } }] };
const frogSettled: Condition = { any: [{ flag: 'frog-magistrate-accountable' }, { flag: 'frog-ward-left' }] };

export const frogReturn: Dialogue = {
  'frog-return': { speaker: 'THE FROG', portrait: 'frog', prompt: 'Speak to the frog at the grate', hiddenIf: [{ not: frogReady }], lines: [
    'She stops at the grate she used to sleep behind. The lock is still on it, open. Someone has put a clean blanket on the cot inside.',
    '“Every dose I gave in here, the sister wrote down. The magistrate came every week to read it.” She looks at the ward book on the sister’s table. “I want to know what he was reading.”',
  ], then: { set: 'frog-ward-returned' }, variants: [
    { if: { flag: 'frog-quest-complete' }, lines: [
      'She is checking the patients’ tongues, one by one, and writing the meals down beside them. She does it as if nobody had ever locked her in to do it.',
      '“I still come in some mornings. Nobody makes me. It turns out that’s different.”',
    ] },
    { if: frogSettled, lines: [
      'She takes a glass dropper off the sister’s tray and holds it up to the window. It is marked in tenths of a drop, scratched into the glass by hand.',
      '“My first one. They took it off me at the door when I came in and gave it back to me inside, so I could work.” She puts it in your hand. “It’s mine. Now it’s yours. If you forget me, look at the marks. You’ll know whose hands they were for.”',
    ], choices: [{ text: 'Keep the dropper.', ends: true, lines: [
      'It is lighter than it looks. The marks are small and very straight.',
      'For a moment you are on the harbour wall after the kraken, shaking, and someone small is holding the cup to your mouth because you can’t, and saying, slowly, it’s all right, it’s all right.',
    ], then: { set: 'frog-quest-complete', find: 'glass-dropper', keepMemory: 'frog' } }] },
    { if: { flag: 'frog-book-taken' }, lines: [
      '“The magistrate. On the decks. He signed every one of those lines. He can read them to me.”',
    ] },
    { if: { flag: 'frog-ward-returned' }, lines: [
      '“The book on the sister’s table. Not the front. The column at the back, where she wrote the doses.”',
      'She doesn’t go near the grate. She keeps her back to it, the way you keep your back to a wall.',
    ] },
  ] },
};

export function withFrogBook(dialogue: Dialogue): Dialogue {
  const original = dialogue['ward-book'];
  return { ...dialogue, 'ward-book': { ...original, variants: [
    { if: { all: [frogOpen, { flag: 'frog-ward-returned' }, { not: { flag: 'frog-book-taken' } }, { not: frogSettled }] }, lines: [
      'At the back of the book, a second column, in the sister’s hand: every dose the frog gave, how much, to whom, and what happened.',
      'Beside each patient who died, the same words, written in afterwards in a different ink: VENOMOUS HEALER IN ATTENDANCE. Under each, the magistrate’s initials.',
      '“He asked me to add that,” the sister says, from behind you. “Every week. They were dying of the stores. I knew it. I wrote it anyway.”',
      'The frog reads to the end. “Every cage on the decks. He filled them with my name.” She closes the book. “I want him to read this to me. Out loud. Or I want to walk out of here and lock that grate behind me with nobody in it.”',
    ], voices: [undefined, undefined, sister, frog], then: { set: 'frog-book-read' }, choices: [
      { text: 'Take it to the magistrate.', ends: true, lines: [
        'The sister copies the column out onto a clean sheet, every line, and signs the bottom of it. Her hand shakes a little at the signature.',
        '“He’ll say I wrote it,” she says. “I did. Tell him that too.”',
      ], voices: [undefined, sister], then: { set: 'frog-book-taken' } },
      { text: 'Lock the grate and go.', ends: true, lines: [
        'The frog takes the key from the sister’s belt. The sister lets her.',
        'She swings the grate shut on the empty cot and turns the key, and then she hangs the key on the outside of the bars, where anyone could reach it.',
        '“There.” She looks at it for a while. “One more thing. There’s something of mine on that tray.”',
      ], voices: [undefined, undefined, frog], then: { set: 'frog-ward-left' } },
      { text: 'Not yet.', ends: true, lines: ['She puts the book back exactly where it was, square to the edge of the table.'] },
    ] },
    ...(original.variants ?? []),
  ] } };
}

const magistrateChoices: Choice[] = [
  { text: 'Show him the ward book.', if: { all: [frogOpen, { flag: 'frog-book-taken' }, { not: { flag: 'frog-magistrate-accountable' } }] }, ends: true, lines: [
    'He reads the sheet, and the sister’s signature, and then he reads it again. “The sickness was in the water. Venom in the blood. I had reports.”',
    '“You had a book that said I was in the room.” The frog doesn’t raise her voice. “I was. I was the only one in there trying to keep them alive. Read it to me.”',
    'He reads it to her, line by line, there on the decks, and people stop to listen. When he gets to the end he is quiet for a long time.',
    'Then he takes the round-up order off the board, writes across it, CAUSE: THE CHURCH STORES, NOT THE SICK, and signs it, and pins it back up where everyone can read it.',
    'The frog watches the pin go in. “There’s something I left at the hospice,” she says to you. “Come back with me.”',
  ], voices: [magistrate, frog, { speaker: 'ON THE DECKS' }, { speaker: 'ON THE DECKS' }, frog], then: { set: 'frog-magistrate-accountable' } },
];

export function withFrogReplies(dialogue: Dialogue): Dialogue {
  return withReplies(dialogue, 'magistrate', magistrateChoices, [
    { if: { flag: 'frog-magistrate-accountable' }, lines: [
      'The round-up order is still on the board with his writing across it. Nobody has taken it down. Nobody has dared.',
      '“I signed it,” he says, before you can speak. “I know what I signed.”',
    ] },
  ]);
}

// The octopus: the kraken it fought, and the elder's count, where the sea writes down who took from it.
const octopusReady: Condition = { all: [{ flag: 'octopus-free' }, { flag: 'cuttlefish-slain' }, { not: { fallen: 'octopus' } }] };
const octopusOpen: Condition = { all: [octopusReady, { not: { flag: 'octopus-quest-complete' } }] };
const octopusSettled: Condition = { any: [{ flag: 'octopus-count-mended' }, { flag: 'octopus-knot-cut' }] };

export const octopusReturn: Dialogue = {
  'octopus-return': { speaker: 'THE OCTOPUS', portrait: 'octopus', prompt: 'Speak to the octopus under the ribs', hiddenIf: [{ not: octopusReady }], lines: [
    'It goes very still under the ribs, where the church net is thickest, and puts one arm flat against the bone.',
    '“I was on the wall. I put a spear in this.” It doesn’t take the arm away. “The elder keeps a count of everyone who took from the sea. I want to know where she put me.”',
  ], then: { set: 'octopus-grave-returned' }, variants: [
    { if: { flag: 'octopus-quest-complete' }, lines: [
      'It is cutting net off the ribs, one knot at a time, and letting the pieces go out on the tide. There is a lot of net. It doesn’t seem to mind.',
      '“Somebody should. It might as well be the one who knows how the knots go.”',
    ] },
    { if: octopusSettled, lines: [
      'It saws a length of church net off the kraken’s arm with the edge of a shell, then ties it, slowly, over and over, into one hard knot the size of a fist.',
      '“A sailor ties a line like this when it has to hold in any weather.” It puts the knot in your hand. “If you forget me, untie it. You won’t be able to. Then you’ll remember who taught you that.”',
    ], choices: [{ text: 'Keep the knot.', ends: true, lines: [
      'It is wet and tight and heavier than rope should be.',
      'For a moment you are on the harbour wall and a hooded shape beside you is saying your name, your real name, the way it said it in the tavern, as if it had been keeping it safe for you.',
    ], then: { set: 'octopus-quest-complete', find: 'net-knot', keepMemory: 'octopus' } }] },
    { if: { flag: 'octopus-grave-returned' }, lines: [
      '“The elder, at the pens. She keeps it on cords, not paper. The sea doesn’t trust paper.”',
    ] },
  ] },
};

const elderChoices: Choice[] = [
  { text: 'The octopus wants to see its knot.', if: { all: [octopusOpen, { flag: 'octopus-grave-returned' }, { not: octopusSettled }] }, lines: [
    'The elder draws a bundle of cords out of the sand, each one knotted along its length, some black, some pale. She finds one cord near the end and holds it up.',
    '“The five on the harbour wall. Five black knots. Taken from the sea: one kraken.” She runs a flipper down to the last knot. “That one is yours.”',
    '“Nobody tied anything for why it came up,” the octopus says. “The nets. The reef they took in one night. That isn’t on any cord.”',
    '“The count is what was done. Not why.” The elder doesn’t put the cord down. “If you want the why on it, you will have to tie it yourself.”',
    'The octopus turns to you. “I could tie the nets onto it. The church’s, the ones off the kraken, so every pod that reads this knows what made it rise. Or I could cut my own knot out, and give it back, and not be counted by the sea at all any more.”',
  ], voices: [undefined, elder, octopus, elder, octopus], then: { set: 'octopus-count-read' }, choices: [
    { text: 'Tie the nets onto the count.', ends: true, lines: [
      'It swims out to the pens and comes back with a length of church net, cut where the knots are tightest, and ties it onto the cord beside the five black knots, so it hangs there, pale and ugly, in the middle of the count.',
      'The elder watches it work. When it is done she says, “Every pod that reads this cord will ask what that is. Somebody will have to tell them.”',
      '“Good,” says the octopus. “I will.” Then, to you: “There’s one more piece of that net I want. Back at the grave.”',
    ], voices: [undefined, elder, octopus], then: { set: 'octopus-count-mended' } },
    { text: 'Cut your knot out.', ends: true, lines: [
      'The elder holds the cord still, and the octopus cuts its own knot out with a shell, cleanly, and holds it for a moment, and then lets it go into the water.',
      '“The sea can keep count of the others.” It watches the knot sink. “I’m with them now. The land can count me, if it ever learns how.”',
      'It looks back toward the grave. “There’s something I want from there first.”',
    ], voices: [undefined, octopus, octopus], then: { set: 'octopus-knot-cut' } },
    { text: 'Not yet.', ends: true, lines: ['The elder winds the cords back up and pushes them into the sand. “They will wait. That is what they are for.”'] },
  ] },
];

export function withOctopusReplies(dialogue: Dialogue): Dialogue {
  return withReplies(dialogue, 'elder', elderChoices, [
    // After her pearl, so finishing this first never hides it.
    { if: { all: [{ flag: 'octopus-count-mended' }, { flag: 'elder-thanked' }] }, lines: [
      '“Three pods came to read the cord this month,” she says. “All three asked about the net. Your friend told them.”',
    ] },
    { if: { all: [{ flag: 'octopus-knot-cut' }, { flag: 'elder-thanked' }] }, lines: [
      '“There is a gap in the five now, where one knot was. The young ones put their flippers in it, to feel it.”',
    ] },
  ]);
}
