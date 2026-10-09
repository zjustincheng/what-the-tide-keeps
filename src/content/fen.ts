import type { Dialogue } from './dialogue';

// The fen upstream of the mill, over the drowned hamlet of Wetherby. Names are placeholders.
export const fen: Dialogue = {
  sluice: { speaker: 'THE SLUICE', prompt: 'Examine the sluice', lines: [
    'A sluice gate of black oak across the stream. It holds the fen back so the mill stream runs steady.',
    'The windlass is stiff, but it would turn.',
  ], choices: [
    // Draining the fen uncovers the causeway to the chapel, and slows the mill wheel downstream.
    { text: 'Open the sluice.', ends: true, lines: [
      'You lean on the windlass until it gives. The water goes through roaring, and the fen starts to drop.',
      'A causeway comes up out of the water to the west, toward the old chapel.',
      'Downstream, the mill wheel will be turning slower.',
    ], then: { set: 'sluice-open' } },
    { text: 'Leave it.', ends: true, lines: ['You leave the windlass alone.'] },
  ], variants: [{ if: { flag: 'sluice-open' }, lines: [
    'The sluice stands open. The water runs down to the mill low and muddy.',
  ] }] },
  'hamlet-sign': { speaker: 'A SUNKEN SIGN', prompt: 'Read the sign', lines: [
    'WETHERBY. The rest of the board is under the water.',
    'The roofs out in the fen are its houses. The water came up the year the mill was built.',
  ] },
  'willow-sign': { speaker: 'THE WILLOW', prompt: 'Examine the willow', lines: [
    'Names carved into the bark, dozens of them, one above the other. The newest are only a few years old.',
  ] },
  otter: { speaker: 'THE OTTER', prompt: 'Speak to the otter', hiddenIf: [{ flag: 'otter-reported' }], lines: [
    'Stop there. You\'re not the watch. The watch doesn\'t wade.',
    'I take eels. No license. The fishmonger buys them at his back door and sells them as church fish.',
  ], variants: [{ if: { flag: 'otter-trusted' }, lines: [
    'Eels are running. Go on, the run\'s yours as much as mine.',
  ] }], choices: [
    { text: 'Why live out here?', lines: [
      'My family lived in Wetherby. Under there.',
      'The fen\'s all that\'s left that nobody counts.',
    ] },
    { text: 'I won\'t tell anyone.', if: { not: { flag: 'otter-trusted' } }, lines: [
      'She looks at you for a long time. Then she pulls up the reeds behind her camp.',
      '"Eels run along there. Fish it when you like."',
    ], then: { set: 'otter-trusted' } },
    { text: 'The reeve pays for poachers.', if: { not: { flag: 'otter-trusted' } }, ends: true, lines: [
      '"Does he."',
      'She\'s already moving. When you look back, the camp is empty except for the traps.',
    ], then: { set: 'otter-reported' } },
  ] },
  traps: { speaker: 'EEL TRAPS', prompt: 'Examine the traps', lines: [
    'Eel traps of woven willow, still wet. Something heavy is moving in two of them.',
  ] },
  bell: { speaker: 'THE BELL', prompt: 'Look into the water', lines: [
    'Through the water on the chapel floor you can see the bell, cracked across, with the rope still tied to it.',
  ] },
  'chapel-cache': { speaker: 'A DRY NICHE', prompt: 'Search the niche', hiddenIf: [{ owns: 'drowned-psalter' }], lines: [
    'In a niche above the waterline, a psalter wrapped in oilskin. The pages are swollen but you can read them.',
    'The Drowned psalter is yours. Whoever carries it can cast Undertow; give it to someone from the Equipment screen.',
  ], then: { find: 'drowned-psalter' } },
};
