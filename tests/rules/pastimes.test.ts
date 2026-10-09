import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canCook, cook, forage } from '../../src/rules/cooking.ts';
import { createWorld, drop } from '../../src/rules/world.ts';
import { houseKeeps, outcome, reroll, score } from '../../src/rules/dice.ts';
import { createBattle, useSupply } from '../../src/rules/battle.ts';

test('foraged herbs and caught fish cook into supplies that work in battle', () => {
  let world = { ...createWorld(), fish: { minnow: 1, perch: 1, eel: 1, char: 0 } };
  assert.equal(canCook(world, 'fish-stew'), false, 'needs thyme');
  world = forage(world, 'herb');
  world = cook(world, 'fish-stew');
  assert.equal(world.supplies['fish-stew'], 1);
  assert.deepEqual(world.fish, { minnow: 0, perch: 0, eel: 1, char: 0 }, 'the smallest fish go in the pot');
  assert.equal(world.pantry!.herb, 0);
  assert.equal(cook(world, 'fish-stew'), world, 'nothing left to cook with');
  // The stew heals more than smoked fish in a fight.
  const battle = createBattle('locust', [], { roster: ['chameleon'], supplies: world.supplies, wounds: { chameleon: 19 } });
  assert.equal(useSupply(battle, 'chameleon', 'fish-stew').party[0].health, 19);
  // Like fish, foraged things are lost on a wipe.
  assert.equal(drop(forage(world, 'berry', 3)).pantry!.berry, 0);
});

test('bones: three of a kind beats a pair beats a total, and the house keeps what is worth keeping', () => {
  assert.ok(score([2, 2, 2]) > score([6, 6, 5]));
  assert.ok(score([1, 1, 2]) > score([6, 5, 4]));
  assert.ok(score([5, 5, 1]) > score([4, 4, 6]));
  assert.equal(outcome([3, 3, 3], [6, 6, 6]), 'lose');
  assert.equal(outcome([6, 5, 3], [3, 5, 6]), 'draw');
  assert.deepEqual(reroll([1, 6, 2], [false, true, false], [4, 5]), [4, 6, 5]);
  assert.deepEqual(houseKeeps([2, 2, 1]), [true, true, false]);
  assert.deepEqual(houseKeeps([5, 3, 1]), [true, false, false]);
});
