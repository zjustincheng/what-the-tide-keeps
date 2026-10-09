import type { Dialogue } from './dialogue';

// The capital: the square outside the church, the harbour below it, and the hall where the feast was held. Names are placeholders.
export const square: Dialogue = {
  statue: { speaker: 'THE STATUE OF THE FIVE', prompt: 'Examine the statue', lines: [
    'The five who killed the kraken, in bronze: a bear, a vulture, a frog, an octopus, a chameleon. Unveiled a week before the feast.',
    'Someone has chiselled all five faces off. The chameleon\'s was done first, and most carefully.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'Five figures in bronze: a bear, a vulture, a frog, an octopus, a chameleon. Heroes of something.',
    'Someone has chiselled all five faces off. You don\'t know why the chameleon\'s should bother you most.',
  ] }] },
  fountain: { speaker: 'THE FOUNTAIN', prompt: 'Look into the fountain', lines: [
    'Salt water, piped up from the harbour. The same water as the basin in the church.',
    'Coins on the bottom, none of them new.',
  ] },
  'alchemists-gate': { speaker: 'THE ALCHEMISTS\' GATE', prompt: 'Examine the gate', lines: [
    'Black iron, with the church\'s seal pressed in wax across the lock. Beyond it: a courtyard, a dry fountain, windows bricked up from the inside.',
    'The wax is fresh. Somebody seals it again every week.',
  ] },
  crier: { speaker: 'THE CRIER', prompt: 'Speak to the crier', lines: [
    'Hear the regency council! Bread prices fixed until the harvest. The fish ration is under review. The five condemned serve the church until their sentences are spent!',
    'He sees your brand and keeps reading, louder.',
  ], choices: [
    { text: 'Who sits on the regency council?', lines: [
      'One regent for each nation, chosen by whoever was holding the seal when the news came.',
      'Six, if you count the church\'s observer. Everybody counts him.',
    ] },
    { text: 'Where are the rulers buried?', lines: [
      'In the crypt under the Long Table, all together. "At peace at last, at one table." That was the proclamation. I read it forty times that day.',
    ] },
    { text: 'When are the sentences spent?', lines: ['The proclamation doesn\'t say. They never do.'] },
  ] },
  broadsheets: { speaker: 'A BROADSHEET SELLER', prompt: 'Speak to the broadsheet seller', lines: [
    'Broadsheet! Feast murderers still serving! Read how they did it!',
  ], choices: [
    { text: 'How did they do it?', lines: [
      'Poison, then teeth. The bear held the doors. There\'s a drawing.',
      'It\'s not a very good drawing. It\'s not very like you, either.',
    ] },
    { text: 'Do you believe it?', lines: ['Mum says the octopus did the poison. Mum says you can\'t trust anything with eight arms.'] },
  ] },
  lamplighter: { speaker: 'THE LAMPLIGHTER', prompt: 'Speak to the lamplighter', lines: [
    'I light them at dusk and put them out at dawn. In between I see everything nobody else is awake for.',
  ], choices: [
    { text: 'What did you see the night of the feast?', lines: [
      'Carts at the alchemists\' gate, late, with the lamps off. That gate has been sealed for twenty years.',
      'That night the wax was broken. By morning it was mended. Nobody asked me, so I never said.',
    ] },
    { text: 'Why light the square at all?', lines: [
      'The city has been afraid of the dark since the kraken. Every lamp is an argument that the sea can\'t come up the hill.',
    ] },
  ] },
  'guard-square': { speaker: 'A CHURCH GUARD', prompt: 'Speak to the guard', lines: [
    'Stay where I can see you, convict. The square is open to you. The hall isn\'t. The gate isn\'t.',
  ] },
  apothecary: { speaker: 'THE APOTHECARY', prompt: 'Speak to the owl', lines: [
    'Church-licensed remedies. Double the board price for the branded. It isn\'t personal. It\'s on a schedule.',
  ], then: { shop: 'apothecary' } },
  citizen: { speaker: 'AN OLD DOE', prompt: 'Speak to the doe', lines: [
    'My son was on the doors at the feast. He doesn\'t sleep any more.',
    'He says the doors were locked from outside before anyone screamed. He told the inquiry. They thanked him and wrote down something else.',
  ] },
};

