import type { Dialogue } from './dialogue';

// The rivers and marsh: a sickness in the river towns, the church's stores spoiling, and a healer blamed for it.
// People talk about what is in front of them. Names are placeholders.

// The causeway: boardwalks through the fog from the ferry landing to Wickmere.
export const causeway: Dialogue = {
  'causeway-sign': { speaker: 'A SIGN ON THE JETTY', prompt: 'Read the sign', lines: [
    'WICKMERE. SICKNESS. TURN BACK.',
    'Under it, smaller, in another hand: the church is here, so it\'s safe. Under that, in a third: it isn\'t.',
  ] },
  fisher: { speaker: 'AN OLD COYPU', prompt: 'Speak to the coypu', lines: [
    'Don\'t come any closer. Not for my sake. For yours. Everybody in town is coughing.',
    'I eat what I catch, out here. I don\'t eat the church\'s fish any more. I haven\'t been sick once.',
  ], choices: [
    { text: 'Why are you out here?', lines: [
      'I bite. Everyone with teeth like mine is out here now, or in the magistrate\'s cage.',
      'They decided the sickness is something we carry. It started when the new barrels came upriver. Nobody wants to hear that part.',
    ] },
    { text: 'What about the reed beds?', lines: [
      'They used to burn them every spring. The church said burning was wasteful. Now they breed out there by the thousand.',
      'The ferryman won\'t cross at dusk any more. They come off the reeds and take whoever is on the water.',
    ] },
  ] },
  bones: { speaker: 'ON THE MUD', prompt: 'Look at the bones', lines: [
    'A heron, picked clean by something small and patient.',
    'Beside it, a church ration tin, still sealed. He died before he could open it, or he knew better.',
  ] },
  nest: { speaker: 'THE REED BEDS', prompt: 'Look into the reeds', lines: [
    'The reeds are hung with eggs the size of a fist, sweating in the fog. Something is moving in every one of them.',
  ], variants: [{ if: { flag: 'brood-slain' }, lines: [
    'The eggs have gone grey and still. Nothing will hatch out here this year.',
  ] }] },
};

