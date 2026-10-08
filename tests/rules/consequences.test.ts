import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, conversation, createWorld, holds, replies } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { price } from '../../src/rules/economy.ts';
import { farm } from '../../src/content/farm.ts';
import { fields } from '../../src/content/fields.ts';
import { town } from '../../src/content/town.ts';
import type { Dialogue } from '../../src/content/dialogue.ts';

const start = (flags: Context['world']['flags'] = [], coins = 0): Context => ({ world: { ...createWorld(), flags, coins }, lost: [], studied: [] });
// Choose a reply by its text, applying its effect, as the dialogue box does.
function answer(context: Context, dialogue: Dialogue, name: string, text: string) {
  const choice = replies(conversation(dialogue, name, context).choices, context).find(choice => choice.text === text);
  assert.ok(choice, `"${text}" should be on offer`);
  return { context: choice.then ? apply(context, choice.then) : context, lines: choice.lines.join(' ') };
}
const hidden = (dialogue: Dialogue, name: string, context: Context) => dialogue[name].hiddenIf!.some(condition => holds(context, condition));

test("sparing the boar's followers earns the badger's trust and the boar's tusk", () => {
  let { context, lines } = answer(start(['boar-defeated']), farm, 'badger', "Go. Before the reeve's watch comes.");
  assert.match(lines, /Third fence post/);
  assert.equal(hidden(farm, 'badger', context), true, 'they are gone');
  assert.equal(hidden(farm, 'tusk-cache', context), false);
  context = apply(context, conversation(farm, 'tusk-cache', context).then!);
  assert.deepEqual(context.world.found, ['boar-tusk']);
  assert.doesNotMatch(conversation(town, 'reeve', context).lines.join(' '), /Twenty coins/, 'no reward for mercy');
});

test("reporting them pays, and the gibbet shows the cost", () => {
  let { context } = answer(start(['boar-defeated']), farm, 'badger', "I'm taking you to the reeve.");
  assert.equal(hidden(farm, 'tusk-cache', context), true);
  assert.match(conversation(fields, 'gibbet', context).lines[0], /A badger/);
  const paid = conversation(town, 'reeve', context);
  assert.match(paid.lines.join(' '), /Twenty coins/);
  context = apply(context, paid.then!);
  assert.equal(context.world.coins, 20);
  assert.doesNotMatch(conversation(town, 'reeve', context).lines.join(' '), /Twenty coins/, 'paid once');
});

test('coin buys a room, the bear lowers prices, and the count is remembered', () => {
  assert.equal(replies(town.innkeeper.choices, start([], 11)).some(choice => choice.text.startsWith('Twelve coins')), false, 'not enough coin');
  let { context } = answer({ ...start([], 15), world: { ...start([], 15).world, wounds: { chameleon: 5 } } }, town, 'innkeeper', 'Twelve coins for a bed. Back stairs.');
  assert.deepEqual([context.world.coins, context.world.flags], [3, ['inn-room']], 'paying gets the hero through the inn door');
  assert.match(answer(start(), town, 'shopkeeper', 'Lower your prices.').lines, /^No\./);
  ({ context } = answer(start(['bear-free']), town, 'shopkeeper', 'Lower your prices.'));
  assert.equal(price(context.world, { supply: 'firepot' }), price({ ...context.world, flags: ['boar-defeated'] }, { supply: 'firepot' }));
  ({ context } = answer(start(), town, 'fox', "I'll stand in the count tonight."));
  assert.equal(context.world.supplies.firepot, 1);
  assert.match(conversation(town, 'fox', context).lines.join(' '), /salt cut/);
});

test('telling the fishmonger about his squid loses him as a buyer', () => {
  const { context } = answer(start(['barrel-bought', 'squid-freed']), town, 'fishmonger', 'I let your squid go.');
  const after = conversation(town, 'fishmonger', context);
  assert.match(after.lines[0], /turns his back/);
  assert.equal(after.then?.shop, undefined, 'no more trade');
});
