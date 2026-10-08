import type { Dialogue } from './dialogue';

export const road: Dialogue = {
  sign: { speaker: 'A WAYMARK', prompt: 'Read the waymark', lines: [
    'South: Millbrook, two hours by cart. The mile figure has been scratched out and written again, smaller.',
    'Someone has carved a crude reptile beneath it, with a noose.',
  ] },
  scarecrow: { speaker: 'THE SCARECROW', lines: [
    'Its sack face has been stitched with a snout and long ears, so the locusts know whose field this is.',
    'The locusts have eaten the wheat right up to its feet.',
  ] },
  south: { speaker: 'THE ROAD SOUTH', prompt: 'Follow the road', lines: [
    'The road bends toward Millbrook. Grain carts should be passing at this hour. None are.',
    'The market town is not built yet. For now, the road ends here.',
  ] },
};
