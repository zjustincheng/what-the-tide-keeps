import type { Dialogue } from './dialogue';

// The border road between the farmland and the highlands. Names are placeholders.
export const border: Dialogue = {
  hedge: { speaker: 'THE HEDGE', prompt: 'Examine the brambles', hiddenIf: [{ flag: 'hedge-open' }], lines: [
    'A wall of brambles has grown straight across the road, thick as a cart is wide.',
    'You pull. They don\'t give.',
  ], variants: [{ if: { knows: "Bramble's leave" }, lines: [
    'You crouch and say the lamb\'s word, quietly, the way she showed you.',
    'For a moment nothing happens. Then the brambles loosen, stem by stem, and draw back to the verges.',
  ], then: { set: 'hedge-open' } }] },
  driver: { speaker: 'A HIGHLAND CARTER', prompt: 'Speak to the carter', lines: [
    'Six days I\'ve driven this road. Six days a guard in a church sash has stopped me here and said turn back, by order.',
    'Up in the highlands they\'ve cut the fish ration again. People are hungry up there.',
  ], variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'The guard waved me through this morning. Said there was never any order.',
  ] }] },
  guard: { speaker: 'A FARMLAND GUARD', prompt: 'Speak to the guard', lines: [
    'Stay back.',
    'The order came by word of mouth from the border post. I haven\'t seen it written down.',
  ], variants: [{ if: { flag: 'boar-defeated' }, lines: [
    'I went to the border post and asked about the order. Nobody there had heard of it.',
    'The pass is open, if you\'re going up. The track east of me. Mind the raiders; you won\'t see them coming.',
  ] }] },
  carts: { speaker: 'THE GRAIN CARTS', prompt: 'Examine the carts', lines: [
    'Grain carts, still loaded, turned around to face the farmland.',
    'The farmland\'s mark has been cut off every sack.',
  ] },
  marker: { speaker: 'THE BORDER MARKER', prompt: 'Read the marker', lines: [
    'FARMLAND on one face. HIGHLANDS on the other.',
  ] },
};

border.guard.choices = [
  { text: 'Who gave the order?', lines: ['A rider. Said he came from the border post. I didn\'t know him.'] },
  { text: 'Let the carts through.', lines: ['Not without an order.'] },
];
border.driver.choices = [
  { text: 'Who stopped you?', lines: ['That one, and the one before him. Same words every time.'] },
];
