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

// The weir above the fen: the church fishery, the otters' holt, and the smugglers' stair. Names are placeholders.
export const weir: Dialogue = {
  'weir-sign': { speaker: 'A NOTICE ON A POST', prompt: 'Read the notice', lines: [
    'CHURCH FISHERY. All fish taken from this river are the property of the Covenant. Poachers will be held until collected.',
    'Scratched underneath: HELD BY WHO.',
  ] },
  warden: { speaker: 'THE FISHERY WARDEN', prompt: 'Speak to the goose', lines: [
    'Church fishery. State your business or move along.',
    'The otter in the cage? A poacher. The fishery keeps what it catches until the church collects.',
  ], variants: [{ if: { flag: 'brother-freed' }, lines: [
    'There\'ll be another poacher in that cage by spring. There always is.',
  ] }, { if: { flag: 'warden-bribed' }, lines: [
    'I didn\'t see you. I\'m not seeing you now.',
  ] }], choices: [
    { text: 'Let him out.', lines: ['With what? The padlock is the church\'s. The key is the church\'s. I\'m the church\'s.'] },
    { text: 'Who eats what the fishery takes?', lines: [
      'The fort, mostly. The garrison families, when the cart comes. Most of it goes to the capital first.',
      'The otters fished this river for a hundred years. Now it\'s licensed. Now they\'re poachers. I didn\'t write the license.',
    ] },
    // Three ways to the key: pay him, lean on him, or leave it.
    { text: 'Here. For the key. (15 coins)', if: { all: [{ coins: 15 }, { not: { flag: 'warden-bribed' } }] }, ends: true, lines: [
      'He looks at the coins, then at the cage, then at nothing in particular.',
      '"I\'ll be at the far end of the weir for a while. The key\'s on the nail."',
    ], then: { pay: 15, set: 'warden-bribed' } },
    { text: 'The bear would like the key.', if: { all: [{ flag: 'bear-free' }, { not: { flag: 'warden-bribed' } }] }, ends: true, lines: [
      'The bear leans on the hut, and the hut leans with him.',
      'The warden takes the key off its nail and drops it in the mud at your feet.',
    ], then: { set: 'warden-bribed' } },
  ] },
  brother: { speaker: 'THE OTTER IN THE CAGE', prompt: 'Speak to the caged otter', portrait: 'otter-kit', hiddenIf: [{ flag: 'brother-freed' }], lines: [
    'A young otter in a cage of church iron, the river up to his chest. He doesn\'t look at you.',
    '"Mum sent you? No. Nobody sends anyone for us."',
  ], choices: [
    { text: 'I\'ll get you out.', if: { not: { flag: 'warden-bribed' } }, lines: ['"The key\'s on the goose\'s nail. He doesn\'t take it off for anyone."'] },
    { text: 'Open the cage.', if: { flag: 'warden-bribed' }, ends: true, lines: [
      'The padlock opens. He is out and under the water before the door finishes swinging.',
      'A moment later his head comes up by the west bank, by the holt.',
    ], then: { set: 'brother-freed' } },
  ] },
  elder: { speaker: 'THE OLD OTTER', prompt: 'Speak to the old otter', lines: [
    'You came up from the fen. My daughter trusted you. That\'s rare, for us.',
  ], variants: [{ if: { all: [{ flag: 'brother-freed' }, { not: { owns: 'weir-hook' } }] }, lines: [
    'He\'s home. Wet, thin, and home.',
    'Up the cliff, behind the willow, there\'s a stair the river folk cut before the church came. It goes to the high tarn. Use it. Nobody counts what goes up it.',
    'She gives you something from the holt\'s stores: a bone hook, old and very sharp.',
    'The Weir hook is a keepsake. Equip it from the Equipment screen.',
  ], then: { find: 'weir-hook' } }, { if: { flag: 'brother-freed' }, lines: [
    'Use the stair. Tell the trapper at the tarn the otters sent you.',
  ] }], choices: [
    { text: 'Who is in the cage?', lines: [
      'My son. They caught him taking eels the river has fed us for a hundred years.',
      'The church owns the river now. It says.',
    ] },
    { text: 'Why don\'t you free him?', lines: [
      'The goose can\'t fight. The church can, and does. If an otter opens that cage, they drain the fen again to find the rest of us.',
    ] },
  ] },
  kin: { speaker: 'AN OTTER KIT', prompt: 'Speak to the kit', portrait: 'otter-kit', lines: [
    'Are you the one with no fur?',
    'No. He had no scales either. He came up the river last winter and gave us bread, and asked how many fish the church takes from the weir.',
    'Mum told him. He wrote it down.',
  ] },
  'holt-traps': { speaker: 'THE HOLT', prompt: 'Look around the holt', lines: [
    'Willow traps, mended nets, a fire kept small so the smoke doesn\'t show. Everything here can be packed up in an hour.',
  ] },
  smuggler: { speaker: 'THE MINK', prompt: 'Speak to the mink', lines: [
    'Smuggler. Don\'t say it so loud.',
  ], variants: [{ if: { flag: 'crate-delivered' }, lines: [
    'The weasel says you\'re reliable. Don\'t let it go to your head.',
  ] }], choices: [
    { text: 'What do you carry?', lines: [
      'Up the stair: salt fish the church doesn\'t count. Down: whatever the fort\'s weasel pays for.',
      'Everyone eats. Somebody has to carry it.',
    ] },
    // An errand that runs from the weir, up the stair and over the pass, to the fort.
    { text: 'I\'ll carry something for you.', if: { all: [{ not: { has: 'crate' } }, { not: { flag: 'crate-delivered' } }] }, ends: true, lines: [
      'A crate, tarred shut, heavier than it looks.',
      '"The weasel in the fort\'s alley. She\'ll pay you. If you die with it, it\'s gone, and so is my trust."',
    ], then: { give: 'crate' } },
  ] },
};
weir.smuggler.variants![0].choices = weir.smuggler.choices;
