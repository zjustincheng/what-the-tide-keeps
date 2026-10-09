import type { Dialogue } from './dialogue';

// The highlands: the pass, the fort town, the battlefield below it, and the abbey over the ossuary. Names are placeholders.
export const pass: Dialogue = {
  'pass-sign': { speaker: 'A SIGN', prompt: 'Read the sign', lines: [
    'THE HIGH PASS. Garrison road. Herbivores travel with an escort or not at all.',
    'Somebody has underlined NOT AT ALL in charcoal.',
  ] },
  cairn: { speaker: 'A CAIRN', prompt: 'Examine the cairn', lines: [
    'A cairn for the garrison dead, one stone each. It is taller than you, and nobody has knocked it down.',
  ] },
  // A shortcut opened from above: the rope ladder down to the tarn.
  'ladder-top': { speaker: 'THE CLIFF EDGE', prompt: 'Examine the rope ladder', hiddenIf: [{ flag: 'ladder-down' }], lines: [
    'A rope ladder, coiled and lashed to an iron ring at the cliff edge. Far below, a frozen lake.',
  ], choices: [
    { text: 'Untie it and let it down.', ends: true, lines: ['It unrolls all the way down to the scree above the tarn. Now there is a way down, and a way up.'], then: { set: 'ladder-down' } },
  ] },
  // A letter carried through the highlands is lost if the party wipes, and goes back to the body.
  courier: { speaker: 'A COURIER', prompt: 'Search the body', hiddenIf: [{ has: 'letter' }, { flag: 'letter-delivered' }], lines: [
    'A courier in church grey, face down in the snow. Not raiders: nothing has been taken.',
    'In the satchel, a sealed letter addressed to the quartermaster of the highland fort.',
    'You take the letter. If you fall before you deliver it, it will be lost.',
  ], then: { give: 'letter' } },
};

