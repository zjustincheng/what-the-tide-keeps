import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCatch, bite, catchValue, FISH, landed, marker, NO_CATCH } from '../../src/rules/fishing.ts';
import { buy } from '../../src/rules/economy.ts';
import { createWorld, drop } from '../../src/rules/world.ts';

test('the marker sweeps back and forth, and only the gold zone lands the fish', () => {
  assert.equal(marker(0, 'minnow'), 0);
  assert.equal(marker(1 / FISH.minnow.speed, 'minnow'), 1);
  assert.ok(Math.abs(marker(1.5 / FISH.minnow.speed, 'minnow') - 0.5) < 1e-9, 'and back again');
  assert.equal(landed(0.5, 0.45, 'eel'), true);
  assert.equal(landed(0.56, 0.45, 'eel'), false, 'an eel leaves a narrow zone');
  assert.equal(landed(0.56, 0.45, 'minnow'), true);
});

test('deeper water bites bigger fish', () => {
  assert.equal(bite('pond', 0), 'minnow');
  assert.equal(bite('pond', 0.99), 'eel');
  assert.equal(bite('stream', 0.1), 'minnow');
  assert.equal(bite('stream', 0.5), 'perch');
});

test('the fishmonger buys the whole catch, and a wipe loses it', () => {
  let world = { ...createWorld(), fish: addCatch(addCatch(NO_CATCH, 'eel'), 'perch') };
  assert.equal(catchValue(world.fish), FISH.eel.value + FISH.perch.value);
  world = buy(world, { sellCatch: true });
  assert.deepEqual([world.coins, world.fish], [FISH.eel.value + FISH.perch.value, NO_CATCH]);
  assert.deepEqual(drop({ ...world, fish: addCatch(NO_CATCH, 'eel') }).fish, NO_CATCH);
});
