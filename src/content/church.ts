import type { Choice, Dialogue } from './dialogue';
import type { MemberId } from '../rules/battle';
import { RAISE_PRICE } from '../rules/world.ts';

// Narrative content stays separate from rendering and input.
// People talk about what is in front of them; the world's history comes out sideways, if at all.
export const church: Dialogue = {
  priest: { speaker: 'THE PRIEST', prompt: 'Speak to the priest', lines: [
    'Easy. Sit up slowly. You were a long time coming back this time.',
    'You asked me to remember something for you, last time. I am sorry. You never told me what it was.',
    'The church has work for you. Grain has stopped reaching the highlands. Take the south door into the farmland and find out why.',
  ], variants: [{ if: { flag: 'human-spared' }, lines: [
    'No orders today. Or tomorrow. Your name is in the ledger, but the sentence beside it is struck through.',
    'I kept bringing you back. I thought that meant I was saving you. I should have asked what it cost, and where it went.',
    'The basin is empty. If you stay, it is because you want to. There is still a clean bed here.',
  ] }, { if: { flag: 'cuttlefish-slain' }, lines: [
    'You came back from the sea. I wrote that you were lost. I am going to go on writing it.',
    'They say the fish isn\'t coming any more. They say it in the cellars, not the chapel. Whatever you did out there, the ledger doesn\'t have a column for it.',
  ] }, { if: { flag: 'deserted' }, lines: [
    'You went out to sea. No orders sent you. I have not reported it. The ledger has your name, and today\'s date, and I have not written anything after it.',
    'Go back out, if you are going. I won\'t ask where.',
  ] }, { if: { flag: 'cuckoo-slain' }, lines: [
    'Letters again. The church\'s own mail came down from the holds in a sack the size of a cart, a year of it.',
    'One of the couriers saw a lighthouse on an island that is on no chart. The church has no orders about that. That is not the same as not knowing about it.',
    'There is nothing more I can send you to. Not by any road. The sea is not the church\'s.',
    'If you go anyway, you go as a deserter. I would not see it. I would not be looking.',
  ] }, { if: { flag: 'viper-slain' }, lines: [
    'Wickmere writes that the sickness has stopped. A venomous outbreak, properly contained. The church is satisfied.',
    'Someone also wrote to ask what the lighthouse is. The letter went upstairs, and nobody has come back down with an answer.',
    'New orders. The messenger birds have stopped flying and the mountain holds have shut their gate. No nation can talk to another. Reopen the routes.',
    'The holds\' gate is at the top of the rookery road, above the old border fort. It will open for the church\'s convicts. Don\'t expect them to be glad.',
  ] }, { if: { flag: 'hyena-slain' }, lines: [
    'You came back from the highlands. Most don\'t.',
    'Whatever you found under that abbey, don\'t tell me. Not in here.',
    'New orders. A sickness in the river towns, and the church\'s stores at Wickmere are spoiling. There is a hospice there. Guard it, and find out what is spoiling.',
    'The crane at the weir will ferry you downriver. She won\'t like it.',
  ] }, { if: { flag: 'boar-defeated' }, lines: [
    'Easy. Sit up slowly. The carts are moving again. The church is grateful, in its way.',
    'New orders. Bodies are going missing from the old battlefield below the highland fort. The garrison calls whatever takes them grave-eaters. Put them down.',
    'Take the border road. Past the carts, the guard will let you onto the pass.',
  ] }, { if: { forgot: 'feast' }, lines: [
    'Easy. Sit up slowly. You were a long time coming back this time.',
    'You used to wake up saying you were framed. You did not say it this time.',
    'The church has work for you. Grain has stopped reaching the highlands. Take the south door into the farmland and find out why.',
  ] }] },
  ledger: { speaker: 'THE RESURRECTION LEDGER', lines: [
    'Five names, five sentences. Beside yours, a column of dates runs off the bottom of the page.',
    'The last date is today. The ink is still wet.',
  ], variants: [{ if: { flag: 'human-spared' }, lines: [
    'Five names. Beside each, in new ink: CLEARED. SENTENCE LIFTED.',
    'The old dates remain. Nobody gets to pretend those years did not happen.',
  ] }, { if: { forgot: 'trial' }, lines: [
    'Five names, five sentences. Beside yours, a single word you do not want to read.',
    'The seal at the foot of the page matches the brand on your wrist. You do not know what you did to earn either.',
  ] }] },
  basin: { speaker: 'THE TIDAL BASIN', lines: [
    'Salt water, and a crust of salt around the rim. It smells like the night of the feast.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'Salt water, and a crust of salt around the rim.',
  ] }] },
};