export const harbour: Dialogue = {
  'harbour-wall': { speaker: 'THE HARBOUR WALL', prompt: 'Examine the wall', lines: [
    'Rebuilt in new stone where the kraken came over it. The old stones are still down in the water, with marks on them like teeth.',
  ] },
  'kraken-arm': { speaker: 'THE KRAKEN\'S ARM', prompt: 'Examine the arm', lines: [
    'One of the kraken\'s arms, as long as a street, dried and nailed along the quay like a trophy. Suckers the size of shields.',
    'Children dare each other to touch it. The ones from the sea won\'t come near it.',
  ] },
  'sea-shrine': { speaker: 'THE LAST SHRINE', prompt: 'Examine the shrine', lines: [
    'The last shrine, where the fish come ashore. The oath is carved on the land side: HERE NOBODY EATS ANYBODY.',
    'On the sea side, in a different hand, an answer: EXCEPT US.',
  ] },
  crab: { speaker: 'THE CRAB IN THE TANK', prompt: 'Speak to the crab', hiddenIf: [{ flag: 'crab-freed' }], lines: [
    'A crab woman in a market tank, the lid weighted shut. She speaks through the glass.',
    '"Don\'t buy me. Everyone who buys me eats me."',
  ], choices: [
    { text: 'How did you get here?', lines: [
      'A church fishery boat. They don\'t ask whether what\'s in the net can talk.',
      'The sea was never at the Long Table. So I am stock.',
    ] },
    { text: 'I\'ll get you out.', lines: ['The gull keeps the key to the lid. Twenty coins is my price, apparently. I\'ve heard her say it.'] },
  ] },
  fishwife: { speaker: 'THE GULL FISHWIFE', prompt: 'Speak to the gull', lines: [
    'Fresh off the boats! Fish, eel, crab, anything that swims!',
  ], variants: [{ if: { flag: 'crab-freed' }, lines: [
    'Twenty coins for a crab. Best sale I\'ve made all week.',
  ] }], choices: [
    { text: 'Let the crab go.', if: { not: { flag: 'crab-freed' } }, lines: ['She\'s stock. Twenty coins and she\'s yours. Do what you like with her.'] },
    // Free the caught: the guideline's quest, at the sea's edge.
    { text: 'Buy the crab. (20 coins)', if: { all: [{ coins: 20 }, { not: { flag: 'crab-freed' } }] }, ends: true, lines: [
      'She unlocks the lid and doesn\'t watch. The crab is over the quay edge and into the harbour before the coins stop ringing.',
      'A while later something knocks twice on the pier boards. A shell is left there: smooth, white, and humming faintly.',
      'Found: Tide shell.',
    ], then: { pay: 20, set: 'crab-freed', find: 'tide-shell' } },
  ] },
  harbourmaster: { speaker: 'THE HARBOURMASTER', prompt: 'Speak to the harbourmaster', lines: [
    'Harbourmaster. Ninety years on this quay, and I\'ve never seen the water do what it did that night.',
  ], choices: [
    { text: 'Tell me about the kraken.', lines: [
      'It came on the spring tide, under a calm sky. The sea stood up.',
      'Everything I knew about water stopped being true for one night. Then five of you went down the steps, and it started being true again.',
    ] },
    { text: 'Where do the church\'s ships go?', lines: [
      'The fishery boats go out and come back full. A few go further, past the headland, and come back empty.',
      'They\'re not on my manifests. I\'ve stopped asking why.',
    ] },
    { text: 'Is there a lighthouse?', lines: ['Not on my coast. Not lit, anyway.'] },
    { text: 'What do the sea peoples think of the land?', lines: [
      'That it eats them. They\'re not wrong. They trade with us anyway. You can hate the hand you eat from.',
    ] },
  ] },
  steward: { speaker: 'A STOAT IN A STEWARD\'S COAT', prompt: 'Speak to the stoat', lines: [
    'Former steward of the hall of the Long Table. Former. Pour me one.',
  ], variants: [{ if: { flag: 'hall-key' }, lines: [
    'Did you go in? Don\'t tell me.',
  ] }], choices: [
    { text: 'What happened at the feast?', if: { not: { flag: 'hall-key' } }, lines: ['I don\'t talk about it sober.'] },
    { text: 'Buy him a drink. (3 coins)', if: { all: [{ coins: 3 }, { not: { flag: 'hall-key' } }] }, ends: true, lines: [
      '"You\'re one of them. The five. I served you."',
      '"I served everyone that night. Except the wine. They brought in their own cupbearer for the wine. Hooded. Nobody hired him. Nobody asked."',
      'He pushes a small iron key across the table. "Staff door, under the chain. I\'m not going back in there. You go."',
      'Found: the hall\'s staff key.',
    ], then: { pay: 3, set: 'hall-key' } },
  ] },
  dockhand: { speaker: 'A SEAL DOCKHAND', prompt: 'Speak to the seal', lines: [
    'Mind the nets.',
  ], choices: [
    { text: 'Where are you from?', lines: [
      'The outer reefs. My pod trades seal-oil for grain. We don\'t go further inland than the fish market.',
      'The land has a way of keeping things.',
    ] },
  ] },
};

