import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBattle, intent } from '../../src/rules/battle.ts';
import { apply, conversation, createWorld, feed, holds, replies } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { barrow, downs } from '../../src/content/downs.ts';
import { fen } from '../../src/content/fen.ts';
import { fields } from '../../src/content/fields.ts';
import { town } from '../../src/content/town.ts';

const start = (world = {}): Context => ({ world: { ...createWorld(), ...world }, lost: [], studied: [] });

test('fish are handed over smallest first, and a reply can ask for them', () => {
  assert.deepEqual(feed({ minnow: 1, perch: 2, eel: 1 }, 3), { minnow: 0, perch: 0, eel: 1 });
  assert.equal(holds(start({ fish: { minnow: 1, perch: 1, eel: 0 } }), { fish: 3 }), false);
  assert.equal(holds(start({ fish: { minnow: 1, perch: 1, eel: 1 } }), { fish: 3 }), true);
});

test('feeding the hound mother sends the pack away, and the ram pays less for it', () => {
  let context = start({ fish: { minnow: 2, perch: 1, eel: 1 } });
  const give = replies(conversation(barrow, 'hound-mother', context).choices, context).find(choice => choice.text === 'Give her three fish.')!;
  context = apply(context, give.then!);
  assert.deepEqual(context.world.fish, { minnow: 0, perch: 0, eel: 1 });
  assert.equal(context.world.coins, 6);
  assert.ok(context.world.flags.includes('hounds-fed'));
  const ram = conversation(downs, 'ram', context);
  assert.match(ram.lines.join(' '), /You fed them/);
  assert.equal(apply(context, ram.then!).world.coins, 11);
});

test('killing the pack leader earns the ram\'s full fee instead', () => {
  const context = start({ flags: ['pack-slain'] });
  assert.equal(apply(context, conversation(downs, 'ram', context).then!).world.coins, 15);
});

test('the pack rush grows with every hound still standing', () => {
  let battle = createBattle('pack');
  battle = { ...battle, round: 3 };
  assert.equal(intent(battle).damage, 13);
  assert.equal(intent({ ...battle, followers: battle.followers.map(follower => ({ ...follower, health: 0 })) }).damage, 5);
  assert.ok(intent(battle).undodgeable);
});

test('the otter can be trusted or reported, and the reeve pays for a report', () => {
  const context = start();
  const choices = replies(conversation(fen, 'otter', context).choices, context);
  const trusted = apply(context, choices.find(choice => choice.text === "I won't tell anyone.")!.then!);
  assert.ok(trusted.world.flags.includes('otter-trusted'));
  const reported = apply(context, choices.find(choice => choice.text === 'The reeve pays for poachers.')!.then!);
  const reeve = conversation(town, 'reeve', reported);
  assert.match(reeve.lines[0], /went up to the fen/);
  assert.equal(apply(reported, reeve.then!).world.coins, 10);
});

test('opening the sluice is noticed by the miller', () => {
  const context = apply(start(), { set: 'sluice-open' });
  assert.match(conversation(fields, 'miller', context).lines[0], /dropped a foot/);
  // The writ still frees the bear while the stream is low.
  const writ = apply(context, { set: 'writ-given' });
  assert.equal(conversation(fields, 'miller', writ).then?.set, 'bear-free');
});
