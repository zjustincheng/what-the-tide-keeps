import type { Dialogue } from './dialogue';

// Places off the roads, one or two in every region: nothing in them is on the church's orders.
// People talk about what is in front of them. Names are placeholders.

// The orchard below the downs.
export const orchard: Dialogue = {
  grafter: { speaker: 'AN OLD HARE', prompt: 'Speak to the hare', lines: [
    'An old hare with a knife and a pot of wax, binding a cut branch to a stake. She doesn\'t look up.',
    '"If you\'re here for apples, take them. Nobody else does. They fall and they rot and the weevils have the rest."',
  ], variants: [
    { if: { owns: 'grafting-knife' }, lines: ['"The trees are quieter. I can hear myself think, out here. That isn\'t always a mercy."'] },
    { if: { flag: 'orchard-cleared' }, lines: [
      'She looks at the weevil husks on your boots, then at you, for the first time.',
      '"So the trees get another year. Here. It was the youngest one\'s. It cuts clean, and it\'s no use to me now that my hands shake."',
      'Found: a grafting knife.',
    ], then: { find: 'grafting-knife' } },
  ], choices: [
    { text: 'Whose orchard was it?', lines: [
      '"A family of deer. Six of them. Good with trees. I was their neighbour; I helped with the picking."',
      '"The year the fish failed, the church came with a list for the levy. Six names on it. They went in a cart, to the capital, and on from there. Nobody would say where on."',
      '"I stayed to keep the trees. Somebody has to, or it\'s as if they were never here."',
    ] },
    { text: 'What is eating the trees?', lines: [
      '"Weevils. A whole heap of them, in the old tree at the bottom by the wall. They breed in the windfalls. Nobody picks, so there are more windfalls every year."',
      '"Kill the heap and the trees get a year. I can\'t. I\'ve tried."',
    ] },
    { text: 'What are the stakes for?', lines: [
      '"One for each of them. I graft a cutting from their tree onto it, so there\'s something growing with their name on."',
    ] },
  ] },
  hut: { speaker: 'THE HUT', prompt: 'Look at the hut', lines: [
    'Six bedrolls, rolled and tied, along one wall. One unrolled by the fire. Apples drying on strings from the rafters.',
  ] },
  press: { speaker: 'THE PRESS', prompt: 'Look at the press', lines: [
    'A cider press, its screw rusted fast. The trough under it is full of rainwater and wasps.',
  ] },
  stakes: { speaker: 'THE STAKES', prompt: 'Read the tags', lines: [
    'Five stakes, five tags, five names burnt into wood. Each stake has a young branch bound to it with wax and twine.',
    'There is room in the row for a sixth. The hare hasn\'t put one there. Maybe she is still waiting for someone.',
  ] },
  well: { speaker: 'THE WELL', prompt: 'Look into the well', lines: [
    'A long way down, a little round of sky. The rope is new. Someone still draws water here every day, for trees.',
  ] },
};

// The church's quarry west of the border road.
export const quarry: Dialogue = {
  quarryman: { speaker: 'A MOLE ON A CHAIN', prompt: 'Speak to the mole', hiddenIf: [{ flag: 'quarrymen-freed' }], lines: [
    'A mole with a pick, grey with stone dust from ears to tail. There is a brand on his wrist. The same iron as yours, a different number.',
    '"Keep your head down if the overseer looks. He takes a day off the end of your sentence for every block. He adds a week for every word."',
  ], choices: [
    { text: 'What are you cutting?', lines: [
      '"Stone for the light. That\'s all they tell us. It goes by cart to the capital harbour and on by boat."',
      '"Good stone. Nobody builds a lighthouse that big for ships. You\'d build it that big to be seen from very far away."',
    ] },
    { text: 'How long is your sentence?', lines: [
      '"Seven years. I\'ve done nine. The tally says seven, so I must be wrong."',
    ] },
    { text: 'Break the chain.', if: { flag: 'overseer-slain' }, ends: true, lines: [
      'It takes the old cutter\'s wedge and a block to do it. The chain parts at the staple, and goes through every ankle in the pit like a sigh.',
      'Nobody runs. They stand there, then one of them laughs, and then they go, all at once, east toward the road and away from it.',
      'The old cutter stops by you. "Keep the wedge. It split more stone than I did. It\'ll split anything you put it to."',
      'Found: the cutter\'s wedge.',
    ], then: { set: 'quarrymen-freed', find: 'cutters-wedge' } },
    { text: 'Break the chain.', if: { not: { flag: 'overseer-slain' } }, lines: [
      '"With the overseer up on the terrace? We\'d be in the pit with the others by dark. Him first."',
    ] },
  ] },
  'old-cutter': { speaker: 'AN OLD MOLE', prompt: 'Speak to the old mole', hiddenIf: [{ flag: 'quarrymen-freed' }], lines: [
    'Older than the other one, almost blind, working by touch. He sets a wedge, listens to the stone, moves it a finger\'s width, and strikes.',
    '"The face takes one in four, a season. They lay them under it, by the bones. Nobody\'s family comes. Nobody\'s family is told."',
  ] },
  chain: { speaker: 'THE CHAIN', prompt: 'Look at the chain', hiddenIf: [{ flag: 'quarrymen-freed' }], lines: [
    'One chain, run through an iron ring at every ankle, stapled into the rock at each end. When one of them falls, they all feel it.',
  ] },
  fallen: { speaker: 'UNDER THE FACE', prompt: 'Look under the face', lines: [
    'Bones, laid out in a row under the cut rock, under a scatter of stone chips. No markers. Somebody has pushed a pebble into each eye socket so they can\'t look up at the face any more.',
  ] },
  blocks: { speaker: 'THE BLOCKS', prompt: 'Look at the blocks', lines: [
    'Dressed stone, squared and stacked for the carts. Each block has the church\'s mark cut into one face, and under it, smaller: FOR THE LIGHT.',
  ] },
  tally: { speaker: 'THE OVERSEER\'S TALLY', prompt: 'Read the tally', lines: [
    'CONVICTS: 31. LOST TO THE FACE THIS SEASON: 9. REPLACED: 9. BLOCKS SHIPPED: 412.',
    'Under it, in another hand: ASK THE MAGISTRATE FOR MORE. THE LIGHT WANTS TWICE THIS BY SPRING.',
  ] },
};

