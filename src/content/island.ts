import type { Choice, Dialogue } from './dialogue';

// The island past the charts: the church's landing, the works, the white house where the hero was a guard, the lighthouse,
// and the lamp room at the top, where the man with no fur has been waiting. People talk about what is in front of them.

// The landing.
export const landing: Dialogue = {
  crates: { speaker: 'THE CRATES', prompt: 'Look at the crates', lines: [
    'Crates on the jetty, in the same black wax as the ones in the Wickmere stores: FOR THE LIGHTHOUSE. Others, empty, are stencilled RETURN TO WICKMERE.',
    'They smell of salt, and of something under the salt.',
  ] },
  notice: { speaker: 'A NOTICE', prompt: 'Read the notice', lines: [
    'Painted on a board by the road, in the church\'s hand: THE LIGHT OF THE COVENANT. ALL WHO SERVE HERE SERVE THE PEACE.',
    'Underneath, smaller: WHAT IS SEEN HERE IS NOT CARRIED HOME.',
  ], then: { set: 'island-landed' } },
};

// The works.
export const works: Dialogue = {
  ledger: { speaker: 'THE WORKS\' DAYBOOK', prompt: 'Read the daybook', lines: [
    'Every boat is a line: food from the fleet, lamp oil, seized books, prisoners transferred from the land. The old laboratory used this landing. The later officials kept using it after they sealed the project.',
    'Two manifests share a date. One lists rations for the capital. The other lists people caught in the same nets. The sea has never had a column marked CITIZEN.',
    'A note orders the laboratory shipments omitted from the public accounts. Below it are the same church signatures that approved your transfer.',
  ], then: { set: 'works-seen' } },
  vats: { speaker: 'THE VATS', prompt: 'Look in the vats', lines: [
    'Old vats for curing the fleet’s catch. The lids are shut. Nobody is working here now.',
  ] },
  barrels: { speaker: 'THE BARRELS', prompt: 'Look at the barrels', lines: [
    'Stamped SMOKED FISH, WICKMERE, ready for the boat. The same stamp as every barrel you have bought since the farmland.',
    'The rations you healed with came from a sea whose people the Covenant never counted. Beside the barrels is another manifest, this one with names.',
  ] },
  hooks: { speaker: 'THE HOOK RAIL', prompt: 'Look at the hooks', lines: [
    'A rail for unloading crates. Most hooks hang empty. A prisoner’s coat is folded over the last one.',
  ] },
  cages: { speaker: 'THE CAGES', prompt: 'Look at the cages', hiddenIf: [{ flag: 'cages-opened' }], lines: [
    'Cages along the north wall, full. Nobody inside is making any noise. They\'ve learned not to.',
  ], choices: [
    { text: 'Open the cages.', ends: true, lines: [
      'The keys hang on a hook beside the daybook. They fit every lock, the way keys do here.',
      'Nobody comes out at first. Then a newt does, and the others follow her, slowly, down to the jetty.',
    ], then: { set: 'cages-opened' } },
  ] },
  'caged-1': { speaker: 'A NEWT IN A CAGE', prompt: 'Speak to the newt', hiddenIf: [{ flag: 'cages-opened' }], lines: [
    '"From the river towns. The magistrate said there was work out here, for anyone with venom. Good work, and fed."',
  ] },
  'caged-2': { speaker: 'A LODGER IN A CAGE', prompt: 'Speak to the lodger', hiddenIf: [{ flag: 'cages-opened' }], lines: [
    '"I gave the sister my name for a bowl of soup. They came for me that night. Somebody had to, I suppose, if the book said so."',
  ] },
  'caged-3': { speaker: 'AN OLD MOLE IN A CAGE', prompt: 'Speak to the mole', hiddenIf: [{ flag: 'cages-opened' }], lines: [
    '"Nine years at the quarry. The tally said seven, and then it said I was done. I thought done meant home."',
  ] },
};