export const fort: Dialogue = {
  sergeant: { speaker: 'THE SERGEANT', prompt: 'Speak to the sergeant', lines: [
    'A convict. Good. We need people who can\'t refuse orders.',
    'Bodies are going missing from the old battlefield below the east gate. The church calls whatever takes them grave-eaters. So do I, now.',
    'The vulture works the dead down there. Penal unit, like you. She won\'t remember you, and she won\'t like you.',
  ], variants: [{ if: { flag: 'hyena-slain' }, lines: [
    'The dead are staying where they\'re put. I don\'t know what you did under that abbey. I don\'t want to.',
  ] }], choices: [
    { text: 'Why does nobody stare at me here?', lines: [
      'You\'re a reptile with a brand. Half my garrison has a brand.',
      'Up here, the ones who get stared at are behind the wall.',
    ] },
    { text: 'What happened on the battlefield?', lines: [
      'A border war, before the Covenant. Both sides buried each other\'s dead in the same ground.',
      'Now something is digging them up again.',
    ] },
  ] },
  quartermaster: { speaker: 'THE QUARTERMASTER', prompt: 'Speak to the quartermaster', lines: [
    'Line\'s over there. One fish a head, a day, if the cart comes. It came half-empty again.',
  ], variants: [{ if: { all: [{ has: 'letter' }, { not: { flag: 'letter-delivered' } }] }, lines: [
    'That\'s a church seal. Give it here.',
    'He reads it twice. "Ration cut by a third. Effective two months ago. Before anyone up here so much as threw a stone."',
    '"They cut it first. Then they called us dangerous for being hungry."',
    'He pays you for the courier\'s trouble, which is to say yours. You receive 15 coins.',
  ], then: { take: 'letter', earn: 15, set: 'letter-delivered' } }, { if: { flag: 'letter-delivered' }, lines: [
    'I\'ve written to the church about that letter. They haven\'t written back.',
  ] }], choices: [
    { text: 'Why is there less fish?', lines: ['Ask the church. It\'s their fish. Everything we eat comes up that road with their seal on it.'] },
    { text: 'Who is in the line?', lines: ['Garrison families. Soldiers eat in the barracks. Their children eat here, if there\'s any left.'] },
  ] },
  lynx: { speaker: 'A LYNX IN THE LINE', prompt: 'Speak to the lynx', lines: [
    'Don\'t push in. I\'ve been here since before it was light.',
    'My cubs eat first. I eat if there\'s anything left. Mostly there isn\'t.',
  ] },
  veteran: { speaker: 'AN OLD WOLF', prompt: 'Speak to the old wolf', lines: [
    'Going down to the battlefield? I was on it, before the Covenant. The wrong side, they say now.',
    'The vulture down there\'s been clearing it since spring. Talks to the dead. Writes things on her arm so she knows who she is in the morning.',
  ], choices: [
    { text: 'Play bones. (10 coins)', if: { coins: 10 }, ends: true, lines: ['"Garrison rules. No crying."'], then: { dice: 10 } },
    { text: 'Where did you fight?', lines: ['On the ground below the east gate. Both sides buried each other\'s dead in it, after. Nobody remembers who won.'] },
  ] },
  smith: { speaker: 'THE SMITH', prompt: 'Speak to the smith', lines: [
    'Bring me anything you would die without. I\'ll make it worth dying with.',
    'Thirty coins a piece, once each. After that it\'s as good as it will ever be.',
  ], then: { shop: 'smith' } },
  // Up here the herbivores are the frightened ones, and too frightened to overcharge.
  merchant: { speaker: 'A GOAT BEHIND THE BARS', prompt: 'Speak to the goat', lines: [
    'Stay on that side. Please.',
    'We sell to the garrison at the board price, and we don\'t argue. You don\'t argue with people who could eat you.',
  ], then: { shop: 'merchant' }, variants: [{ if: { all: [{ flag: 'hyena-slain' }, { not: { flag: 'merchant-thanked' } }] }, lines: [
    'They say the graves are quiet. They say it was you.',
    'We had a cousin buried down there. Here. For the trouble. You receive 10 coins.',
  ], then: { earn: 10, set: 'merchant-thanked' } }] },
  fence: { speaker: 'A WEASEL IN THE ALLEY', prompt: 'Speak to the weasel', lines: [
    'The market\'s a night thing, mostly. For you I\'m open.',
    'Salts, firepots, smoked fish. Meat, for those who ask properly. You don\'t look like you\'re asking.',
    'I\'ll buy fish, too. Fish is worth something up here.',
  ], then: { shop: 'fence' }, choices: [
    { text: 'A delivery, from the weir.', if: { has: 'crate' }, ends: true, lines: [
      'She pries the lid up an inch, sniffs, and presses it shut again.',
      '"Salt cod. The church would hang us both. Here." You receive 20 coins.',
    ], then: { take: 'crate', earn: 20, set: 'crate-delivered' } },
  ] },
  board: { speaker: 'THE NOTICE BOARD', prompt: 'Read the notice board', lines: [
    'CHURCH OF THE COVENANT. By order, the highland fish ration is reduced, for the good of all. Complaints to the quartermaster.',
    'Under it, rows of scratched lines. Somebody has been counting the days.',
  ] },
  hooks: { speaker: 'THE HOOKS', prompt: 'Look at the hooks', lines: [
    'Meat hooks along the wall. Not all of them are empty. You don\'t look long enough to find out what it was.',
  ] },
};

export const barracks: Dialogue = {
  // Before she forgot, the vulture hid a note to herself here.
  bunk: { speaker: 'THE FAR BUNK', prompt: 'Search the far bunk', hiddenIf: [{ has: 'note' }, { flag: 'vulture-free' }], lines: [
    'The far bunk is longer than the others, built for wings. A floorboard under it has been pried up and put back carefully.',
    'Under it, a folded note in ugly, hurried writing: TRUST THE CHAMELEON. HE DIDN\'T DO IT. — V.',
    'You take the note. It would be lost if you fell.',
  ], then: { give: 'note' } },
  roll: { speaker: 'THE GARRISON ROLL', prompt: 'Read the roll', lines: [
    'Halfway down, under PENAL UNIT: "Vulture. Burial detail. Do not post on the walls; she forgets the watchwords."',
  ] },
  stove: { speaker: 'THE STOVE', prompt: 'Look in the stove', lines: [
    'Cold. Somebody has burned letters in it. On the edge of one: "...ARE ASKED NOT TO DISCUSS THE RATION..."',
  ] },
};

