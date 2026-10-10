import type { Choice, Dialogue } from './dialogue';

// The ocean: no church, no orders, and the sea's side of everything the land has been eating.
// People talk about what is in front of them. Names are placeholders.

// Wrecktown, the outlaw port.
export const port: Dialogue = {
  portmaster: { speaker: 'A GULL IN A CAPTAIN\'S COAT', prompt: 'Speak to the gull', lines: [
    'Welcome to Wrecktown. Every deck here ran aground somewhere else first. We just tied them together.',
    'Nobody here cares about your brand. Half the port has one. The other half took theirs off with a knife.',
  ], choices: [
    { text: 'Who runs the water?', lines: [
      'The shark clans hold the deep. The crews hold the shipping lanes. The cuttlefish holds the reef, and lately the cuttlefish holds everybody.',
      'It\'s been going round the clans, the crews, the pods, saying the same thing: no more fish for the land. Nobody\'s argued with it for long.',
    ] },
    { text: 'Where does the fish go?', lines: [
      'Inland, to feed your carnivores, so they don\'t eat your herbivores. That\'s your Covenant. Ask the sea what it thinks of it. Out past the pens, someone will tell you.',
    ] },
  ] },
  stranger: { speaker: 'A HOODED SAILOR', prompt: 'Speak to the sailor', hiddenIf: [{ flag: 'octopus-free' }], portrait: 'octopus', lines: [
    'A sailor in a hood, sitting very still at the rail. Too many arms under the coat for one person.',
    'Then they say your name. Not "hero". Not "convict". A name you don\'t remember, and you know at once that it is yours.',
  ], variants: [{ if: { flag: 'shark-slain' }, lines: [
    'The hood comes down. An octopus, grey with hiding. Then it lets its colour come back, slowly, as if it had forgotten how.',
    '"You came out to sea. I told you not to die out here. I didn\'t tell you not to come."',
  ], choices: [
    { text: 'Come with us.', ends: true, lines: [
      '"I fought my own kin for the land, and the land sentenced me for it. You were the only ones who didn\'t look at me like a traitor. Then we all went to a feast."',
      '"I remember the feast better than any of you. I didn\'t drink. I watched. The cupbearer had hands with no fur on them, and no claws."',
      '"I\'ll come. I\'ll teach you the currents. The sea is easier if you stop fighting it."',
      'The octopus joins the party.',
    ], then: { set: 'octopus-free' } },
  ] }], choices: [
    { text: 'Who are you?', lines: [
      '"Someone the sharks are paid to find. Not here: there\'s one at the next rail, pretending to be interested in rope."',
      '"Deal with him, and I\'ll take the hood off."',
    ], then: { set: 'octopus-met' } },
  ] },
  chandler: { speaker: 'A SHIP\'S CHANDLER', prompt: 'Speak to the chandler', lines: [
    'Everything a ship needs and nothing a church would sell you. Look all you like. The good books are under the counter.',
  ], choices: [
    { text: 'Show me what you have.', ends: true, lines: ['She lifts the counter flap. Under it, in oilcloth, books with the church\'s seal scratched off.'], then: { shop: 'chandler' } },
  ] },
  books: { speaker: 'A STACK OF BOOKS', prompt: 'Look at the books', lines: [
    'Grimoires the church banned for being too strong, or too true. One, open, shows a spell for pulling the sea up out of the ground. Someone has written in the margin: THIS IS WHY THEY KILLED THE KRAKEN. THEY WERE AFRAID OF IT.',
  ] },
  tavern: { speaker: 'THE TAVERN HOLD', prompt: 'Look into the tavern', lines: [
    'A hold full of hammocks and smoke. Somebody is singing a song about a lighthouse. Everyone else is not joining in, carefully.',
  ] },
  fisher: { speaker: 'A SEAL WITH A NET', prompt: 'Speak to the seal', lines: [
    'I fish for the port. Not for the land. There\'s a difference: I take what we eat and leave the rest.',
    'The land\'s boats take everything, every night, and sort it later. What they don\'t want goes back in dead.',
  ] },
  pirate: { speaker: 'A PIRATE', prompt: 'Speak to the pirate', lines: [
    'A shark with one fin cut short, cleaning a knife. "The church boats used to pay us to leave them alone. Then they stopped paying and started sailing past us at night with no lights."',
    '"Going out to that light. Nobody follows them. Even we don\'t follow them."',
  ] },
  child: { speaker: 'A SEAL PUP', prompt: 'Speak to the pup', lines: [
    'Are you from the land? Mum says the land eats us. Not like a shark eats. Slower, and with paperwork.',
  ] },
  shrine: { speaker: 'A SHRINE OF NETS', prompt: 'Look at the shrine', lines: [
    'Bits of net, tied in knots, one for every person the port has lost to the land\'s fleets. There are so many that the shrine is mostly knots.',
  ] },
};

