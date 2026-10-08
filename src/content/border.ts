import type { Dialogue } from './dialogue';

// The border road between the farmland and the highlands. Names are placeholders.
export const border: Dialogue = {
  hedge: { speaker: 'THE HEDGE', prompt: 'Examine the brambles', hiddenIf: [{ flag: 'hedge-open' }], lines: [
    'A wall of brambles has grown straight across the road, thick as a cart is wide. The thorns are as long as your claws.',
    'You pull, and they pull back. Whatever grew this did not mean for anyone to pass.',
  ], variants: [{ if: { knows: "Bramble's leave" }, lines: [
    'You crouch and say the lamb\'s word, softly, as though the thorns were frightened and you were not.',
    'For a moment nothing happens. Then, stem by stem, the brambles let go of each other and draw back to the verges.',
  ], then: { set: 'hedge-open' } }] },
  driver: { speaker: 'A HIGHLAND CARTER', prompt: 'Speak to the carter', lines: [
    'Six days I have driven this road. Six days a guard in a church sash stops me here and says: turn back, by order.',
    'Whose order? He does not know. He only knows it is an order.',
    'Up in the highlands they are cutting the fish ration again. Hungry wolves do not stay patient for long, convict.',
  ] },
  guard: { speaker: 'A FARMLAND GUARD', prompt: 'Speak to the guard', lines: [
    'Stay back, reptile. One of you is plenty.',
    'The order came by word of mouth from the border post. Nobody here has seen it written. Nobody here has asked.',
    'The wolves say we are starving them. We say they will eat us when the grain runs out. Both sides are waiting for the other to move first.',
  ] },
  carts: { speaker: 'THE GRAIN CARTS', prompt: 'Examine the carts', lines: [
    'Grain carts, still loaded, turned around to face the farmland. Nobody has unhitched them.',
    'The farmland\'s mark has been cut from every sack, neatly, by someone with time to do it.',
  ] },
  marker: { speaker: 'THE BORDER MARKER', prompt: 'Read the marker', lines: [
    'Here ends the farmland. Here begins the highlands. Under both, older and deeper: HERE NOBODY EATS ANYBODY.',
  ] },
  south: { speaker: 'THE ROAD SOUTH', prompt: 'Follow the smoke', lines: [
    'The grass is scorched past the marker. A burned farmhouse stands a little way off the road.',
    'The boar\'s farm is not built yet. For now, the road ends here.',
  ] },
};
