import type { Dialogue } from './dialogue';

// The downs east of the fields, and the barrow under them. Names are placeholders.
export const downs: Dialogue = {
  'downs-sign': { speaker: 'A SIGN', prompt: 'Read the sign', lines: [
    'THE DOWNS. Common grazing, by license of the Covenant. NO DOGS.',
    'Under it, scratched in smaller: WHERE ELSE.',
  ] },
  tower: { speaker: 'THE OLD WATCH', prompt: 'Examine the tower', lines: [
    'A border watchtower from before the border moved. Half the wall is down and the stair is rubble.',
    'Something lives in it. The doorway smells of wet fur and old meat.',
  ] },
  'tower-cache': { speaker: 'UNDER THE STAIR', prompt: 'Search the rubble', hiddenIf: [{ owns: 'iron-collar' }], lines: [
    'Under the fallen stones of the stair, an iron collar with three links of chain still on it. Too big for any dog.',
    'Found: Iron collar.',
  ], then: { find: 'iron-collar' } },
  ram: { speaker: 'THE OLD RAM', prompt: 'Speak to the ram', lines: [
    'Hounds. A pack of them, up at the old watchtower. Three lambs this month.',
    'The reeve\'s watch won\'t come up the hill for sheep. Kill the leader and I\'ll pay you fifteen coins.',
  ], variants: [{ if: { all: [{ flag: 'pack-slain' }, { not: { flag: 'ram-paid' } }] }, lines: [
    'You killed him? Let me see your hands. Hm.',
    'Fifteen coins, like I said. Don\'t tell my son I paid a convict.',
    'You receive 15 coins.',
  ], then: { earn: 15, set: 'ram-paid' } }, { if: { all: [{ flag: 'hounds-fed' }, { not: { flag: 'ram-paid' } }] }, lines: [
    'The hounds are gone. The boy saw them going over the border at first light, the whole lot of them, pups and all.',
    'You fed them, didn\'t you. With fish. I can smell it on you.',
    'Five coins. That\'s for my lambs, not for them.',
    'You receive 5 coins.',
  ], then: { earn: 5, set: 'ram-paid' } }, { if: { flag: 'ram-paid' }, lines: [
    'The lambs sleep out in the fold again.',
  ] }], choices: [
    { text: 'Why are there hounds out here?', lines: [
      'The Covenant took the commons off them. No license, no grazing, no hunting.',
      'They have to eat something. It\'s been my lambs.',
    ] },
    { text: 'Where is your son?', lines: ['Down at the crossroads with the flock. He thinks I\'m too old for the hill. He\'s right.'] },
    { text: 'Who is the kid by the fold?', lines: [
      'The miller\'s boy. He wandered up here after my sheep one spring and stayed three weeks before anyone thought to look uphill.',
      'By the time he went home, they\'d burned the boar out for eating him. The miller sends him up here every summer now. Says it\'s safer. Means it\'s further from the farm.',
    ] },
    { text: 'Leave him be.', ends: true, lines: ['He goes back to watching the gorse.'] },
  ] },
  kid: { speaker: 'THE MILLER\'S KID', prompt: 'Speak to the kid', lines: [
    'I\'m not supposed to talk to people from the town.',
    'You\'re not from the town, though. You\'re from the church. That\'s worse, Dad says.',
  ], choices: [
    { text: 'Where did you go, that spring?', lines: [
      'I followed the sheep up the hill. The ram let me sleep in the fold. I didn\'t want to go home.',
      'When I did, everyone was crying, and then they weren\'t, and then nobody would say the boar\'s name.',
    ] },
    { text: 'Did the boar ever hurt you?', lines: [
      'He gave me bread through his fence. Twice. He told me not to tell my dad, because my dad would be angry he\'d spoken to me.',
      'I told the reeve that. After. He wrote it down and then he tore the page out.',
      'You can tell people I said it. I\'m not scared of the reeve.',
    ], then: { set: 'kid-found' } },
  ] },
  hut: { speaker: 'THE RAM\'S HUT', prompt: 'Examine the hut', lines: [
    'A crook by the door, and a row of tally marks cut into the frame. One for each lamb lost. The newest are still pale.',
  ] },
  fold: { speaker: 'THE LAMBING FOLD', prompt: 'Examine the fold', lines: [
    'Hurdles lashed together with twine. The ground in one corner is dark, and has been scuffed over.',
  ] },
  figure: { speaker: 'THE CHALK FIGURE', prompt: 'Examine the chalk figure', lines: [
    'A running wolf, cut into the chalk of the hillside so long ago that the grass has nearly closed over it.',
    'Somebody has been scouring the lines clean. Recently, by hand, at night.',
  ] },
  cairn: { speaker: 'A CAIRN', prompt: 'Examine the cairn', lines: [
    'A long pile of stones over something long. Scratched into the top one: FOR WHAT HE TOOK, NOT FOR WHAT HE WAS.',
  ] },
};

export const barrow: Dialogue = {
  'hound-mother': { speaker: 'A HOUND', prompt: 'Speak to the hound', hiddenIf: [{ flag: 'hounds-fed' }, { flag: 'pack-slain' }], lines: [
    'Don\'t come any closer. They\'ve only just gone to sleep.',
    'You\'re from the church. The old ram sent you for him.',
  ], choices: [
    { text: 'For who?', lines: ['My mate. The one at the tower. He takes the lambs so I can feed these.'] },
    { text: 'What would make you leave?', if: { not: { fish: 3 } }, lines: [
      'Food that isn\'t anybody\'s lamb. Fish. Three would do, and we\'d go over the border tonight.',
      'The heron won\'t share hers. Nobody shares with us.',
    ] },
    // Feeding her ends the trouble on the downs without a fight.
    { text: 'Give her three fish.', if: { fish: 3 }, ends: true, lines: [
      'She eats one where she lies and puts the other two down by the pups.',
      'We\'ll go tonight. He\'ll come with us. He won\'t take another lamb from that ram.',
      'She noses something out of the straw toward you: a few old coins from the graves. "For the fish."',
      'You receive 6 coins.',
    ], then: { feed: 3, earn: 6, set: 'hounds-fed' } },
    { text: 'The ram will pay for his hide.', lines: ['Then go and earn it. He won\'t make it easy for you.'] },
  ] },
  nest: { speaker: 'THE NEST', prompt: 'Examine the nest', hiddenIf: [{ not: { any: [{ flag: 'hounds-fed' }, { flag: 'pack-slain' }] } }], lines: [
    'Hair on the stones, and the smell of milk. She and the pups are gone.',
    'She didn\'t wait to see who came back from the tower.',
  ], variants: [{ if: { flag: 'hounds-fed' }, lines: [
    'Flattened straw, still a little warm. Fish bones. They\'re gone.',
  ] }] },
  grave: { speaker: 'A GRAVE SLAB', prompt: 'Examine the slab', lines: [
    'A carved figure, worn almost smooth: someone with long teeth, sitting at a table, holding out a cup.',
  ] },
  'grave-goods': { speaker: 'GRAVE GOODS', prompt: 'Search the grave goods', hiddenIf: [{ flag: 'barrow-coins' }], lines: [
    'Grave goods, mostly rotted to nothing. Among them, a few coins with a wolf\'s head on them. Nobody has minted those in a long time.',
    'You receive 8 coins.',
  ], then: { earn: 8, set: 'barrow-coins' } },
};
