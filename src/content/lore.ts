import type { Dialogue } from './dialogue';

// People who carry the world's history: the Covenant, the nations, the sea, magic, and the church.
// Each is added to an area's own dialogue. Names are placeholders.

// The church: a novice who has read too much.
export const churchLore: Dialogue = {
  novice: { speaker: 'A NOVICE', prompt: 'Speak to the novice', lines: [
    'I\'m not supposed to talk to the condemned. I\'m supposed to sweep around you.',
    'But you\'ve been more places than I have. I\'ve only been here.',
  ], choices: [
    { text: 'What is the Covenant?', lines: [
      'The law under every other law. No citizen eats another.',
      'It was sworn at the Long Table in the capital, at the end of the Hunger Wars, by every nation that had a seat. The table is still there. Nobody is allowed to eat at it.',
      'The church keeps it. That\'s what we\'re for, really. Everything else came after.',
    ] },
    { text: 'What is the basin for?', lines: [
      'Salt water from the sea, carried up from the harbour every morning. The rite needs it. The priest won\'t say why.',
      'There\'s an old saying from the coast: the tide keeps what it takes. The priest doesn\'t like it said in here.',
    ] },
    { text: 'Who else does the church raise?', lines: [
      'Only the condemned. It\'s forbidden for anyone else. Citizens die once, like they\'re supposed to.',
      'The rite was the alchemists\' before it was ours. They built it for something else. I found that in a book I wasn\'t supposed to be reading.',
    ] },
    { text: 'Who are the alchemists?', lines: [
      'The church\'s scholars. They license every grimoire, test every spell, make the fish last on the long carts inland.',
      'They used to have a building on the water. Now it\'s just a wing of the library nobody\'s given a key to.',
    ] },
  ] },
};

// The farmland: a pilgrim at the old shrine, a seal hauling fish inland, and a hedgehog who keeps bees.
export const fieldsLore: Dialogue = {
  pilgrim: { speaker: 'A PILGRIM', prompt: 'Speak to the pilgrim', lines: [
    'Sit, if you like. The stones don\'t mind who sits by them.',
    'I walk the old shrines. All of them, one after another, until I don\'t.',
  ], choices: [
    { text: 'Why walk the shrines?', lines: [
      'Each one marks a feeding ground from before the Covenant, where one kind of people used to eat another.',
      'They built the shrines on top of them so nobody could forget, and then everybody forgot anyway. Somebody should still visit.',
    ] },
    { text: 'What were the Hunger Wars?', lines: [
      'Before the Covenant, the nations ate each other when the harvests failed, and the harvests always failed.',
      'Then the alchemists showed the church how to keep fish from the sea fresh all the way inland. Carnivores could eat without eating anyone. The Long Table came after that.',
      'So the peace is fish. Remember that, when you hear how holy it is.',
    ] },
    { text: 'What does the oath on the stone mean?', lines: [
      'HERE NOBODY EATS ANYBODY. It was carved by the first pilgrims, who had all eaten somebody.',
      'They meant it as a promise. Now it\'s read as a rule. A promise asks something of you. A rule asks something of other people.',
    ] },
    { text: 'Where are you walking to?', lines: [
      'The last shrine is on the coast, below the capital, where the land stops. I\'ll get there or I won\'t.',
      'They say the sea peoples were never asked to the Long Table. That shrine is where the fish come ashore.',
    ] },
  ] },
  carter: { speaker: 'A SEAL WITH A FISH CART', prompt: 'Speak to the seal', lines: [
    'Mind the barrels. They\'re counted.',
    'I haul for the church, from the harbour to the fort. Fish going inland, me going with them, since nobody else will smell like this.',
  ], choices: [
    { text: 'Are you a citizen?', lines: [
      'I\'m from the sea. The sea was never at the Long Table. So no.',
      'On land I\'m cargo that can drive. At sea I\'m the one who decides who\'s cargo.',
    ] },
    { text: 'What is the sea like?', lines: [
      'Lawless, they\'ll tell you here. That\'s wrong. It has more laws than the land. They\'re just not the church\'s.',
      'Pirate crews with their articles. Shark clans with their blood-debts. Whale pods that remember a grudge for a hundred years. Out there, eating is legal, and so is being eaten. You know where you stand.',
    ] },
    { text: 'Why did the kraken attack?', lines: [
      'Ask the barrels.',
      'The land eats the sea. Every fish that feeds a wolf up in the highlands came out of somebody\'s waters. The kraken was the first one big enough to say no.',
      'The five who killed it got a feast. The sea got nothing. You\'d remember, if you were one of the five.',
    ] },
  ] },
  beekeeper: { speaker: 'A HEDGEHOG BEEKEEPER', prompt: 'Speak to the beekeeper', lines: [
    'Slowly. They don\'t like quick.',
    'The orchard needs them, and the locusts come for the orchard. So I keep these and I kill those, and nobody calls it murder either way.',
  ], choices: [
    { text: 'Are insects people?', lines: [
      'Not under the Covenant. Insects don\'t speak, don\'t swear, don\'t sit at tables. They\'re what a lizard or a frog can eat without breaking anything.',
      'Some of my bees dance directions to the others. I\'ve watched them argue. I don\'t say that at the shrine.',
    ] },
    { text: 'Why are the pests so big?', lines: [
      'They weren\'t, when I was young. The swarms grew the year the alchemists started dosing the fields to stop them.',
      'Whatever they put on the wheat, the locusts liked it more than we did.',
    ] },
    { text: 'What do you eat?', lines: [
      'Grubs, beetles, the odd slug. I\'m an insect-eater, like you. We\'re the lucky ones. Nobody ever had to feed us fish to keep the peace.',
    ] },
  ] },
};