// The open water.
export const openWater: Dialogue = {
  wreck: { speaker: 'THE WRECK', prompt: 'Look at the wreck', lines: [
    'A church boat, run onto the rocks. Its hold is full of empty crates stencilled FOR THE LIGHTHOUSE. Whatever was in them was let out, or got out.',
  ] },
};

// The pens: the land's fleet keeps its catch alive offshore until the boats take it in.
export const seaPens: Dialogue = {
  elder: { speaker: 'THE ELDER', prompt: 'Speak to the old seal', portrait: 'elder', lines: [
    'An old seal, so old her whiskers have gone white and stiff, sitting on the sand above the pens.',
    '"I keep count. Of everyone the land takes, and everyone the land lets go. You have a count too. It is short."',
  ], variants: [
    { if: { flag: 'elder-thanked' }, lines: ['"The sea knows your count. That will matter, out at the reef."'] },
    { if: { all: [{ flag: 'nets-cut' }, { any: [{ flag: 'squid-freed' }, { flag: 'crab-freed' }] }, { any: [{ flag: 'pens-freed' }, { flag: 'brother-freed' }, { flag: 'newt-freed' }] }] }, lines: [
      '"A squid let go in a mill stream. A crab off the harbour stones. Things in cages on the land, opened. And now these nets."',
      '"It is not much. It is more than anyone from the land has ever done. Take this to the reef. Show it to the one who is waiting."',
      'Found: the elder\'s pearl.',
    ], then: { set: 'elder-thanked', find: 'elder-pearl' } },
  ], choices: [
    { text: 'What are these pens?', lines: [
      '"Where the land keeps what it catches alive, until it is salted. Fish. And not only fish. The nets do not ask who is a citizen."',
      '"You have eaten from here since your first day out of that church. The smoked fish you heal with. Every barrel."',
    ] },
    { text: 'What count?', lines: [
      '"Who you let go. A child in a barrel, a crab in a tank, a newt in a cage. The sea hears about it, the way it hears about everything that ends up in the water."',
    ] },
  ] },
  nets: { speaker: 'THE NETS', prompt: 'Look at the nets', hiddenIf: [{ flag: 'nets-cut' }], lines: [
    'Fish, crabs, an eel, and something with hands, all in the same net, too tired to struggle. The net is the church\'s, and the knots are tight.',
  ], choices: [
    { text: 'Cut the nets.', ends: true, lines: [
      'It takes a long time with a knife. When the first net opens, nothing moves. Then everything does, all at once, down and away into the dark.',
    ], then: { set: 'nets-cut' } },
  ] },
  barrels: { speaker: 'THE BARRELS', prompt: 'Look at the barrels', lines: [
    'Salt barrels, stamped SMOKED FISH, WICKMERE. The same barrels you have bought from every stall since the farmland. The same stamp you have been eating.',
  ] },
  ledger: { speaker: 'THE FLEET\'S TALLY', prompt: 'Read the tally', lines: [
    'Tonnage by the night. One column says FISH. One says OTHER. The OTHER column is not small.',
  ] },
  caught: { speaker: 'IN THE PEN', prompt: 'Look into the pen', lines: [
    'A young seal, in the net with the fish, has stopped trying. When you look at it, it looks back.',
  ] },
};

