import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, conversation, createWorld, replies } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { destinations, waystoneIn } from '../../src/rules/waystones.ts';
import { harbour } from '../../src/content/capital.ts';
import { fieldsLore } from '../../src/content/lore.ts';

test('a stone from the last shrine buys the old roads, and woken stones lead to each other', () => {
  let context: Context = { world: createWorld(), lost: [], studied: [] };
  const take = replies(conversation(harbour, 'sea-shrine', context).choices, context).find(choice => choice.text === 'Take a stone from the shrine.')!;
  context = apply(context, take.then!);
  const give = replies(conversation(fieldsLore, 'pilgrim', context).choices, context).find(choice => choice.text === 'I brought you a stone from the last shrine.')!;
  context = apply(context, give.then!);
  assert.ok(context.world.flags.includes('old-roads'));
  assert.ok(!context.world.carried.includes('shrine-stone'));
  // Only woken stones lead anywhere, and only from a woken stone.
  assert.deepEqual(destinations(context.world, 'crossroads'), []);
  context = apply(apply(context, { set: 'way-crossroads' }), { set: 'way-fort' });
  assert.deepEqual(destinations(context.world, 'crossroads'), ['fort']);
  assert.deepEqual(destinations(context.world, 'millbrook'), []);
  assert.equal(waystoneIn('town'), 'millbrook');
});
