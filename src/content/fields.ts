import type { Dialogue } from './dialogue';

// The open farmland south of the church. Names are placeholders.
export const fields: Dialogue = {
  sign: { speaker: 'A WAYMARK', prompt: 'Read the waymark', lines: [
    'South: Millbrook. West: the mill, over the stream. East: the old shrine, and the field track to the border.',
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
  bear: { speaker: 'THE BEAR', prompt: 'Speak to the bear', hiddenIf: [{ flag: 'bear-free' }], lines: [
    'Hero? Hero! Look at you. You look thinner. Do they feed you at that church, or only bury you?',
    'They chained me to the millstone. Penal labor, the miller calls it. The miller is frightened of me, so the chain is very short.',
    'You still know me. Good. Remember the kraken? You took its eye and I took the blame for the smell. Hold on to that one.',
    'The miller only answers to paper. Get the reeve in Millbrook to sign a writ, and I am yours.',
  ] },
  miller: { speaker: 'THE MILLER', prompt: 'Speak to the miller', lines: [
    'Keep back from him. And from me, while we are at it.',
    'The church sends me a convict, the church takes the flour. Nobody asks the miller. The key stays on my belt.',
    'He stays until someone with a writ says otherwise. The reeve writes the writs.',
  ], variants: [{ if: { flag: 'bear-free' }, lines: [
    'The wheel turns slower without him. I will not say I miss him. Do not tell him I said anything at all.',
  ] }, { if: { flag: 'writ-given' }, lines: [
    'A writ. Signed by the reeve, sealed by the reeve. He would sign anything to be rid of a problem.',
    'The key turns. The chain drops. The bear rolls his shoulders for the first time in a long while.',
    '"Right," says the bear. "Where are we going?" The bear joins you.',
  ], then: { set: 'bear-free' } }] },
  heron: { speaker: 'A HERON', prompt: 'Speak to the heron', lines: [
    'Shh. The fish here are small and very suspicious.',
    'Everyone inland eats fish by church license now. Carted up from the capital in barrels. Not all of the barrels hold fish, mind you.',
    'I only eat what I catch myself. It is legal, and it keeps me honest.',
    'You have the look of someone who gets hurt a great deal. Here. My mother\'s primer. It teaches water to be still, and wounds to close.',
    "Pond-keeper's primer is yours. Give it to anyone from the Equipment screen; whoever carries it can cast Still water.",
  ], then: { find: 'pond-primer' }, variants: [{ if: { owns: 'pond-primer' }, lines: [
    'Shh. The fish here are small and very suspicious.',
    'Did the primer help? Type the water slowly. It does not like to be rushed, but it likes waiting less.',
  ] }] },
  camp: { speaker: 'AN ABANDONED CAMP', prompt: 'Examine the camp', lines: [
    'A tent gone grey with rain and a fire long cold. Whoever slept here left in a hurry, and did not come back.',
    'Scratched into the tent pole: FIVE DAYS TO THE BORDER. DO NOT TAKE THE ROAD.',
  ] },
  shrine: { speaker: 'THE OLD SHRINE', prompt: 'Examine the shrine', lines: [
    'A Covenant shrine older than the church, in a ring of standing stones. Moss has eaten most of the carving.',
    'What is left reads: HERE NOBODY EATS ANYBODY. Someone has added, in fresh chalk: ANYBODY WHO MATTERS.',
  ] },
  // Keepsakes left where only someone wandering off the road would find them.
  'camp-cache': { speaker: 'UNDER THE TENT FLAP', prompt: 'Search the bundle', hiddenIf: [{ owns: 'cracked-mirror' }], lines: [
    'A bundle in oilcloth, tucked where the rain could not reach. Inside: a hand mirror, cracked straight across.',
    'In the broken glass you look like two people. The Cracked mirror is a keepsake. Equip it from the Equipment screen.',
  ], then: { find: 'cracked-mirror' } },
  'orchard-cache': { speaker: 'IN THE LAST ROW OF TREES', prompt: 'Search the roots', hiddenIf: [{ owns: 'crow-feather' }], lines: [
    'Between the roots of the oldest tree, a crow has hoarded buttons, a thimble, and one of its own black feathers, oiled and perfect.',
    "You take the Crow's feather. The vulture would know what to do with it.",
  ], then: { find: 'crow-feather' } },
  'shrine-cache': { speaker: 'BEHIND THE SHRINE', prompt: 'Search behind the shrine', hiddenIf: [{ owns: 'covenant-token' }], lines: [
    'Offerings left at the foot of the stone: dried flowers, a wheat knot, and a worn bronze Covenant token stamped with a paw and a hoof.',
    'Whoever wears it is easy to see. Perhaps that was the point.',
  ], then: { find: 'covenant-token' } },
  'ford-cache': { speaker: 'IN THE REEDS', prompt: 'Search the reeds', hiddenIf: [{ owns: 'yoke-peg' }], lines: [
    'Washed up in the reeds below the ford: a heavy oak yoke peg, worn smooth by some great shoulder.',
    'It is too big for anyone but the bear.',
  ], then: { find: 'yoke-peg' } },
  // The shepherd's strays: three sheep scattered by the locusts, sent home one by one.
  shepherd: { speaker: 'THE SHEPHERD', prompt: 'Speak to the shepherd', lines: [
    'Three of my flock bolted when the locusts came. One into the dark woods, one into the orchard, one off toward the hay yard.',
    'I would go myself, but the woods are no place for a ram. Send them home, would you? Sheep come if you call them kindly.',
    'A reptile calling sheep. Now I have seen everything.',
  ], variants: [
    { if: { flag: 'sheep-reward' }, lines: ['The flock is whole. I counted twice. I will count again tonight, but that is my nature, not your fault.'] },
    { if: { all: [{ flag: 'sheep-woods' }, { flag: 'sheep-orchard' }, { flag: 'sheep-yard' }] }, lines: [
      'All three, home and grazing. You called them kindly, then.',
      'Fifteen coins, and this: a charm my daughter knots from the first shearing. It keeps you warm, and easy to find.',
      'You receive 15 coins and the Wool charm, a keepsake.',
    ], then: { earn: 15, find: 'wool-charm', set: 'sheep-reward' } },
  ] },
  'sheep-woods': { speaker: 'A LOST SHEEP', prompt: 'Call the sheep', hiddenIf: [{ flag: 'sheep-woods' }], lines: [
    'A sheep, burrs in its wool, trembling in the dark between the trees. You call it kindly. It considers you for a long moment, then trots off toward the meadow.',
  ], then: { set: 'sheep-woods' } },
  'sheep-orchard': { speaker: 'A LOST SHEEP', prompt: 'Call the sheep', hiddenIf: [{ flag: 'sheep-orchard' }], lines: [
    'A sheep with its face deep in the windfalls. It has had too many apples. You call it kindly, and it wobbles home.',
  ], then: { set: 'sheep-orchard' } },
  'sheep-yard': { speaker: 'A LOST SHEEP', prompt: 'Call the sheep', hiddenIf: [{ flag: 'sheep-yard' }], lines: [
    'A sheep pressed against the hay yard fence, hoping the hay will come to it. You call it kindly. It goes, eventually.',
  ], then: { set: 'sheep-yard' } },
  // Free the caught: what the fishmonger keeps in his barrel needs running water.
  'stream-bank': { speaker: 'THE MILL STREAM', prompt: 'Tip the barrel into the stream', hiddenIf: [{ not: { flag: 'barrel-bought' } }, { flag: 'squid-freed' }], lines: [
    'You tip the barrel into the stream. For a moment the young squid hangs in the current, as if it has forgotten how.',
    'Then it touches your claw with one arm, the way you might touch a door you mean to remember, and is gone downstream, toward the sea.',
    'Somewhere, someone is counting.',
  ], then: { set: 'squid-freed' } },
};