// Wickmere: the stilt town where the river meets the tide.
export const wickmere: Dialogue = {
  magistrate: { speaker: 'THE MAGISTRATE', prompt: 'Speak to the heron', lines: [
    'Church business? Good. Then you know what we\'re dealing with. A sickness carried by venom. It\'s in their blood, and their blood is in the water.',
    'Every venomous soul in Wickmere has been asked to present themselves. Most have. The rest will be found.',
  ], variants: [{ if: { flag: 'viper-slain' }, lines: [
    'The sickness has stopped. I have written to the church that it was a venomous outbreak, properly contained.',
    'Don\'t look at me like that. I have to write something.',
  ] }], choices: [
    { text: 'What happens to the ones you catch?', lines: [
      'They\'re held until the sickness passes. Then they\'re moved somewhere they can\'t do any harm.',
      'Nobody has asked me where, and I haven\'t asked the church.',
    ] },
    { text: 'Let the newt go. I\'ll pay her fine. (20 coins)', if: { all: [{ coins: 20 }, { not: { flag: 'newt-freed' } }] }, lines: [
      'He counts it twice. "There is no fine for this. But there is now."',
      'He unlocks the cage and doesn\'t watch her go.',
    ], then: { pay: 20, set: 'newt-freed' } },
  ] },
  newt: { speaker: 'A NEWT IN THE CAGE', prompt: 'Speak to the newt', hiddenIf: [{ flag: 'newt-freed' }], lines: [
    'I\'m not sick. I\'ve never been sick. My skin\'s poison if you lick it, and nobody has ever licked me.',
    'They took my little brother first. He\'s eight.',
  ] },
  ferryman: { speaker: 'THE FERRYMAN', prompt: 'Speak to the beaver', lines: [
    'The far bank? Nobody goes over there now. The church storehouse is on the far bank, and the old apothecary, under water to the sills.',
    'I don\'t cross at dusk any more. The mosquitoes come off the reed beds on the causeway and take whoever\'s on the water. Kill the thing that\'s laying them, and I\'ll teach you a better way over than my boat.',
  ], variants: [{ if: { flag: 'channel-firm' }, lines: [
    'Speak the word at the channel, and walk. Don\'t look down. It holds better if you don\'t.',
  ] }], choices: [
    { text: 'The reed-bed queen is dead.', if: { all: [{ flag: 'brood-slain' }, { not: { flag: 'channel-firm' } }] }, ends: true, lines: [
      'He looks at you a long while, then up at the reeds, as if he can hear the difference.',
      '"Then here. It\'s an old river word. Say it over still water and the water remembers it was ice once."',
      '"My father taught it to me so we\'d never need the ferry. Then the church licensed the ferry, and we needed it."',
      'Still the water joins the grimoire. The channel will hold you now.',
    ], then: { learn: 'Still the water', set: 'channel-firm' } },
    { text: 'What happened to the apothecary?', lines: [
      'There was a healer in it. A viper. Best hands on the river. When a patient of hers died, they said she bit him.',
      'They flooded the shop with her in it. Opened the dyke and walked away. She didn\'t drown. That\'s the part people don\'t say.',
    ] },
  ] },
  smoker: { speaker: 'AN OTTER AT THE SMOKEHOUSE', prompt: 'Speak to the otter', lines: [
    'The barrels come up from the coast. We smoke the fish, the church stamps it, the carts take it inland to the carnivores. That\'s Wickmere. That\'s all Wickmere is.',
    'This season\'s barrels came up already open. Resealed. Fresh wax over old. The church said a seal is a seal.',
  ], choices: [
    { text: 'Who gets sick?', lines: [
      'Whoever eats from the church stores. The poor, mostly, because they don\'t have anything else.',
      'My husband didn\'t eat it. I did. I\'m fine. I don\'t understand anything any more.',
    ] },
  ] },
  widow: { speaker: 'A STOAT IN BLACK', prompt: 'Speak to the stoat', lines: [
    'They wouldn\'t let me into the hospice. They said it was catching. They sent his boots back.',
    'He was sick after supper. Not after a cough. Not after a fever. After supper.',
  ] },
  child: { speaker: 'A VOLE CHILD', prompt: 'Speak to the child', lines: [
    'We\'re not allowed to go near the hospice. You can hear them at night.',
    'Mum says the sick ones are being punished. I asked what for and she said shush.',
  ] },
  mourner: { speaker: 'AN OLD WATER RAT', prompt: 'Speak to the water rat', lines: [
    'They burned his cot on the deck. The sister said that\'s how you stop it spreading.',
    'It didn\'t spread to me. I slept beside him every night. Write that down for the church if you\'re writing things down.',
  ] },
  herbalist: { speaker: 'THE HERBALIST', prompt: 'Speak to the herbalist', lines: [
    'Antivenom, mostly. It\'s the only thing anybody buys now. It doesn\'t help with plague, and they buy it anyway.',
    'If you\'re asking me, I don\'t sell it for plague.',
  ], then: { shop: 'herbalist' } },
  notice: { speaker: 'THE NOTICE BOARD', prompt: 'Read the notice', lines: [
    'BY ORDER OF THE MAGISTRATE, FOR THE SAFETY OF THE TOWN: all venomous persons to present themselves at the cage.',
    'Pinned below it, a church notice: THE HOSPICE IS UNDER THE PROTECTION OF THE COVENANT. Someone has scratched out PROTECTION and written WATCH.',
  ] },
  barrels: { speaker: 'THE BARRELS', prompt: 'Look at the barrels', lines: [
    'Church fish barrels, stamped with the Covenant seal, waiting to be smoked. The wax on every one of them is newer than the stamp.',
  ] },
};

