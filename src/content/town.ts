import type { Choice, Dialogue } from './dialogue';

// Millbrook: a prosperous herbivore market town. Names are placeholders.
export const town: Dialogue = {
  reeve: { speaker: 'THE REEVE', prompt: 'Speak to the reeve', lines: [
    'A reptile with a church brand. The church said it would send someone. I had hoped for someone else.',
    'Grain carts leave here for the highlands every morning. For six days, every one has come back. The drivers say they were turned at the border.',
    'Nobody gave the order. Everybody has heard it. Find out who is turning my carts, and I may find a use for a convict.',
    'The bear at the mill is yours, I suppose. If you want him, earn him. Clear the pests from my fields, the locust in the wheat and the weevil in the hay yard, and I will sign a writ.',
    'Or pay his fine. Sixty coins. The town could use them more than it could use a bear.',
  ], then: { shop: 'reeve' }, variants: [{ if: { all: [{ flag: 'swarm-slain' }, { not: { flag: 'bounty-paid' } }] }, lines: [
    'The swarm-mother. In the woods. You.',
    'Twenty-five coins, as posted. The board will say PAID by tonight.',
    'You receive 25 coins.',
  ], then: { earn: 25, set: 'bounty-paid' } }, { if: { all: [{ flag: 'pests-field' }, { flag: 'pests-yard' }, { not: { flag: 'writ-given' } }] }, lines: [
    'The wheat is standing and the hay yard is quiet. You did that.',
    'Here. A writ releasing the bear into the custody of the church\'s convict. Into yours. Not into mine.',
    'Show it to the miller. And keep that bear out of my square.',
  ], then: { set: 'writ-given' } }, { if: { flag: 'boar-defeated' }, lines: [
    'The carts went through at dawn. The highlands will have their grain.',
    'The boar. We burned him out over a kid who was never eaten. I signed the order myself.',
    'I will not thank a convict in the square. I am thanking you here.',
  ] }, { if: { all: [{ flag: 'writ-given' }, { not: { flag: 'bear-free' } }] }, lines: [
    'You have the writ. The miller is waiting, though he will not admit it.',
  ] }] },
  innkeeper: { speaker: 'THE INNKEEPER', prompt: 'Speak to the innkeeper', lines: [
    'We are full.',
    'The board says otherwise? The board is old. There is a field past the south gate. I am told your kind sleeps well enough out of doors.',
  ], variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'A room has come free. Do not make me regret it.',
  ] }] },
  shopkeeper: { speaker: 'THE STALLHOLDER', prompt: 'Speak to the stallholder', lines: [
    'Smoked fish, smelling salts, firepots. For citizens, the price on the board.',
    'For you, three times that. The road is dangerous, and so, I hear, are you.',
  ], then: { shop: 'stall' }, variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'The carts are moving again. Twice the board price, then, not three times. Do not spread it about.',
  ], then: { shop: 'stall' } }] },
  board: { speaker: 'THE NOTICE BOARD', prompt: 'Read the notice board', lines: [
    'WANTED, by order of the Covenant: the five who murdered the rulers.',
    'Four of the faces have been scratched out by hooves. Yours has not, though it is a poor likeness.',
    'Pinned beneath it: ROOMS FREE. ASK WITHIN.',
    'And newer: BOUNTY. The swarm-mother, in the dark woods west of the stream. Twenty-five coins from the reeve.',
  ] },
  child: { speaker: 'A LAMB', prompt: 'Speak to the lamb', lines: [
    'Are you the one who killed the king?',
  ], variants: [
    { if: { flag: 'lamb-thanked' }, lines: [
      'Did the thorns let go? They let go for me. They never let go for the grown-ups.',
      'Mother says you are dangerous. She says the dangerous ones are always kind to children first.',
    ] },
    { if: { has: 'bell' }, lines: [
      'My bell! You went into the locust field for it?',
      'Bend down. You say it like this, softly, as though the thorns were frightened and you were not.',
      "Bramble's leave is written into the grimoire.",
    ], then: { take: 'bell', learn: "Bramble's leave", set: 'lamb-thanked' } },
  ] },
  fishmonger: { speaker: 'THE FISHMONGER', prompt: 'Speak to the fishmonger', lines: [
    'Fresh from the capital port. Fish for the carnivore quarter, by church license, so nobody there need go hungry.',
    'The barrel? Pickling. Keep your claws off it.',
    'If you have caught anything yourself, I will take it off your hands. At my price.',
  ], then: { shop: 'fishmonger' } },
  barrel: { speaker: 'THE BARREL', lines: [
    'Something inside knocks twice against the staves, then stops.',
    'The fishmonger sets a hoof on the lid and does not look at you.',
  ], variants: [
    { if: { flag: 'squid-freed' }, lines: ['Empty, and smelling of brine. The fishmonger has not refilled it. Yet.'] },
    { if: { flag: 'barrel-bought' }, lines: [
      'You pry the lid. Inside, in brine too shallow for it, a young squid folds and unfolds its arms. It is not food. It is a child of the sea.',
      'It needs running water. The mill stream runs to the sea.',
    ] },
  ] },
  fox: { speaker: 'A FOX ON A DOORSTEP', prompt: 'Speak to the fox', lines: [
    'Herbivores built that wall and call the far side ours. The gate locks from their side.',
    'Nobody here has eaten a neighbor in thirty years. They still count us at night.',
    'You, though. Even our side looks at you twice. What are you, under the brand?',
  ] },
  stocks: { speaker: 'THE STOCKS', prompt: 'Examine the stocks', lines: [
    'Stocks in the middle of the market, where the whole square can watch. The wood is worn dark where hands have gripped it.',
    'A board above: FOR THE CORRECTION OF APPETITES. Below it, the stones are stained, and nobody has scrubbed them.',
  ] },
  stall: { speaker: 'A SHUTTERED STALL', prompt: 'Examine the stall', lines: [
    'A stall behind the tannery, shuttered tight. Chalked on the boards: AFTER DARK.',
    'Beneath it, smaller and in another hand: ASK FOR THE SALT CUT.',
    'The night market is not built yet.',
  ] },
};

