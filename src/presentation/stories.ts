import type { Effect } from '../audio/effects';
import type { Encounter } from '../rules/battle';
import type { Flag } from '../rules/world';

export type Tableau = 'feast' | 'church' | 'mill' | 'battlefield' | 'cell' | 'sea' | 'lighthouse';
export type Shot = { art: Tableau; caption: string; text: string; sound?: Effect; actors?: readonly string[] };
export type Story = { id: string; title: string; subtitle: string; shots: readonly Shot[] };

export const STORIES = {
  waking: {
    id: 'waking', title: 'What the tide keeps', subtitle: 'A memory, before the sentence', shots: [
      { art: 'feast', caption: 'THE NIGHT OF THE FEAST', text: 'For one night, nobody asks what kind of animal you are. You brought the others home. The sea is quiet.', actors: ['bear', 'vulture', 'frog', 'octopus'], sound: 'memory' },
      { art: 'feast', caption: 'THE CUP', text: 'Someone fills your cup again. The bear is laughing. You try to remember what he said. You can remember the laughter.', sound: 'glass' },
      { art: 'church', caption: 'MANY DEATHS LATER', text: 'Salt in your mouth. A bell overhead. The same ceiling. You reach for four familiar voices and find only your own breathing.', sound: 'toll' },
      { art: 'church', caption: 'THE SENTENCE CONTINUES', text: 'They call you hero. You remember enough to know it is a punishment. Somewhere beyond these walls, someone knows what happened that night.', sound: 'heartbeat' },
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
      { art: 'church', caption: 'THE TRANSFER ORDER', text: 'Your brand number. Your old posting. A line in another hand: he is not to be told why.', sound: 'page' },
      { art: 'cell', caption: 'SOMETHING BEFORE THE FEAST', text: 'A white corridor. The weight of keys. You try to hold the image still, but the room at the end has no name.', sound: 'memory' },
    ],
  },
  boar: {
    id: 'boar', title: 'What they burned', subtitle: 'The farmland · lieutenant', shots: [
      { art: 'mill', caption: 'THE BOAR', text: 'This used to be a home. He stands where the doorway was, between you and everyone who came to him with nowhere else to go.', actors: ['boar'], sound: 'chain' },
      { art: 'mill', caption: 'NO ONE WAITED FOR PROOF', text: '“If you want them,” he says, “you go through me.”', actors: ['boar'], sound: 'heartbeat' },
    ],
  },
  hyena: {
    id: 'hyena', title: 'A place at her table', subtitle: 'The highlands · lieutenant', shots: [
      { art: 'battlefield', caption: 'THE HYENA', text: 'Beneath the abbey, she has given every bone a place. The kingdom gave her none.', actors: ['hyena'], sound: 'wind' },
      { art: 'battlefield', caption: 'THE HUNGER OUTLIVED THE FAMINE', text: '“They would rather we died politely.” She rises. Nothing in this room stays buried.', actors: ['hyena'], sound: 'heartbeat' },
    ],
  },
  viper: {
    id: 'viper', title: 'The dose makes the poison', subtitle: 'The marsh · lieutenant', shots: [
      { art: 'cell', caption: 'THE VIPER', text: 'Water reaches the medicine shelves. Her bottles are still labelled in a careful hand.', actors: ['viper'], sound: 'submerge' },
      { art: 'cell', caption: 'A HEALER, ONCE', text: '“When he lived, it was a miracle. When he died, it was my venom.”', actors: ['viper'], sound: 'glass' },
    ],
  },
  cuckoo: {
    id: 'cuckoo', title: 'A borrowed face', subtitle: 'The mountain holds · lieutenant', shots: [
      { art: 'feast', caption: 'THE CUCKOO', text: 'For a moment, the face belongs to someone you trust. Then the expression arrives a little too late.', actors: ['cuckoo'], sound: 'memory' },
      { art: 'feast', caption: 'THE HOUSE THAT RAISED HIM', text: '“They called me son until someone counted the feathers.”', actors: ['cuckoo'], sound: 'heartbeat' },
    ],
  },
  cuttlefish: {
    id: 'cuttlefish', title: 'What the sea is owed', subtitle: 'The ocean · lieutenant', shots: [
      { art: 'sea', caption: 'THE CUTTLEFISH', text: 'Colours pass beneath its skin like words beneath a page. You recognise a spell. It is one of yours.', actors: ['cuttlefish'], sound: 'surf' },
      { art: 'sea', caption: 'KIN TO THE KRAKEN', text: '“You called it peace because you could not hear us from the shore.”', actors: ['cuttlefish'], sound: 'memory' },
    ],
  },
  laboratory: {
    id: 'laboratory', title: 'The open door', subtitle: 'What they erased before the feast', shots: [
      { art: 'cell', caption: 'THE LABORATORY', text: 'The paper says guard. The paper says subject. Your hand remembers the keys before you remember either word.', sound: 'memory' },
      { art: 'cell', caption: 'THE CHILD', text: 'Small fingers curl around the bars. There is no monster in the cage. Only a child waiting to learn what you will do.', sound: 'heartbeat' },
      { art: 'cell', caption: 'THE DOOR', text: 'You turn the key. You step aside. For the rest of your life, they will try to take this moment from you.', sound: 'chain' },
      { art: 'sea', caption: 'YOU OPENED IT', text: 'The tide is louder now. The room is empty. You remember why the door is open.', sound: 'surf' },
    ],
  },
  kraken: {
    id: 'kraken', title: 'The other shore', subtitle: 'The sea remembers differently', shots: [
      { art: 'sea', caption: 'THE KRAKEN’S GRAVE', text: 'You remember banners, cheering, a kingdom calling you its saviour. Here there are no banners.', actors: ['octopus'], sound: 'surf' },
      { art: 'sea', caption: 'WHAT THE LAND CALLED A MONSTER', text: 'The nets came first. Then the kraken rose. Your companion cannot look at the water.', actors: ['octopus'], sound: 'memory' },
    ],
  },
  human: {
    id: 'human', title: 'The one who remembers', subtitle: 'At the end of the sea', shots: [
      { art: 'lighthouse', caption: 'THE LAMP ROOM', text: 'You search for a mana signature. There is nothing. Only a chair, a cup, and someone who has been waiting.', actors: ['human'], sound: 'toll' },
      { art: 'feast', caption: 'A HAND AT YOUR CUP', text: 'No fur. No scales. No claws. You have seen those hands before.', sound: 'glass' },
      { art: 'lighthouse', caption: 'THE HUMAN', text: '“You opened the door.” He says it gently. As though it is the only thing about you he has never forgotten.', actors: ['human'], sound: 'memory' },
    ],
  },
} satisfies Record<string, Story>;
export type StoryId = keyof typeof STORIES;
export const STORY_FLAGS: Partial<Record<Flag, StoryId>> = {
  'bear-free': 'bear', 'vulture-free': 'vulture', 'lab-remembered': 'transfer', 'house-seen': 'laboratory', 'grave-seen': 'kraken',
};

export function resurrectionStory(names: readonly string[]): Story {
  return { id: 'resurrection', title: 'Something does not return', subtitle: 'The price of another morning', shots: [
    { art: 'sea', caption: 'BELOW THE SURFACE', text: 'For a moment, there is no pain. You hold on to a voice, a place, the shape of a familiar face. The tide pulls the other way.', sound: 'submerge' },
    { art: 'church', caption: names.join(' · ').toUpperCase(), text: 'A bell reaches you through the water. You wake with one less reason to recognise its sound.', sound: 'toll' },
  ] };
}

export const BOSS_STORIES: Partial<Record<Encounter, StoryId>> = { boar: 'boar', hyena: 'hyena', viper: 'viper', cuckoo: 'cuckoo', cuttlefish: 'cuttlefish' };
