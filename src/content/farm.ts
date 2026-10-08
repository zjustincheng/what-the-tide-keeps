import type { Dialogue } from './dialogue';

// The boar's burned farm, the farmland lieutenant's lair. Names are placeholders.
export const farm: Dialogue = {
  notice: { speaker: 'A NOTICE ON THE GATEPOST', prompt: 'Read the notice', lines: [
    'FOUND: the miller\'s kid, alive and well, in the high pasture, three weeks after going missing.',
    'Under it, an older notice, mostly burned.',
  ] },
  badger: { speaker: 'THE BADGER', prompt: 'Speak to the badger', portrait: 'badger', hiddenIf: [{ not: { flag: 'boar-defeated' } }, { flag: 'followers-spared' }, { flag: 'followers-reported' }], lines: [
    'He told us not to fight for him. Then he went and fought for us.',
    'After the fire nobody came. Except one, later. No fur on him. He sat with us and listened. That was all, but nobody else had.',
    'He asked us to stop the carts. So we did.',
  ] },
  rat: { speaker: 'THE RAT', prompt: 'Speak to the rat', portrait: 'rat', hiddenIf: [{ not: { flag: 'boar-defeated' } }, { flag: 'followers-spared' }, { flag: 'followers-reported' }], lines: [
    'Leave us alone. We\'re done.',
  ] },
  'ruin-cache': { speaker: 'IN THE FARMHOUSE ASHES', prompt: 'Search the ashes', hiddenIf: [{ owns: 'snare-primer' }], lines: [
    'Under a fallen beam, a tin box the fire couldn\'t open. Inside, a thin primer of snares and knots in a crooked hand.',
    "Hedge-witch's primer is yours. Whoever carries it can cast Bramble snare.",
  ], then: { find: 'snare-primer' } },
  // The badger's thanks for letting them go.
  'tusk-cache': { speaker: 'UNDER THE THIRD FENCE POST', prompt: 'Dig under the fence post', hiddenIf: [{ not: { flag: 'followers-spared' } }, { owns: 'boar-tusk' }], lines: [
    'A small box wrapped in sacking. Inside, a boar\'s tusk, broken off and polished smooth from years of being held.',
    "The Boar's tusk is a keepsake. Equip it from the Equipment screen.",
  ], then: { find: 'boar-tusk' } },
  cup: { speaker: 'AMONG THE BOAR\'S THINGS', prompt: 'Examine the cup', hiddenIf: [{ not: { flag: 'boar-defeated' } }], lines: [
    'A gilded cup with the capital\'s crest, out of place on a pig farm.',
    'You have drunk from one like it. You can\'t think where.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'A gilded cup with the capital\'s crest, out of place on a pig farm.',
  ] }] },
};

farm.badger.choices = [
  { text: 'Who was he?', lines: ['Never said. Kept his hood up.'] },
  { text: 'Where did he go?', lines: ['West, toward the coast.'] },
  // What happens to the boar's followers is the hero's call, and it is remembered.
  { text: 'Go. Before the reeve\'s watch comes.', lines: [
    'The badger looks at you for a long time.',
    '"Third fence post from the gate. There\'s a box under it. His. He\'d want it to go to someone who didn\'t burn him out."',
    'When you look back, they are gone.',
  ], then: { set: 'followers-spared' } },
  { text: 'I\'m taking you to the reeve.', lines: [
    'The rat runs. The badger doesn\'t.',
    '"Fine," he says. "Get it over with."',
  ], then: { set: 'followers-reported' } },
];
