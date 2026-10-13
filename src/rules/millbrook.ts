import type { Context } from './world';
import type { Conversation } from '../content/dialogue';

export function millbrookState(context: Context) {
  const flags = context.world.flags;
  const grain = flags.includes('boar-defeated');
  const fish = flags.includes('cuttlefish-slain') ? 'stopped' : flags.some(flag => ['ration-ledger', 'hyena-slain', 'viper-slain'].includes(flag)) ? 'scarce' : 'rationed';
  const familiar = context.remembered?.includes('bear') ?? !context.lost.includes('bear');
  return { grain, fish, familiar, name: familiar ? 'Millbrook' : 'An unfamiliar market town',
    mood: !grain ? 'The grain road is closed.' : fish === 'stopped' ? 'The grain returns. The fish do not.' : fish === 'scarce' ? 'The grain moves. The ration line grows.' : 'The grain road is open.' };
}

export function bearAtCamp(context: Context): Conversation | undefined {
  if (!context.world.flags.includes('bear-free') || context.world.fallen?.includes('bear')) return;
  if (context.world.flags.includes('bear-quest-complete')) return { speaker: 'THE BEAR', lines: [
    'He asks for the link and rolls it between his paws. “I used to dream about this chain. Now I can put it down.”',
    '“You do not have to hold all of it in your head anymore. Neither do I.” He gives it back.',
    context.world.flags.includes('bear-reeve-accountable') ? '“My name is on the paper now. Their names too. That matters.”' : '“I left without asking what I was allowed to be. That matters.”',
    'He takes the burnt edge of the bread. You remember why he likes it.',
  ] };
  if (context.world.flags.some(flag => ['bear-mill-left', 'bear-reeve-accountable'].includes(flag))) return { speaker: 'THE BEAR', lines: [
    'He rubs a thumb over the bare patch on his wrist. “That chain has a weak link. I used to look at it every morning.”',
    '“I could have broken it. I thought they would chain somebody else instead.”',
    'He opens his hand beside the fire. “I would like to take that one piece. Then we can go.”',
  ] };
  if (context.world.flags.includes('bear-miller-witnessed')) return { speaker: 'THE BEAR', lines: [
    'A corner of the miller’s statement sticks out of the grimoire. The bear smooths it flat before he sits.',
    '“I keep wondering what the reeve will say.” He takes the burnt edge of the bread and forgets to eat it.',
    '“If he tells me it was all permitted, I might not be very polite.” You tell him he does not have to be.',
  ] };
  if (context.world.flags.includes('bear-mill-record')) return { speaker: 'THE BEAR', lines: [
    'He turns his bowl so the cracked side faces away. He has been doing it all evening.',
    '“Unable to stand.” He says it as it was written in the book. “I thought he had stopped counting that day.”',
    'He sets the bowl down. “Tomorrow, I want to hear him read it.”',
  ] };
  if (context.world.flags.includes('bear-mill-returned')) return { speaker: 'THE BEAR', lines: [
    'He sits with his feet toward the mill road. “I thought I would be glad to see the stone again without the chain.”',
    '“I could not quite make myself go through the door.” He leaves the thought there a while.',
    '“The book is inside. We can look when the fire goes down.”',
  ] };
  if (!(context.remembered?.includes('bear') ?? !context.lost.includes('bear'))) return { speaker: 'THE BEAR', lines: [
    'He sits on the other side of the fire, leaving a space he used to sit in.',
    '“You always gave me the burnt edge of the bread. Said I was the only one who liked it.”',
    'You turn the bread over. You do not know whether he is joking.',
    context.world.flags.includes('boar-defeated') ? '“There is something I want back at the old mill. You can come with me, even if you do not remember why it matters.”' : '“I can sit farther away,” he says. “If that helps.” He stays until the fire settles.',
  ] };
  if (context.world.flags.includes('boar-defeated')) return { speaker: 'THE BEAR', lines: [
    'He breaks the bread and gives you the soft half. The burnt edge disappears into his paw.',
    '“They let the carts through. That is something.” He watches a spark go out.',
    '“But nobody went back to his farm. Nobody said they were sorry.”',
    '“I left something at the mill,” he says. “Something I want back. Will you come with me?”',
  ] };
  return { speaker: 'THE BEAR', lines: [
    'He holds his wrists toward the fire. The fur has not grown back where the mill chain rubbed it away.',
    '“At the feast, you kept putting bread on my plate. Thought I had not eaten enough.”',
    'He gives you the soft half. “I remember that better than the kings.”',
    'The mill turns somewhere in the dark. For a while, you let it turn without him.',
  ] };
}