// The shieling above the drove road.
export const shieling: Dialogue = {
  collie: { speaker: 'A SHEEPDOG', prompt: 'Speak to the dog', lines: [
    'A sheepdog, thin, her coat matted with snow. She has kept the flock in the fold all winter. She stands when you come, as if you might be them.',
    '"Oh. No. You\'re not. They went down to the fort in the autumn, for the levy. They said spring. It\'s spring."',
  ], variants: [{ if: { flag: 'collie-told' }, lines: [
    '"I\'ll keep the sheep. It\'s what I know. Somebody will want sheep, one day."',
  ] }], choices: [
    { text: 'Who went down?', lines: [
      '"Three of them. The old ram and his two boys. The fort wanted wool for the garrison, and the boys for the garrison too."',
    ] },
    { text: 'They\'re not coming back.', ends: true, lines: [
      'She looks down the track to the drove road for a long time.',
      '"I know. I knew at the first snow. I wanted someone to say it, so I could stop listening for them."',
    ], then: { set: 'collie-told' } },
    { text: 'What hunts up here?', lines: [
      '"Harriers off the tops, for the lambs. Hounds from the raiders\' camp, for anything. I\'ve lost four. I\'ve killed more than four."',
    ] },
  ] },
  cairn: { speaker: 'THE CAIRN', prompt: 'Read the cairn', lines: [
    'Every shepherd who summered here cut their name into a stone and set it on the pile. The newest stones have names you could still read. Three of them are scratched over: GONE FOR THE LEVY.',
  ] },
  hut: { speaker: 'THE HUT', prompt: 'Search the hut', hiddenIf: [{ owns: 'shepherds-horn' }], lines: [
    'Snow has come in through the stove-in door. Bunks, a cold stove, a hook on the wall with a cow\'s horn hanging from it, polished with handling.',
    'The dog watches you take it and doesn\'t stop you. "They\'d call the flock in with that. I hear it in my sleep. Take it away from here."',
    'Found: the shepherds\' horn.',
  ], then: { find: 'shepherds-horn' } },
  fold: { speaker: 'THE FOLD', prompt: 'Look at the fold', lines: [
    'The last of the flock, huddled in a ring of stones. Their wool hasn\'t been cut in a year and hangs off them in grey ropes.',
  ] },
};

