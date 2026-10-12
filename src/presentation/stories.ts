import type { Effect } from '../audio/effects';
import type { ThemeId } from '../audio/themes';
import type { Encounter } from '../rules/battle';
import type { Flag } from '../rules/world';

export type Tableau = 'home-table' | 'empty-cell' | 'feast' | 'feast-high-table' | 'feast-cup' | 'feast-fall' | 'feast-dead' | 'trial' | 'wake' | 'farmhouse' | 'ossuary' | 'hospice' | 'apothecary' | 'rookery' | 'archive' | 'laboratory' | 'church' | 'mill' | 'battlefield' | 'cell' | 'sea' | 'harbor' | 'kraken' | 'lighthouse';
export type Shot = { art: Tableau; caption: string; text: string; sound?: Effect; actors?: readonly string[]; flashback?: boolean };
export type Story = { id: string; title: string; subtitle: string; shots: readonly Shot[]; music?: ThemeId; finalAction?: string };

export const STORIES = {
  krakenSlain: {
    id: 'krakenSlain', title: 'The sea falls silent', subtitle: 'The capital harbor · The final stand', music: 'arena', finalAction: 'To the feast', shots: [
      { art: 'kraken', caption: 'ONE LAST OPENING', text: 'The bear catches the falling arm. Stone cracks beneath his feet. Above him, the vulture’s spell tears through the spray. “Now!” The frog’s toxin burns bright along your blade. The octopus parts the water. You let every hidden spark of mana blaze.', actors: ['kraken'], sound: 'spell' },
      { art: 'kraken', caption: 'THE KRAKEN FALLS', text: 'Your strike meets the light of four others. For a heartbeat, the harbor is white. Then the great crown breaks the surface one last time. Its arms fall beyond the wall, and a wave rises higher than the roofs.', actors: ['kraken'], sound: 'roar' },
      { art: 'harbor', caption: 'HOLD TOGETHER', text: 'The bear braces on the shattered pier. The octopus throws a barrier across it. Water crashes over the seawall until there is no sky, no city—only five shadows holding their ground. Then the wave passes.', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'barrier' },
      { art: 'harbor', caption: 'ALL FIVE', text: 'The frog counts heads before she catches her breath. The vulture lowers her weapon. The bear pulls you upright. “All five,” he says. Behind him, the octopus looks out to where the sea has closed.', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'victory' },
      { art: 'harbor', caption: 'THE BELLS RING AGAIN', text: 'A shout rises from the uphill road. Then another. By sunset, every nation’s banners hang over the great hall. The rulers have called a feast for the five who saved the kingdom. Tonight, they promise, you will be remembered.', sound: 'toll' },
    ],
  },
  prologue: {
    id: 'prologue', title: 'Before the tide turned', subtitle: 'The capital harbor · Before the feast', music: 'sea', finalAction: 'Face the Kraken', shots: [
      { art: 'harbor', caption: 'THE BELLS BEFORE DAWN', text: 'The harbor bell has not stopped. Beyond the seawall, masts disappear beneath the water. Families crowd the uphill road, carrying what they could reach in the dark.', sound: 'toll' },
      { art: 'harbor', caption: 'THE BEAR', text: 'The bear holds a broken gate above his shoulders while the last cart passes beneath it. “Up the hill. Keep going.” He waits until the child on the cart stops looking back.', actors: ['bear'], sound: 'chain' },
      { art: 'harbor', caption: 'THE VULTURE', text: 'The vulture lands on the wall beside you. “The outer pier is gone. The next strike reaches the houses.” She checks the others, then meets your eyes. “Five of us. Same as always.”', actors: ['hero', 'vulture'], sound: 'wind' },
      { art: 'harbor', caption: 'THE FROG', text: 'The frog ties a bandage around a dockworker’s arm and sends him after the cart. “Small dose for you. Something stronger for what’s out there.” Her hands are steady as she closes the medicine case.', actors: ['frog'], sound: 'page' },
      { art: 'sea', caption: 'THE OCTOPUS', text: 'The octopus stands at the edge of the pier, watching the water. “It has never come this close before.” You ask if it can be stopped. A long pause. “Get everyone off the docks first.”', actors: ['octopus'], sound: 'surf' },
      { art: 'kraken', caption: 'SOMETHING RISES', text: 'The sea draws back. A shape higher than the watchtower unfolds beyond the wall. You feel its mana before you can see its eyes. Behind you, the harbor bell falls silent.', actors: ['kraken'], sound: 'heartbeat' },
      { art: 'harbor', caption: 'THE FIVE', text: '“Bear, hold the front. Vulture, watch its arms. Frog, stay close. Octopus—with me.” You let your mana fade into the rain. The bear grins. “All five coming back?” You nod. “All five.”', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'gather' },
    ],
  },
  waking: {
    id: 'waking', title: 'What the tide keeps', subtitle: 'A memory, before the sentence', shots: [
      { art: 'feast', caption: 'THE NIGHT OF THE FEAST', text: 'The kraken hangs from the rafters, its suckers silvered with salt. For one night, nobody asks what kind of animal you are. You brought the others home.', actors: ['bear', 'vulture', 'frog', 'octopus'], sound: 'memory' },
      { art: 'feast-high-table', caption: 'THE COVENANT', text: 'The rulers raise their cups together. “No nation above another. No citizen hunted for what they are.” Everyone applauds. At the far end, the sea envoys do not.', sound: 'glass' },
      { art: 'feast', caption: 'THE BEAR', text: 'The bear laughs too loudly at a joke he has already told twice. He catches your eye and lifts his cup: “To coming back.”', actors: ['bear'], sound: 'memory' },
      { art: 'feast', caption: 'THE VULTURE', text: 'The vulture watches the doors while the others drink. “Someone has to remember this properly,” she says. “None of you will.”', actors: ['vulture'], sound: 'wind' },
      { art: 'feast', caption: 'THE LAST TOAST', text: 'The frog and the octopus argue over the last piece of bread. For once, neither is watching the room. You think you should remember this.', actors: ['frog', 'octopus'], sound: 'memory' },
      { art: 'feast-cup', caption: 'THE CUP', text: 'A hooded servant fills your cup again. The bear is still laughing. You try to remember what he said. You can remember the laughter.', sound: 'glass' },
      { art: 'feast-fall', caption: 'THE LAST CLEAR THING', text: 'The room leans. Candlelight runs into long gold lines. The cup slips from your hand. Someone is laughing, or calling for help. You cannot tell which.', sound: 'submerge' },
      { art: 'feast-fall', caption: 'VOICES UNDERWATER', text: '“He’s breathing.” “Leave him.” “The doors—check the doors!” The words drift past, slow and swollen, as if spoken from the bottom of the sea.', sound: 'heartbeat' },
      { art: 'feast-dead', caption: 'THE HALL', text: '“The rulers are dead.” “All of them?” Nobody answers. The chairs are still in their places. A dark hooded figure stands between the tables. Somewhere, someone keeps asking for the guards to open the doors.', sound: 'chain' },
      { art: 'trial', caption: 'THE ACCUSATION', text: 'The church official takes the high seat and opens the charge. “The five who killed the kraken. They were the last with the rulers.” You try to speak. Your mouth is dry. He writes down that you said nothing.', actors: ['church-official', 'hero'], sound: 'page' },
      { art: 'trial', caption: 'THE SENTENCE', text: '“By order of the regency, you will serve as a hero.” The official brings his hammer down. The brand burns into your wrist. “You will fight. You will die. The church will return you to service.”', actors: ['church-official', 'hero'], sound: 'chain' },
      { art: 'trial', caption: 'LED AWAY', text: 'You look for the others. Five brands glow in the dark. Guards take each of you through a different door. Someone calls you “hero.” You want to ask what happened. The memory is already gone.', sound: 'toll' },
      { art: 'wake', caption: 'MANY DEATHS LATER', text: 'A bell reaches you through the dark. Salt on your tongue. Cold stone beneath your cheek. You wake alone, with four empty places where your companions should be.', sound: 'toll' },
      { art: 'church', caption: 'THE CHURCH OF THE COVENANT', text: 'The priest tells you to stand. He has seen you die before. He says the sentence goes on. Outside, the kingdom waits for its hero.', sound: 'heartbeat' },
    ],
  },
  bear: {
    id: 'bear', title: 'The sound of his laughter', subtitle: 'A memory returns', shots: [
      { art: 'mill', caption: 'THE MILL', text: 'The chain stops moving. He looks at you as if no time has passed at all.', actors: ['bear'], sound: 'chain' },
      { art: 'feast', caption: 'BEFORE THE BRAND', text: 'A great paw steadies your cup. “To coming back,” he says. At the time, you thought it was a toast.', actors: ['bear'], sound: 'memory' },
      { art: 'mill', caption: 'SOMEONE STILL REMEMBERS', text: 'He says your name. For a moment, the space where it should be does not feel empty.', actors: ['bear'] },
    ],
  },
  vulture: {
    id: 'vulture', title: 'Trust the chameleon', subtitle: 'Ink remembers', shots: [
      { art: 'battlefield', caption: 'THE OLD BATTLEFIELD', text: 'She reads the note twice. The handwriting is hers. The certainty belongs to someone she no longer remembers being.', actors: ['vulture'], sound: 'wind' },
      { art: 'feast', caption: 'A VOICE ACROSS THE TABLE', text: '“If I forget,” she says, almost smiling, “you had better have proof.” You thought she was joking.', actors: ['vulture'], sound: 'memory' },
      { art: 'battlefield', caption: 'A SMALL ACT OF FAITH', text: 'She folds the paper along its old crease and puts it away. Then she stands beside you.', actors: ['vulture'] },
    ],
  },
  transfer: {
    id: 'transfer', title: 'A room without a name', subtitle: 'A fragment from the archive', shots: [
      { art: 'archive', caption: 'THE TRANSFER ORDER', text: 'Your brand number. Your old posting. A line in another hand: he is not to be told why.', sound: 'page' },
      { art: 'laboratory', caption: 'SOMETHING BEFORE THE FEAST', text: 'A white corridor. The weight of keys. You try to hold the image still, but the room at the end has no name.', sound: 'memory' },
    ],
  },
  boar: {
    id: 'boar', title: 'What they burned', subtitle: 'The farmland · lieutenant', music: 'wilds', finalAction: 'Face the boar', shots: [
      { art: 'farmhouse', caption: 'THE HOUSE AT THE BORDER', text: 'Grain carts wait outside the burned farm. Beyond the broken doorway, someone is sharing the last loaf with a child. The boar watches you approach without moving.', actors: ['boar'], sound: 'wind' },
      { art: 'farmhouse', caption: 'THE CLOSED ROAD', text: 'The boar steps outside. His followers gather behind him. You ask who ordered the blockade. “Someone who listened before he judged.” He closes the ledger without letting you read it.', actors: ['boar'], sound: 'chain' },
      { art: 'farmhouse', caption: 'NO ONE WAITED FOR PROOF', text: 'You tell him the highlands are starving. His jaw tightens. “They sent branded heroes to make me obey. Of course they did.” He plants his feet in the doorway. “If you want them, you go through me.”', actors: ['boar'], sound: 'heartbeat' },
    ],
  },
  hyena: {
    id: 'hyena', title: 'A place at her table', subtitle: 'The highlands · lieutenant', music: 'crypt', finalAction: 'Face the hyena', shots: [
      { art: 'ossuary', caption: 'BENEATH THE ABBEY', text: 'Names are scratched above the shelves. Every bone has a place. The hyena stops counting when your footsteps reach the bottom stair. “Have you come to take them away again?”', actors: ['hyena'], sound: 'wind' },
      { art: 'ossuary', caption: 'THE CHURCH’S WORD', text: 'You tell her the church sent you to stop the grave-eaters. She repeats the word quietly. “Still that name. They never learned any of ours.” Her followers turn toward the stair.', actors: ['hyena'], sound: 'heartbeat' },
      { art: 'ossuary', caption: 'THE HUNGER OUTLIVED THE FAMINE', text: '“They would rather we died politely.” She rises from her place among the bones. “You know what a sentence is. Tell me why yours deserves mercy and ours deserves a grave.”', actors: ['hyena'] },
    ],
  },
  viper: {
    id: 'viper', title: 'The dose makes the poison', subtitle: 'The marsh · lieutenant', music: 'marsh', finalAction: 'Face the viper', shots: [
      { art: 'apothecary', caption: 'THE CAREFUL HAND', text: 'Water reaches the medicine shelves. Each bottle is labelled in the same careful hand. The viper watches you read them. “They were cures before anyone decided they were evidence.”', actors: ['viper'], sound: 'submerge' },
      { art: 'apothecary', caption: 'THE RUINED STORES', text: 'You recognise the smell from the ruined food stores. The viper sees you understand. “Small dose, a cure. Large dose, a poison. They never cared about the difference until it reached their own table.”', actors: ['viper'] },
      { art: 'apothecary', caption: 'A HEALER, ONCE', text: '“When he lived, it was a miracle. When he died, it was my venom.” She knocks a stopper loose. Something bitter spreads across the water. “Keep your cures close, hero. You will need them.”', actors: ['viper'], sound: 'heartbeat' },
    ],
  },
  cuckoo: {
    id: 'cuckoo', title: 'A borrowed face', subtitle: 'The mountain holds · lieutenant', music: 'holds', finalAction: 'Face the cuckoo', shots: [
      { art: 'rookery', caption: 'THE CLOSED ROOKERY', text: 'The messenger cages are open and empty. At the far end of the gallery, the lord of the house waits for you. His expression arrives a little after his voice.', actors: ['cuckoo'], sound: 'wind' },
      { art: 'rookery', caption: 'THE FACE THAT ANSWERS', text: 'The lord smiles with your own mouth. For a moment the face belongs to someone you trust. Then it is yours again. “He said you would understand. He said you hide what you are too.”', actors: ['cuckoo'], sound: 'heartbeat' },
      { art: 'rookery', caption: 'THE HOUSE THAT RAISED HIM', text: '“I had a room at the top of this house.” His shape changes, but his voice stays small. “I only wanted to come home.” The doors close behind you. Three familiar mana signatures appear where only one stood.', actors: ['cuckoo'], sound: 'door' },
    ],
  },
  cuttlefish: {
    id: 'cuttlefish', title: 'What the sea is owed', subtitle: 'The ocean · lieutenant', music: 'sea', finalAction: 'Face the cuttlefish', shots: [
      { art: 'sea', caption: 'BENEATH THE FISHING LANES', text: 'The nets overhead are empty. Below them, colours pass beneath the cuttlefish’s skin like words beneath a page. You recognise a spell. It is one of yours.', actors: ['cuttlefish'], sound: 'surf' },
      { art: 'sea', caption: 'A TRAITOR TO THE SEA', text: 'The cuttlefish turns toward your companion. “You stood with them against our kin.” The water holds the silence between them. “Will you do it again?” Its skin repeats the shape of your last spell.', actors: ['cuttlefish'], sound: 'heartbeat' },
      { art: 'sea', caption: 'KIN TO THE KRAKEN', text: '“You called it peace because you could not hear us from the shore.” Its colours brighten. Every spell in your book seems to move beneath its skin. This time, the sea knows how you fight.', actors: ['cuttlefish'], sound: 'spell' },
    ],
  },

  boarAfter: {
    id: 'boarAfter', title: 'What the ashes remember', subtitle: 'After the battle · A story told by the defeated', music: 'hearth', finalAction: 'Return', shots: [
      { art: 'farmhouse', caption: 'AFTER THE BATTLE', text: 'The boar lowers his head. “The child was alive. He knew that when he came to my door.” He looks at the cold hearth, and tells you about the stranger who found him there.', actors: ['boar'], sound: 'memory' },
      { art: 'farmhouse', caption: 'EARLIER · A STRANGER AT THE DOOR', text: 'A hooded stranger stands in the doorway. “The child they said you ate was found alive.” The boar keeps his eyes on the ashes. “I know. Nobody came back to tell me.”', actors: ['boar', 'hooded'], flashback: true, sound: 'memory' },
      { art: 'farmhouse', caption: 'EARLIER · WHAT AN APOLOGY WOULD COST', text: '“If they admitted it,” the stranger says, “they would have to admit what they did to you.” The boar looks up. “What do you want?” “For once, let them be the ones who have to ask.”', actors: ['boar', 'hooded'], flashback: true },
      { art: 'farmhouse', caption: 'EARLIER · THE GRAIN ROAD', text: 'The stranger lays a route ledger on the scorched threshold. “Every cart passes your land. Close the road.” “There are hungry people beyond that pass.” “There are hungry people in this room. Who came for them?”', actors: ['boar', 'hooded'], flashback: true, sound: 'page' },
      { art: 'farmhouse', caption: 'WHAT THE BOSS LEAVES YOU', text: 'Among his things lies a cup from the feast. “The one with no fur,” a follower says. “He listened.” The grain carts begin to turn back toward the pass.', actors: ['boar'], sound: 'memory' },
    ],
  },

  hyenaAfter: {
    id: 'hyenaAfter', title: 'The guest at her table', subtitle: 'After the battle · A story told by the defeated', music: 'hearth', finalAction: 'Return', shots: [
      { art: 'ossuary', caption: 'AFTER THE BATTLE', text: 'The hyena settles beside the shelves. “He ate at my table. Never asked me to hide what I was.” She looks at the empty place next to her and begins to tell you why she trusted him.', actors: ['hyena'], sound: 'memory' },
      { art: 'ossuary', caption: 'EARLIER · ONE MORE PLACE', text: 'The hooded stranger accepts a seat beside her. She puts a bowl in front of him. “You know what they call me.” “I asked for supper,” he says. “I did not ask what they call you.”', actors: ['hyena', 'hooded'], flashback: true, sound: 'memory' },
      { art: 'ossuary', caption: 'EARLIER · THE FAMINE', text: '“I buried them until I could not lift the spade. Then I fed the living with what the dead no longer needed.” The stranger listens. “And they exiled you for keeping people alive.” She stares at her untouched bowl.', actors: ['hyena', 'hooded'], flashback: true },
      { art: 'ossuary', caption: 'EARLIER · A PROMISE FOR THE HUNGRY', text: '“The rations are shrinking,” he says. “They will blame the hungry again.” “What would you have me do?” “Tell them who the Covenant leaves outside. They already know hunger. Give it a name.”', actors: ['hyena', 'hooded'], flashback: true },
      { art: 'ossuary', caption: 'WHAT THE BOSS LEAVES YOU', text: 'She pushes a ration ledger across the floor. “The cuts started before the unrest. The church knew.” Her voice drops. “He eats anything. Like me. I thought that meant he understood.”', actors: ['hyena'], sound: 'memory' },
    ],
  },

  viperAfter: {
    id: 'viperAfter', title: 'The question he asked', subtitle: 'After the battle · A story told by the defeated', music: 'hearth', finalAction: 'Return', shots: [
      { art: 'apothecary', caption: 'AFTER THE BATTLE', text: 'The viper draws herself out of the poisoned water. “He asked what happened to my patient. Nobody else had.” She turns an empty bottle between her coils, remembering the day he came.', actors: ['viper'], sound: 'memory' },
      { art: 'apothecary', caption: 'EARLIER · A QUESTION NO ONE ASKED', text: 'The hooded stranger sets a patient record on her counter. “What happened to him?” Her answer catches in her throat. “You are the first person who asked.”', actors: ['viper', 'hooded'], flashback: true, sound: 'page' },
      { art: 'hospice', caption: 'EARLIER · THREE NIGHTS', text: '“I set his bones. Sat with him three nights. His fever broke, then came back.” The stranger waits for her to finish. “They saw my fangs and stopped reading the record.” “They had their answer before they entered the room.”', actors: ['viper', 'hooded'], flashback: true, sound: 'memory' },
      { art: 'apothecary', caption: 'EARLIER · THE WRONG DOSE', text: 'He turns a bottle in his sleeve. “The church stores feed every garrison. Spoil them, and the church will have to explain itself.” “People will fall ill.” “People like you already suffer. This time they will have to notice.”', actors: ['viper', 'hooded'], flashback: true, sound: 'glass' },
      { art: 'apothecary', caption: 'WHAT THE BOSS LEAVES YOU', text: '“Crates for the lighthouse,” she says. “That was where he wanted the shipments sent.” She does not know where it is. For the first time, she wonders why he never asked who would drink the poison.', actors: ['viper'], sound: 'memory' },
    ],
  },

  cuckooAfter: {
    id: 'cuckooAfter', title: 'A name beneath the ink', subtitle: 'After the battle · A story told by the defeated', music: 'hearth', finalAction: 'Return', shots: [
      { art: 'rookery', caption: 'AFTER THE BATTLE', text: 'The cuckoo has stopped changing faces. “He found the place where they scraped out my name.” His eyes go to the family register. “He made it sound like coming home.”', actors: ['cuckoo'], sound: 'memory' },
      { art: 'rookery', caption: 'EARLIER · BELOW THE HOUSE', text: 'The hooded stranger finds him beneath the roosts. “They raised you here.” “They called me son until someone counted the feathers.” “Did those feathers change how you loved them?” The cuckoo does not answer.', actors: ['cuckoo', 'hooded'], flashback: true, sound: 'memory' },
      { art: 'archive', caption: 'EARLIER · A NAME ON PAPER', text: 'The stranger opens the family register. Someone has scraped out a name. “They can erase ink,” he says. “They cannot erase every face you remember.” The cuckoo touches the damaged page. “I remember his voice too.”', actors: ['cuckoo', 'hooded'], flashback: true, sound: 'page' },
      { art: 'rookery', caption: 'EARLIER · BY ORDER OF THE HOUSE', text: '“Wear his face. Close the rookery. Let no order leave the holds.” “And then?” The stranger draws his hood closer. “Then they will learn what it means to call for someone who never comes.”', actors: ['cuckoo', 'hooded'], flashback: true },
      { art: 'rookery', caption: 'WHAT THE BOSS LEAVES YOU', text: '“He remembers you,” the cuckoo says. “He told me you opened a door.” Beyond the gallery, the first messenger takes flight. Whatever the stranger promised, the house is still here.', actors: ['cuckoo'], sound: 'memory' },
    ],
  },

  cuttlefishAfter: {
    id: 'cuttlefishAfter', title: 'The promise at the pier', subtitle: 'After the battle · A story told by the defeated', music: 'sea', finalAction: 'Return', shots: [
      { art: 'sea', caption: 'AFTER THE BATTLE', text: 'The cuttlefish lets the copied spells fade. “He stood where the land ended. Said there would be no church at sea.” It tells you about the stranger on the pier, and the promise the clans believed.', actors: ['cuttlefish'], sound: 'memory' },
      { art: 'harbor', caption: 'EARLIER · AT THE EDGE OF THE PIER', text: 'A hooded stranger waits on the pier. The cuttlefish surfaces beyond its posts. “The land calls your dead rations,” he says. “I thought you should know what it calls mine.”', actors: ['hooded', 'cuttlefish'], flashback: true, sound: 'memory' },
      { art: 'harbor', caption: 'EARLIER · THE NETS CAME FIRST', text: '“The kraken rose after they emptied a whole reef,” the cuttlefish says. “They killed it and celebrated.” The stranger does not look away. “They will keep taking from you as long as the ships return.”', actors: ['hooded', 'cuttlefish'], flashback: true, sound: 'surf' },
      { art: 'harbor', caption: 'EARLIER · NO MORE SHIPS', text: '“I can bring the clans together.” “Then close the fishing lanes,” he says. “Let the land discover what its peace costs.” “And the sea?” “The sea will answer to no church.” He steps back before it can ask what comes after.', actors: ['hooded', 'cuttlefish'], flashback: true },
      { art: 'sea', caption: 'WHAT THE BOSS LEAVES YOU', text: '“The island has a lighthouse,” it says. “The sea has always known where it is.” The fishing lanes remain closed. A different peace will have to be made; the stranger offered only an end.', actors: ['cuttlefish'], sound: 'memory' },
    ],
  },
  laboratory: {
    id: 'laboratory', title: 'The open door', subtitle: 'What they erased before the feast', shots: [
      { art: 'laboratory', caption: 'THE LABORATORY', text: 'The paper says guard. The paper says subject. Your hand remembers the keys before you remember either word.', sound: 'memory' },
      { art: 'cell', caption: 'THE CHILD', text: 'Small fingers curl around the bars. There is no monster in the cage. Only a child waiting to learn what you will do.', sound: 'heartbeat' },
      { art: 'laboratory', caption: 'THE DOOR', text: 'You turn the key. You step aside. For the rest of your life, they will try to take this moment from you.', sound: 'chain' },
      { art: 'sea', caption: 'YOU OPENED IT', text: 'The tide is louder now. The room is empty. You remember why the door is open.', sound: 'surf' },
    ],
  },
  kraken: {
    id: 'kraken', title: 'The other shore', subtitle: 'The sea remembers differently', shots: [
      { art: 'sea', caption: 'THE KRAKEN’S GRAVE', text: 'You remember banners, cheering, a kingdom calling you its saviour. Here there are no banners.', actors: ['octopus'], sound: 'surf' },
      { art: 'sea', caption: 'WHAT THE LAND CALLED A MONSTER', text: 'The nets came first. Then the kraken rose. Your companion cannot look at the water.', actors: ['octopus'], sound: 'memory' },
    ],
  },
  bearChain: {
    id:'bearChain',title:'What the chain holds',subtitle:'The bear · A memory given a home',music:'hearth',finalAction:'Walk on together',shots:[
      {art:'mill',caption:'THE OLD STONE',text:'The stone stays still behind him. A link of the chain rests between his paws. The mill can keep the rest.',actors:['bear'],sound:'chain'},
      {art:'home-table',caption:'BEFORE THE BRAND',text:'You remember his laugh at the feast. How he made room at the table. Before anyone called him dangerous, he was the one making sure everybody had eaten.',actors:['bear'],sound:'memory'},
      {art:'mill',caption:'SOMETHING THE TIDE CANNOT TAKE',text:'“You do not have to carry all of me in your head,” he says. You put the link beside the grimoire. It is small enough to keep. It is enough to remember.',actors:['hero','bear'],sound:'memory'},
      {art:'farmhouse',caption:'HIS OWN NEXT STEP',text:'He waits for you at the road. You do not give him an order. You ask which way he wants to go.',actors:['hero','bear']},
    ],
  },
  humanChallenge: {
    id:'humanChallenge',title:'The lives he carries',subtitle:'The lamp room · Before the last fight',music:'wake',finalAction:'Stand together',shots:[
      {art:'lighthouse',caption:'YOU REFUSE THE CUP',text:'You move the chair aside. “I came to clear our names. I came for the others. I am not staying here to watch you finish this.” The cup stays untouched.',actors:['hero'],sound:'glass'},
      {art:'laboratory',caption:'THE VOICES IN HIS HEAD',text:'He speaks with a voice you almost recognize. Then another. “Every time you woke, I woke with something else of yours. I could not make them stop.” The borrowed voices overlap until you hear your own.',sound:'memory'},
      {art:'lighthouse',caption:'NO MANA TO READ',text:'You look for the gathering light of a spell. Nothing. He lifts an empty hand. The force behind it belongs to everything you forgot. You will have to take it back, a piece at a time.',actors:['human'],sound:'heartbeat'},
      {art:'harbor',caption:'A REASON TO COME BACK',text:'You remember the promise before the kraken: all five coming back. This time, coming back means more than surviving. You turn toward the people beside you, and give the last order of your sentence.',actors:['hero','bear','vulture','frog','octopus'],sound:'gather'},
    ],
  },
  human: {
    id: 'human', title: 'The one who remembers', subtitle: 'At the end of the sea', shots: [
      { art: 'lighthouse', caption: 'THE LAMP ROOM', text: 'You search for a mana signature. There is nothing. Only a chair, a cup, and someone who has been waiting.', actors: ['human'], sound: 'toll' },
      { art: 'feast-cup', caption: 'A HAND AT YOUR CUP', text: 'No fur. No scales. No claws. You have seen those hands before.', sound: 'glass' },
      { art: 'lighthouse', caption: 'THE HUMAN', text: '“You opened the door.” He says it gently. As though it is the only thing about you he has never forgotten.', actors: ['human'], sound: 'memory' },
    ],
  },
} satisfies Record<string, Story>;
export type StoryId = keyof typeof STORIES;
export const STORY_FLAGS: Partial<Record<Flag, StoryId>> = {
  'bear-quest-complete':'bearChain', 'bear-free': 'bear', 'vulture-free': 'vulture', 'lab-remembered': 'transfer', 'house-seen': 'laboratory', 'grave-seen': 'kraken',
};

export function resurrectionStory(names: readonly string[]): Story {
  return { id: 'resurrection', title: 'Something does not return', subtitle: 'The price of another morning', shots: [
    { art: 'sea', caption: 'BELOW THE SURFACE', text: 'For a moment, there is no pain. You hold on to a voice, a place, the shape of a familiar face. The tide pulls the other way.', sound: 'submerge' },
    { art: 'church', caption: names.join(' · ').toUpperCase(), text: 'A bell reaches you through the water. You wake with one less reason to recognise its sound.', sound: 'toll' },
  ] };
}

export const BOSS_STORIES: Partial<Record<Encounter, StoryId>> = {
  human:'humanChallenge', boar: 'boar', hyena: 'hyena', viper: 'viper', cuckoo: 'cuckoo', cuttlefish: 'cuttlefish' };

export const BOSS_AFTERMATH: Partial<Record<Encounter, StoryId>> = { boar: 'boarAfter', hyena: 'hyenaAfter', viper: 'viperAfter', cuckoo: 'cuckooAfter', cuttlefish: 'cuttlefishAfter' };
