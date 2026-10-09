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
  // The boar's sister won't let anyone from Millbrook past until they know the truth and say it.
  sister: { speaker: 'THE BOAR\'S SISTER', prompt: 'Speak to the sow', hiddenIf: [{ flag: 'boar-defeated' }], lines: [
    'That\'s far enough. The lane is his. What\'s left of it.',
    'Millbrook sent you. I can see the brand from here, but they sent you.',
  ], variants: [{ if: { flag: 'lane-open' }, lines: [
    'Go on. He knows you\'re coming. He always knows.',
  ] }], choices: [
    { text: 'Tell me what happened.', lines: [
      'A kid went missing. My brother\'s a boar. That was the trial.',
      'They came at night with torches and the reeve\'s paper. He carried our mother out through the smoke and they threw stones at him while he did it.',
    ] },
    { text: 'Let me through.', if: { not: { all: [{ flag: 'kid-found' }, { flag: 'burn-order-seen' }] } }, lines: [
      'To finish what Millbrook started? No.',
      'Come back when you know what they did. All of it. Not the part they tell.',
    ] },
    { text: 'The kid is alive. He told me himself.', if: { flag: 'kid-found' }, lines: [
      'Everybody knows he\'s alive. Nobody has ever said it to my face.',
      'She looks away for a while.',
    ] },
    { text: 'The reeve signed the burn order.', if: { flag: 'burn-order-seen' }, lines: [
      'I know whose hand it was. I watched him sign it, by torchlight, on the back of a cart.',
    ] },
    { text: 'I know he didn\'t do it. Let me speak to him.', if: { all: [{ flag: 'kid-found' }, { flag: 'burn-order-seen' }, { not: { flag: 'lane-open' } }] }, ends: true, lines: [
      'She studies you for a long time.',
      '"He won\'t stop. Not for you, not for me. But he\'ll hear it said, once, before."',
      'She drags the beams aside.',
    ], then: { set: 'lane-open' } },
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
// Meeting her again after she has let you through, the same replies stand.
border.sister.variants![0].choices = border.sister.choices;