export const feastHall: Dialogue = {
  'long-table': { speaker: 'THE LONG TABLE', prompt: 'Examine the long table', lines: [
    'Oak, black with age, long enough to seat every nation. It was laid for the feast and never cleared. The cloth is still on it, and so are the stains.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'Oak, black with age, long enough to seat every nation. The cloth is still on it, and so are the stains.',
    'You don\'t remember sitting here. Your hands do. They go to the edge of the table, where you\'d grip it.',
  ] }] },
  'rulers-table': { speaker: 'THE RULERS\' TABLE', prompt: 'Examine the rulers\' table', lines: [
    'Seven chairs across the head of the hall. The church\'s is the only one with a cushion.',
    'The floor under the other six has been scrubbed so hard the stone has gone pale.',
  ] },
  'five-seats': { speaker: 'FIVE STOOLS', prompt: 'Examine the stools', lines: [
    'Five stools at the far end, apart from the table: for guests of honour who weren\'t quite guests.',
    'Yours is the one nearest the door. You remember that much. You remember the bear laughing.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'Five stools at the far end, apart from the table.',
    'You don\'t know which one was yours. You sit on each of them. None of them feels like yours.',
  ] }] },
  sideboard: { speaker: 'THE CUPBEARER\'S SIDEBOARD', prompt: 'Examine the sideboard', lines: [
    'A jug, still stoppered. A stool where a servant stood all night, pouring. Nobody remembers his face. Everyone remembers the hood.',
    'Under the sideboard, on its side, a gilded cup with the capital\'s crest.',
  ], variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'A jug, still stoppered. A stool where a servant stood all night, pouring. Nobody remembers his face. Everyone remembers the hood.',
    'Under the sideboard, on its side, a gilded cup with the capital\'s crest: the twin of the one in the ashes of the boar\'s farm.',
  ] }] },
  'kraken-1': { speaker: 'THE KRAKEN', prompt: 'Look up at the kraken', lines: [
    'Its arms were hung from the rafters for the feast, and nobody has taken them down. Dry now, grey, enormous. The whole hall smells of the sea.',
  ] },
  cleaner: { speaker: 'THE OLD CLEANER', prompt: 'Speak to the cleaner', lines: [
    'Nobody\'s allowed in here. I\'m nobody, so I clean.',
  ], choices: [
    { text: 'What do you remember?', lines: [
      'Screaming, then nothing, then the guards.',
      'And the doors. Locked from outside, before anyone screamed. I had the only other key, and I was in the kitchen with it.',
    ] },
    { text: 'Who was the cupbearer?', lines: [
      'Not staff. I know every face in this house. He came in with the alchemists\' carts that afternoon.',
      'I watched him get down off one. They were the first carts through that gate in twenty years.',
    ] },
    { text: 'Why do you still clean it?', lines: [
      'They never let anyone clear the table. Evidence, they said. Of what, I said. Nobody answered.',
      'Somebody should keep it decent.',
    ] },
  ] },
};
