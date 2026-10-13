import type { Context, Flag } from './world';
import type { Conversation } from '../content/dialogue';

// Count rescue events, rather than claiming a headcount for entire opened pens.
export const SEA_RESCUES: Flag[] = ['squid-freed', 'crab-freed', 'brother-freed', 'newt-freed', 'pens-freed', 'nets-cut'];
export function oceanState(context: Context) {
  const rescues = SEA_RESCUES.filter(flag => context.world.flags.includes(flag)).length;
  const familiar = context.remembered?.includes('octopus') ?? !context.lost.includes('octopus');
  return { rescues, reception: rescues >= 3 ? 'welcomed' : rescues > 0 ? 'recognized' : 'wary', familiar,
    name: familiar ? 'Wrecktown' : 'A port of borrowed decks',
    pens: context.world.flags.includes('nets-cut') ? 'empty' : 'held',
    trade: context.world.flags.includes('cuttlefish-slain') ? 'truce' : 'blockade' };
}

export function octopusAtCamp(context: Context): Conversation | undefined {
  const flags = context.world.flags;
  if (!flags.includes('octopus-free') || context.world.fallen?.includes('octopus')) return;
  if (!oceanState(context).familiar) return { speaker: 'THE OCTOPUS', lines: [
    'It knots your hammock rope with three arms and keeps the fourth against the rail. “This one comes loose in a swell.”',
    'You watch its hands for a memory that does not come. It notices, and stops explaining as if you already know.',
    '“I remember enough for both of us tonight. You can ask me again tomorrow.”',
    'It sits on the deck beside the hammock, and stays.',
  ] };
  if (flags.includes('cuttlefish-slain')) return { speaker: 'THE OCTOPUS', lines: [
    'Its colours change slowly in the lantern light. “A truce is a beginning. Nobody has agreed what comes after it.”',
    'It lays the old chart flat between you. Beyond its edge, it places a small shell. “The island is there.”',
    '“I will take you. After that, I want to come back and help make something that lasts.”',
  ] };
  if (flags.includes('grave-seen')) return { speaker: 'THE OCTOPUS', lines: [
    'It sits with its arms folded close, looking at a knot of net caught in the rail.',
    '“I knew whose side I was on when we fought it. I thought saving your kingdom meant saving you.”',
    '“I did not ask what it had come to stop.” The knot slips free. It keeps it in its hands.',
    'You sit together until it is ready to put the net down.',
  ] };
  return { speaker: 'THE OCTOPUS', lines: [
    'It fixes a loose plank beside your hammock. Nobody in this port has asked it to show its brand.',
    '“I remembered all of you while I was hiding. I could not tell whether that was luck or another punishment.”',
    '“At the feast, I watched the cupbearer’s hands. At the trial, nobody asked what I saw.”',
    'It tests the plank with one arm. “Sleep here. If the tide changes, I will wake you.”',
  ] };
}
