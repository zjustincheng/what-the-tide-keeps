import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, conversation, createWorld, replies } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { border } from '../../src/content/border.ts';
import { downs } from '../../src/content/downs.ts';
import { hall } from '../../src/content/interiors.ts';
import { farm } from '../../src/content/farm.ts';
import { abbey, ossuary } from '../../src/content/highlands.ts';

const start = (flags: string[] = []): Context => ({ world: { ...createWorld(), flags: flags as never }, lost: [], studied: [] });
const options = (dialogue: Parameters<typeof conversation>[0], name: string, context: Context) => replies(conversation(dialogue, name, context).choices, context).map(choice => choice.text);
const pick = (dialogue: Parameters<typeof conversation>[0], name: string, context: Context, text: string) => replies(conversation(dialogue, name, context).choices, context).find(choice => choice.text === text)!;

test('the boar\'s sister lets the hero through only once he knows about the kid and the burn order', () => {
  let context = start();
  assert.ok(options(border, 'sister', context).includes('Let me through.'));
  assert.ok(!options(border, 'sister', context).some(text => text.startsWith('I know he didn')));
  // The records in the reeve's hall, and the kid on the downs.
  context = apply(context, conversation(hall, 'records', context).then!);
  context = apply(context, pick(downs, 'kid', context, 'Did the boar ever hurt you?').then!);
  assert.ok(!options(border, 'sister', context).includes('Let me through.'));
  context = apply(context, pick(border, 'sister', context, "I know he didn't do it. Let me speak to him.").then!);
  assert.ok(context.world.flags.includes('lane-open'));
});

test('the boar talks first, and the fight starts when the hero says so', () => {
  const context = start(['lane-open', 'kid-found']);
  assert.ok(options(farm, 'boar', context).includes('The kid is alive. You never touched him.'));
  const fight = pick(farm, 'boar', context, 'Then we fight.');
  assert.equal(fight.ends, true);
  assert.equal(fight.then?.set, 'boar-challenged');
});

test('the monk gives up the ossuary key once the dead in his yard are buried', () => {
  let context = start();
  assert.ok(options(abbey, 'monk', context).includes('Give me the key.'));
  for (const n of [1, 2, 3] as const) context = apply(context, pick(abbey, `dead-${n}`, context, 'Bury him in the yard.').then!);
  assert.ok(!options(abbey, 'monk', context).includes('Give me the key.'));
  context = apply(context, pick(abbey, 'monk', context, "They're buried. The key.").then!);
  assert.ok(context.world.flags.includes('ossuary-key'));
  assert.equal(pick(ossuary, 'hyena', context, 'The church sent me to put you down.').then?.set, 'hyena-challenged');
});