// Millbrook: a church scribe who licenses grimoires, and an old marine in the inn.
export const townLore: Dialogue = {
  scribe: { speaker: 'A STORK SCRIBE', prompt: 'Speak to the scribe', lines: [
    'Grimoire licenses, renewals, and confessions of unlicensed casting. One queue for all three.',
  ], choices: [
    { text: 'Why license grimoires?', lines: [
      'Because a spell doesn\'t care how big you are. A rabbit with the right grimoire can put down a bear.',
      'That\'s what made the Covenant possible. Herbivores could stand at the table without being afraid. It\'s also why the church writes down who holds every book in the kingdom.',
    ] },
    { text: 'What is mana?', lines: [
      'What you cast with. Everyone has some, and everyone can see everyone else\'s if they look.',
      'In a town, hiding your mana is a confession all by itself. Honest people let you see how dangerous they are.',
    ] },
    { text: 'Who are the hedge-witches?', lines: [
      'People who write their own grimoires instead of buying ours. Little spells, mostly. Thorns, knots, a word for a fever.',
      'Technically heresy. Practically, every village has one, and I don\'t walk to villages.',
    ] },
  ] },
};
export const innLore: Dialogue = {
  marine: { speaker: 'AN OLD HARE MARINE', prompt: 'Speak to the old marine', lines: [
    'I know that brand. I know that face, too, under it. I was on the harbour wall the night of the kraken.',
  ], choices: [
    { text: 'What happened that night?', lines: [
      'The sea stood up. That\'s the only way I can say it. The water came over the wall and the kraken came with it, and the capital\'s lamps went out street by street.',
      'Five of you went down to the water when everyone else was running up the hill. I didn\'t know any of you were people the kingdom would hang inside a month.',
    ] },
    { text: 'What was the feast?', lines: [
      'Every ruler of every nation at one table for the first time since the Long Table. To thank the five. They hung the kraken\'s arms from the rafters.',
      'Then the rulers were dead, all of them, and the five were covered in it. I never believed it. Nobody asked me.',
    ] },
    { text: 'Who rules now?', lines: [
      'Regents, councils, cousins, whoever was holding the seal when the news came. Every nation thinks one of the others did it.',
      'The church is the only thing that still reaches all of them. Funny how that works out.',
    ] },
  ] },
};

