import type { Choice, Dialogue, DialogueVoice } from './dialogue';
import type { Condition } from '../rules/world';

const bear: DialogueVoice = { speaker: 'THE BEAR', portrait: 'bear' };
const miller: DialogueVoice = { speaker: 'THE MILLER', portrait: 'miller' };
const reeve: DialogueVoice = { speaker: 'THE REEVE', portrait: 'reeve' };
const mill: DialogueVoice = { speaker: 'AT THE MILL' };

const ready: Condition = { all: [{ flag: 'bear-free' }, { flag: 'boar-defeated' }, { not: { fallen: 'bear' } }] };
const unresolved: Condition = { all: [ready, { not: { flag: 'bear-quest-complete' } }] };
const settled: Condition = { any: [{ flag: 'bear-reeve-accountable' }, { flag: 'bear-mill-left' }] };

export const bearReturn: Dialogue = {
  'mill-chain': { speaker: 'THE OLD CHAIN', prompt: 'Look at the old chain', hiddenIf: [{ not: { flag: 'bear-quest-complete' } }], lines: ['The chain lies loose beside the stone. A small gap shows where the worn link came away.', 'The bear brushes your shoulder as you pass. He keeps walking.'] },
  'bear-return': { speaker: 'THE BEAR', portrait: 'bear', prompt: 'Speak to the bear at the old chain', hiddenIf: [{ not: ready }, { flag: 'bear-quest-complete' }], lines: [
    'His paw stops just short of the stone. “Still wearing the same groove,” he says. He looks at the bare patch on his wrist.',
    '“There was a book inside. He used to count the sacks while I worked.” He looks toward the door. “Could we have a look?”',
  ], then: { set: 'bear-mill-returned' }, variants: [
    { if: { flag: 'bear-quest-complete' }, lines: [
      'He rests a paw on the stone. It does not move unless he decides to push it.',
      '“That little link is ours now. This place does not get to tell us what it means.”',
    ] },
    { if: settled, lines: [
      'He works a claw into a link worn thin against the stone. The metal gives with a small, dull click. He turns it over, rubbing away the rust.',
      '“Ugly little thing.” He almost laughs. Then he holds it out. “Here. If you forget which one I am, I will ask you where you got this.”',
    ], choices: [{ text: 'Keep the broken link.', ends: true, lines: [
      'He closes your fingers around the metal. It is warm from his paw.',
      'You rub your thumb along the worn edge. For a moment, there is bread on the table and he is laughing with his mouth full.',
    ], then: { set: 'bear-quest-complete', find: 'broken-link', keepMemory: 'bear' } }] },
    { if: { flag: 'bear-miller-witnessed' }, lines: [
      '“He signed his own name. Now I want the reeve to put mine where his order said CONVICT.”',
      '“I will walk into that office. Nobody will carry a writ out to me this time.”',
    ] },
    { if: { flag: 'bear-mill-record' }, lines: [
      '“My food, my work, the days I could not stand. All of it counted. Not one place for what I said.”',
      'He looks at the miller. “Stay beside me. I want to speak for myself.”',
    ] },
    { if: { flag: 'bear-mill-returned' }, lines: [
      '“The book is inside, beside the flour sacks. I used to hear him adding the columns at night.”',
      'The chain hangs slack. He keeps a paw near it, without taking hold.',
    ] },
  ] },
};

const millerChoices: Choice[] = [
  { text: 'Let the bear speak.', if: { all: [unresolved, { flag: 'bear-mill-record' }, { not: { flag: 'bear-miller-witnessed' } }, { not: { flag: 'bear-mill-left' } }] }, lines: [
    'He sets the open book on a flour sack. “That day. Nine sacks. I remember the ninth.”',
    '“Those were owed to the church.” The miller keeps his eyes on the column. “The carts were waiting.”',
    '“My legs gave out. You wrote it down.” He puts a claw beside the entry. “Then you charged me for standing up.”',
    'The miller starts to answer, but the bear has already turned the page. The request for a replacement lies between them.',
    '“Was there someone else before me?”',
    '“They said you were dangerous. After the feast, everyone—” He stops. “I had the key. I could have let you sit.”',
    '“Put that underneath. With your name.” The bear waits until the miller reaches for the pen.',
    'He speaks quietly to you while the nib scratches. “The reeve signed the order. I could ask him to sign this too.” A pause. “Or we could just go. I do not want to spend another night here.”',
  ], voices: [bear, miller, bear, mill, bear, miller, bear, bear], choices: [
    { text: 'Take it to the reeve.', ends: true, lines: [
      'The miller signs below the entry and sands the wet ink. He pulls a clean sheet from the back of the book and makes a copy.',
      'The bear reads it slowly. “I want him to stop asking for another one of us.”',
      'You tuck the sheet between two pages of the grimoire. The bear keeps a finger on the corner until you close it.',
    ], voices: [mill, bear, mill], then: { set: 'bear-miller-witnessed' } },
    { text: 'Leave with him.', ends: true, lines: [
      '“Keep the page,” the bear says to the miller. “You know what it says now.”',
      'He takes the key from the miller’s open hand and hangs it on the empty chain. He watches it settle, then lets go.',
      '“One thing first.” He turns toward the old stone. “There is a piece I want to take with me.”',
    ], voices: [bear, mill, bear], then: { set: 'bear-mill-left' } },
    { text: 'We can come back to this.', ends: true, lines: ['The bear nods. “We can. That is the difference now.”'] },
  ] },
];

