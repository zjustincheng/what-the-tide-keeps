import type { Dialogue } from './dialogue';

export const road: Dialogue = {
  sign: { speaker: 'A WAYMARK', prompt: 'Read the waymark', lines: [
    'South: Millbrook, two hours by cart. The mile figure has been scratched out and written again, smaller.',
    'Someone has carved a crude reptile beneath it, with a noose.',
  ] },
  bell: { speaker: 'THE TRAMPLED CLEARING', prompt: 'Pick up the bell', hiddenIf: [{ has: 'bell' }, { flag: 'lamb-thanked' }], lines: [
    'A small brass bell on a faded ribbon, trodden into the chaff. The kind a lamb wears.',
    'You take it. It rings once, too loudly, and something in the wheat goes still.',
  ], then: { give: 'bell' } },
  scarecrow: { speaker: 'THE SCARECROW', lines: [
    'Its sack face has been stitched with a snout and long ears, so the locusts know whose field this is.',
    'The locusts have eaten the wheat right up to its feet.',
  ] },
};
