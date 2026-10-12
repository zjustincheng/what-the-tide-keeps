import type {Dialogue} from './dialogue';

export const portLife:Dialogue={
  'returned-crab':{speaker:'A CRAB ON THE DECK',portrait:'crab',prompt:'Speak to the returned crab',hiddenIf:[{not:{flag:'crab-freed'}}],lines:[
    '“A tank in your harbour. Twenty coins. You did not even ask what I was worth.”',
    'She taps the plank with a claw. “I told them who opened it. They do not have to like you to know that.”',
  ],variants:[{if:{flag:'cuttlefish-slain'},lines:[
    '“They are calling it a truce. I am calling it a deck I can stand on without someone weighing me.”',
    '“Tell the land that part, when you go back.”',
  ]}]},
  'moorings':{speaker:'THE MOORING BOARD',prompt:'Read the mooring board',lines:[
    'Several shipping routes have been crossed out. Beneath them: NO CARGO FOR THE LAND. The names of the crews are signed below, in different hands.',
  ],variants:[{if:{flag:'cuttlefish-slain'},lines:[
    'The old prohibition remains. A second sheet has been nailed beside it: PASSAGE BY AGREEMENT. NO LIVE CARGO.',
    'Someone is collecting the crews’ signatures again. A truce needs more hands than a threat.',
  ]}]},
};
