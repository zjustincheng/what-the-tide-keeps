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
    'Every boat is a line. FROM THE PENS. FROM THE LANES. FROM THE QUARRY. FROM THE HOSPICE. Then two columns: SALTED, SHIPPED AS FISH. RENDERED, OIL TO THE LIGHT.',
    'Nothing in either column is fish.',
    'At the foot of the page, in a different hand, old and careful: THE COVENANT HOLDS. NO CARNIVORE HAS EATEN A CITIZEN IN FORTY YEARS. THEY HAVE EATEN NOTHING ELSE.',
  ], then: { set: 'works-seen' } },
  vats: { speaker: 'THE VATS', prompt: 'Look in the vats', lines: [
    'Salt, packed down hard over what\'s under it. A paddle stands in one vat, worn smooth by hands.',
  ] },
  barrels: { speaker: 'THE BARRELS', prompt: 'Look at the barrels', lines: [
    'Stamped SMOKED FISH, WICKMERE, ready for the boat. The same stamp as every barrel you have bought since the farmland.',
    'The barrels you healed with. The barrels the party lived on.',
  ] },
  hooks: { speaker: 'THE HOOK RAIL', prompt: 'Look at the hooks', lines: [
    'A rail along the ceiling, with hooks on runners, and a drain under every hook. Someone has hung a coat on the last one, to dry.',
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
    'THE ISLAND PROJECT. SUBJECTS: the last of the old people, the ones with no fur, brought back from the ruins past the charts. PURPOSE: to learn how they kept the peace for so long.',
    'Their answer is copied out underneath, in a clerk\'s hand: they bred what they ate, and called it something else, and nobody asked.',
    'The Covenant was theirs. The church only kept it. One line, near the end: SUBJECT 9 (A CHILD) ESCAPED. GUARD ON DUTY TRANSFERRED.',
  ], then: { set: ['house-seen', 'lab-remembered'] } },
  'basin-records': { speaker: 'THE BASIN BOOK', prompt: 'Read the basin book', lines: [
    'How the church raises its convicts. Salt from the works, cut with sea water, in a basin. The dead are laid in it, and they get up.',
    'Each raising costs the raised what the salt cost the ones it was made from: a part of what they were. The book calls it the tithe. It doesn\'t call it anything else.',
    'Every time you woke on the cot, the tide took something. Now you know whose.',
  ] },
  cage: { speaker: 'THE CAGE BY THE DOOR', prompt: 'Look at the cage', lines: [
    'A small cage, its door hanging open on one hinge. Scratched inside it, at a child\'s height, a long row of marks, and then no more.',
  ], variants: [{ if: { flag: 'lab-remembered' }, lines: [
    'A small cage, its door hanging open on one hinge. You remember the weight of the keys. You remember that he didn\'t cry.',
  ] }] },
  tables: { speaker: 'THE TABLES', prompt: 'Look at the tables', lines: [
    'Steel tables with a gutter round the edge, and a drain under each one. Clean. Somebody still cleans them.',
  ] },
};

// The lighthouse.
export const lighthouse: Dialogue = {
  tanks: { speaker: 'THE OIL TANKS', prompt: 'Look at the tanks', lines: [
    'Iron tanks of lamp oil, stencilled RENDERED. The light has burned this for forty years. It burns bright.',
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
    '"I wanted you branded. Branded, they send you everywhere. I needed you to see everywhere."',
  ] },
  { text: 'Why me?', lines: [
    '"You opened the door. You were the only one who ever did. Then they took it out of your head and sent you to guard a feast."',
    '"I thought, if anyone could stand here and decide, it should be the one who let me out. I didn\'t think you\'d remember me. I hoped you\'d remember the door."',
  ] },
  { text: 'You made the lieutenants.', lines: [
    '"I didn\'t make anyone. Everyone the church broke, I sat down with and asked what happened. Then I told them what the fish was."',
    '"After that, they did what they did. Some of it I\'d have stopped. I didn\'t try."',
  ] },
  { text: 'What happens if the light goes out?', lines: [
    '"Every nation on that coast looks at it and thinks: the peace holds. Put it out and they\'ll look at each other instead. They\'ll be hungry. They\'ll have to ask each other for food. Maybe they\'ll ask the sea."',
    '"Or they\'ll eat each other. I don\'t know. Nobody\'s ever been allowed to find out."',
  ] },
  { text: 'And me?', lines: [
    '"No works, no salt. No salt, no basin. Sooner or later you die and you stay dead. I\'m sorry. It\'s the only thing I had to give you that they didn\'t: an end."',
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
    'You open it again. He does not look back as he walks out.',
  ], then: { set: 'human-spared', recallAll: true, ending: 'good' } },
];

// The lamp room.
export const lamp: Dialogue = {
  stranger: { speaker: 'THE HUMAN', prompt: 'Speak to him', portrait: 'stranger', hiddenIf: [
    { flag: 'human-seated' }, { all: [{ flag: 'human-challenged' }, { not: { flag: 'human-beaten' } }] },
  ], lines: [
    'He sits beside the lens, not touching it. No fur, no scales, no feathers. He looks up as you come in.',
    '"You opened the door. You won\'t remember me. That\'s all right. I remember you."',
  ], variants: [{ if: { flag: 'human-beaten' }, lines: [
    'He is on his knees beside the lens. The light turns over the sea.',
    '"You could end this now. You came here to decide. What do you remember?"',
  ], choices: strangerReplies }], choices: strangerReplies },
  lens: { speaker: 'THE LENS', prompt: 'Look at the lens', lines: [
    'Glass rings stacked taller than a house, turning on a bed of mercury, the flame at the heart of it so bright it has no colour.',
  ] },
  'sea-view': { speaker: 'THE SEA', prompt: 'Look out', lines: [
    'The beam goes round, and every time it passes over the sea you can see, for a moment, everything: the reefs, the wrecks, the coast. Then dark.',
  ] },
};