// The hospice: a long ward of cots, the sister who keeps it, and the frog behind the grate.
export const hospice: Dialogue = {
  sister: { speaker: 'THE SISTER', prompt: 'Speak to the stork', lines: [
    'The church sent you? Good. Then you guard the door, and I\'ll guard her.',
    'She heals better than I do. That\'s why she\'s behind the grate. A poisoner who heals is the most dangerous kind.',
  ], variants: [{ if: { flag: 'viper-slain' }, lines: [
    'Nobody new has come in since the stores stopped spoiling. The ones who are left are getting better. I don\'t know what to tell the church.',
    'Take the bell. I rang it every time one of them died. Nobody needs to ring it now.',
  ], then: { find: 'hospice-bell' } }, { if: { flag: 'frog-free' }, lines: [
    'You took her. Fine. The church\'s convicts can look after the church\'s poisoner.',
  ] }], choices: [
    { text: 'What is the sickness?', lines: [
      'Plague. The church says plague.',
      'It comes on after meals, and it doesn\'t pass from bed to bed, and it isn\'t plague. But the church says plague.',
    ] },
  ] },
  frog: { speaker: 'THE FROG', prompt: 'Speak to the frog', hiddenIf: [{ flag: 'frog-free' }], portrait: 'frog', lines: [
    'You. Of course it\'s you. They sent the convicts to guard the ward. That\'s funny, if you think about it.',
    'I\'m not coming with you. I\'m useful here. I\'m not useful anywhere you go.',
  ], choices: [
    { text: 'Do you remember me?', lines: [
      'I remember the kraken. I remember you on the harbour wall, after, shaking so hard you couldn\'t hold a cup. I held it for you.',
      'I don\'t remember the feast. Nobody does. That used to make me sure we didn\'t do it. Now it makes me sure of nothing.',
    ] },
    { text: 'We were framed.', lines: [
      'Maybe. I said that too, for a while. Then I stopped dying long enough to listen to people.',
      'Everyone in this ward was sure they hadn\'t done anything, either. Being sure isn\'t proof.',
    ] },
    { text: 'Come with me.', if: { not: { has: 'venom-vial' } }, lines: [
      'To do what? Hit things? I can do more good with a basin than you\'ve ever done with a fist.',
      'Show me what\'s killing these people, and I\'ll come and stop it. Not for you. For them.',
    ] },
    { text: 'It isn\'t plague. It\'s poison.', if: { has: 'venom-vial' }, ends: true, lines: [
      'She takes the vial through the grate, uncorks it, and smells it. Then she puts a drop on the back of her hand and waits.',
      '"Viper. Milked, and cut thin, and put in the food." She is quiet for a long time. "I\'ve been treating them for plague."',
      'She calls the sister over, and says something you don\'t hear. The sister unlocks the grate.',
      '"I\'m coming to stop a poisoner. Not to help you. Don\'t ask me to remind you of anything. I haven\'t decided if you deserve it."',
      'The frog joins the party.',
    ], then: { take: 'venom-vial', set: 'frog-free' } },
  ] },
  'patient-1': { speaker: 'A SICK BADGER', prompt: 'Speak to the badger', lines: [
    'I only had the soup. The church soup. I want to say that to someone who\'ll remember it.',
  ] },
  'patient-2': { speaker: 'A SICK HARE', prompt: 'Speak to the hare', lines: [
    'Are you the ones they sentenced? They say you killed the kings. You don\'t look like much.',
    'Nobody in here looks like much.',
  ] },
  'patient-3': { speaker: 'AN EMPTY COT', prompt: 'Look at the cot', lines: [
    'The blanket has been folded with great care. Whoever folded it knew they would not be back to unfold it.',
  ] },
  basin: { speaker: 'THE BASIN', prompt: 'Look at the basin', lines: [
    'The frog\'s basin, full of clean water and a cloth. She changes the water every hour. The sister says she does it to look busy.',
  ] },
  'ward-book': { speaker: 'THE WARD BOOK', prompt: 'Read the ward book', lines: [
    'Admitted, and the hour of admission. Almost every line says: after supper.',
    'In the margin, in a smaller hand: they don\'t catch it from each other. Under it, crossed out: it\'s the food.',
  ] },
};

