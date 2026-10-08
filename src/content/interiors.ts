import type { Dialogue } from './dialogue';

// Inside Millbrook's buildings and the mill. Names are placeholders.
export const inn: Dialogue = {
  drinker: { speaker: 'A CARTER AT THE TABLE', prompt: 'Speak to the carter', lines: [
    'Six days\' wages sitting on a cart at the border. Six days.',
    'Don\'t go out to the old shrine after dark. Something stands in the stones.',
  ], choices: [
    // Paying for a drink buys what he knows about the ford.
    { text: 'Buy him a drink. (2 coins)', if: { coins: 2 }, lines: [
      'He drinks half of it at once.',
      '"The ford\'s no good either. Lost a mule there in the spring. Something under the water took it, and the water went dark after."',
    ], then: { pay: 2 } },
    { text: 'Leave him be.', ends: true, lines: ['He doesn\'t notice.'] },
  ] },
  patron: { speaker: 'A RABBIT BY THE FIRE', prompt: 'Speak to the rabbit', lines: [
    'Don\'t sit there.',
    'My brother\'s on the watch. He says they count the carnivore quarter twice some nights, when the reeve\'s worried.',
  ] },
  tariff: { speaker: 'A SLATE BEHIND THE COUNTER', prompt: 'Read the slate', lines: [
    'ROOMS, 4 COPPERS A NIGHT.',
  ] },
};

export const hall: Dialogue = {
  clerk: { speaker: 'THE CLERK', prompt: 'Speak to the clerk', lines: [
    'The reeve\'s outside. He\'s always outside. Says he can\'t think in here.',
  ], choices: [
    { text: 'Can I see the writ book?', lines: ['No.'] },
    { text: 'What are you writing?', lines: ['A letter to the church. Asking for a different convict.'] },
  ] },
  records: { speaker: 'THE RECORDS', prompt: 'Read the records', lines: [
    'Writs, licenses, and fines in neat columns.',
    'Halfway down a page from last spring: AUTHORITY TO CLEAR THE BOAR\'S HOLDING BY FIRE. Signed by the reeve.',
  ] },
  letter: { speaker: 'THE CLERK\'S DESK', prompt: 'Look at the desk', lines: [
    'A half-written letter to the church: "...request that a more suitable convict be sent..."',
  ] },
};

export const millInside: Dialogue = {
  gears: { speaker: 'THE GEARS', prompt: 'Examine the gears', lines: [
    'The wheel\'s shaft comes through the wall and turns the stones through a train of wooden gears. Half of them are still.',
  ], variants: [{ if: { not: { flag: 'bear-free' } }, lines: [
    'The wheel\'s shaft comes through the wall and turns the stones through a train of wooden gears.',
    'A chain runs out through a hole in the wall, to the millstone outside and the bear on the end of it.',
  ] }] },
  sacks: { speaker: 'FLOUR SACKS', prompt: 'Examine the sacks', lines: [
    'Flour, stamped with the church\'s mark. Every sack is spoken for.',
  ] },
  'mill-ledger': { speaker: 'THE MILLER\'S LEDGER', prompt: 'Read the ledger', lines: [
    'Flour out, coin in. One line from years back, in a different ink: PIKE TAKEN FROM THE POND. WATCH SENT FOR.',
  ] },
};

export const tannery: Dialogue = {
  tanner: { speaker: 'THE TANNER', prompt: 'Speak to the tanner', lines: [
    'Shut the door. The smell gets out and the other side of the wall complains.',
    'Hides come down from the highlands. Fewer every month.',
  ], choices: [
    { text: 'What happens after dark?', lines: ['Come back after dark and see.'] },
    { text: 'Whose hides are these?', lines: ['Cattle that died on their own. Mostly. Don\'t ask me that again.'] },
  ] },
  vats: { speaker: 'THE VATS', prompt: 'Examine the vats', lines: [
    'Bark water and lime. Your eyes sting.',
  ] },
  'back-door': { speaker: 'THE BACK DOOR', prompt: 'Try the back door', lines: [
    'Bolted from outside. Through the gap you can see the shuttered stall.',
  ] },
};
