import type { Choice, Dialogue } from './dialogue';

// Narrative content stays separate from rendering and input.
// People talk about what is in front of them; the world's history comes out sideways, if at all.
export const church: Dialogue = {
  priest: { speaker: 'THE PRIEST', prompt: 'Speak to the priest', lines: [
    'Easy. Sit up slowly. You were a long time coming back this time.',
    'You asked me to remember something for you, last time. I am sorry. You never told me what it was.',
    'The church has work for you. Grain has stopped reaching the highlands. Take the south door into the farmland and find out why.',
  ], variants: [{ if: { flag: 'hyena-slain' }, lines: [
    'You came back from the highlands. Most don\'t.',
    'Whatever you found under that abbey, don\'t tell me. Not in here.',
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
  ], variants: [{ if: { forgot: 'trial' }, lines: [
    'Five names, five sentences. Beside yours, a single word you do not want to read.',
    'The seal at the foot of the page matches the brand on your wrist. You do not know what you did to earn either.',
  ] }] },
  basin: { speaker: 'THE TIDAL BASIN', lines: [
    'Salt water, and a crust of salt around the rim. It smells like the night of the feast.',
  ], variants: [{ if: { forgot: 'feast' }, lines: [
    'Salt water, and a crust of salt around the rim.',
  ] }] },
};

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
  { text: 'I should go.', ends: true, lines: ['Go on, then. Try to come back on your feet.'] },
];
church.priest.choices = priestReplies;
for (const variant of church.priest.variants!) variant.choices = priestReplies;