export const battlefield: Dialogue = {
  // After the duel she stops attacking, but she does not trust the hero until her own note tells her to.
  vulture: { speaker: 'THE VULTURE', prompt: 'Speak to the vulture', hiddenIf: [{ not: { any: [{ flag: 'vulture-met' }, { has: 'note' }] } }, { flag: 'vulture-free' }], lines: [
    'You again. You\'re not a grave thief. You still smell like one.',
    'I don\'t know you. I don\'t know most people. The ones that matter, I write on my arm.',
  ], variants: [{ if: { not: { flag: 'vulture-met' } }, lines: [
    'She drops from the dead tree with her talons out, then stops. She is looking at the paper in your hand.',
    '"That\'s my writing. Where did you get it?"',
  ] }], choices: [
    { text: 'We were a unit. Five of us.', lines: ['My arm doesn\'t say so.'] },
    { text: 'What is taking the bodies?', lines: [
      'Not me. The drag marks go east, to the ravine. The bridge is up on the far side.',
      'I could fly over and drop it. I don\'t trust anyone enough to let them follow.',
    ] },
    { text: 'Give her the note.', if: { has: 'note' }, ends: true, lines: [
      'She reads it, then reads it again. She holds it next to her arm and compares the hand.',
      '"That\'s mine. I don\'t remember writing it. I don\'t remember you."',
      '"But I don\'t lie to myself. I can\'t afford to."',
      'The vulture joins you.',
      '"Here\'s how I do it," she says. "At a fire, before you sleep, write down the thing you can\'t lose. It\'ll still be there after the next time you die. Then write it again."',
      'You can now write a memory down when you rest at a fire.',
    ], then: { take: 'note', set: ['vulture-free', 'anchors-known'] } },
  ] },
  tent: { speaker: 'THE GRAVEDIGGERS\' TENT', prompt: 'Examine the tent', lines: [
    'Two shovels, a ledger of names, and a sash like the vulture\'s, folded neatly. The ledger\'s last pages are in a different, uglier hand.',
  ] },
  graves: { speaker: 'THE GRAVES', prompt: 'Read the markers', lines: [
    'Two rows of graves. The markers on the left are carved with names. The ones on the right are numbers.',
  ] },
  pit: { speaker: 'AN OPEN GRAVE', prompt: 'Look into the grave', lines: [
    'Empty. The earth was dug out from below.',
  ] },
  tracks: { speaker: 'DRAG MARKS', prompt: 'Examine the tracks', lines: [
    'Drag marks in the frost, heading east to the ravine. Whatever carried the dead didn\'t care how.',
  ] },
  // A shortcut opened from this side: the drovers' gate down to the downs.
  'drove-gate': { speaker: 'THE DROVERS\' GATE', prompt: 'Examine the gate', hiddenIf: [{ flag: 'drove-gate-open' }], lines: [
    'A drovers\' gate at the bottom of the field, barred on this side with a beam. The track beyond runs down toward the downs.',
  ], choices: [
    { text: 'Lift the bar.', ends: true, lines: ['The beam is frozen into its brackets. It comes free with a crack. Now the road runs both ways.'], then: { set: 'drove-gate-open' } },
  ] },
  // Some gates no spell opens: only a companion can.
  ravine: { speaker: 'THE RAVINE', prompt: 'Examine the bridge', lines: [
    'A rope bridge, raised on the far side, its winch out of reach. The ravine is too wide to jump, and you can\'t see the bottom.',
    'No spell you know will reach that winch.',
  ], variants: [{ if: { flag: 'bridge-lowered' }, lines: [
    'The bridge is down. It sways in the wind coming up the ravine.',
  ] }, { if: { flag: 'vulture-free' }, lines: [
    'The bridge is raised on the far side, its winch out of reach.',
  ], choices: [
    { text: 'Ask the vulture.', ends: true, lines: [
      'She drops off the edge without a word, catches the wind coming up the ravine, and lands on the far side.',
      'She kicks the winch loose. The bridge comes down with a crack.',
    ], then: { set: 'bridge-lowered' } },
  ] }] },
};

