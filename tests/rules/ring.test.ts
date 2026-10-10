import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boutAfter, boutWon, BOUTS, RING_FEE } from '../../src/rules/ring.ts';
import { createBattle } from '../../src/rules/battle.ts';
import { createWorld } from '../../src/rules/world.ts';

test('the Talon Ring runs all four bouts straight through, ending with the champion', () => {
  assert.equal(boutAfter(0), 1);
  assert.equal(boutAfter(2), 3);
  assert.equal(BOUTS[3].encounter, 'champion');
  assert.equal(boutAfter(3), undefined, 'the champion is the last');
  assert.ok(RING_FEE > 0, 'going in costs something');
});

test('two-at-a-time bouts put both in the ring at once', () => {
  const hornets = createBattle(BOUTS[0].encounter, [], { company: BOUTS[0].company, arena: true });
  assert.equal(hornets.followers.length, 1);
  assert.equal(hornets.waves, 1);
});

test('each bout won pays its prize; the flag and the torc only come once', () => {
  let world = { ...createWorld(), coins: 0 };
  world = boutWon(world, 3);
  world = boutWon(world, 3);
  assert.equal(world.coins, BOUTS[3].prize * 2);
  assert.deepEqual(world.flags, ['ring-champion']);
  assert.deepEqual(world.found, ['champions-torc']);
});