// The lanes behind the harbour.
export const lanes: Dialogue = {
  'soup-sister': { speaker: 'A SISTER OF THE COVENANT', prompt: 'Speak to the sister', lines: [
    'A sister in a clean white apron, ladling soup into bowls. Before each bowl, a name goes into the book at her elbow.',
    '"Soup after confession, convict. Not before. That\'s the rule."',
  ], choices: [
    { text: 'Confess what?', lines: [
      '"Anything. Everyone has something. Your name, where you sleep, who you sleep near. It all goes in the book."',
      '"The book goes up to the church every week. The church likes to know where everyone is. In case they are needed."',
    ] },
    { text: 'Needed for what?', lines: [
      'The ladle stops for a moment.',
      '"Volunteers. For the light. Good work, and fed. Nobody has ever come back to complain."',
    ] },
  ] },
  'queue-1': { speaker: 'A LODGER IN THE QUEUE', prompt: 'Speak to the lodger', lines: [
    '"I gave her my sister\'s name last week, and where she sleeps. Soup was thin, but it was hot."',
    '"My sister hasn\'t been home since Tuesday. I\'m sure it\'s nothing."',
  ] },
  'queue-2': { speaker: 'AN OLD GOAT', prompt: 'Speak to the goat', lines: [
    '"I give her a different name every time. She doesn\'t check. When they come looking for the names in the book, they\'ll find nobody."',
  ] },
  'rat-mother': { speaker: 'A RAT WITH A BUCKET', prompt: 'Speak to the rat', lines: [
    'A rat sitting on an empty bucket by the grate, looking at it.',
    '"My boy went down there two nights ago. The pump has the church\'s lock on it, a copper a pail, and we haven\'t got a copper. Under the yard there\'s the cistern, all the city\'s water. Free, if you can get to it."',
    '"He got the grate up with a bar. He hasn\'t come up."',
  ], variants: [
    { if: { owns: 'tin-cup' }, lines: ['"He\'s asleep. He wakes up shouting. I tell him it\'s only water, and he says that\'s what he means."'] },
    { if: { flag: 'ratling-home' }, lines: [
      'She has the boy wrapped in a blanket on her knee. She doesn\'t let go of him to speak.',
      '"I haven\'t got anything. I\'ve got this. It\'s what he took down there, to bring the water up in. You have it. I don\'t want to look at it."',
      'Found: a tin cup.',
    ], then: { find: 'tin-cup' } },
  ], choices: [
    { text: 'I\'ll go down.', if: { not: { flag: 'cistern-asked' } }, ends: true, lines: [
      'She hands you the bar. "It sticks at the left. Lift and pull."',
    ], then: { set: 'cistern-asked' } },
    { text: 'Why is there a lock on the pump?', lines: [
      '"Water tithe. The church owns the water under the city, the same as it owns the fish in the sea. It says. It sells it back by the pail."',
    ] },
  ] },
  'ratling-1': { speaker: 'A RAT CHILD', prompt: 'Speak to the child', lines: [
    '"Don\'t go near the grate. Something down there breathes. You can hear it, if you put your ear to the bars at night."',
  ] },
  stoat: { speaker: 'A STOAT IN A DOORWAY', prompt: 'Speak to the stoat', lines: [
    'A stoat in a doorway, picking his teeth with a fishbone. "Branded. You\'ve got the look of someone the church has a use for. I\'d keep out of that soup line."',
  ], choices: [
    { text: 'What happens to the volunteers?', lines: [
      '"A cart at night, down to the harbour. A boat, no lights. Every new moon, regular as tithe."',
      '"I sold a list of names to a cleric once. Good money. I don\'t do it now. Not because I\'m good. Because nobody on that list ever turned up again, and I like to have customers."',
    ] },
  ] },
  notice: { speaker: 'A NOTICE', prompt: 'Read the notice', lines: [
    'BY ORDER OF THE REGENCY: THE WATER TITHE IS RAISED TO ONE COPPER THE PAIL. THE CHURCH THANKS THE FAITHFUL FOR THEIR PATIENCE IN A DRY YEAR.',
    'It has rained every day this month.',
  ] },
  soup: { speaker: 'THE POT', prompt: 'Look in the pot', lines: [
    'Fish soup. The same smoked fish as every stall in the farmland, stamped WICKMERE on the barrel by the pot.',
  ] },
  pump: { speaker: 'THE PUMP', prompt: 'Look at the pump', lines: [
    'A padlock through the handle, with the church\'s mark on it. Under the spout, the cobbles are dry.',
  ] },
  washing: { speaker: 'THE WASHING', prompt: 'Look at the washing', lines: [
    'Shirts and smocks, grey from being washed in grey water. Some lines have a gap in them, where somebody\'s things were taken in and not put out again.',
  ] },
};

// The cistern under the lanes.
export const cistern: Dialogue = {
  ratling: { speaker: 'A RAT BOY', prompt: 'Speak to the boy', hiddenIf: [{ flag: 'ratling-home' }], lines: [
    'A young rat on a ledge across the water, holding a tin cup, shaking. Between you and him, something stands up to its waist in the water and does not breathe.',
  ], variants: [{ if: { flag: 'cistern-cleared' }, lines: [
    'He is still on the ledge, holding the cup out in front of him with the water in it. He hasn\'t spilled any.',
    '"I got it. I got the water. Can we go up now?"',
    'He holds your hand all the way up the stair, and doesn\'t look back once.',
  ], then: { set: 'ratling-home' } }] },
  valve: { speaker: 'THE VALVE', prompt: 'Look at the valve', lines: [
    'A great iron wheel on the wall, chained and locked with the church\'s mark. It is turned halfway. Above it, cut into the stone: LANES. And below that: SHUT IN DRY YEARS.',
  ] },
  tithe: { speaker: 'MARKS ON THE WALL', prompt: 'Read the marks', lines: [
    'Water levels, scratched into the wall with dates beside them, for a hundred years. The water has never once been low.',
  ] },
  bones: { speaker: 'IN THE WATER', prompt: 'Look into the water', lines: [
    'Bones, at the bottom, under clear water. Small ones. The city drinks this water. It has always drunk this water.',
  ] },
};