// The kraken's grave.
export const krakenGrave: Dialogue = {
  ribs: { speaker: 'THE RIBS', prompt: 'Look at the ribs', lines: [
    'The kraken\'s ribs, arching out of the sand, each as tall as a house. You stood on its back, once. You remember the weight of it under your feet.',
  ] },
  nets: { speaker: 'IN THE SAND', prompt: 'Dig at the sand', lines: [
    'Under the bones, the sand is full of net. Old net, church net, miles of it, wrapped around everything. Around the kraken\'s arms.',
    'It didn\'t come up out of the sea to attack the land. It came up tangled in the land\'s nets, after they took a whole reef in one night.',
  ], then: { set: 'grave-seen' } },
  skull: { speaker: 'THE SKULL', prompt: 'Look at the skull', lines: [
    'Someone has built a shrine against the kraken\'s skull: shells, sea glass, and knots of net. A small stone on top reads, in the sea\'s writing and then in the land\'s: IT CAME TO MAKE IT STOP.',
  ] },
  tooth: { speaker: 'A TOOTH', prompt: 'Take the tooth', hiddenIf: [{ owns: 'kraken-tooth' }], lines: [
    'One of the kraken\'s beak-teeth, broken off and half buried. The octopus looks away while you pick it up.',
    'Found: the kraken\'s tooth.',
  ], then: { find: 'kraken-tooth' } },
};

// The cuttlefish's reef. What can be said to it, whichever way it greets you.
const cuttlefishReplies: Choice[] = [
    { text: 'What are you doing?', lines: [
      '"Ending the fish trade. Every clan, every crew, every pod: no more fish for the land. Let the land find out what it eats when it has to look at itself."',
    ] },
    { text: 'Who is the one with no fur?', lines: [
      '"He came out in a church boat to the lighthouse. He told me the land would starve without the sea, and I believed him, because it\'s true."',
      '"He didn\'t tell me the sea would starve without the land too. Or he did, and I didn\'t care."',
    ] },
    { text: 'Where is the island?', if: { owns: 'elder-pearl' }, lines: [
      '"The sea has always known. It\'s where the land\'s secrets wash up. South, past the charts, where the light is."',
    ] },
    { text: 'Then it ends here.', ends: true, lines: [
      '"Does it? Show me your magic, then. I\'ll show it back to you."',
    ], then: { set: 'cuttlefish-challenged' } },
  ];

export const reef: Dialogue = {
  cuttlefish: { speaker: 'THE CUTTLEFISH', prompt: 'Speak to the cuttlefish', portrait: 'cuttlefish', hiddenIf: [{ flag: 'cuttlefish-challenged' }, { flag: 'cuttlefish-slain' }], lines: [
    'Colours move over its skin like weather. It turns one eye on the octopus, then on you.',
    '"The traitor, and the ones who killed my kin for a feast. Come to keep the fish trade going?"',
  ], variants: [{ if: { owns: 'elder-pearl' }, lines: [
    'Its colours stop, all at once, on the elder\'s pearl.',
    '"She gave you that. She doesn\'t give anyone that." A long silence. "It changes nothing. But I will tell you what I know, before."',
  ], choices: cuttlefishReplies }], choices: cuttlefishReplies },
  den: { speaker: 'THE CUTTLEFISH', prompt: 'Speak to the cuttlefish', portrait: 'cuttlefish', hiddenIf: [{ not: { flag: 'cuttlefish-slain' } }], lines: [
    'It lies on the reef, grey, its colours gone out.',
    '"The trade doesn\'t come back, whatever you do to me. The sea won\'t feed the land the old way again."',
    'The octopus speaks to it for a long time, in colours you can\'t read. When it\'s done, it says only: "There will be a truce. Not the old one."',
  ] },
  shells: { speaker: 'SHELLS', prompt: 'Look at the shells', lines: [
    'A heap of empty shells, carefully arranged by size. Everything the reef lost the night the nets came. The cuttlefish has been counting too.',
  ] },
};
