import type { Context } from './world';
import type { Conversation } from '../content/dialogue';

export function marshState(context: Context) {
  const flags = context.world.flags;
  const care = flags.includes('viper-slain') ? 'recovering' : flags.includes('frog-free') ? 'poison' : 'feared';
  const familiar = context.remembered?.includes('frog') ?? !context.lost.includes('frog');
  return { care, familiar, fish: flags.includes('cuttlefish-slain') ? 'stopped' : care === 'recovering' ? 'inspected' : 'held',
    name: familiar ? 'Wickmere' : 'A town above dark water' };
}

export function frogAtCamp(context: Context): Conversation | undefined {
  if (!context.world.flags.includes('frog-free') || context.world.fallen?.includes('frog')) return;
  const trusted = context.world.flags.includes('viper-slain');
  if (!(context.remembered?.includes('frog') ?? !context.lost.includes('frog'))) return { speaker: 'THE FROG', lines: [
    'She sets a cup of water where you can reach it, then moves her medicine case out of your way.',
    '“You do not remember me. I know what that looks like.” She waits for you to choose whether to sit.',
    trusted ? '“I can still look after you. You do not have to know my name for that.”' : '“I came to stop the poison. That includes keeping you alive long enough to find it.”',
    'She measures a small dose. The same careful hands, even when they are new to you.',
  ] };
  if (trusted) return { speaker: 'THE FROG', lines: [
    'She washes the last stain from her medicine spoon. This time, she lets you hold the basin.',
    '“They blamed a healer because they were frightened of her hands. I heard them do it. I helped them believe it.”',
    '“I still cannot remember the feast.” She looks at your brand. “But I can no longer call forgetting it proof against you.”',
    'When she puts her case away, she leaves the empty place beside her for you.',
  ] };
  return { speaker: 'THE FROG', lines: [
    'She counts the doses in her case before she looks up. “I am here for the people in those beds.”',
    'You offer to hold the basin. She puts it on the ground between you instead.',
    '“Do not ask me to tell you who you were. Help me find what is in their food.”',
    'She checks your bandage anyway. Duty can look like kindness before it becomes trust.',
  ] };
}
