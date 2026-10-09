import type { Dialogue } from './dialogue';

// The boar's burned farm, the farmland lieutenant's lair. Names are placeholders.
export const farm: Dialogue = {
  notice: { speaker: 'A NOTICE ON THE GATEPOST', prompt: 'Read the notice', lines: [
    'FOUND: the miller\'s kid, alive and well, in the high pasture, three weeks after going missing.',
    'Under it, an older notice, mostly burned.',
  ] },
  // The boar speaks before he fights; the hero decides when it begins.
  boar: { speaker: 'THE BOAR', prompt: 'Speak to the boar', portrait: 'boar', hiddenIf: [{ flag: 'boar-challenged' }, { flag: 'boar-defeated' }], lines: [
    'He is sitting in the ashes of his own doorway, and he doesn\'t get up.',
    '"My sister let you through. That means you know. Say it, then."',
  ], choices: [
    { text: 'The kid is alive. You never touched him.', if: { flag: 'kid-found' }, lines: [
      '"I know. I\'ve known for a year."',
      '"Do you think that matters to them? They\'d burn me again tomorrow, and sleep fine. They did sleep fine."',
    ] },
    { text: 'Why stop the grain?', lines: [
      '"A man sat at that table. No fur on him. He asked me what I wanted, and nobody had asked me anything since the fire."',
      '"I said I wanted Millbrook to be hungry for once. To feel what it\'s like when the thing you need is kept from you on somebody\'s say-so. He made it happen."',
    ] },
    { text: 'Who is the man with no fur?', lines: [
      '"He didn\'t give a name. He drank from a gold cup and he listened. That\'s all I know, and it was more than I\'d had."',
    ] },
    { text: 'Stand down. Let the carts through.', lines: [
      '"And then what? Millbrook says sorry? Gives me my farm back? My mother?"',
      '"No. If it ends, it ends the way it started. With someone from the church in my yard."',
    ] },
    { text: 'Then we fight.', ends: true, lines: [
      'He gets up, slowly. His followers move to his flanks without being told.',
      '"Good. At least you\'ll do it to my face."',
    ], then: { set: 'boar-challenged' } },
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
  { text: 'Go. Before the reeve\'s watch comes.', ends: true, lines: [
    'The badger looks at you for a long time.',
    '"Third fence post from the gate. There\'s a box under it. His. He\'d want it to go to someone who didn\'t burn him out."',
    'When you look back, they are gone.',
  ], then: { set: 'followers-spared' } },
  { text: 'I\'m taking you to the reeve.', ends: true, lines: [
    'The rat runs. The badger doesn\'t.',
    '"Fine," he says. "Get it over with."',
  ], then: { set: 'followers-reported' } },
];
