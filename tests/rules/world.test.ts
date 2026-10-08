import { test } from 'node:test';
import assert from 'node:assert/strict';
import { church } from '../../src/content/church.ts';
import { createMemory, forget, wipe } from '../../src/rules/memory.ts';
import type { MemoryId } from '../../src/rules/memory.ts';
import { conversation as say, createWorld } from '../../src/rules/world.ts';

const conversation = (name: string, lost: readonly MemoryId[]) => say(church, name, { world: createWorld(), lost, studied: [] });

test('forgetting a memory changes what the church says, and only that', () => {
  const start = createMemory();
  assert.match(conversation('basin', start.lost).lines[0], /night of the feast/);
  assert.match(conversation('priest', start.lost).lines[1], /remember something for you/);
  const noFeast = forget(wipe(start), 'feast');
  assert.doesNotMatch(conversation('basin', noFeast.lost).lines[0], /feast/);
  assert.match(conversation('priest', noFeast.lost).lines[1], /did not say it this time/);
  assert.match(conversation('ledger', noFeast.lost).lines[0], /column of dates/);
  const noTrial = forget(wipe(start), 'trial');
  assert.match(conversation('ledger', noTrial.lost).lines[1], /do not know what you did/);
  assert.equal(conversation('basin', noTrial.lost).speaker, 'THE TIDAL BASIN');
});

test('the lamb trades a favor spell for her bell, and the spell opens the hedge', async () => {
  const { town } = await import('../../src/content/town.ts');
  const { border } = await import('../../src/content/border.ts');
  const { fields } = await import('../../src/content/fields.ts');
  const { apply, BRAMBLES, drop, holds } = await import('../../src/rules/world.ts');
  let context = { world: createWorld(), lost: [] as MemoryId[], studied: [] as string[] };
  assert.match(say(border, 'hedge', context).lines[1], /don't give/);
  assert.equal(say(border, 'hedge', context).then, undefined);
  assert.match(say(town, 'child', context).choices!.at(-1)!.lines.at(-1)!, /lost my bell/);
  const found = say(fields, 'bell', context);
  context = apply(context, found.then!);
  assert.deepEqual(context.world.carried, ['bell']);
  assert.ok(fields.bell.hiddenIf!.some(condition => holds(context, condition)), 'a bell in hand is no longer on the ground');
  // A wipe drops what is carried, so the bell is back in the clearing.
  assert.deepEqual(drop(context.world).carried, []);
  const thanks = say(town, 'child', context);
  assert.match(thanks.lines[0], /My bell/);
  context = apply(context, thanks.then!);
  assert.deepEqual([context.world.flags, context.world.carried], [['lamb-thanked'], []]);
  assert.deepEqual(context.studied, [BRAMBLES]);
  assert.match(say(town, 'child', context).lines[0], /Did the thorns let go\? Told you/);
  const hedge = say(border, 'hedge', context);
  assert.match(hedge.lines[1], /draw back/);
  context = apply(context, hedge.then!);
  assert.deepEqual(drop(context.world).flags, ['lamb-thanked', 'hedge-open'], 'opened shortcuts survive a wipe');
});

test('what the hero has forgotten, he cannot say', async () => {
  const { replies } = await import('../../src/rules/world.ts');
  const { town } = await import('../../src/content/town.ts');
  const { fields } = await import('../../src/content/fields.ts');
  const remembering = { world: createWorld(), lost: ['home', 'name'] as MemoryId[], studied: [] };
  const forgetting = { ...remembering, lost: ['home', 'name', 'feast'] as MemoryId[] };
  const texts = (context: typeof remembering) => replies(say(town, 'child', context).choices, context).map(choice => choice.text);
  assert.deepEqual(texts(remembering), ["No. I don't think so.", 'They say I did.']);
  assert.deepEqual(texts(forgetting), ["I don't remember.", 'They say I did.']);
  assert.ok(replies(fields.bear.choices, remembering).some(choice => choice.text === 'What is my name?'), 'his name is already gone when the game begins');
}); 
