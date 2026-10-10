import type { Dialogue } from './dialogue';

// The mountain holds: the birds' city, ranked by height, where the messenger birds have stopped flying.
// People talk about what is in front of them. Names are placeholders.

// The climb above the holds' gate.
export const climb: Dialogue = {
  'wind-post': { speaker: 'A POST IN THE WIND', prompt: 'Read the post', lines: [
    'A post hung with little brass charms that hum in the wind. Carved down its length: MANA LIES ON THE MOUNTAIN. TRUST WHAT YOU CAN SEE.',
    'Someone has added, lower down: AND NOT ALWAYS THAT.',
  ] },
  bag: { speaker: 'A COURIER\'S BAG', prompt: 'Look in the bag', lines: [
    'A courier\'s bag, wedged in the rock where the wind put it. The bird is nowhere. The letters inside are all addressed to the same house, and none of them were opened.',
    'One charm, still humming, is tied to the strap: the kind that throws a big signature to frighten off hornets. The mountain is full of them now, and nothing behind them.',
  ] },
};

// The hold: a city up a cliff face.
export const hold: Dialogue = {
  goshawk: { speaker: 'A GOSHAWK AT THE GATE', prompt: 'Speak to the goshawk', lines: [
    'The great stair is the house\'s. Ground-dwellers stay on the ground tiers. That\'s not an insult. It\'s the order of things.',
  ], variants: [{ if: { flag: 'cuckoo-slain' }, lines: [
    'The stair is open. Nobody\'s ordered it shut. Nobody\'s ordering anything up there now.',
  ] }, { if: { flag: 'stair-open' }, lines: [
    'Somebody pulled the stair lever. I didn\'t see who. I didn\'t see anybody, and I\'ll say so.',
  ] }], choices: [
    { text: 'And the vulture?', if: { flag: 'vulture-free' }, lines: [
      'A scavenger? On the house\'s stair? She can wait with the sparrows. She knows why.',
    ] },
    { text: 'Who closed the rookery?', lines: [
      'The lord. By order of the house. He hasn\'t come down in a year. The orders come down without him.',
    ] },
  ] },
  magpie: { speaker: 'A MAGPIE', prompt: 'Speak to the magpie', lines: [
    'Everything I sell came up the mountain in somebody\'s bag, before the rookery shut. Now nothing comes up, so everything\'s dearer.',
  ], choices: [
    { text: 'Show me what you have.', ends: true, lines: [], then: { shop: 'magpie' } },
  ] },
  pigeon: { speaker: 'A PIGEON', prompt: 'Speak to the pigeon', lines: [
    'Courier. Was. Thirty years of letters, and then one morning the rookery doors were chained, and I\'m a pigeon on a wall.',
    'You can\'t imagine what it\'s like down there, without letters. Every nation thinks the others have stopped talking to it on purpose.',
  ], choices: [
    { text: 'The cliff, behind you.', lines: [
      'Old climbers\' path. Before there was a stair, the ground-dwellers who served the house went up the rock. Somebody small and quiet could still do it.',
      'The house put its duellist at the foot of it. He shows no mana at all. Don\'t believe him.',
    ] },
  ] },
  wren: { speaker: 'A WREN', prompt: 'Speak to the wren', lines: [
    'My eldest was taken into the house to serve, when the lord was still the lord. He used to write every week.',
    'He stopped writing when the rookery shut. I tell myself that\'s why.',
  ] },
  sparrow: { speaker: 'A SPARROW PORTER', prompt: 'Speak to the sparrow', lines: [
    'Ground tier. Porters, cooks, and anyone the house doesn\'t want to look at. You\'ll fit in.',
    'When the old lord\'s son was a chick, he used to come down here to play. Funny chick. Bigger than all of us by the end of the first spring.',
  ] },
  statue: { speaker: 'A STATUE', prompt: 'Look at the statue', lines: [
    'The house\'s founder, carved in the act of feeding a chick from her own beak. The plaque says: WE RAISE OUR OWN.',
  ] },
  rookery: { speaker: 'THE ROOKERY', prompt: 'Examine the rookery', lines: [
    'A tower of woven nests, chained shut. A notice on the door: CLOSED BY ORDER OF THE HOUSE. Inside, faintly, something is still cooing.',
  ], variants: [{ if: { flag: 'cuckoo-slain' }, lines: [
    'The chains are off. Birds are going in and out of the top of the tower in a long, ragged line, as if they had been waiting all year at the door.',
  ] }] },
  courier: { speaker: 'A SWIFT', prompt: 'Speak to the swift', hiddenIf: [{ not: { flag: 'cuckoo-slain' } }], lines: [
    'First bird out. I went round the coast while the others went inland.',
    'There\'s an island off the south coast, past where the charts stop. Nothing on it but a lighthouse. Lit. Nobody I know of keeps it.',
    'Ships were going out to it. With fish.',
  ] },
  letters: { speaker: 'UNDELIVERED LETTERS', prompt: 'Search the undelivered letters', hiddenIf: [{ not: { flag: 'cuckoo-slain' } }], lines: [
    'A year of letters nobody carried, in sacks. The rookery keepers are sorting them by nation and crying a little.',
    'One is addressed to you, by your name, in a hand that leans the wrong way, as if written with something other than fingers.',
    '"I am at sea. I am alive, which is more than I can say for the rest of you, and I am sorry. Don\'t die out there. Out there, the church can\'t fetch you back."',
  ], then: { set: 'octopus-letter' } },
};

