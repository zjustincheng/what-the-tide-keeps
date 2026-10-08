import type { Dialogue } from './dialogue';

// Millbrook: a prosperous herbivore market town. Names are placeholders.
export const town: Dialogue = {
  reeve: { speaker: 'THE REEVE', prompt: 'Speak to the reeve', lines: [
    'A reptile with a church brand. The church said it would send someone. I had hoped for someone else.',
    'Grain carts leave here for the highlands every morning. For six days, every one has come back. The drivers say they were turned at the border.',
    'Nobody gave the order. Everybody has heard it. Find out who is turning my carts, and I may find a use for a convict.',
    'The bear at the mill is yours, I suppose. If you want him, earn him. Clear the pests from my fields, the locust in the wheat and the weevil in the hay yard, and I will sign a writ.',
    'Or pay his fine. Sixty coins. The town could use them more than it could use a bear.',
  ], then: { shop: 'reeve' }, variants: [{ if: { all: [{ flag: 'pests-field' }, { flag: 'pests-yard' }, { not: { flag: 'writ-given' } }] }, lines: [
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
  ] },
  child: { speaker: 'A LAMB', prompt: 'Speak to the lamb', lines: [
    'Are you the one who killed the king?',
    'Mother says not to look at you. I am looking at you anyway.',
    'There are thorns growing over the south road. The grown-ups say it is a curse. I think the thorns are only sad.',
    'I lost my bell in the locust field when they chased me. If you find it, I will teach you the word for thorns. It is only a children\'s spell.',
  ], variants: [
    { if: { flag: 'lamb-thanked' }, lines: [
      'Did the thorns listen? They always listen to me.',
      'Mother says you are dangerous. I told her you found my bell.',
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
  ] },
  barrel: { speaker: 'THE BARREL', lines: [
    'Something inside knocks twice against the staves, then stops.',
    'The fishmonger sets a hoof on the lid and does not look at you.',
  ] },
  fox: { speaker: 'A FOX ON A DOORSTEP', prompt: 'Speak to the fox', lines: [
    'Herbivores built that wall and call the far side ours. The gate locks from their side.',
    'Nobody here has eaten a neighbor in thirty years. They still count us at night.',
    'You, though. Even our side looks at you twice. What are you, under the brand?',
  ] },
  stall: { speaker: 'A SHUTTERED STALL', prompt: 'Examine the stall', lines: [
    'A stall behind the tannery, shuttered tight. Chalked on the boards: AFTER DARK.',
    'Beneath it, smaller and in another hand: ASK FOR THE SALT CUT.',
    'The night market is not built yet.',
  ] },
};
