import type { Choice, Dialogue } from './dialogue';

// Millbrook: a prosperous herbivore market town. Names are placeholders.
export const town: Dialogue = {
  reeve: { speaker: 'THE REEVE', prompt: 'Speak to the reeve', lines: [
    'The church said it would send someone. I hoped it would not be one of you.',
    'Grain carts leave here for the highlands every morning. For six days, every one has come back. The drivers say they were turned around at the border.',
    'Nobody here gave that order. Find out who did.',
    'The bear at the mill is yours, I suppose. Clear the pests out of my fields, the locust in the wheat and the weevil in the hay yard, and I will sign a writ for him.',
    'Or pay his fine. Sixty coins.',
  ], then: { shop: 'reeve' }, variants: [{ if: { all: [{ flag: 'otter-reported' }, { not: { flag: 'otter-paid' } }] }, lines: [
    'The watch went up to the fen on your word. Found a camp and some eel traps. Nobody in it.',
    'Ten coins anyway. The Covenant thanks you.',
    'You receive 10 coins.',
  ], then: { earn: 10, set: 'otter-paid' } }, { if: { all: [{ flag: 'followers-reported' }, { not: { flag: 'followers-paid' } }] }, lines: [
    'The watch brought a badger in this morning. Said you sent him.',
    'Twenty coins. The Covenant thanks you.',
    'You receive 20 coins.',
  ], then: { earn: 20, set: 'followers-paid' } }, { if: { all: [{ flag: 'swarm-slain' }, { not: { flag: 'bounty-paid' } }] }, lines: [
    'The swarm-mother? You?',
    'Twenty-five coins, as posted.',
    'You receive 25 coins.',
  ], then: { earn: 25, set: 'bounty-paid' } }, { if: { all: [{ flag: 'pests-field' }, { flag: 'pests-yard' }, { not: { flag: 'writ-given' } }] }, lines: [
    'The wheat is standing and the hay yard is quiet.',
    'Here. A writ releasing the bear into your custody. Show it to the miller.',
    'And keep him out of my square.',
  ], then: { set: 'writ-given' } }, { if: { all: [{ flag: 'boar-defeated' }, { not: { flag: 'reeve-pardon' } }, { not: { flag: 'writ-given' } }, { not: { flag: 'bear-free' } }] }, lines: [
    'The carts went through at dawn.',
    'The boar. We burned him out over a kid who turned up alive three weeks later. I signed the order.',
    'I won\'t thank a convict in the square. So, here.',
    'He hands you a folded letter with the reeve\'s seal on it. Good conduct, it says, for the bearer, in Millbrook.',
    'The brand stays. That\'s the church\'s business. But here you\'ll be treated as a citizen.',
    'And the bear\'s writ. Pests or no pests, you\'ve done more than I asked. Show it to the miller.',
    'You receive the reeve\'s letter of good conduct, and the bear\'s writ.',
  ], then: { set: ['reeve-pardon', 'writ-given'] } }, { if: { all: [{ flag: 'boar-defeated' }, { not: { flag: 'reeve-pardon' } }] }, lines: [
    'The carts went through at dawn.',
    'The boar. We burned him out over a kid who turned up alive three weeks later. I signed the order.',
    'I won\'t thank a convict in the square. So, here.',
    'He hands you a folded letter with the reeve\'s seal on it. Good conduct, it says, for the bearer, in Millbrook.',
    'The brand stays. That\'s the church\'s business. But here you\'ll be treated as a citizen.',
    'You receive the reeve\'s letter of good conduct.',
  ], then: { set: 'reeve-pardon' } }, { if: { all: [{ flag: 'boar-defeated' }, { not: { flag: 'writ-given' } }, { not: { flag: 'bear-free' } }] }, lines: [
    'The bear. Pests or no pests, you\'ve done more than I asked. Here, his writ. Show it to the miller.',
    'You receive the bear\'s writ.',
  ], then: { set: 'writ-given' } }, { if: { all: [{ flag: 'writ-given' }, { not: { flag: 'bear-free' } }] }, lines: [
    'You have the writ. Go and show the miller.',
  ] }, { if: { flag: 'boar-defeated' }, lines: [
    'The carts went through at dawn. Keep that letter on you.',
  ] }] },
  innkeeper: { speaker: 'THE INNKEEPER', prompt: 'Speak to the innkeeper', lines: [
    'We\'re full.',
  ], variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'A room\'s come free. Don\'t make me regret it.',
  ], choices: [
    { text: 'Take the room.', ends: true, lines: ['The bed by the west wall. Go on in.'], then: { set: 'inn-room' } },
    { text: 'Not tonight.', ends: true, lines: ['Suit yourself.'] },
  ] }] },
  shopkeeper: { speaker: 'THE STALLHOLDER', prompt: 'Speak to the stallholder', lines: [
    'Smoked fish, smelling salts, firepots. The board price is for citizens.',
    'Yours is three times that.',
  ], then: { shop: 'stall' }, variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'Carts are moving again. Twice the board price, then.',
  ], then: { shop: 'stall' } }, { if: { flag: 'stall-cowed' }, lines: [
    'Twice the board price, like we said. Leave the bear outside.',
  ], then: { shop: 'stall' } }] },
  board: { speaker: 'THE NOTICE BOARD', prompt: 'Read the notice board', variants: [{ if: { flag: 'reeve-pardon' }, lines: [
    'WANTED, by order of the Covenant: the five who murdered the rulers.',
    'All five faces have been scratched out now. Someone did yours carefully.',
  ] }], lines: [
    'WANTED, by order of the Covenant: the five who murdered the rulers.',
    'Four of the faces have been scratched out. Yours hasn\'t.',
    'Pinned under it: BOUNTY. The swarm-mother, in the dark woods west of the stream. Twenty-five coins from the reeve.',
  ] },
  child: { speaker: 'A LAMB', prompt: 'Speak to the lamb', lines: [
    'Are you the one who killed the king?',
  ], variants: [
    { if: { flag: 'lamb-thanked' }, lines: [
      'Did the thorns let go? Told you.',
      'Mum\'s watching from the window. I have to go in.',
    ] },
    { if: { has: 'bell' }, lines: [
      'My bell!',
      'Bend down. You say it like this. Quiet, like you\'re not in a hurry.',
      "Bramble's leave is written into the grimoire.",
    ], then: { take: 'bell', learn: "Bramble's leave", set: 'lamb-thanked' } },
  ] },
  fishmonger: { speaker: 'THE FISHMONGER', prompt: 'Speak to the fishmonger', lines: [
    'Fish from the capital port, church license on every barrel. For the carnivore quarter, mostly.',
    'If you\'ve caught anything yourself, I\'ll take it. At my price.',
  ], then: { shop: 'fishmonger' }, variants: [{ if: { flag: 'fishmonger-angry' }, lines: [
    'He turns his back on you and stays that way.',
  ] }] },
  barrel: { speaker: 'THE BARREL', lines: [
    'Something inside knocks against the staves, then stops.',
    'The fishmonger puts a hoof on the lid.',
  ], variants: [
    { if: { flag: 'squid-freed' }, lines: ['Empty. It still smells of brine.'] },
    { if: { flag: 'barrel-bought' }, lines: [
      'You pry the lid. In a few inches of brine, a young squid. Still alive.',
      'It needs moving water. The mill stream runs down to the sea.',
    ] },
  ] },
  fox: { speaker: 'A FOX ON A DOORSTEP', prompt: 'Speak to the fox', lines: [
    'The gate in that wall locks from their side, not ours.',
    'They still do a count of us every night. Thirty years and nobody\'s eaten anybody, and they still count.',
  ], variants: [{ if: { flag: 'stood-count' }, lines: [
    'You stood in the line with us. People on this side noticed.',
    'When the stall behind the tannery opens, ask for the salt cut. Say the fox sent you.',
  ] }] },
  stocks: { speaker: 'THE STOCKS', prompt: 'Examine the stocks', lines: [
    'Stocks in the middle of the market square, where everyone can see. Empty today. The stones under them have not been scrubbed.',
  ] },
  stall: { speaker: 'A SHUTTERED STALL', prompt: 'Examine the stall', lines: [
    'A stall behind the tannery, shuttered. Chalked on the boards: AFTER DARK.',
    'The night market is not built yet.',
  ] },
};

