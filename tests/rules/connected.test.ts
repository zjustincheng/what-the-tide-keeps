import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, conversation, createWorld, replies } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { weir } from '../../src/content/fen.ts';
import { fort, tarn } from '../../src/content/highlands.ts';
import { bite, FISH, SPOTS } from '../../src/rules/fishing.ts';

const start = (world: object = {}): Context => ({ world: { ...createWorld(), ...world }, lost: [], studied: [] });
const pick = (dialogue: Parameters<typeof conversation>[0], name: string, context: Context, text: string) => {
  const choice = replies(conversation(dialogue, name, context).choices, context).find(choice => choice.text === text);
  assert.ok(choice, `${name}: ${text}`);
  return choice!;
};

test('the caged otter goes free once the warden is paid or leaned on, and his mother gives the hook', () => {
  let context = start({ coins: 20 });
  assert.equal(replies(conversation(weir, 'brother', context).choices, context).some(choice => choice.text === 'Open the cage.'), false);
  context = apply(context, pick(weir, 'warden', context, 'Here. For the key. (15 coins)').then!);
  assert.equal(context.world.coins, 5);
  context = apply(context, pick(weir, 'brother', context, 'Open the cage.').then!);
  const thanks = conversation(weir, 'elder', context);
  assert.match(thanks.lines.join(' '), /stair the river folk cut/);
  context = apply(context, thanks.then!);
  assert.ok(context.world.found.includes('weir-hook'));
  // With the bear along, no coins are needed.
  const bear = start({ flags: ['bear-free'] });
  assert.equal(pick(weir, 'warden', bear, 'The bear would like the key.').then?.set, 'warden-bribed');
});

test("the smuggler's crate goes from the weir to the fort's fence", () => {
  let context = start();
  context = apply(context, pick(weir, 'smuggler', context, "I'll carry something for you.").then!);
  assert.ok(context.world.carried.includes('crate'));
  context = apply(context, pick(fort, 'fence', context, 'A delivery, from the weir.').then!);
  assert.equal(context.world.coins, 20);
  assert.ok(!context.world.carried.includes('crate'));
});

test("the trapper's partner's ring comes back from under the ice", () => {
  let context = start();
  context = apply(context, pick(tarn, 'ice-body', context, 'Break the ice and take the ring.').then!);
  context = apply(context, pick(tarn, 'trapper', context, 'Give him the ring.').then!);
  assert.ok(context.world.found.includes('frost-ring'));
});

test('only the cold tarn holds char, and they are worth the most', () => {
  assert.equal(SPOTS.pond.odds.char, 0);
  assert.equal(bite('tarn', 0.99), 'char');
  assert.ok(Object.values(FISH).every(fish => fish.value <= FISH.char.value));
});
