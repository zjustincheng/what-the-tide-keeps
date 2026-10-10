import { BOUTS } from '../rules/ring';
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
  ], variants: [{ if: { flag: 'son-freed' }, lines: [
    'He came down the great stair this morning with nothing but his apron. He hasn\'t said much. He sleeps a lot.',
    'Here. It was his grandmother\'s. Don\'t argue with me.',
  ], then: { find: 'wren-feather' } }] },
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

// The cellars under the lord's hall.
export const cellars: Dialogue = {
  'lord-cell': { speaker: 'THE LORD OF THE HOUSE', prompt: 'Speak to the falcon', portrait: 'falcon-lord', hiddenIf: [{ flag: 'lord-freed' }], lines: [
    'A falcon in what is left of a lord\'s coat, chained to the wall. He has been fed. Someone has been careful to feed him.',
    '"Is it you he sent, or are you here for me? Either way. Open the door."',
  ], variants: [{ if: { flag: 'lord-left' }, lines: [
    'He doesn\'t look up this time. "The sparrows will let me out. The sparrows always do what they\'re told."',
  ] }], choices: [
    { text: 'Did you paint over him?', lines: [
      '"My wife did. I let her. He was the best of them, you know. The strongest chick we ever had. Then someone looked at the shell."',
      '"What would you have done? He wasn\'t ours."',
    ] },
    { text: 'Open the door.', if: { all: [{ flag: 'cuckoo-slain' }, { not: { flag: 'lord-left' } }] }, ends: true, lines: [
      'The lock is old and gives. He walks out on legs that don\'t work properly yet, and he doesn\'t thank you.',
      'At the stair he stops. "The house will open the rookery. The house will say it was always going to." He gives you his signet, as if paying a porter.',
      'Found: the house signet.',
    ], then: { set: 'lord-freed', find: 'house-signet' } },
    { text: 'Leave him.', if: { all: [{ flag: 'cuckoo-slain' }, { not: { flag: 'lord-left' } }] }, ends: true, lines: [
      'You leave the door shut. Behind you, he doesn\'t call out. He is too proud, or he knows it wouldn\'t help.',
    ], then: { set: 'lord-left' } },
    { text: 'Not until the house is settled.', if: { not: { flag: 'cuckoo-slain' } }, lines: [
      '"Then settle it. You know where he is. He sits in my chair."',
    ] },
  ] },
  'servant-cell': { speaker: 'A YOUNG WREN', prompt: 'Speak to the wren', hiddenIf: [{ flag: 'son-freed' }], lines: [
    'A wren, very young, in a servant\'s apron. "He put me down here because I saw him take the lord\'s face off. He said he was sorry. He brought me bread."',
    '"Is my mother still on the market tier? I used to write to her every week."',
  ], choices: [
    { text: 'Go home.', ends: true, lines: [
      'The cell door isn\'t even locked: it was never the lock that kept him. He goes up the passage at a run.',
    ], then: { set: 'son-freed' } },
  ] },
  wine: { speaker: 'THE WINE CELLAR', prompt: 'Look at the racks', lines: [
    'The house\'s wine, racked by year. One rack is labelled FOR THE LONG TABLE, and it is empty.',
  ] },
  store: { speaker: 'THE STORE', prompt: 'Look in the store', lines: [
    'Sacks of grain and barrels of fish, church-stamped, enough for a year. The house has been eating while the rookery was shut. Nobody on the ground tier has.',
  ] },
};

// The old eyrie on the peak.
export const summit: Dialogue = {
  hermit: { speaker: 'AN OLD EAGLE', prompt: 'Speak to the eagle', lines: [
    'First courier of the holds. Was. Fifty years ago. They gave me the eyrie when my eyes went, and I stayed when everybody else went down.',
    'Those are my flight, in the snow. They went out in a storm with a church letter that couldn\'t wait. It waited.',
  ], variants: [{ if: { flag: 'flight-slain' }, lines: [
    'They\'re down. Good. I couldn\'t do it, and they weren\'t going to stop flying on their own.',
  ], then: { find: 'courier-bell' } }], choices: [
    { text: 'What letter couldn\'t wait?', lines: [
      'Supplies, for the island. Back then the church sent a boat a month out past the coast, to a white house on a rock. Food, and medicine, and cages.',
      'Then one winter the orders stopped. Then the copies of the orders were taken out of the archive. I remember because I was the one who flew them.',
    ] },
    { text: 'The couriers in the snow.', if: { not: { flag: 'flight-slain' } }, lines: [
      'They still fly. The dead do that up here. Anything that comes up the bridge, they take for a hawk.',
      'If you put them down, the bell over the door is yours. It\'s the one they used to ring when a flight came in.',
    ] },
  ] },
  oldest: { speaker: 'THE OLDEST LETTERS', prompt: 'Read the oldest letters', lines: [
    'Letters older than the Covenant, in a dozen hands. Most are about weather and debts. One is from a herbivore lord to a carnivore lord, and says only: I am so hungry. Are you?',
  ] },
  perches: { speaker: 'THE PERCHES', prompt: 'Look at the perches', lines: [
    'Perches for a flight of twelve, worn smooth. Seven names are cut in the wood. Five are scratched out, carefully, by someone who knew them.',
  ] },
};

// The Talon Ring: bouts for the houses' amusement, one after another, until the champion.
export const ring: Dialogue = {
  ringmaster: { speaker: 'THE RINGMASTER', prompt: 'Speak to the shrike', portrait: 'shrike', lines: [
    'Ground-dwellers! The houses love a ground-dweller. They bleed so honestly.',
    'Bouts in order, prize in hand, nobody dies in my ring. I call it before that. The crowd prefers it that way: it means you come back.',
  ], variants: [{ if: { flag: 'ring-champion' }, lines: [
    'The champion\'s torc on a ground-dweller. The houses are furious. Business has never been better.',
  ] }], choices: BOUTS.map((bout, index) => ({
    text: `${bout.name}. (${bout.prize} coins${bout.find ? ', and the torc' : ''})`,
    if: index === 0 ? { not: { flag: bout.flag } } : { all: [{ flag: BOUTS[index - 1].flag }, { not: { flag: bout.flag } }] },
    ends: true, lines: [bout.text, '"In you go."'], then: { bout: index },
  })) },
  board: { speaker: 'THE BOUT BOARD', prompt: 'Read the board', lines: [
    'Chalked up in order: HORNETS, TWO AT A TIME. SOMETHING FROM THE CRACKS. THE KESTREL BROTHERS. THE CHAMPION.',
    'Beside it, a longer list, wiped half clean: the names of ground-dwellers who fought here. Most have a little thorn drawn next to them.',
  ] },
  crowd: { speaker: 'THE STANDS', prompt: 'Look up at the stands', lines: [
    'Falcons and hawks in the high seats, sparrows standing at the back. The house seats have cushions. The sparrows have each other\'s shoulders.',
  ] },
  thorns: { speaker: 'THE THORNS', prompt: 'Look at the thorns', lines: [
    'A blackthorn hedge grown up the wall by the gate, and on the thorns, the shrike\'s larder: shrews, beetles, a lizard\'s tail.',
    'He doesn\'t eat any of it. He just likes to keep it.',
  ] },
  bettor: { speaker: 'A JAY TAKING BETS', prompt: 'Speak to the jay', lines: [
    'I take bets on ground-dwellers. Mostly against. Nothing personal.',
    'Bring the vulture for the champion: he fights from the air, and her talons are the only thing in the holds that\'ll reach him.',
  ] },
};