// Replies. Some are only possible while the hero still remembers, or once he has forgotten.
const lambGoesOn = [
  'There\'s thorns all over the south road now. Since the carts stopped.',
  "I lost my bell in the locust field. If you get it back I'll show you how to make thorns let go. Gran showed me.",
];
town.child.choices = [
  { text: "No. I don't think so.", ends: true, if: { not: { forgot: 'feast' } }, lines: ['Mum says you did.', ...lambGoesOn] },
  { text: "I don't remember.", ends: true, if: { forgot: 'feast' }, lines: ['That\'s what everyone says.', ...lambGoesOn] },
  { text: 'They say I did.', ends: true, lines: ['Mum says.', ...lambGoesOn] },
];
const reeveReplies: Choice[] = [
  { text: 'Who gave the order to turn the carts?', lines: ['If I knew, I wouldn\'t need you. Ask at the border.'] },
  { text: 'I did not kill anyone.', if: { not: { forgot: 'trial' } }, lines: ['Everyone in my lockup says that.'] },
  { text: 'Why am I branded?', if: { forgot: 'trial' }, lines: [
    'You don\'t know? They say you killed the king.',
  ] },
  // He says exactly what is left to do for the writ.
  { text: 'About the bear.', if: { all: [{ not: { flag: 'writ-given' } }, { not: { flag: 'pests-field' } }, { not: { flag: 'pests-yard' } }] }, lines: [
    'Kill the locust in my wheat and the weevil in the hay yard, and I\'ll sign his writ. Or pay his fine. Sixty coins.',
  ] },
  { text: 'About the bear.', if: { all: [{ not: { flag: 'writ-given' } }, { flag: 'pests-field' }, { not: { flag: 'pests-yard' } }] }, lines: [
    'The wheat\'s clear. The weevil in the hay yard isn\'t. Then you get your writ. Or sixty coins.',
  ] },
  { text: 'About the bear.', if: { all: [{ not: { flag: 'writ-given' } }, { not: { flag: 'pests-field' } }, { flag: 'pests-yard' }] }, lines: [
    'The hay yard\'s clear. The locust in the wheat isn\'t. Then you get your writ. Or sixty coins.',
  ] },
  { text: 'About the bear.', if: { all: [{ flag: 'writ-given' }, { not: { flag: 'bear-free' } }] }, lines: ['You have his writ. Show it to the miller.'] },
  // The brand is the church's to lift, not his. What the reeve can give is Millbrook's good word.
  { text: 'I want a pardon.', if: { all: [{ not: { flag: 'boar-defeated' } }, { not: { flag: 'reeve-pardon' } }] }, lines: [
    'A pardon? The brand is the church\'s, not mine. I couldn\'t lift it if I wanted to.',
    'But bring my carts back, and I\'ll see what a reeve\'s word is worth in Millbrook.',
  ] },
  { text: 'About your letter.', if: { flag: 'reeve-pardon' }, lines: [
    'Board prices at the stall, a bed when you want one, and nobody\'s face on my wall but the four who earned it.',
    'It holds in Millbrook. Past the border, it\'s paper.',
  ] },
];
town.reeve.choices = reeveReplies;
// The reeve can be asked things whatever else is going on.
for (const variant of town.reeve.variants!) variant.choices ??= reeveReplies;
town.fox.choices = [
  { text: 'Who counts you?', lines: ['The reeve\'s watch. With a lantern and a list.'] },
  { text: "I'll stand in the count tonight.", lines: [
    'The fox looks at you for a while. "They\'ll count you twice. Once for the brand."',
    'You stand in the line with the carnivore quarter until the watch has gone past. Nobody says anything.',
    'In the morning someone has left a firepot by your pack.',
  ], then: { set: 'stood-count', supply: 'firepot' } },
  { text: 'I eat insects.', lines: ['Lucky you. They don\'t count insects.'] },
];
town.innkeeper.choices = [
  { text: 'Your board says rooms are free.', lines: ['The board\'s old.'] },
  // Coin talks after all, if there is enough of it.
  { text: 'Twelve coins for a bed. Back stairs.', ends: true, if: { coins: 12 }, lines: [
    'She looks at the coins for a long moment, then sweeps them off the counter.',
    '"The bed by the west wall. Out before anyone\'s up."',
  ], then: { pay: 12, set: 'inn-room' } },
  { text: "Fine. I'll sleep outdoors.", ends: true, lines: ['There\'s a fire ring at the crossroads. The shepherds use it.'] },
];
town.shopkeeper.choices = [
  { text: 'Lower your prices.', if: { all: [{ flag: 'bear-free' }, { not: { flag: 'boar-defeated' } }] }, lines: [
    'She looks past you at the bear filling the doorway.',
    '"Twice the board price. Not a copper less."',
  ], then: { set: 'stall-cowed' } },
  { text: 'Lower your prices.', if: { not: { flag: 'bear-free' } }, lines: ['No.'] },
  { text: 'Show me what you have.', ends: true, lines: ['Look, then. Don\'t touch.'] },
];
town.fishmonger.choices = [
  { text: "What's in the barrel?", if: { not: { flag: 'barrel-bought' } }, lines: ['Pickling. Leave it.'] },
  // Telling him costs a buyer for good.
  { text: 'I let your squid go.', ends: true, if: { flag: 'squid-freed' }, lines: [
    'He stares at you.',
    '"Get away from my stall. Don\'t come back."',
  ], then: { set: 'fishmonger-angry' } },
  { text: 'Show me what you buy.', ends: true, lines: ['Go on, then.'] },
];