export const abbey: Dialogue = {
  memorial: { speaker: 'A MEMORIAL STONE', prompt: 'Read the memorial', lines: [
    'THE WINTER OF NO BREAD. The names below have been chiselled off.',
    'At the bottom, scratched in later and deeper: SHE FED US.',
  ] },
  nave: { speaker: 'THE NAVE', prompt: 'Examine the nave', lines: [
    'Open to the sky, with snow on the altar. In the north-east corner, steps go down to the ossuary. Something has worn them smooth recently.',
  ] },
  // The abbey's last monk keeps the key to the ossuary, and won't give it up while her dead lie in his yard.
  monk: { speaker: 'THE LAST MONK', prompt: 'Speak to the monk', hiddenIf: [{ flag: 'hyena-slain' }], lines: [
    'Don\'t. Please. I\'m not one of hers.',
    'She keeps the dead below. The grate on the stair is locked; I locked it, from up here, the last time she came up.',
  ], variants: [{ if: { flag: 'ossuary-key' }, lines: [
    'Lock it behind you. Whatever comes up.',
  ] }], choices: [
    { text: 'Who is she?', lines: [
      'Our gravedigger, in the winter of no bread. She kept us alive.',
      'We never forgave her for how. I never forgave her. I ate what she brought, and then I preached against her.',
    ] },
    { text: 'Give me the key.', if: { not: { all: [{ flag: 'dead-1' }, { flag: 'dead-2' }, { flag: 'dead-3' }] } }, lines: [
      'Not while her dead lie in my yard. Her creatures dragged them up from the battlefield and left them where I have to see them.',
      'Lay them back in the ground. I can\'t lift them anymore, and I can\'t look at them. Then the key is yours.',
    ] },
    { text: 'They\'re buried. The key.', if: { all: [{ flag: 'dead-1' }, { flag: 'dead-2' }, { flag: 'dead-3' }, { not: { flag: 'ossuary-key' } }] }, ends: true, lines: [
      'He holds it out at arm\'s length, as if it might bite.',
      '"Lock it behind you. Whatever comes up."',
      '"And take a light. Not a candle: she puts out candles. The garrison\'s old signal lantern is in the border fort, if the deserters haven\'t burned it for warmth."',
      'You receive the ossuary key.',
    ], then: { set: 'ossuary-key' } },
  ] },
  'dead-1': { speaker: 'ONE OF THE DEAD', prompt: 'Examine the body', hiddenIf: [{ flag: 'dead-1' }], lines: [
    'A garrison soldier, dragged here by the heels from the battlefield. The frost has kept him.',
  ], choices: [
    { text: 'Bury him in the yard.', ends: true, lines: [
      'You scrape a shallow grave in the frozen yard with your hands and lay him in it. It takes a long time.',
    ], then: { set: 'dead-1' } },
  ], variants: [{ if: { flag: 'vulture-free' }, lines: [
    'A garrison soldier, dragged here by the heels from the battlefield. The frost has kept him.',
  ], choices: [
    { text: 'Bury him in the yard.', ends: true, lines: [
      'The vulture does it properly: straightens the coat, closes the eyes, and says a name she reads off the collar. She doesn\'t look at you while she does it.',
    ], then: { set: 'dead-1' } },
  ] }] },
  'dead-2': { speaker: 'ONE OF THE DEAD', prompt: 'Examine the body', hiddenIf: [{ flag: 'dead-2' }], lines: [
    'An old soldier from the border war, in a coat that belongs to neither side.',
  ], choices: [
    { text: 'Bury him in the yard.', ends: true, lines: [
      'You scrape a shallow grave in the frozen yard with your hands and lay him in it. It takes a long time.',
    ], then: { set: 'dead-2' } },
  ], variants: [{ if: { flag: 'vulture-free' }, lines: [
    'An old soldier from the border war, in a coat that belongs to neither side.',
  ], choices: [
    { text: 'Bury him in the yard.', ends: true, lines: [
      'The vulture does it properly: straightens the coat, closes the eyes, and says a name she reads off the collar. She doesn\'t look at you while she does it.',
    ], then: { set: 'dead-2' } },
  ] }] },
  'dead-3': { speaker: 'ONE OF THE DEAD', prompt: 'Examine the body', hiddenIf: [{ flag: 'dead-3' }], lines: [
    'A body small enough to be a child\'s, wrapped in a ration sack.',
  ], choices: [
    { text: 'Bury him in the yard.', ends: true, lines: [
      'You scrape a shallow grave in the frozen yard with your hands and lay him in it. It takes a long time.',
    ], then: { set: 'dead-3' } },
  ], variants: [{ if: { flag: 'vulture-free' }, lines: [
    'A body small enough to be a child\'s, wrapped in a ration sack.',
  ], choices: [
    { text: 'Bury him in the yard.', ends: true, lines: [
      'The vulture does it properly: straightens the coat, closes the eyes, and says a name she reads off the collar. She doesn\'t look at you while she does it.',
    ], then: { set: 'dead-3' } },
  ] }] },
  'abbey-cache': { speaker: 'BEHIND THE ALTAR STONE', prompt: 'Search behind the stone', hiddenIf: [{ owns: 'famine-spoon' }], lines: [
    'Behind the fallen altar stone, a wooden spoon worn thin, wrapped in a ration card from the winter of no bread.',
    'Found: Famine spoon.',
  ], then: { find: 'famine-spoon' } },
};