// The white house.
export const whitehouse: Dialogue = {
  file: { speaker: 'A FILE WITH YOUR BRAND ON IT', prompt: 'Open the drawer', lines: [
    'A drawer with the church\'s seal. In it, a guard\'s file: a sketch of a young chameleon in the church\'s grey, a brand number that is yours, and a posting. THE ISLAND PROJECT. KEEPER OF THE CAGES.',
    'Then the transfer, and the note: MEMORY OF POSTING TO BE TAKEN BEFORE HE SAILS.',
    'At the top of the page, a name.',
  ], variants: [{ if: { flag: 'name-read' }, lines: ['Your file. You know what it says. You know what you\'re called.'] },
    { if: { not: { forgot: 'name' } }, lines: ['Your file. Your name at the top of it, and your old posting, and the order to take it out of your head.'] }],
  choices: [
    { text: 'Read the name.', if: { all: [{ forgot: 'name' }, { not: { flag: 'name-read' } }] }, ends: true, lines: [
      'You read it, and then you say it out loud, and the long white room hears it.',
      'It\'s yours. It always was. They only took it out of your head; they never took it off the page.',
    ], then: { set: 'name-read', recall: 'name' } },
    { text: 'Leave it in the drawer.', if: { all: [{ forgot: 'name' }, { not: { flag: 'name-read' } }] }, ends: true, lines: [
      'Whoever that was, he isn\'t the one standing here. You close the drawer.',
    ] },
  ] },
  records: { speaker: 'THE PROJECT\'S RECORDS', prompt: 'Read the records', lines: [
    'THE ISLAND PROJECT. PURPOSE: a sovereign who is neither predator nor prey. The scholars took the human from myth and made him flesh. Beside the first successful birth: SUBJECT 9.',
    'The next pages record lessons, restraints, and failed tests. They made him to rule, then called him a failure and put him in a cage. Nobody recorded what he wanted.',
    'The last entry: SUBJECT 9 ESCAPED. GUARD ON DUTY TRANSFERRED. MEMORY OF POSTING REMOVED. Years later, a different hand records that the alchemists were found dead. The project was sealed, not confessed.',
  ], then: { set: ['house-seen', 'lab-remembered'] } },
  'basin-records': { speaker: 'THE BASIN BOOK', prompt: 'Read the basin book', lines: [
    'The basin and the human were built with the same alchemy. He was made empty: a vessel filled with memories taken from others. The resurrection diagrams end at that same vessel.',
    'Every raising takes a memory from the convict and sends it to SUBJECT 9. The priest at the basin was given a prayer, not this diagram. The signatures authorizing it are the same ones on your transfer order.',
    'Every time you woke on the cot, something of you woke here. The human has been living with every life the church took out of your head.',
  ] },
  cage: { speaker: 'THE CAGE BY THE DOOR', prompt: 'Look at the cage', lines: [
    'A small cage, its door hanging open on one hinge. Scratched inside it, at a child\'s height, a long row of marks, and then no more.',
  ], variants: [{ if: { flag: 'lab-remembered' }, lines: [
    'A small cage, its door hanging open on one hinge. You remember the weight of the keys. You remember that he didn\'t cry.',
  ] }] },
  tables: { speaker: 'THE TABLES', prompt: 'Look at the tables', lines: [
    'Steel tables with restraints bolted to their edges. Dust fills the joints. A child’s height was marked against one leg.',
  ] },
};

// The lighthouse.
export const lighthouse: Dialogue = {
  tanks: { speaker: 'THE OIL TANKS', prompt: 'Look at the tanks', lines: [
    'Old tanks of fish oil, delivered with the laboratory supplies. The gauge is nearly empty. Someone has kept this lamp burning long after the project ended.',
  ] },
  'crates-in': { speaker: 'THE CRATES', prompt: 'Look at the crates', lines: [
    'The crates from Wickmere, opened. Oil, in stoppered jars, packed in straw. They slosh.',
  ] },
  'landing-view': { speaker: 'A WINDOW', prompt: 'Look out of the window', lines: [
    'A slit in the tower wall. The sea, and far off, a coast with no lights on it at all. Every light there is, is up above you.',
  ] },
};

