import type { Dialogue } from './dialogue';

// Millbrook: a prosperous herbivore market town. Names are placeholders.
export const town: Dialogue = {
  reeve: { speaker: 'THE REEVE', prompt: 'Speak to the reeve', lines: [
    'A reptile with a church brand. The church said it would send someone. I had hoped for someone else.',
    'Grain carts leave here for the highlands every morning. For six days, every one has come back. The drivers say they were turned at the border.',
    'Nobody gave the order. Everybody has heard it. Find out who is turning my carts, and I may find a use for a convict.',
  ] },
  innkeeper: { speaker: 'THE INNKEEPER', prompt: 'Speak to the innkeeper', lines: [
    'We are full.',
    'The board says otherwise? The board is old. There is a field past the south gate. I am told your kind sleeps well enough out of doors.',
  ] },
  shopkeeper: { speaker: 'THE STALLHOLDER', prompt: 'Speak to the stallholder', lines: [
    'Smoked fish, bandages, lamp oil. For citizens, four coppers a piece.',
    'For you, let us say twelve. The road is dangerous, and so, I hear, are you.',
    'You have nothing on you anyway. The church takes everything at the door.',
  ] },
  board: { speaker: 'THE NOTICE BOARD', prompt: 'Read the notice board', lines: [
    'WANTED, by order of the Covenant: the five who murdered the rulers.',
    'Four of the faces have been scratched out by hooves. Yours has not, though it is a poor likeness.',
    'Pinned beneath it: ROOMS FREE. ASK WITHIN.',
  ] },
  child: { speaker: 'A LAMB', prompt: 'Speak to the lamb', lines: [
    'Are you the one who killed the king?',
    'Mother says not to look at you. I am looking at you anyway.',
    'There are thorns growing over the south road. The grown-ups say it is a curse. I think the thorns are only sad.',
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
  south: { speaker: 'THE SOUTH GATE', prompt: 'Follow the border road', lines: [
    'The border road runs south toward the highlands. Past the last farm, brambles have grown across it since the carts stopped.',
    'The border road is not built yet. For now, Millbrook is as far as the sentence reaches.',
  ] },
};
