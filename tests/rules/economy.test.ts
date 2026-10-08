import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, ENEMIES, resolveEnemy, UNHOLLOWED, useSupply } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';
import { buy, canBuy, earn, NO_SUPPLIES, price, SUPPLIES } from '../../src/rules/economy.ts';
import type { Ware } from '../../src/rules/economy.ts';
import { STARTING_BOOKS } from '../../src/rules/spells.ts';
import { createWorld, drop } from '../../src/rules/world.ts';

const fish: Ware = { supply: 'smoked-fish' };
const writ: Ware = { deed: 'writ-given', name: 'Writ', text: '', price: 60 };

test('the branded convict pays triple until the town thaws, then double', () => {
  let world = earn(createWorld(), 20);
  assert.equal(price(world, fish), SUPPLIES['smoked-fish'].price * 3);
  world = buy(world, fish);
  assert.equal(world.coins, 20 - SUPPLIES['smoked-fish'].price * 3);
  assert.equal(world.supplies['smoked-fish'], 1);
  assert.equal(price({ ...world, flags: ['boar-defeated'] }, fish), SUPPLIES['smoked-fish'].price * 2);
  assert.equal(buy({ ...world, coins: 0 }, fish).supplies['smoked-fish'], 1, 'no coins, no sale');
});

test('a writ can be bought once, and coins and supplies are lost on a wipe', () => {
  let world = earn(createWorld(), 75);
  world = buy(world, writ);
  assert.deepEqual([world.coins, world.flags], [15, ['writ-given']]);
  assert.equal(canBuy(earn(world, 100), writ), false, 'already bought');
  world = buy(world, fish);
  const after = drop(world);
  assert.deepEqual([after.coins, after.supplies, after.flags], [0, NO_SUPPLIES, ['writ-given']]);
});

test("supplies heal, revive, and burn as a hero's action, and are used up", () => {
  const supplies = { 'smoked-fish': 1, 'smelling-salts': 1, firepot: 1 };
  const start = createBattle('locust', [], UNHOLLOWED, undefined, STARTING_BOOKS, undefined, supplies);
  const hurt: Battle = { ...start, party: start.party.map(member => ({ ...member, health: member.id === 'vulture' ? 0 : 5 })) };
  let battle = useSupply(hurt, 'chameleon', 'smoked-fish', 'bear');
  assert.equal(battle.party[1].health, 15);
  assert.equal(battle.supplies['smoked-fish'], 0);
  assert.equal(useSupply(battle, 'bear', 'smoked-fish', 'bear'), battle, 'none left');
  assert.equal(useSupply(battle, 'bear', 'smelling-salts', 'chameleon'), battle, 'salts are for the fallen');
  battle = useSupply(battle, 'bear', 'smelling-salts', 'vulture');
  assert.equal(battle.party[2].health, SUPPLIES['smelling-salts'].power);
  assert.equal(battle.phase, 'player', 'the revived vulture can still act this round');
  battle = useSupply(battle, 'vulture', 'firepot', 'vulture');
  assert.equal(battle.enemy.health, ENEMIES.locust.health - SUPPLIES.firepot.power);
  assert.equal(battle.phase, 'enemy');
  assert.equal(resolveEnemy(battle).supplies.firepot, 0);
  assert.equal(act(start, 'chameleon', 'attack').supplies, supplies);
});