// Replies. Some are only possible while the hero still remembers, or once he has forgotten.
const lambGoesOn = [
  'Mother says not to look at you. I am looking at you anyway.',
  'There are thorns growing over the south road. The grown-ups say it is a curse. I think something is buried under them.',
  "I lost my bell in the locust field when they chased me. If you find it, I will teach you the word for thorns. It is only a children's spell.",
];
town.child.choices = [
  { text: "No. I don't think so.", if: { not: { forgot: 'feast' } }, lines: ["You don't know? Then how do you know you didn't?", ...lambGoesOn] },
  { text: "I don't remember.", if: { forgot: 'feast' }, lines: ['Then anyone could have done it. Even you.', ...lambGoesOn] },
  { text: 'They say I did.', lines: ['They say a lot of things. They say the thorns are a curse.', ...lambGoesOn] },
];
const reeveReplies: Choice[] = [
  { text: 'Who gave the order to turn the carts?', lines: ['If I knew, I would not need a convict. Ask at the border. Ask loudly.'] },
  { text: 'I did not kill anyone.', if: { not: { forgot: 'trial' } }, lines: ['Every soul in my lockup is innocent. You would be amazed how many.'] },
  { text: 'Why am I branded?', if: { forgot: 'trial' }, lines: [
    'You do not know? They say you killed the king. They say it with great confidence.',
    'A man who does not know his own crime. Either you are very good, or something has been done to you.',
  ] },
  { text: 'About the bear.', lines: ['Earn him or buy him. I do not care which, so long as it is quick.'] },
];
town.reeve.choices = reeveReplies;
town.fox.choices = [
  { text: 'A chameleon. Same as ever.', lines: ['Same as ever. You are the only one who thinks so.'] },
  { text: "I don't know anymore.", if: { forgot: 'home' }, lines: ['Then you and this quarter have something in common. Welcome.'] },
  { text: 'Someone who eats insects.', lines: ['Legally. For now. The herbivores will still lock the gate.'] },
];
town.innkeeper.choices = [
  { text: 'Your board says rooms are free.', lines: ['The board is old.'] },
  { text: 'I can pay.', lines: ['Your coin is not the problem.'] },
  { text: "Fine. I'll sleep outdoors.", lines: ['There is a fire ring at the crossroads. The shepherds will not mind. Much.'] },
];
town.fishmonger.choices = [
  { text: "What's really in the barrel?", if: { not: { flag: 'barrel-bought' } }, lines: ['Pickling.', 'Ask again and you can climb in with it.'] },
  { text: 'Where do the fish come from?', lines: ['The capital port. The sea. The church licenses every barrel. Where the sea gets them is not my business.'] },
  { text: 'Show me what you buy.', lines: ['Go on, then.'] },
];