const HYENA = [
  'She is still breathing. She doesn\'t try to get up.',
  '"I dug the graves through the winter of no bread. When there was nothing else, I ate what I buried, and fed the living with it. I broke no law. They exiled me anyway."',
  '"The one with no fur ate at my table once. He eats anything. Like me. He listened, too."',
  '"Your church cut the fish before anyone rioted. Look in my ledger. Then tell me who the grave-eaters are."',
];
export const ossuary: Dialogue = {
  // She talks first; the hero decides when it comes to blows.
  hyena: { speaker: 'THE HYENA', prompt: 'Speak to the hyena', portrait: 'hyena', hiddenIf: [{ flag: 'hyena-challenged' }, { flag: 'hyena-slain' }], lines: [
    'She looks up from the bones. "Nobody comes down here to pray."',
    '"You came with the key. So the old monk finally gave it to someone. Good for him."',
  ], choices: [
    { text: 'Why do you raise the dead?', lines: [
      '"The fish is cut again. I know what comes after that. I lived through it."',
      '"I\'m keeping the dead out of the ground before somebody needs them. Better they walk than end up in a pot with a church seal on it."',
    ] },
    { text: 'You ate them.', lines: [
      '"I fed the living with them. Ask the monk upstairs how he got through that winter. Ask him what he said about me after."',
    ] },
    { text: 'Who is the one with no fur?', lines: [
      '"He ate at my table. He eats anything. Like me."',
      '"Ask me again when you\'ve won. If you win."',
    ] },
    { text: 'The church sent me to put you down.', ends: true, lines: [
      'She laughs, and behind her the dead she keeps get up.',
      '"Then they sent the right one. You\'ve died more than any of mine."',
    ], then: { set: 'hyena-challenged' } },
  ] },
  den: { speaker: 'THE HYENA', prompt: 'Speak to the hyena', hiddenIf: [{ not: { flag: 'hyena-slain' } }], lines: HYENA,
    variants: [{ if: { flag: 'vulture-free' }, lines: [
      ...HYENA,
      'The vulture is looking at the bones. "They sentenced me to clear the dead," she says. "They exiled her for doing the same."',
    ] }] },
  ledger: { speaker: 'THE HYENA\'S LEDGER', prompt: 'Read the ledger', hiddenIf: [{ not: { flag: 'hyena-slain' } }], lines: [
    'A church ration ledger. FISH ALLOWANCE, HIGHLAND GARRISON: REDUCED BY ONE THIRD.',
    'The order is dated two months before the first unrest at the fort. It was countersigned at the church, and the name has been cut out of the page.',
    'You take the page. It is the first proof the church knew.',
  ], then: { set: 'ration-ledger' }, variants: [{ if: { flag: 'ration-ledger' }, lines: [
    'The ledger, missing the page you took.',
  ] }] },
  shelves: { speaker: 'THE NICHES', prompt: 'Examine the niches', lines: [
    'The dead of the winter of no bread, stacked in the niches. Clean, sorted, and kept.',
  ], variants: [{ if: { flag: 'vulture-free' }, lines: [
    'The dead of the winter of no bread, stacked in the niches. Clean, sorted, and kept.',
    '"Neatly done," the vulture says. She doesn\'t say anything else for a while.',
  ] }] },
};
// Meeting her with the note in hand offers the same replies.
battlefield.vulture.variants![0].choices = battlefield.vulture.choices;
// Coming back to the monk with the key in hand, the same replies stand.
abbey.monk.variants![0].choices = abbey.monk.choices;

