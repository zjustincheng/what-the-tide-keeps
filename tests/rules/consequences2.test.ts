import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canFlee, createBattle, flee } from '../../src/rules/battle.ts';
import { price } from '../../src/rules/economy.ts';
import { apply, conversation, createWorld, drop, fill, fleeing, replies } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { church } from '../../src/content/church.ts';
import { town } from '../../src/content/town.ts';

test('running away costs a parting blow, but never the last hero standing; the boar cannot be fled', () => {
  const battle = flee(createBattle());
  assert.equal(battle.phase, 'fled');
  const struck = battle.party.find(member => member.health < member.maxHealth);
  assert.ok(struck, 'someone is caught on the way out');
  assert.match(battle.log.at(-1)!, /You run\./);
  const alone = createBattle('locust', [], { roster: ['chameleon'] });
  const nearlyDead = { ...alone, party: alone.party.map(member => ({ ...member, health: 2 })) };
  assert.equal(flee(nearlyDead).party[0].health, 1, 'the last hero gets away on their feet');
  assert.equal(canFlee(createBattle('boar')), false);
  assert.equal(flee(createBattle('boar')).phase, 'player');
  assert.equal(fleeing({ ...createWorld(), coins: 25 }).coins, 12, 'half the coins, rounded down');
});

test("the ledger counts every death, and the priest reads it", () => {
  let context: Context = { world: createWorld(), lost: [], studied: [] };
  const answer = () => fill(church.priest.choices!.find(choice => choice.text === 'How many times have I died?')!.lines[0], context);
  assert.equal(answer(), 'Forty-one, by the ledger.');
  context = { ...context, world: drop(context.world) };
  assert.equal(answer(), 'Forty-two, by the ledger.');
  context = { ...context, world: drop(drop(context.world)) };
  assert.equal(answer(), 'Forty-four, by the ledger.');
});

test("the reeve can't lift the brand, but once the carts move his letter makes the hero a citizen in Millbrook", () => {
  let context: Context = { world: { ...createWorld(), coins: 50 }, lost: [], studied: [] };
  const pardon = () => replies(conversation(town, 'reeve', context).choices, context).find(choice => choice.text === 'I want a pardon.')!;
  assert.match(pardon().lines.join(' '), /bring my carts back/);
  assert.equal(pardon().then, undefined);
  context = apply(context, { set: 'boar-defeated' });
  context = apply(context, pardon().then!);
  assert.ok(context.world.flags.includes('reeve-pardon'));
  assert.equal(price(context.world, { supply: 'firepot' }), 4, 'board price');
  assert.match(conversation(town, 'board', context).lines[1], /All five faces/);
});
