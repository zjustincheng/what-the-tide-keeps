// The ending: what happens after the lamp room, told from what the hero did on the way. Pure: flags in, scenes out.
import type { Flag, World } from './world';
import type { Shot, Story } from '../presentation/stories';

export type Ending = 'good' | 'bad';
export const ENDING_TITLES: Record<Ending, string> = { good: 'The door stays open', bad: 'The seat beside him' };

export function endingStory(world: Pick<World, 'flags'>, ending: Ending, hasName: boolean): Story {
  const has = (flag: Flag) => world.flags.includes(flag);
  const shots: Shot[] = ending === 'bad' ? [
    { art: 'lighthouse', caption: 'THE SEAT BESIDE HIM', text: 'The human fills your cup, as he did at the feast. You sit beside him. He knows how far you came. You can\'t remember why.', sound: 'glass' },
    { art: 'cell', caption: 'SOMEONE ELSE’S LIFE', text: 'He tells you about a young guard who opened a cage. You listen as if it happened to someone else. You ask what became of him.' },
    { art: 'church', caption: 'AN EMPTY PLACE', text: 'In the capital, the priest keeps your cot made. No order comes to lift the sentence. The rulers are dead, the heroes are gone, and no fish comes inland. The nations start to go hungry.', sound: 'toll' },
    { art: 'home-table', caption: 'THE ONES WHO WAIT', text: 'A chair stays empty beside a table. Somewhere, someone keeps a note that says to trust you. He has every memory that could have brought you back to them.' },
    { art: 'cell', caption: 'THE DOOR', text: 'The cell door stands open. Neither of you goes through it. Out over the sea, he pours another cup.', sound: 'surf' },
  ] : [
    { art: 'lighthouse', caption: 'MERCY, WITH YOUR EYES OPEN', text: 'You lower your hand. “You killed them. I remember that too.” He waits for the blow. “I will not put you back in a cage.” You open the door a second time.', sound: 'memory' },
    { art: 'home-table', caption: 'WHAT THE TIDE RETURNS', text: 'What the tide took comes back from him: the feast, the trial, the hands that pulled you upright. The Hollow strength goes with it. Your knees give way. This time your companions catch you.', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'gather' },
    { art: 'archive', caption: 'THE CASE HE SHOULD HAVE OPENED', text: has('inquisitor-spoke')
      ? 'The inquisitor comes by boat, with the transfer order he took from the archive. This time he asks his questions before he draws.'
      : 'The rookery carries the island\'s records to the capital. The inquisitor follows them out to the light. This time he comes to listen.', actors: ['inquisitor'], sound: 'page' },
    { art: 'laboratory', caption: 'EVERY NAME IN THE RECORD', text: 'The human admits to the feast murders and the frame. The records name who made him, who caged him, and who ordered your memory taken. The basin book shows where the memories went. The inquisitor seals a copy for every nation.' },
    { art: 'trial', caption: 'THE VERDICT', text: 'In the hall where you were condemned, the charge is read again. The nations clear your party\'s name: after all five, the word cleared. The inquisitor sets the sentence beside the evidence. “I believed the brand before I listened to you.”', actors: ['church-official', 'hero'], sound: 'hammer' },
    { art: 'church', caption: 'THE LAST ENTRY', text: 'The priest writes SENTENCE LIFTED beside five names and closes the ledger. His hands shake as he empties the basin. The resurrections stop. No more memories are poured into the human. The officials who concealed the project must answer for it.', sound: 'toll' },
    { art: 'harbor', caption: 'A PEACE THAT COUNTS THE SEA', text: 'The sea is named in the new Covenant, and signs for itself. The fish trade does not start again. Grain moves first. It is a hungry winter, but nobody is shipped to the light.', actors: ['octopus'], sound: 'surf' },
    { art: 'farmhouse', caption: 'WHAT CAN BE REPAIRED', text: 'The grain road is open. The hospice keeps its doors open. Letters cross the passes again. The outcasts\' stories go into the inquiry, beside what they did.' },
    { art: 'cell', caption: 'THE ONES LEFT INSIDE', text: has('cages-opened')
      ? 'Those freed from the works give their names to the inquiry. By morning they are on a boat home.'
      : 'The inquisitor\'s men open the cages at the works. The people inside are given blankets and asked where they want to go.' },
    { art: 'home-table', caption: 'THE BEAR', text: has('bear-quest-complete')
      ? 'The bear sets the broken link on the table. “It doesn\'t hold me here any more,” he says. “It holds a place for me.”'
      : has('bear-free') ? 'The bear sets a chain link on the table. “I thought I had to remember enough for all of us.” He puts it down. “You can take a turn.”'
      : 'The pardon reaches the mill with the inquisitor\'s seal. The bear\'s chain comes off. There is a place for him at your table.', actors: ['bear'] },
    { art: 'home-table', caption: 'THE VULTURE', text: has('vulture-free')
      ? 'The vulture unfolds her old note: TRUST THE CHAMELEON. “I was right,” she says, and puts a clean sheet beside it.'
      : 'A courier finds the vulture at the battlefield. Her sentence is lifted with yours.', actors: ['vulture'] },
    { art: 'home-table', caption: 'THE FROG', text: has('frog-free')
      ? 'The frog stays on at the hospice. “Because I want to,” she says. It still sounds strange to her.'
      : 'The pardon reaches the hospice. The frog is offered work there, with wages and a door that isn\'t locked.', actors: ['frog'] },
    { art: 'home-table', caption: 'THE OCTOPUS', text: has('octopus-free')
      ? 'The octopus takes a berth on the first boat with the sea\'s delegates. “I\'m coming back,” it says, before anyone asks.'
      : 'Word reaches Wrecktown that your names are cleared. You leave a message for the octopus. There is a chair for it too.', actors: ['octopus'] },
    { art: 'home-table', caption: 'WEEKS LATER · A TOAST WITHOUT A CUPBEARER', text: hasName
      ? 'Someone asks your name, and you answer. The bear passes the bread. Nobody fills your cup without asking. “To coming back,” he says.'
      : 'Someone asks your name. You still don\'t have it. They pass you the bread anyway.', actors: ['hero', 'bear', 'vulture', 'frog', 'octopus'], sound: 'glass' },
    { art: 'empty-cell', caption: 'BY MORNING', text: 'The human is gone. Nothing was broken. He left the cup on the windowsill, empty. The cell is empty. The door is open. You do not know where he went.', sound: 'wind' },
    { art: 'harbor', caption: 'YOUR NEXT MORNING', text: `You stand at the harbour with a body that can tire and a life that can end, and no order telling you where to go. Behind you, ${hasName ? 'someone calls you by name' : 'a familiar voice calls you back'}.`, actors: ['hero'], sound: 'surf' },
  ];
  return { id: `ending-${ending}`, title: ENDING_TITLES[ending], subtitle: ending === 'good' ? 'After the sentence' : 'At the end of the sea',
    music: ending === 'good' ? 'hearth' : 'wake', finalAction: ending === 'good' ? 'Return to the harbour' : 'Return to the island', shots };
}

export function epilogue(world: Pick<World, 'flags'>, ending: Ending, hasName: boolean): string[] {
  return endingStory(world, ending, hasName).shots.map(shot => shot.text);
}
