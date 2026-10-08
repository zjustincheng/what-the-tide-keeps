import type { Dialogue } from './dialogue';

// The open farmland south of the church. Names are placeholders.
export const fields: Dialogue = {
  sign: { speaker: 'A WAYMARK', prompt: 'Read the waymark', lines: [
    'South: Millbrook. West: the mill, over the stream. East: the old shrine, and the field track to the border.',
    'Someone has carved a lizard under it, and a rope.',
  ] },
  bell: { speaker: 'THE TRAMPLED CLEARING', prompt: 'Pick up the bell', hiddenIf: [{ has: 'bell' }, { flag: 'lamb-thanked' }], lines: [
    'A small brass bell on a faded ribbon, trodden into the chaff. A child\'s.',
    'It rings once when you lift it. Something in the wheat stops moving.',
  ], then: { give: 'bell' } },
  scarecrow: { speaker: 'THE SCARECROW', lines: [
    'A sack head with long ears stitched on. The locusts have eaten the wheat right up to its feet.',
  ] },
  bear: { speaker: 'THE BEAR', prompt: 'Speak to the bear', hiddenIf: [{ flag: 'bear-free' }], lines: [
    'Hero? Look at you. You\'re thinner every time.',
    'They have me turning the millstone. The miller\'s scared of me, so the chain\'s short.',
    'He won\'t unlock it without a writ from the reeve in Millbrook. Get me one and I\'m with you.',
  ] },
  miller: { speaker: 'THE MILLER', prompt: 'Speak to the miller', lines: [
    'Keep back from him. And from me.',
    'The church sends me a convict, the church takes the flour. The key stays on my belt until the reeve says otherwise, in writing.',
    'Go and ask the reeve in Millbrook what he wants for it.',
  ], variants: [{ if: { flag: 'bear-free' }, lines: [
    'Wheel turns slower without him. Don\'t tell him I said that.',
  ] }, { if: { flag: 'writ-given' }, lines: [
    'A writ. The reeve\'s seal. Fine.',
    'The key turns and the chain drops. The bear rolls his shoulders, slowly, like he\'s not sure they\'re his.',
    '"Right," says the bear. "Where are we going?" The bear joins you.',
  ], then: { set: 'bear-free' } }] },
  heron: { speaker: 'A HERON', prompt: 'Speak to the heron', lines: [
    'Quiet. You\'ll scare them.',
    'Fish come inland by church license now, in barrels, at a price. I catch my own. That\'s still allowed.',
    'You get hurt a lot, don\'t you. Take this. It was my mother\'s. It\'s mostly mending.',
    "Pond-keeper's primer is yours. Whoever carries it can cast Still water; give it to someone from the Equipment screen.",
  ], then: { find: 'pond-primer' }, variants: [{ if: { owns: 'pond-primer' }, lines: [
    'Quiet. You\'ll scare them.',
    'Use the primer. It was never any good sitting on a shelf.',
  ] }], choices: [
    { text: 'What happened to your mother?', lines: [
      'The reeve\'s watch took her for a pike out of the mill pond. The miller sent for them.',
      'She didn\'t come back. I fish the stream now. Nobody owns the stream.',
    ] },
  ] },
  camp: { speaker: 'AN ABANDONED CAMP', prompt: 'Examine the camp', lines: [
    'A tent gone grey with rain and a fire long cold. A tally of days is scratched into the tent pole. It stops at nine.',
  ] },
  shrine: { speaker: 'THE OLD SHRINE', prompt: 'Examine the shrine', lines: [
    'A Covenant shrine, older than the church, in a ring of standing stones. Most of the carving is moss now.',
    'You can still make out the oath: HERE NOBODY EATS ANYBODY.',
  ] },
  // Keepsakes left where only someone wandering off the road would find them.
  'camp-cache': { speaker: 'UNDER THE TENT FLAP', prompt: 'Search the bundle', hiddenIf: [{ owns: 'cracked-mirror' }], lines: [
    'A bundle in oilcloth, kept out of the rain. Inside: a hand mirror, cracked straight across.',
    'The Cracked mirror is a keepsake. Equip it from the Equipment screen.',
  ], then: { find: 'cracked-mirror' } },
  'orchard-cache': { speaker: 'IN THE LAST ROW OF TREES', prompt: 'Search the roots', hiddenIf: [{ owns: 'crow-feather' }], lines: [
    'A crow\'s hoard between the roots: buttons, a thimble, and one long black feather.',
    "You take the Crow's feather. It's the vulture's kind of thing.",
  ], then: { find: 'crow-feather' } },
  'shrine-cache': { speaker: 'BEHIND THE SHRINE', prompt: 'Search behind the shrine', hiddenIf: [{ owns: 'covenant-token' }, { not: { flag: 'warden-slain' } }], lines: [
    'Where the warden stood: dried flowers, a knot of wheat, and a worn bronze Covenant token stamped with a paw and a hoof.',
  ], then: { find: 'covenant-token' } },
  'ford-cache': { speaker: 'IN THE REEDS', prompt: 'Search the reeds', hiddenIf: [{ owns: 'yoke-peg' }, { not: { flag: 'leech-slain' } }], lines: [
    'Where the leech lay: a heavy oak yoke peg, worn smooth on one side. It\'s too big for anyone but the bear.',
  ], then: { find: 'yoke-peg' } },
  // The shepherd's strays: three sheep scattered by the locusts, sent home one by one.
  shepherd: { speaker: 'THE SHEPHERD', prompt: 'Speak to the shepherd', lines: [
    'Three of mine bolted when the locusts came. One into the dark woods, one into the orchard, one toward the hay yard.',
    'I\'m not going in those woods. Send them home, if you\'re going that way. Call them quietly or they\'ll run.',
  ], variants: [
    { if: { flag: 'sheep-reward' }, lines: ['All there. I\'ll count them again tonight anyway.'] },
    { if: { all: [{ flag: 'sheep-woods' }, { flag: 'sheep-orchard' }, { flag: 'sheep-yard' }] }, lines: [
      'All three. Didn\'t think they\'d come for you.',
      'Here. Fifteen coins, and this. My daughter used to knot them from the first shearing.',
      'You receive 15 coins and the Wool charm, a keepsake.',
    ], then: { earn: 15, find: 'wool-charm', set: 'sheep-reward' } },
  ] },
  'sheep-woods': { speaker: 'A LOST SHEEP', prompt: 'Call the sheep', hiddenIf: [{ flag: 'sheep-woods' }], lines: [
    'A sheep with burrs in its wool, shaking in the dark under the trees. You call it quietly. It goes.',
  ], then: { set: 'sheep-woods' } },
  'sheep-orchard': { speaker: 'A LOST SHEEP', prompt: 'Call the sheep', hiddenIf: [{ flag: 'sheep-orchard' }], lines: [
    'A sheep in the windfalls, sick on rotten apples. It follows when you call.',
  ], then: { set: 'sheep-orchard' } },
  'sheep-yard': { speaker: 'A LOST SHEEP', prompt: 'Call the sheep', hiddenIf: [{ flag: 'sheep-yard' }], lines: [
    'A sheep pressed against the hay yard fence, blood dried in its fleece. Not its own. It goes when you call.',
  ], then: { set: 'sheep-yard' } },
  log: { speaker: 'A FALLEN OAK', prompt: 'Examine the fallen oak', lines: [
    'A fallen oak lies across the path into the woods, roots and all. It is too big to climb.',
    'The only other way in is across the ford.',
  ] },
  // Free the caught: what the fishmonger keeps in his barrel needs running water.
  'stream-bank': { speaker: 'THE MILL STREAM', prompt: 'Tip the barrel into the stream', hiddenIf: [{ not: { flag: 'barrel-bought' } }, { flag: 'squid-freed' }], lines: [
    'You tip the barrel into the stream. The squid hangs in the current for a moment, then goes, downstream toward the sea.',
  ], then: { set: 'squid-freed' } },
  gibbet: { speaker: 'THE GIBBET', prompt: 'Examine the gibbet', lines: [
    'An iron cage on a post at the crossroads. The crows have had most of what was in it.',
    'A painted plaque: COVENANT-BREAKER.',
  ], variants: [{ if: { flag: 'followers-reported' }, lines: [
    'There is someone in the cage now. A badger. He doesn\'t look up.',
    'A painted plaque: COVENANT-BREAKER.',
  ] }] },
  bones: { speaker: 'IN THE HOLLOW', prompt: 'Examine the bones', lines: [
    'Bones, picked clean. A scrap of sleeve on one arm still has a church brand on it.',
  ] },
};

fields.bear.choices = [
  { text: "I'll get you out.", lines: ['I know.'] },
  { text: 'Do you remember the feast?', lines: [
    'Bits. Too much wine. Somebody kept filling my cup. Then nothing until the guards.',
  ] },
  { text: 'What is my name?', if: { forgot: 'name' }, lines: [
    'The bear tells you. You hear it, and a moment later it\'s gone again.',
    '"I\'ll keep telling you," he says.',
  ] },
];
fields.heron.variants![0].choices = fields.heron.choices;