// The far bank: the spoiled church storehouse, and the flooded apothecary at the water's edge.
export const farBank: Dialogue = {
  'store-gate': { speaker: 'THE CHURCH STOREHOUSE', prompt: 'Examine the storehouse', lines: [
    'The church\'s river stores, where the fish was kept before it went inland. The roof has come in. The smell is the same smell as the hospice.',
  ] },
  vial: { speaker: 'AMONG THE SACKS', prompt: 'Search the sacks', hiddenIf: [{ not: { flag: 'apprentice-slain' } }, { has: 'venom-vial' }, { flag: 'frog-free' }], lines: [
    'Under the apprentice\'s apron, on a cord: a little stoppered vial of something clear, and a dropper.',
    'Every sack in the store has a tiny hole in the top, the size of the dropper.',
    'You take the vial. It would be lost if you fell.',
  ], then: { give: 'venom-vial' } },
  manifest: { speaker: 'SEALED CRATES', prompt: 'Look at the sealed crates', lines: [
    'Three crates nobody has spoiled, sealed in black wax and marked in a careful church hand: FOR THE LIGHTHOUSE.',
    'There is no lighthouse on this river. There is no lighthouse anywhere that you know of. The crates are heavy, and they slosh.',
  ], then: { set: 'manifest-read' } },
};

// The flooded apothecary: the viper's shop, sunk to its sills.
export const apothecary: Dialogue = {
  viper: { speaker: 'THE VIPER', prompt: 'Speak to the viper', portrait: 'viper', hiddenIf: [{ flag: 'viper-challenged' }, { flag: 'viper-slain' }], lines: [
    'She lifts her head off the counter. The water around her is very still.',
    '"Another one of the frog\'s. She sends me her patients, one way or another."',
  ], choices: [
    { text: 'Why poison the stores?', lines: [
      '"I sat up three nights with a boy who\'d broken his leg on the dyke. He died of a fever. Fevers do that."',
      '"They said I bit him. They opened the dyke and walked away and let the river in on me. Now the river towns eat what I give them. It seems fair."',
    ] },
    { text: 'Who is the one with no fur?', lines: [
      '"He came down here with a lamp, after they flooded me. He sat on the stairs and asked me what really happened to the boy."',
      '"Nobody else ever asked. Not the magistrate. Not the church. Not your frog."',
    ] },
    { text: 'What is the lighthouse?', lines: [
      '"Somewhere the fish goes, instead of inland. Ask him. He likes to be asked things."',
    ] },
    { text: 'It ends here.', ends: true, lines: [
      '"Everybody\'s sick when they come in here. You were sick when you came through the door."',
      'She uncoils from the counter, and the water moves at last.',
    ], then: { set: 'viper-challenged' } },
  ] },
  ledger: { speaker: 'HER PATIENT BOOK', prompt: 'Read the patient book', lines: [
    'Years of patients in a neat, small hand. Fevers set, bones set, a calf turned, a child\'s croup.',
    'One name, near the end, is crossed out so hard the page has torn.',
  ] },
  cure: { speaker: 'THE SHELF', prompt: 'Look at the shelf', lines: [
    'Jars of antivenom, labelled in her hand, years old. She made the cure before anyone in the river towns needed it.',
  ] },
  den: { speaker: 'THE VIPER', prompt: 'Speak to the viper', portrait: 'viper', hiddenIf: [{ not: { flag: 'viper-slain' } }], lines: [
    'She lies half in the water, too tired to hold her head up.',
    '"He was the only one who ever asked what really happened. The man with no fur. Remember that, when you meet him. He asks."',
    '"Tell the frog the boy died of a fever. She won\'t believe it either."',
  ] },
};
