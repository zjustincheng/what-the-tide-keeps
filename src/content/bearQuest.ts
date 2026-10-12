import type {Choice,Dialogue} from './dialogue';
import type {Condition} from '../rules/world';

const ready:Condition={all:[{flag:'bear-free'},{flag:'boar-defeated'},{not:{fallen:'bear'}}]};
const unresolved:Condition={all:[ready,{not:{flag:'bear-quest-complete'}}]};
const settled:Condition={any:[{flag:'bear-reeve-accountable'},{flag:'bear-mill-left'}]};

export const bearReturn:Dialogue={
  'bear-return':{speaker:'THE BEAR',portrait:'bear',prompt:'Speak to the bear at the old chain',hiddenIf:[{not:ready}],lines:[
    'He stands beside the stone without touching it. “The boar said nobody came back to his farm. I keep thinking about that.”',
    '“I do not want this mill burned. I want to know what they wrote down while I was turning it.” He looks toward the door. “Will you read it with me?”',
  ],then:{set:'bear-mill-returned'},variants:[
    {if:{flag:'bear-quest-complete'},lines:[
      'He rests a paw on the stone. It does not move unless he decides to push it.',
      '“That little link is ours now. This place does not get to tell us what it means.”',
    ]},
    {if:settled,lines:[
      'He lifts the old chain. One link gives where the stone wore it thin. It fits in your hand.',
      '“You remembered me when you could. I remembered you when you could not. Let this do some of the work.”',
    ],choices:[{text:'Keep the broken link.',ends:true,lines:[
      'He closes your fingers around the metal. It is warm from his paw.',
      'You remember the laugh at the feast, the chain at the mill, and the friend who stayed. This memory has somewhere the tide cannot reach.',
      'Found: Broken mill-chain link. The bear’s memory is held permanently, even when the keepsake is not equipped.',
    ],then:{set:'bear-quest-complete',find:'broken-link',keepMemory:'bear'}}]},
    {if:{flag:'bear-miller-witnessed'},lines:[
      '“He signed his own name. Now I want the reeve to put mine where his order said CONVICT.”',
      '“I will walk into that office. Nobody will carry a writ out to me this time.”',
    ]},
    {if:{flag:'bear-mill-record'},lines:[
      '“My food, my work, the days I could not stand. All of it counted. Not one place for what I said.”',
      'He looks at the miller. “Stay beside me. I want to speak for myself.”',
    ]},
    {if:{flag:'bear-mill-returned'},lines:[
      '“The book is inside, beside the flour sacks. I used to hear him adding the columns at night.”',
      'The chain hangs slack. He keeps a paw near it, without taking hold.',
    ]},
  ]},
};

const millerChoices:Choice[]=[
  {text:'Let the bear speak about the labour record.',if:{all:[unresolved,{flag:'bear-mill-record'},{not:{flag:'bear-miller-witnessed'}},{not:{flag:'bear-mill-left'}}]},lines:[
    'The bear steps forward. “You wrote that I could not be trusted loose. I turned your stone until I could not lift my hands. What did I do to make you afraid?”',
    'The miller reaches for the key on his belt, then lets it go. “Nothing. The brand said enough. I did not wait to find out.”',
    '“Write that,” the bear says. “And write that you asked for another convict when I left.” He turns to you. “We can take his name to the reeve. Or we can leave him here. I will not beg for another writ.”',
  ],choices:[
    {text:'Take his signed statement to the reeve.',ends:true,lines:[
      'The miller writes what the bear tells him. No church seal, no charge against a species. His own name beneath what he did.',
      'The bear reads it once. “I want the order changed too. Not just the lock.”',
      'You keep a copy with the grimoire. It will survive the walk back, and a death.',
    ],then:{set:'bear-miller-witnessed'}},
    {text:'Leave on the bear’s terms.',ends:true,lines:[
      '“You were afraid of me,” the bear says. “You made that my punishment. I will not spend the rest of my life proving you wrong.”',
      'He takes the key from the miller’s open hand and hangs it on the empty chain. “Keep it. Find another way to turn your stone.”',
      'He turns toward the stream. “There is one piece of that chain I want to take. Come with me.”',
    ],then:{set:'bear-mill-left'}},
    {text:'We can come back to this.',ends:true,lines:['The bear nods. “We can. That is the difference now.”']},
  ]},
];

const reeveChoices:Choice[]=[
  {text:'Show the miller’s statement. Let the bear speak.',if:{all:[unresolved,{flag:'bear-miller-witnessed'},{not:{flag:'bear-reeve-accountable'}}]},ends:true,lines:[
    'The reeve begins to read the statement aloud. The bear stops him. “I know what it says. I was there. I want to know whether you will send him somebody else.”',
    '“The church permits—” “You signed the writ. He held the key. Put your name beside that.”',
    'The reeve draws a line through the request for another convict. In a new order, he writes that the mill will receive no chained labour. He signs it where the bear can see.',
    '“And my name,” the bear says. The reeve writes it in place of CONVICT. The bear reads the page, folds his copy, and leaves through the front door.',
    'Outside, he lets out a long breath. “Now I can go back for the piece I want to keep.”',
  ],then:{set:'bear-reeve-accountable'}},
];

// Add quest replies to every existing variant so other writs, rewards and rumours remain available.
export function withBearReplies(dialogue:Dialogue,point:'miller'|'reeve'):Dialogue {
  const original=dialogue[point];const extra=point==='miller'?millerChoices:reeveChoices;
  const aftermath:NonNullable<Dialogue[string]['variants']>=point==='miller'?[
    {if:{flag:'bear-reeve-accountable'},lines:[
      '“The replacement order is cancelled. The reeve sent me a copy. No more chained labour here.”',
      'He looks at the wheel. “I will have to pay someone. Or turn it myself.”',
    ]},
    {if:{flag:'bear-mill-left'},lines:[
      'The key hangs from the empty chain, where the bear left it. The miller has not taken it back.',
      '“He did not ask whether he could go.” He looks at you. “I heard what he said.”',
    ]},
  ]:[];
  return {...dialogue,[point]:{...original,choices:[...(original.choices ?? []),...extra],
    variants:[...aftermath,...(original.variants ?? [])].map(variant=>({...variant,choices:[...(variant.choices ?? original.choices ?? []),...extra]}))}};
}

export function withBearLedger(dialogue:Dialogue):Dialogue {
  const original=dialogue['mill-ledger'];
  return {...dialogue,'mill-ledger':{...original,variants:[
    {if:{flag:'bear-reeve-accountable'},lines:[
      ...original.lines,
      'The replacement request is crossed out. The reeve’s new order is copied below it: NO CHAINED LABOUR AT THIS MILL.',
      'Where the book said CONVICT, it now gives the bear’s name. The old work dates remain. A correction is not an erasure.',
    ]},
    {if:{flag:'bear-mill-left'},lines:[
      ...original.lines,
      'The bear’s column ends on the day he left. The totals do not say who he was, or what it cost him to turn the stone.',
      'You remember those things. The book is no longer the only place that holds his story.',
    ]},
    {if:{all:[unresolved,{flag:'bear-mill-returned'}]},lines:[
      ...original.lines,
      'Farther on: CONVICT UNIT, BEAR. Days worked, flour owed to the church, food deducted. Beside several dates: UNABLE TO STAND. The next column still charges a full day’s flour.',
      'After his release: REQUEST REPLACEMENT CONVICT. ENDORSEMENT REQUIRED: REEVE. The bear runs one claw under the line. “It was never the stone that needed me.”',
    ],then:{set:'bear-mill-record'}},
    ...(original.variants ?? []),
  ]}};
}