const reeveChoices: Choice[] = [
  { text: 'Show the miller’s statement.', if: { all: [unresolved, { flag: 'bear-miller-witnessed' }, { not: { flag: 'bear-reeve-accountable' } }] }, ends: true, lines: [
    'The reeve reads the page twice. “The mill must turn. The highlands are waiting for grain.” He sets it beside your release writ.',
    '“The carts are moving because we went up that road.” The bear does not raise his voice. “There is water in the stream. There are people you can pay. Cross out the request.”',
    'The reeve draws a line through the request for another convict. In a new order, he writes that the mill will receive no chained labour. He signs it where the bear can see.',
    '“My name, too.” The bear waits while the reeve finds room beside the old entry. Then he folds the copy himself. The reeve does not offer to call a guard.',
    'Outside, he stops halfway down the steps and looks at his empty hands. “There is something I want to take from that chain. Will you walk back with me?”',
  ], voices: [reeve, bear, { speaker: 'THE REEVE’S OFFICE' }, bear, bear], then: { set: 'bear-reeve-accountable' } },
];

// Add quest replies to every existing variant so other writs, rewards and rumours remain available.
export function withBearReplies(dialogue: Dialogue, point: 'miller' | 'reeve'): Dialogue {
  const original = dialogue[point]; const extra = point === 'miller' ? millerChoices : reeveChoices;
  const aftermath: NonNullable<Dialogue[string]['variants']> = point === 'miller' ? [
    { if: { flag: 'bear-reeve-accountable' }, lines: [
      '“The replacement order is cancelled. The reeve sent me a copy. No more chained labour here.”',
      'He looks at the wheel. “I will have to pay someone. Or turn it myself.”',
    ] },
    { if: { flag: 'bear-mill-left' }, lines: [
      'The key hangs from the empty chain, where the bear left it. The miller has not taken it back.',
      '“He did not ask whether he could go.” He looks at you. “I heard what he said.”',
    ] },
  ] : [];
  return { ...dialogue, [point]: { ...original, choices: [...(original.choices ?? []), ...extra],
    variants: [...aftermath, ...(original.variants ?? [])].map(variant => ({ ...variant, choices: [...(variant.choices ?? original.choices ?? []), ...extra] })) } };
}

export function withBearLedger(dialogue: Dialogue): Dialogue {
  const original = dialogue['mill-ledger'];
  return { ...dialogue, 'mill-ledger': { ...original, variants: [
    { if: { flag: 'bear-reeve-accountable' }, lines: [
      ...original.lines,
      'The replacement request is crossed out. The reeve’s new order is copied below it: NO CHAINED LABOUR AT THIS MILL.',
      'Where the book said CONVICT, it now gives the bear’s name. The old work dates remain. A correction is not an erasure.',
    ] },
    { if: { flag: 'bear-mill-left' }, lines: [
      ...original.lines,
      'The bear’s column ends on the day he left. The totals do not say who he was, or what it cost him to turn the stone.',
      'You remember those things. The book is no longer the only place that holds his story.',
    ] },
    { if: { all: [unresolved, { flag: 'bear-mill-returned' }] }, lines: [
      'A strip of grey cloth marks a page near the back. The bear recognizes it before you do. “He cut that off my sleeve.”',
      'Farther on: CONVICT UNIT, BEAR. Days worked, flour owed to the church, food deducted. Beside several dates: UNABLE TO STAND. The next column still charges a full day’s flour.',
      'He turns another page. REQUEST REPLACEMENT CONVICT. ENDORSEMENT REQUIRED: REEVE. “He wrote this the day we left.” The bear closes his hand over the edge of the book. “Let me speak to him.”',
    ], voices: [undefined, undefined, bear], choices: [{ text: 'Earlier pages.', lines: original.lines }, { text: 'Close the book.', ends: true, lines: [] }], then: { set: 'bear-mill-record' } },
    ...(original.variants ?? []),
  ] } };
}
