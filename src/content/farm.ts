import type { Dialogue } from './dialogue';

// The boar's burned farm, the farmland lieutenant's lair. Names are placeholders.
export const farm: Dialogue = {
  notice: { speaker: 'A NOTICE ON THE GATEPOST', prompt: 'Read the notice', lines: [
    'FOUND, ALIVE AND WELL: the miller\'s kid, in the high pasture, three weeks after wandering off. Thanks to all who searched.',
    'Beneath it, older and half burned, another notice. Only the last words survive: ...BURN THE EATER OUT.',
  ] },
  badger: { speaker: 'THE BADGER', prompt: 'Speak to the badger', hiddenIf: [{ not: { flag: 'boar-defeated' } }], lines: [
    'He made us promise not to fight for him. Then he fought for us anyway. He always did.',
    'After the fire, nobody came. Then one came, with no fur on him at all. He sat in the ashes and asked what happened, and he listened to the answer.',
    'Nobody else ever listened. So when he asked for the carts to stop, we stopped them.',
  ] },
  rat: { speaker: 'THE RAT', prompt: 'Speak to the rat', hiddenIf: [{ not: { flag: 'boar-defeated' } }], lines: [
    'The one with no fur said the farmland would burn us all eventually. He was right about one farm.',
  ] },
  cup: { speaker: 'AMONG THE BOAR\'S THINGS', prompt: 'Examine the cup', hiddenIf: [{ not: { flag: 'boar-defeated' } }], lines: [
    'A gilded cup, far too fine for a farm, stamped with the crest of the capital.',
    'It smells of wine and salt. For a moment there is a hall full of lanterns, and a hooded servant leaning in to fill it.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'A gilded cup, far too fine for a farm, stamped with the crest of the capital.',
    'It smells of wine and salt. It means nothing to you.',
  ] }] },
};