// Who can fall, and what the priest calls them.
const FALLEN: readonly [MemberId, asked: string, told: string][] = [['chameleon', 'me', 'you'], ...(['bear', 'vulture', 'frog', 'octopus'] as const).map((id): [MemberId, string, string] => [id, `the ${id}`, `the ${id}`])];

// The priest can be answered; what the hero has forgotten, he cannot say.
const priestReplies: Choice[] = [
  { text: 'How many times have I died?', lines: ['{Deaths}, by the ledger.'] },
  { text: 'I was framed.', if: { not: { forgot: 'feast' } }, lines: [
    'The ledger says sentenced. Bring me something that says otherwise and I will read it.',
  ] },
  { text: 'Tend my wounds.', lines: [
    'He cleans each cut with salt water. It stings, then it does not.',
    'Your wounds close.',
  ], then: { rest: true } },
  // Once the hero is back from the boar, the priest says more than she did.
  { text: 'What happens to the ones who forget everything?', if: { flag: 'boar-defeated' }, lines: [
    'They\'re still useful. The ledger doesn\'t ask what anyone remembers.',
    'I try not to ask either. One of them called me mother for a year. I let him.',
  ] },
  { text: 'Who reads the ledger?', if: { flag: 'boar-defeated' }, lines: [
    'The church in the capital. Someone there underlines names. I don\'t know why some and not others.',
    'Yours is underlined twice.',
  ] },
  // The fallen: rest won't raise them. He will, for coins, or, from someone who can't pay, for a memory.
  ...FALLEN.flatMap(([member, asked, told]): Choice[] => {
    const breathes = told === 'you' ? 'You breathe in like someone surfacing.' : `${told[0].toUpperCase()}${told.slice(1)} breathes in like someone surfacing.`;
    return [
      { text: `Raise ${asked}. (${RAISE_PRICE} coins)`, if: { all: [{ fallen: member }, { coins: RAISE_PRICE }] }, ends: true, lines: [
        `He counts the coins twice and puts them in the box under the ledger. Then he kneels over ${told}, with salt water and a prayer you don\'t know, for a long time.`,
        `${breathes} "Don\'t make me do that again," the priest says. "It costs more than coins, even when it\'s coins."`,
      ], then: { pay: RAISE_PRICE, raise: member } },
      { text: `Raise ${asked}. (No coins: he will take something else)`, if: { all: [{ fallen: member }, { not: { coins: RAISE_PRICE } }] }, ends: true, lines: [
        `"The church raises its own for the tithe. You haven\'t got the tithe." He looks at you${told === 'you' ? '' : `, not at ${told}`}. "You have something else. The tide always takes it in the end. I\'ll only take it early."`,
        breathes,
      ], then: { raise: member, tithe: true } },
    ];
  }),
  { text: 'I should go.', ends: true, lines: ['Go on, then. Try to come back on your feet.'] },
];
church.priest.choices = priestReplies;
for (const variant of church.priest.variants!) variant.choices = 'flag' in variant.if && variant.if.flag==='human-spared' ? [
  {text:'Tend my wounds.',lines:['He brings fresh water and clean bandages. There is no basin and no tithe.'],then:{rest:true}},
  {text:'I should go.',ends:true,lines:['Go where you choose. You can come back without being carried.']},
] : priestReplies;
