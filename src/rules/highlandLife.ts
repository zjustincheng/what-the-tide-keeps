import type { Context } from './world';
import type { Conversation } from '../content/dialogue';

export function fortState(context: Context) {
  const flags = context.world.flags;
  const familiar = context.remembered?.includes('vulture') ?? !context.lost.includes('vulture');
  const fish = flags.includes('cuttlefish-slain') ? 'stopped' : flags.includes('frog-free') && !flags.includes('viper-slain') ? 'spoiled' : 'cut';
  return { quiet: flags.includes('hyena-slain'), grain: flags.includes('boar-defeated'), fish, familiar,
    name: familiar ? 'The fort town' : 'A garrison without a name' };
}

export function vultureAtCamp(context: Context): Conversation | undefined {
  if (!context.world.flags.includes('vulture-free') || context.world.fallen?.includes('vulture')) return;
  if (!(context.remembered?.includes('vulture') ?? !context.lost.includes('vulture'))) return { speaker: 'THE VULTURE', lines: [
    'She notices you watching her hands. “You used to know what I was going to do before I did it.”',
    'You cannot remember what she means. She stops reaching for the kettle.',
    '“I have a note that says to trust you. You can borrow it, until you have something of your own.”',
    'She lays the paper between you, keeping it clear of the sparks.',
  ] };
  if (context.world.flags.includes('hyena-slain')) return { speaker: 'THE VULTURE', lines: [
    'She cleans the dirt from beneath one claw, then starts again. There is none left.',
    '“They sent me to bury the dead. They sent you to kill someone for trying to keep the living alive.”',
    'The note is open on her knee. “I do not remember the feast. I remember what we saw under the abbey.”',
    'She moves her bedroll closer to the fire, and to you.',
  ] };
  return { speaker: 'THE VULTURE', lines: [
    'She copies the same line onto a clean scrap: TRUST THE CHAMELEON.',
    '“My handwriting. I do not remember writing it.” She folds the old note inside the new one.',
    'You keep a space beside you. She takes it after the kettle boils.',
    '“If I forget tomorrow, show me the paper before you tell me who I am.”',
  ] };
}