// The peat cuttings south of the far bank.
export const peat: Dialogue = {
  cutter: { speaker: 'A VOLE WITH A SPADE', prompt: 'Speak to the vole', lines: [
    'A vole with a long cutting spade, black to the elbows. "Peat for the capital\'s fires. The church buys it by the cartload and doesn\'t ask where it\'s cut."',
    '"Sometimes the bog gives somebody back. We don\'t move them. We put a stake by them and cut round."',
  ], choices: [
    { text: 'Who are they?', lines: [
      '"Nobody knows. The bog keeps them, skin and hair and all, for hundreds of years. Some have rope at their throats. Some have their hands tied."',
      '"My father said they were offerings, from before the Covenant. My father didn\'t look at them very closely."',
    ] },
    { text: 'Why not tell the church?', lines: [
      '"We did, once. A cleric came and looked at the oldest one for a long time, and told us to cut it back into the bog. We didn\'t."',
    ] },
  ] },
  'body-1': { speaker: 'IN THE CUTTING', prompt: 'Look at the body', lines: [
    'A woman, leather-brown, perfect, curled on her side as if asleep. A plaited cord around her neck, pulled tight. Her face is calm.',
  ] },
  'body-2': { speaker: 'IN THE CUTTING', prompt: 'Look at the body', lines: [
    'A child, small enough to carry. Something carved in its hand: a little wooden fish.',
  ] },
  'old-body': { speaker: 'THE OLDEST', prompt: 'Look at the oldest body', lines: [
    'The oldest, deepest in the bank. A lizard, the cutter says, though there\'s not much left to tell by.',
    'On his wrist there is a brand. Not like yours: the same as yours. The same iron, the same shape. The cutter says this bank was laid down three hundred years ago.',
    'His hand is closed around something black.',
  ], choices: [
    { text: 'Open his hand.', if: { not: { owns: 'brand-iron' } }, ends: true, lines: [
      'The fingers come apart like old leather. In them, a small iron: the head of a branding iron, broken from its handle. The church\'s mark, worn almost smooth.',
      'Whoever he was, he took it with him into the bog. You don\'t know why. You know exactly why.',
      'Found: the old brand-iron.',
    ], then: { find: 'brand-iron' } },
  ] },
};

// The drowned fleet, east of the currents.
export const fleet: Dialogue = {
  hermit: { speaker: 'A HERMIT CRAB', prompt: 'Speak to the crab', lines: [
    'A hermit crab living in a church marine\'s helmet, the visor for a door. "Mine now. He didn\'t need it. They didn\'t need any of it, by the end."',
  ], choices: [
    { text: 'What sank them?', lines: [
      '"Nothing sank them. They were let in. Somebody opened the seacocks on purpose, all three, the same night. The light told them to, I think. They were coming back from it."',
    ] },
    { text: 'Who was on board?', lines: [
      '"Marines. Clerics. And in the hold, chained, the ones they were taking out to the light and bringing back. They weren\'t bringing them back. They were bringing back what was left."',
    ] },
  ] },
  manifest: { speaker: 'THE MANIFEST', prompt: 'Read the manifest', lines: [
    'Ink run, but readable, in a box nailed to the deck. OUTWARD: FISH, 60 BARRELS. PASSENGERS FOR THE LIGHT, 14. RETURNING: — .',
    'The dash is ruled very straight.',
  ] },
  hold: { speaker: 'THE HOLD', prompt: 'Look into the hold', hiddenIf: [{ owns: 'drowned-bell' }], lines: [
    'Chains along both walls, fourteen pairs of rings, all open. On a hook by the hatch, a bell on a lanyard: the kind a jailer rings to count heads.',
    'Found: the drowned bell.',
  ], then: { find: 'drowned-bell' } },
  bell: { speaker: 'THE SHIP\'S BELL', prompt: 'Look at the bell', lines: [
    'Cast with the church\'s mark and a name: THE MERCY. Weed grows out of its mouth. When the swell moves it, it doesn\'t ring.',
  ] },
  bones: { speaker: 'ON THE SAND', prompt: 'Look at the sand', lines: [
    'Bones in the sand, the swell moving them a little, back and forth, back and forth, like something being rocked.',
  ] },
};
