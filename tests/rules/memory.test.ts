import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, ENEMIES, MEMBERS, resolveEnemy } from '../../src/rules/battle.ts';
import { createMemory, forget, held, hollow, INITIAL_LOST, MEMORY_IDS, PERK_BONUS, wipe } from '../../src/rules/memory.ts';
import type { Memory } from '../../src/rules/memory.ts';

test('the hero wakes with some memories gone and no Hollow strength beyond his base', () => {
  const memory = createMemory();
  assert.deepEqual(memory.lost, INITIAL_LOST);
  assert.equal(held(memory).length, MEMORY_IDS.length - INITIAL_LOST.length);
  assert.deepEqual(hollow(memory), { mana: 0, damage: 0, trained: true });
});

test('a wipe owes exactly one held memory, which then gives its Hollow perk', () => {
  const memory = createMemory();
  assert.equal(forget(memory, 'feast'), memory, 'nothing is taken without a wipe');
  const owed = wipe(memory);
  assert.equal(owed.pending, true);
  assert.equal(forget(owed, 'home'), owed, 'a memory already gone cannot pay');
  const paid = forget(owed, 'feast');
  assert.deepEqual(paid.lost, [...INITIAL_LOST, 'feast']);
  assert.equal(paid.pending, false);
  assert.equal(forget(paid, 'trial'), paid, 'one memory per wipe');
  assert.deepEqual(hollow(paid), { mana: 0, damage: PERK_BONUS.force, trained: true });
  const twice = forget(wipe(paid), 'trial');
  assert.deepEqual(hollow(twice), { mana: PERK_BONUS.mana, damage: PERK_BONUS.force, trained: true });
});

test('with every memory gone, a wipe takes nothing', () => {
  let memory: Memory = createMemory();
  for (const id of held(memory)) memory = forget(wipe(memory), id);
  assert.equal(held(memory).length, 0);
  assert.equal(wipe(memory), memory);
});

test('Hollow perks strengthen the hero in battle, and forgetting his training dulls his reveal', () => {
  const memory = forget(wipe(forget(wipe(createMemory()), 'training')), 'feast');
  const battle = createBattle('locust', [], hollow(memory));
  assert.equal(battle.party[0].maxMana, 12);
  assert.equal(battle.party[1].maxMana, 12, 'companions are unchanged');
  let fight = act(battle, 'chameleon', 'suppress');
  fight = resolveEnemy(act(act(fight, 'bear', 'support'), 'vulture', 'support'));
  fight = act(fight, 'chameleon', 'attack');
  assert.equal(fight.enemy.health, ENEMIES.locust.health - (MEMBERS.chameleon.damage + PERK_BONUS.force + 2), 'base, Hollow force, and an untrained reveal');
  const trained = act(createBattle('locust', [], hollow(forget(wipe(createMemory()), 'feast'))), 'chameleon', 'attack');
  assert.equal(trained.enemy.health, ENEMIES.locust.health - (MEMBERS.chameleon.damage + PERK_BONUS.force));
});