// The upper tiers: the noble house, where the hero goes alone.
export const upper: Dialogue = {
  gallery: { speaker: 'THE PORTRAITS', prompt: 'Look at the portraits', lines: [
    'The house\'s family, generation after generation, every one of them a falcon. In the newest, the lord and his lady stand with three chicks. One of them is very much bigger than the others.',
    'That one has been painted over, carefully, with a vase of flowers.',
  ] },
  balcony: { speaker: 'THE BALCONY', prompt: 'Look out from the balcony', lines: [
    'From up here you can see the ground tiers, the sparrows, the rookery in its chains. The house was built so its lords would always be looking down.',
  ] },
  lever: { speaker: 'THE STAIR LEVER', prompt: 'Pull the stair lever', hiddenIf: [{ flag: 'stair-open' }], lines: [
    'You lean on the lever. Far below, the great stair\'s gate grinds open.',
    'The others can come up now.',
  ], then: { set: 'stair-open' } },
};

// The archive: every letter the rookeries carried, copied.
export const archive: Dialogue = {
  shelves: { speaker: 'THE SHELVES', prompt: 'Look along the shelves', lines: [
    'Copies of every letter the rookeries carried, filed by year and by sender. Treaties, love letters, ration orders, the church\'s own mail. Everything anyone ever said to anyone far away.',
  ] },
  clerk: { speaker: 'AN OLD OWL', prompt: 'Speak to the owl', lines: [
    'You\'re not supposed to be up here. Nobody\'s supposed to be up here. I\'ve been copying letters nobody sends for a year.',
    'The lord asked for the old church files, before he stopped coming down. The ones about the island project. He read them all night, and then he closed the rookery.',
  ] },
  order: { speaker: 'AN OLD ORDER', prompt: 'Read the order', lines: [
    'A church order, years old, in the file the clerk mentioned. TRANSFER: one young guard, from the island project to the capital garrison, effective at once.',
    'Below that: HE IS NOT TO BE TOLD WHY. HIS MEMORY OF HIS POSTING IS TO BE TAKEN BEFORE HE SAILS.',
    'The guard\'s name is yours.',
    'And then you remember. A long white room. Cages. One of them had a child in it, a child with no fur at all, who looked at you and did not cry. You had the keys.',
    'You opened the door.',
  ], variants: [{ if: { flag: 'lab-remembered' }, lines: [
    'The order is where you left it. You don\'t need to read it again. You remember the room.',
  ] }], then: { set: 'lab-remembered' } },
  'feast-copy': { speaker: 'A COPY OF A LETTER', prompt: 'Read the letter', lines: [
    'A copy of a letter to the steward of the hall of the Long Table, the week before the feast: the house of the mountain lords will send its own cupbearer, for the wine. He will be hooded, by custom.',
    'It is sealed, in the copy-clerk\'s drawing of it, with an egg.',
  ] },
  inquisitor: { speaker: 'THE INQUISITOR', prompt: 'Speak to the ram', hiddenIf: [{ not: { flag: 'lab-remembered' } }, { flag: 'inquisitor-spoke' }], portrait: 'inquisitor', lines: [
    'He is standing behind you. He has been for some time. He is reading the order over your shoulder.',
    '"I have hunted you across four regions. I have never once asked why a convict would come all this way to read old mail."',
    'He folds the order and puts it inside his coat.',
    '"I will look into this. Then I will come for you."',
    'He goes down the stair without hurrying.',
  ], then: { set: 'inquisitor-spoke' } },
};

// The lord's hall.
export const houseHall: Dialogue = {
  lord: { speaker: 'THE LORD OF THE HOUSE', prompt: 'Speak to the lord', portrait: 'falcon-lord', hiddenIf: [{ flag: 'cuckoo-challenged' }, { flag: 'cuckoo-slain' }], lines: [
    'A falcon in the lord\'s chain, very still in the lord\'s chair. His mana reads almost nothing, and it doesn\'t move.',
    '"Ground-dwellers. In my hall. The rookery is closed by order of the house. You have no business with the house."',
  ], choices: [
    { text: 'Your mana doesn\'t move.', lines: [
      'He smiles. It is not a falcon\'s smile.',
      '"Nobody up here ever noticed. They don\'t look at each other. They only look down."',
    ] },
    { text: 'Who painted over the chick in the portrait?', lines: [
      '"His mother did. The night they found out what he was."',
      '"He was the biggest chick they ever raised. They were so proud. Then someone looked at the eggshell."',
    ] },
    { text: 'Why close the rookery?', lines: [
      '"So nobody can tell anybody anything. So every nation sits alone in the dark and thinks the others did it."',
      '"He asked me to. He asked nicely. He is the only one who ever asked me anything nicely."',
    ] },
    { text: 'You\'re not the lord.', ends: true, lines: [
      'The lord\'s face slides off him like water.',
      '"No. I was his son, for a while."',
    ], then: { set: 'cuckoo-challenged' } },
  ] },
  den: { speaker: 'THE CUCKOO', prompt: 'Speak to the cuckoo', portrait: 'cuckoo', hiddenIf: [{ not: { flag: 'cuckoo-slain' } }], lines: [
    'He sits on the steps below the chair, wearing no one\'s face at all.',
    '"The lord is in the cellar. Alive. I fed him. I\'m not a monster. I\'m just not theirs."',
    '"He remembers you. The one with no fur. He told me you opened a door, once. He said you\'d understand what it\'s like, being let out and then being nobody\'s."',
  ] },
  portraits: { speaker: 'THE HALL\'S PORTRAITS', prompt: 'Look at the portraits', lines: [
    'Lords of the house, each one looking down. The newest frame is empty.',
  ] },
  eggshell: { speaker: 'IN A GLASS CASE', prompt: 'Look in the case', lines: [
    'Half an eggshell, under glass, labelled in the house\'s hand: NOT OURS.',
  ] },
};
