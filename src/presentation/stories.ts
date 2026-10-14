import type { Effect } from '../audio/effects';
import type { ThemeId } from '../audio/themes';
import type { Encounter } from '../rules/battle';
import type { Flag } from '../rules/world';

export type Tableau = 'house-hall' | 'house-threshold' | 'family-register' | 'rookery-open' | 'island-shore' | 'lamp-room' | 'cell-open' | 'home-table' | 'empty-cell' | 'feast' | 'feast-high-table' | 'feast-cup' | 'feast-fall' | 'feast-dead' | 'trial' | 'wake' | 'farmhouse' | 'farmhouse-hearth' | 'grain-road' | 'grain-road-open' | 'ossuary' | 'hospice' | 'apothecary' | 'rookery' | 'archive' | 'laboratory' | 'church' | 'mill' | 'battlefield' | 'cell' | 'sea' | 'harbor' | 'kraken' | 'lighthouse';
export type Shot = { art: Tableau; caption: string; text: string; sound?: Effect; actors?: readonly string[]; flashback?: boolean; staging?: Readonly<Partial<Record<string, { x: number; ground: number; size?: number }>>> };
export type Story = { id: string; title: string; subtitle: string; shots: readonly Shot[]; music?: ThemeId; finalAction?: string };

export const STORIES = {
  krakenSlain: {
    id: 'krakenSlain', title: 'The sea falls silent', subtitle: 'The capital harbor · The final stand', music: 'arena', finalAction: 'To the feast', shots: [
      { art: 'kraken', caption: 'THE KRAKEN FALLS', text: 'The bear catches the falling arm. The vulture\'s spell, the frog\'s toxin, the octopus parting the water, and your blade, all at once. The kraken\'s crown breaks the surface one last time and goes under.', actors: ['kraken'], sound: 'roar' },
      { art: 'harbor', caption: 'ALL FIVE', text: 'The wave that follows comes over the seawall. Five shadows hold their ground, and then it passes. The frog counts heads. The bear pulls you upright. “All five,” he says.', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'victory' },
      { art: 'harbor', caption: 'THE BELLS RING AGAIN', text: 'By sunset, every nation\'s banners hang over the great hall. The rulers have called a feast for the five. Tonight, they promise, you will be remembered.', sound: 'toll' },
    ],
  },
  prologue: {
    id: 'prologue', title: 'Before the tide turned', subtitle: 'The capital harbor · Before the feast', music: 'sea', finalAction: 'Face the Kraken', shots: [
      { art: 'harbor', caption: 'THE BELLS BEFORE DAWN', text: 'The harbour bell has not stopped. Past the seawall, masts are going under. Families crowd the hill road with whatever they could carry in the dark. The bear holds a broken gate up over the last cart.', actors: ['bear'], sound: 'toll' },
      { art: 'harbor', caption: 'THE OTHERS', text: 'The vulture lands on the wall: the outer pier is gone. The frog binds a dockworker\'s arm and sends him up the hill. The octopus stands at the end of the pier, watching the water. “It has never come this close.”', actors: ['hero', 'vulture', 'frog', 'octopus'], sound: 'wind' },
      { art: 'kraken', caption: 'SOMETHING RISES', text: 'The sea draws back. A shape taller than the watchtower unfolds beyond the wall. You feel its mana before you see its eyes. Behind you, the harbour bell stops.', actors: ['kraken'], sound: 'heartbeat' },
      { art: 'harbor', caption: 'THE FIVE', text: '“Bear, hold the front. Vulture, watch its arms. Frog, stay close. Octopus, with me.” The bear grins. “All five coming back?” You nod. “All five.”', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'gather' },
    ],
  },
  waking: {
    id: 'waking', title: 'What the tide keeps', subtitle: 'A memory, before the sentence', shots: [
      { art: 'feast', caption: 'THE NIGHT OF THE FEAST', text: 'The kraken hangs from the rafters, its suckers silvered with salt. For one night, nobody asks what kind of animal you are. You brought the others home.', actors: ['bear', 'vulture', 'frog', 'octopus'], sound: 'memory' },
      { art: 'feast-high-table', caption: 'THE COVENANT', text: 'The rulers raise their cups together. “No nation above another. No citizen hunted for what they are.” Everyone applauds. At the far end, the sea envoys do not.', sound: 'glass' },
      { art: 'feast', caption: 'THE FIVE', text: 'The bear laughs at a joke he has already told twice and lifts his cup: “To coming back.” The vulture watches the doors. The frog and the octopus argue over the last of the bread.', actors: ['bear', 'vulture', 'frog', 'octopus'], sound: 'memory' },
      { art: 'feast-cup', caption: 'THE CUP', text: 'A hooded servant fills your cup again. You can\'t remember what the bear just said. You can remember the laughter.', sound: 'glass' },
      { art: 'feast-fall', caption: 'THE LAST CLEAR THING', text: 'The room leans. The candles run into long gold lines. The cup slips from your hand. “He\'s breathing.” “Leave him.” The voices come from the bottom of the sea.', sound: 'submerge' },
      { art: 'feast-dead', caption: 'THE HALL', text: 'The rulers are dead, all of them, still in their chairs. A hooded figure stands between the tables. Someone keeps shouting for the doors.', sound: 'chain' },
      { art: 'trial', caption: 'THE ACCUSATION', text: 'The church official takes the high seat and reads the charge. “The five who killed the kraken. They were the last with the rulers.” You try to speak. Your mouth is dry. He writes down that you said nothing.', actors: ['church-official', 'hero'], sound: 'page' },
      { art: 'trial', caption: 'THE SENTENCE', text: '“By order of the regency, you will serve as a hero.” The hammer comes down. The brand burns into your wrist. “You will fight. You will die. The church will return you to service.”', actors: ['church-official', 'hero'], sound: 'chain' },
      { art: 'wake', caption: 'MANY DEATHS LATER', text: 'Guards take the five of you through five different doors. Then a bell, a long way off. Salt on your tongue. Cold stone. You wake in the church alone, and the priest tells you to stand. He has seen you die before.', sound: 'toll' },
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
      { art: 'grain-road', caption: 'CARTS WITHOUT DRIVERS', text: 'The grain carts have been left across the road. Beyond them, smoke-black beams stand against the sky. No one has repaired the house. No one has come to ask permission to pass.', sound: 'wind' },
      { art: 'farmhouse', caption: 'THE HOUSE AT THE BORDER', text: 'The boar watches you from the broken doorway. A badger and a rat stand behind him. Their weapons are tools worn smooth by work. He moves in front of them before you say a word.', actors: ['boar', 'badger', 'rat'], sound: 'chain' },
      { art: 'farmhouse-hearth', caption: 'THE LAST LOAF', text: 'Inside, a loaf has been divided into three small pieces. You tell him the highlands are starving. He looks back at the cold hearth. “People were hungry here before anyone cared about that road.”', actors: ['boar'], sound: 'page' },
      { art: 'farmhouse-hearth', caption: 'SOMEONE WHO LISTENED', text: 'You ask who ordered the blockade. “Someone who listened before he judged.” The boar closes a route ledger. The badger looks at it, then lowers his eyes. Neither of them gives you a name.', actors: ['boar', 'badger'], sound: 'heartbeat' },
      { art: 'farmhouse', caption: 'NO ONE WAITED FOR PROOF', text: '“They sent branded heroes to make me obey. Of course they did.” He plants his feet in the doorway. Behind him, the rat tightens both hands around a cudgel. “If you want them, you go through me.”', actors: ['boar', 'badger', 'rat'], sound: 'heartbeat' },
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
      { art: 'house-hall', caption: 'THE SILENT HOUSE', text: 'Beyond the sealed rookery, the great hall is silent. Under the family banners, the lord of the house waits for you. His expression arrives a little after his voice.', actors: ['cuckoo'], sound: 'wind' },
      { art: 'house-hall', caption: 'THE FACE THAT ANSWERS', text: 'The lord smiles with your own mouth. For a moment the face belongs to someone you trust. Then it is yours again. “He said you would understand. He said you hide what you are too.”', actors: ['cuckoo'], sound: 'heartbeat' },
      { art: 'house-hall', caption: 'THE HOUSE THAT RAISED HIM', text: '“I had a room at the top of this house.” His shape changes, but his voice stays small. “I only wanted to come home.” The doors close behind you. Three familiar mana signatures appear where only one stood.', actors: ['cuckoo'], sound: 'door' },
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
    id: 'boarAfter', title: 'What the ashes remember', subtitle: 'After the battle · A story told by the defeated', music: 'hearth', finalAction: 'Return to the farm', shots: [
      { art: 'farmhouse-hearth', caption: 'AFTER THE BATTLE', text: 'The rat drops his cudgel. The badger kneels beside the boar, who turns away from your brand. “The child was alive. He knew that when he came to my door.” His eyes settle on the cold hearth. He begins to tell you.', actors: ['boar', 'badger', 'rat'], sound: 'memory' },
      { art: 'farmhouse', caption: 'A STRANGER AT THE DOOR', text: 'A hooded stranger stands in the doorway. “The child they said you ate was found alive.” The boar keeps his eyes on the ashes. “I know. Nobody came back to tell me.”', actors: ['boar', 'hooded'], flashback: true, sound: 'memory' },
      { art: 'farmhouse-hearth', caption: 'WHAT AN APOLOGY WOULD COST', text: '“If they admitted it,” the stranger says, “they would have to admit what they did to you.” The boar looks up. “What do you want?” “For once, let them be the ones who have to ask.”', actors: ['boar', 'hooded'], flashback: true },
      { art: 'farmhouse-hearth', caption: 'THE GRAIN ROAD', text: 'The stranger lays a route ledger on the scorched threshold. “Every cart passes your land. Close the road.” “There are hungry people beyond that pass.” “There are hungry people in this room. Who came for them?”', actors: ['boar', 'hooded'], flashback: true, sound: 'page' },
      { art: 'farmhouse-hearth', caption: 'BACK AT THE COLD HEARTH', text: 'The doorway is empty again. The boar closes his eyes. “Move the carts.” The badger starts to object, then stops. “Feed them,” the boar says. “This house has had enough of hungry people.”', actors: ['boar', 'badger'], sound: 'wind' },
      { art: 'farmhouse-hearth', caption: 'A CUP THAT DOES NOT BELONG HERE', text: 'A gilded cup lies beside the ledger. You know its shape from the feast. The rat follows your gaze. “The one with no fur brought it. No claws, either. He listened.” You leave the cup where you can examine it.', actors: ['rat'], sound: 'glass' },
      { art: 'grain-road-open', caption: 'THE FIRST CART THROUGH', text: 'Outside, a wheel turns out of its rut. The badger takes one side; the rat takes the other. The road to the highlands opens a cart-width at a time. Behind you, the burned house stays burned.', sound: 'chain' },
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
    id: 'cuckooAfter', title: 'The place that was his', subtitle: 'After the battle · The cuckoo’s account', music: 'hearth', finalAction: 'Return to the holds', shots: [
      { art: 'house-hall', caption: 'BENEATH THE BANNERS', text: 'The cuckoo stays on the floor when the fighting stops. The lord’s face is gone. “That chair was his,” he says. “Mine was beside it.” He looks toward the empty place, and begins.', actors: ['cuckoo'], staging: { cuckoo: { x: 370, ground: 382 } }, sound: 'wind' },
      { art: 'house-hall', caption: 'YEARS EARLIER · A PLACE AT THE TABLE', text: 'Before the house knew what he was, the lord saved him a place at supper. “Tell me what you saw from the roof.” The young bird talked until the candles guttered. Nobody counted his feathers then.', actors: ['falcon-lord', 'cuckoo'], staging: { 'falcon-lord': { x: 535, ground: 292 }, cuckoo: { x: 370, ground: 292, size: 64 } }, flashback: true, sound: 'memory' },
      { art: 'family-register', caption: 'THE FAMILY REGISTER', text: 'A scholar examined the shell kept from his hatching. The household opened its register. A clerk scraped away the name they had written there when he was small. He waited for his father to stop the knife. His father said nothing.', staging: {}, flashback: true, sound: 'page' },
      { art: 'house-threshold', caption: 'OUTSIDE HIS OWN DOOR', text: 'They put his things on the stair. “The house cannot keep an impostor.” From outside, he heard supper being called. The same bell. The same voices. The door stayed shut.', actors: ['cuckoo'], staging: { cuckoo: { x: 390, ground: 386 } }, flashback: true, sound: 'door' },
      { art: 'house-threshold', caption: 'LATER · THE STRANGER ON THE STAIR', text: 'The hooded stranger sits two steps below him. “You still come back.” “I keep thinking he will open the door.” The stranger waits. “Would he listen if the voice on the other side were his own?”', actors: ['cuckoo', 'hooded'], staging: { cuckoo: { x: 390, ground: 386 }, hooded: { x: 570, ground: 416 } }, flashback: true, sound: 'heartbeat' },
      { art: 'house-hall', caption: 'A BORROWED AUTHORITY', text: 'The stranger brings him through a servants’ passage. The cuckoo wears the lord’s face; the guards bow. “The real lord is below, alive,” the stranger says. “Now give the order. Close the rookery.” For the first time since his exile, the house obeys him.', actors: ['falcon-lord', 'hooded'], staging: { 'falcon-lord': { x: 450, ground: 338 }, hooded: { x: 650, ground: 380 } }, flashback: true, sound: 'door' },
      { art: 'rookery', caption: 'WHAT THE ORDER COST', text: 'He seals the doors. Appeals for grain, warnings of sickness, letters asking whether someone is alive: all of them stay in the sacks. “How long?” he asks. “Until the nations have learned to listen,” the stranger says. He never names a day.', actors: ['cuckoo', 'hooded'], staging: { cuckoo: { x: 355, ground: 390 }, hooded: { x: 610, ground: 390 } }, flashback: true, sound: 'page' },
      { art: 'house-hall', caption: 'BACK BENEATH THE BANNERS', text: '“I thought he was giving my home back.” The cuckoo looks at the borrowed chair. “He only needed the doors shut.” He points toward the cellar stair. “The lord is down there. I do not know what I want him to say anymore.”', actors: ['cuckoo'], staging: { cuckoo: { x: 370, ground: 382 } }, sound: 'wind' },
      { art: 'rookery-open', caption: 'LET THEM GO', text: 'The first messenger rises from the gallery. The cuckoo watches without changing shape. “The stranger knew you. He said you opened a door for him once.” He leaves the gallery doors open. “Open another.”', actors: ['cuckoo'], staging: { cuckoo: { x: 355, ground: 390 } }, sound: 'memory' },
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
      { art: 'cell-open', caption: 'THE DOOR', text: 'You turn the key. You step aside. For the rest of your life, they will try to take this moment from you.', sound: 'chain' },
      { art: 'empty-cell', caption: 'YOU OPENED IT', text: 'The tide is louder now. The room is empty. You remember why the door is open.', sound: 'surf' },
    ],
  },
  kraken: {
    id: 'kraken', title: 'The other shore', subtitle: 'The sea remembers differently', shots: [
      { art: 'island-shore', caption: 'THE KRAKEN’S GRAVE', text: 'You remember banners, cheering, a kingdom calling you its saviour. Here there are no banners.', actors: ['octopus'], staging: { octopus: { x: 260, ground: 405 } }, sound: 'surf' },
      { art: 'island-shore', caption: 'WHAT THE LAND CALLED A MONSTER', text: 'The nets came first. Then the kraken rose. Your companion cannot look at the water.', actors: ['octopus'], staging: { octopus: { x: 260, ground: 405 } }, sound: 'memory' },
    ],
  },
  bearChain: {
    id: 'bearChain', title: 'What the chain holds', subtitle: 'At the old mill', music: 'hearth', finalAction: 'Keep the link', shots: [
      { art: 'mill', caption: 'ONE SMALL PIECE', text: 'The key knocks softly against the chain. The bear turns the broken link in his paws until the sharp edge faces away from you. “There. That should not catch.”', actors: ['bear'], sound: 'chain' },
      { art: 'feast', caption: 'THE BURNT EDGE', text: 'At the feast, he takes the crust nobody else wants and pretends it was the best piece. You laugh. He gives you a look over the rim of his cup, pleased that you noticed.', actors: ['bear'], flashback: true, sound: 'memory' },
      { art: 'mill', caption: 'THE ROAD IS STILL THERE', text: 'You wrap the link in a scrap of paper and slip it beside the grimoire. At the road, the bear waits for you. “Same way?” he asks. You nod. The mill turns behind you.', actors: ['hero', 'bear'], sound: 'memory' },
    ],
  },
  vultureStone: {
    id: 'vultureStone', title: 'The count', subtitle: 'The old battlefield', music: 'highlands', finalAction: 'Keep the stone', shots: [
      { art: 'battlefield', caption: 'THE LAST MARK', text: 'She scratches the last line a little apart from the others and blows the dust off it. “Sixty-one of mine. One of me.” She puts it in your hand before she can change her mind.', actors: ['vulture'], sound: 'wind' },
      { art: 'harbor', caption: 'COUNTING WAVES', text: 'On the harbour wall she counts the waves out loud so the rest of you can brace: one, two, three, and on three you all hold. Afterward she tells you she was counting to keep from screaming.', actors: ['vulture'], flashback: true, sound: 'surf' },
      { art: 'battlefield', caption: 'TWO OF YOU COUNTING', text: 'You turn the stone over and count the marks. She counts with you, under her breath, and you reach the end together.', actors: ['hero', 'vulture'] },
    ],
  },
  frogDropper: {
    id: 'frogDropper', title: 'Tenths of a drop', subtitle: 'The hospice', music: 'church', finalAction: 'Keep the dropper', shots: [
      { art: 'hospice', caption: 'THE FIRST DROPPER', text: 'She wipes the glass on her sleeve, though it is already clean. “They gave it back to me so I could work. I am giving it to you so I can stop.”', actors: ['frog'], sound: 'glass' },
      { art: 'harbor', caption: 'AFTER THE KRAKEN', text: 'You are shaking too hard to hold the cup. She holds it for you and counts your breaths, and does not let go until the count is even. “There,” she says. “All five.”', actors: ['hero', 'frog'], flashback: true, sound: 'heartbeat' },
      { art: 'hospice', caption: 'AN EMPTY GRATE', text: 'On the way out she does not look at the grate. At the door she does, once. Then she holds the door open for you.', actors: ['frog'], sound: 'door' },
    ],
  },
  octopusKnot: {
    id: 'octopusKnot', title: 'A line that holds', subtitle: 'The kraken’s grave', music: 'deep', finalAction: 'Keep the knot', shots: [
      { art: 'sea', caption: 'THE LAST OF THE NET', text: 'It cuts the last of the church’s net from the rib and lets the tide take it. The kraken’s bones stand clean for the first time since they fell.', actors: ['octopus'], sound: 'surf' },
      { art: 'harbor', caption: 'BEFORE THE KRAKEN', text: 'At the end of the pier, waiting for the sea to rise, it teaches you a knot: over, under, back through. “When everything else lets go,” it says, “this won’t.”', actors: ['hero', 'octopus'], flashback: true, sound: 'surf' },
      { art: 'sea', caption: 'OVER, UNDER, BACK THROUGH', text: 'Your hands remember the knot before you do. The octopus watches you tie it, and says nothing, and its colour goes warm.', actors: ['hero', 'octopus'], sound: 'memory' },
    ],
  },
  humanChallenge: {
    id: 'humanChallenge', title: 'The lives he carries', subtitle: 'The lamp room · Before the last fight', music: 'wake', finalAction: 'Stand together', shots: [
      { art: 'lamp-room', caption: 'YOU REFUSE THE CUP', text: 'You move the chair aside. “I came to clear our names. I came for the others. I am not staying here to watch you finish this.” The cup stays untouched.', actors: ['hero'], staging: { hero: { x: 360, ground: 405 } }, sound: 'glass' },
      { art: 'lamp-room', caption: 'THE VOICES IN HIS HEAD', text: 'He speaks with a voice you almost recognize. Then another. “Every time you woke, I woke with something else of yours. I could not make them stop.” The borrowed voices overlap until you hear your own.', actors: ['human'], staging: { human: { x: 665, ground: 405 } }, sound: 'memory' },
      { art: 'lamp-room', caption: 'NO MANA TO READ', text: 'You look for the gathering light of a spell. Nothing. He lifts an empty hand. The force behind it belongs to everything you forgot. You will have to take it back, a piece at a time.', actors: ['human'], staging: { human: { x: 665, ground: 405 } }, sound: 'heartbeat' },
      { art: 'lamp-room', caption: 'A REASON TO COME BACK', text: 'You remember the promise before the kraken: all five coming back. This time, coming back means more than surviving. You turn toward the people beside you, and give the last order of your sentence.', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], staging: { hero: { x: 410, ground: 418 }, bear: { x: 150, ground: 418 }, vulture: { x: 280, ground: 418 }, frog: { x: 560, ground: 418 }, octopus: { x: 760, ground: 418 } }, sound: 'gather' },
    ],
  },
  human: {
    id: 'human', title: 'The one who remembers', subtitle: 'At the end of the sea', shots: [
      { art: 'lamp-room', caption: 'THE LAMP ROOM', text: 'You search for a mana signature. There is nothing. Only a chair, a cup, and someone who has been waiting.', actors: ['human'], staging: { human: { x: 665, ground: 405 } }, sound: 'toll' },
      { art: 'feast-cup', caption: 'A HAND AT YOUR CUP', text: 'No fur. No scales. No claws. You have seen those hands before.', sound: 'glass' },
      { art: 'lamp-room', caption: 'THE HUMAN', text: '“You opened the door.” He says it gently. As though it is the only thing about you he has never forgotten.', actors: ['human'], staging: { human: { x: 665, ground: 405 } }, sound: 'memory' },
    ],
  },
} satisfies Record<string, Story>;
export type StoryId = keyof typeof STORIES;
export const STORY_FLAGS: Partial<Record<Flag, StoryId>> = {
  'bear-quest-complete': 'bearChain', 'vulture-quest-complete': 'vultureStone', 'frog-quest-complete': 'frogDropper', 'octopus-quest-complete': 'octopusKnot', 'bear-free': 'bear', 'vulture-free': 'vulture', 'lab-remembered': 'transfer', 'house-seen': 'laboratory', 'grave-seen': 'kraken',
};

export function resurrectionStory(names: readonly string[]): Story {
  return { id: 'resurrection', title: 'Something does not return', subtitle: 'The price of another morning', shots: [
    { art: 'sea', caption: 'BELOW THE SURFACE', text: 'For a moment, there is no pain. You hold on to a voice, a place, the shape of a familiar face. The tide pulls the other way.', sound: 'submerge' },
    { art: 'church', caption: names.join(' · ').toUpperCase(), text: 'A bell reaches you through the water. You wake with one less reason to recognise its sound.', sound: 'toll' },
  ] };
}

export const BOSS_STORIES: Partial<Record<Encounter, StoryId>> = {
  human: 'humanChallenge', boar: 'boar', hyena: 'hyena', viper: 'viper', cuckoo: 'cuckoo', cuttlefish: 'cuttlefish' };

export const BOSS_AFTERMATH: Partial<Record<Encounter, StoryId>> = { boar: 'boarAfter', hyena: 'hyenaAfter', viper: 'viperAfter', cuckoo: 'cuckooAfter', cuttlefish: 'cuttlefishAfter' };