// The high tarn: a frozen lake under the pass, a trapper, and what the ice keeps.
export const tarn: Dialogue = {
  trapper: { speaker: 'THE TRAPPER', prompt: 'Speak to the trapper', lines: [
    'Mind the ice by the middle. It held her too, until it didn\'t.',
  ], variants: [{ if: { flag: 'ring-returned' }, lines: [
    'The ice will go in a month. I\'ll be here.',
  ] }], choices: [
    { text: 'Held who?', lines: [
      'My partner. Forty winters on this lake. She went through last spring, and it closed over her.',
      'When the light\'s right I can see her from the shore. I can\'t make myself go out there.',
    ] },
    { text: 'Give him the ring.', if: { has: 'ring' }, ends: true, lines: [
      'He holds it for a long time without saying anything.',
      '"Take this. It was hers. Better on someone moving." He gives you a band of dark iron, cold as the lake.',
      'Found: Frost ring.',
    ], then: { take: 'ring', set: 'ring-returned', find: 'frost-ring' } },
    { text: 'What is up the cliff?', lines: [
      'The pass. The garrison road. There\'s a rope ladder, if someone up there has let it down.',
      'Nobody has, since the inquisitor came through asking who uses it.',
    ] },
    { text: 'Who else comes this way?', lines: [
      'Otters. Smugglers. Once, last winter, a man with no fur, going down. He asked me how long a body keeps in ice.',
      'I told him. He thanked me like it was good news.',
    ] },
  ] },
  'ice-body': { speaker: 'UNDER THE ICE', prompt: 'Look through the ice', hiddenIf: [{ has: 'ring' }, { flag: 'ring-returned' }], lines: [
    'Under the ice, a lynx in a trapper\'s coat, eyes open. A ring on one finger.',
  ], choices: [
    { text: 'Break the ice and take the ring.', ends: true, lines: [
      'You break through with a rock. The cold takes your breath. You take the ring and let the water close over her again.',
    ], then: { give: 'ring' } },
  ] },
  'tarn-cairn': { speaker: 'A CAIRN', prompt: 'Examine the cairn', lines: [
    'A cairn for the ones the lake kept. Seven stones. The newest has a ring scratched into it.',
  ] },
};