// The downs and the weir: a crow who sings the nations, and a crane who ferries the rivers.
export const downsLore: Dialogue = {
  bard: { speaker: 'A CROW WHO SINGS', prompt: 'Speak to the crow', lines: [
    'A coin for a song, or a song for nothing, if you stand downwind of me.',
  ], choices: [
    { text: 'Sing about the nations.', lines: [
      '"The farmland grows, the highlands guard, the holds look down from stone; the rivers trade with land and sea, the capital holds the throne."',
      'That\'s the version for children. The real one has a verse for the sea, and nobody sings it on land.',
    ] },
    { text: 'Tell me about the mountain holds.', lines: [
      'My people, more or less. Cities built up cliff faces, ranked by height. The higher your nest, the older your blood.',
      'The rookeries carry every message between the nations. Or did. The holds shut their gates this spring, and nobody\'s said why. A kingdom with no letters is a kingdom of rumours.',
    ] },
    { text: 'What is the oldest song you know?', lines: [
      'One about a time before mana, when big ate small and that was simply the weather.',
      'Then something gave everyone a little magic, and the small could bite back. The song doesn\'t say who. Songs never do.',
    ] },
  ] },
};
export const weirLore: Dialogue = {
  ferry: { speaker: 'A CRANE FERRYWOMAN', prompt: 'Speak to the crane', lines: [
    'Ferry\'s not running. River\'s too low below, too high above, and the church fishery owns the middle.',
  ], choices: [
    { text: 'Where does the river go?', lines: [
      'Down through the marsh to the river towns, then out to the sea. Everything ends up at the sea, one way or another.',
      'The river towns stand on stilts, half land and half water. The fish come upriver in barrels to be smoked and sent inland. Everyone there smells of it.',
    ] },
    { text: 'What is happening in the river towns?', lines: [
      'A sickness, they say. And the church\'s food stores going bad in the cellars.',
      'They\'re rounding up anyone with venom or poison in them, in case it\'s them. Frogs, newts, the odd snake. You can guess how that\'s going.',
    ] },
    { text: 'What is the lighthouse?', lines: [
      'There isn\'t one. Not on any chart I\'ve seen.',
      'But I\'ve ferried crates marked for it. Sealed with the church\'s wax. Headed downriver, to the sea.',
    ] },
  ] },
};

// The fort town: a garrison chaplain, a raven courier out of work, and a wolf who teaches the catechism.
export const fortLore: Dialogue = {
  chaplain: { speaker: 'THE GARRISON CHAPLAIN', prompt: 'Speak to the chaplain', lines: [
    'A convict of the church. You\'ve been through the basin more times than I\'ve said the rite.',
  ], choices: [
    { text: 'Why does the church only raise convicts?', lines: [
      'Officially: because a life given back must be a life owed. The condemned serve until they are used up.',
      'Unofficially: because nobody asks what the rite costs a convict. Imagine the questions if it were a duke.',
    ] },
    { text: 'What does it cost?', lines: [
      'Something each time. The ledgers call it "residue." The condemned call it forgetting.',
      'Where it goes, nobody writes down. "The tide keeps what it takes." We say it at funerals up here. Down there they say it at the basin.',
    ] },
    { text: 'What do carnivores believe?', lines: [
      'That we are the Covenant\'s proof. Anyone can keep a promise when they aren\'t hungry.',
      'Every wolf in this fort could break it tonight and doesn\'t. Every herbivore behind that wall prays we keep not doing it. That\'s faith, of a kind.',
    ] },
  ] },
  raven: { speaker: 'A RAVEN COURIER', prompt: 'Speak to the raven', lines: [
    'Courier of the holds, without anything to carry. Three months now.',
  ], choices: [
    { text: 'Why did the holds close?', lines: [
      '"By order of the house." That\'s all the gate said when I came back from my last run. No house signed it.',
      'I\'ve flown letters for twenty years. A house that won\'t sign its own orders is a house with a stranger in it.',
    ] },
    { text: 'What did the rookeries carry?', lines: [
      'Everything. Treaties, ration orders, love letters, the church\'s own mail. Every nation\'s secrets passed through our claws.',
      'The holds keep a copy of all of it, in the archive at the top. Every word ever sent. That\'s why we were trusted, and why we were feared.',
    ] },
    { text: 'What will you do now?', lines: [
      'Wait. Eat garrison fish, which I hate. Hope someone sends something worth carrying.',
    ] },
  ] },
  teacher: { speaker: 'A WOLF SCHOOLMISTRESS', prompt: 'Speak to the schoolmistress', lines: [
    'Lessons are at dawn, when the children are too cold to fidget. Now I\'m just a wolf in a square.',
  ], choices: [
    { text: 'What do you teach?', lines: [
      'Letters, sums, and the catechism. "What is the Covenant?" "No citizen eats another." "Who is a citizen?" "Everyone who sat at the Long Table, and their children."',
      '"Who did not sit?" The children ask that one. The catechism doesn\'t answer it. Insects, and the sea.',
    ] },
    { text: 'Do the children understand it?', lines: [
      'Better than the adults. They understand they\'re hungry, and that the hunger has rules, and that the rules were written somewhere warm.',
    ] },
    { text: 'What happened in the winter of no bread?', lines: [
      'We don\'t teach that. The church says it was a famine. The garrison says it was a siege by the farmland that nobody declared.',
      'The children\'s grandparents say it was a gravedigger, feeding them. Then they stop talking.',
    ] },
  ] },
};