// What can be said to the human in the lamp room.
const strangerReplies: Choice[] = [
  { text: 'You poured the wine at the feast.', if: { not: { forgot: 'feast' } }, lines: [
    '"I poured it. Salt from the works in every cup, enough that you\'d all sleep while the rest was done. The church did the trial. I only made sure you\'d be there for it."',
    '“I wanted the heroes removed. I wanted every nation blaming another. And I wanted you alive long enough to watch what followed.”',
  ] },
  { text: 'Why me?', lines: [
    '"You opened the door. You were the only one who ever did. Then they took it out of your head and sent you to guard a feast."',
    '“You gave me one good memory. The basin filled me with everything they took from you. I wanted you to see the world end. I still kept that door.”',
  ] },
  { text: 'You made the lieutenants.', lines: [
    '"I didn\'t make anyone. Everyone the church broke, I sat down with and asked what happened. Then I told them what the fish was."',
    '“I gave each of them a thread to pull. Grain, hunger, the stores, the messages, the fish. They thought we would make a place for them. I wanted nothing left.”',
  ] },
  { text: 'What happens if the light goes out?', lines: [
    '"Every nation on that coast looks at it and thinks: the peace holds. Put it out and they\'ll look at each other instead. They\'ll be hungry. They\'ll have to ask each other for food. Maybe they\'ll ask the sea."',
    '“They trusted a light instead of each other. I killed the rulers. I took away their heroes. With the fish gone, hunger would finish what I began.”',
  ] },
  { text: 'And me?', lines: [
    '“They called your sentence mercy. Every time you died, they poured more of you into me. End the basin, and neither of us has to keep being what they made.”',
  ] },
  { text: 'Do you know my name?', if: { all: [{ forgot: 'name' }, { not: { flag: 'name-read' } }] }, lines: [
    'He says it. Gently, as if it might break.',
    'It means nothing to you at all. He sees that, and looks away.',
  ] },
  { text: 'I remember the feast, and the door. I will not take your seat.', if: { all: [
    { remembers: 'feast' }, { flag: 'lab-remembered' },
    { any: [{ remembers: 'bear' }, { remembers: 'vulture' }, { remembers: 'frog' }, { remembers: 'octopus' }] },
    { not: { flag: 'human-beaten' } },
  ] }, ends: true, lines: [
    'You know why you came. You know who stood beside you, and you remember the door.',
    'He looks at you for a long time. Then he stands.',
  ], then: { set: 'human-challenged' } },
  { text: 'Take the seat beside him.', if: { any: [
    { not: { remembers: 'feast' } }, { not: { flag: 'lab-remembered' } },
    { all: [{ not: { remembers: 'bear' } }, { not: { remembers: 'vulture' } }, { not: { remembers: 'frog' } }, { not: { remembers: 'octopus' } }] },
  ] }, ends: true, lines: [
    'You came a long way. The reason is gone, and the names are gone with it.',
    'He pours you a cup, as he did at the feast. You sit beside him.',
  ], then: { set: 'human-seated', ending: 'bad' } },
  { text: 'Spare him.', if: { flag: 'human-beaten' }, ends: true, lines: [
    'He is on his knees. You remember the child in the cage, and the door you opened.',
    'You set the key beside him. “Tell them what you did. Then we end the basin.” For the first time, he has no borrowed memory left to hide behind.',
  ], then: { set: ['human-spared','cages-opened'], recallAll: true, ending: 'good' } },
];

// The lamp room.
export const lamp: Dialogue = {
  stranger: { speaker: 'THE HUMAN', prompt: 'Speak to him', portrait: 'stranger', hiddenIf: [
    { flag: 'human-seated' }, { flag: 'human-spared' }, { all: [{ flag: 'human-challenged' }, { not: { flag: 'human-beaten' } }] },
  ], lines: [
    'He sits beside the lens, not touching it. No fur, no scales, no feathers. He looks up as you come in.',
    '"You opened the door. You won\'t remember me. That\'s all right. I remember you."',
  ], variants: [{ if: { flag: 'human-beaten' }, lines: [
    'He is on his knees beside the lens. The light turns over the sea.',
    '“It is quiet. All those voices, and now—quiet.” He looks at you. “What will you do with me?”',
  ], choices: strangerReplies }], choices: strangerReplies },
  lens: { speaker: 'THE LENS', prompt: 'Look at the lens', lines: [
    'Glass rings stacked taller than a house, turning on a bed of mercury, the flame at the heart of it so bright it has no colour.',
  ] },
  'sea-view': { speaker: 'THE SEA', prompt: 'Look out', lines: [
    'The beam goes round, and every time it passes over the sea you can see, for a moment, everything: the reefs, the wrecks, the coast. Then dark.',
  ] },
};