// The drove road between the downs and the battlefield gate.
export const drove: Dialogue = {
  drover: { speaker: 'THE DROVER', prompt: 'Speak to the wolf', lines: [
    'Drover. I take the ram\'s lambs and the downs\' wool up to the fort, and bring back coin they won\'t touch with their hooves.',
    'The herbivores won\'t drive their own flocks up to a carnivore fort. So they pay a wolf to do it. Nobody sees the joke but me.',
  ], variants: [{ if: { flag: 'drove-gate-open' }, lines: [
    'Gate\'s open. That\'s a day off every trip. I owe you a drink I\'ll never buy you.',
  ] }], choices: [
    { text: 'Raiders?', lines: ['In the hollow to the south-east. They take a sheep a trip and leave me the rest, so I keep coming. Practical people.'] },
    { text: 'Why is the gate at the top barred?', if: { not: { flag: 'drove-gate-open' } }, lines: ['The garrison bars it from their side. Lift it from up there sometime and I\'ll be a day quicker.'] },
    { text: 'Who else uses this road?', lines: [
      'Me. Sheep. Lately a man with no fur, going up toward the abbey with a sack that wasn\'t wool.',
    ] },
  ] },
  'drove-cairn': { speaker: 'THE DROVERS\' CAIRN', prompt: 'Examine the cairn', lines: [
    'Every drover adds a stone going up. The bottom stones are carved with wolves. The top ones with nothing.',
  ] },
  'drove-sign': { speaker: 'A SIGNPOST', prompt: 'Read the signpost', lines: [
    'THE DROVE ROAD. West: the downs. North: the battlefield gate, and the fort.',
  ] },
  'raider-stash': { speaker: 'THE RAIDERS\' TENT', prompt: 'Search the tent', hiddenIf: [{ flag: 'drover-cache' }], lines: [
    'Under the raiders\' bedding: a purse of mixed coin, some of it church, and a firepot wrapped in a sheepskin.',
    'You receive 12 coins and a firepot.',
  ], then: { earn: 12, supply: 'firepot', set: 'drover-cache' } },
};

// The old border fort above the fort town, held by deserters, with the border war's archive and the signal lantern.
export const keep: Dialogue = {
  'keep-gate': { speaker: 'THE OLD BORDER FORT', prompt: 'Examine the gate', lines: [
    'The fort the fort town was built to feed, back when the border ran here. The gate has been barred from inside with a cart.',
  ] },
  archive: { speaker: 'THE ARCHIVE', prompt: 'Search the archive', lines: [
    'Shelves of garrison rolls from the border war. The farmland\'s dead have names. The highland dead have numbers.',
    'One roll is newer than the rest, in a careful church hand: RATION OBSERVATIONS, HIGHLAND GARRISON. Weekly.',
    'It records how long the garrison takes to grow angry each time the fish is cut, and how angry. The last entry says only: SUFFICIENT.',
  ] },
  roll: { speaker: 'A LIST ON THE WALL', prompt: 'Read the list', lines: [
    'The names of the deserters who hold the keep, written by one of them. Twelve names. Eleven crossed out, with a date and a word beside each.',
    'HUNGER. HUNGER. COLD. HIS OWN HAND. HUNGER.',
  ] },
  camp: { speaker: 'THEIR FIRE', prompt: 'Examine the fire', lines: [
    'A pot with nothing in it but snow, boiled. The bones of something small, picked clean. They have been up here a long time.',
  ] },
  banner: { speaker: 'THE BANNER', prompt: 'Examine the banner', lines: [
    'The garrison\'s banner, cut down and hung again upside down.',
  ] },
  lantern: { speaker: 'THE SIGNAL LANTERN', prompt: 'Take the lantern', hiddenIf: [{ not: { flag: 'captain-slain' } }, { flag: 'lantern' }], lines: [
    'At the top of the tower stair, the garrison\'s signal lantern: an iron cage around a lens as big as your head. Lit, it could be seen from the farmland.',
    'It\'s heavy. It\'s the kind of light she can\'t put out.',
    'Found: the signal lantern.',
  ], then: { set: 'lantern' } },
};
