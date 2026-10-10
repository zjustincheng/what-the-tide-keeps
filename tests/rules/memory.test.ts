import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, ENEMIES, MEMBERS, resolveEnemy } from '../../src/rules/battle.ts';
import { anchor, canRemind, createMemory, forget, forgettable, held, hollow, INITIAL_LOST, MEMORY_IDS, PERK_BONUS, remind, tideTakes, wipe } from '../../src/rules/memory.ts';
import type { Memory } from '../../src/rules/memory.ts';

test('the hero wakes with some memories gone and no Hollow strength beyond his base', () => {
  const memory = createMemory();
  assert.deepEqual(memory.lost, INITIAL_LOST);
  assert.equal(held(memory).length, MEMORY_IDS.length - INITIAL_LOST.length);
  assert.deepEqual(hollow(memory), { mana: 0, damage: 0, trained: true, kraken: true });
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
  assert.deepEqual(hollow(paid), { mana: 0, damage: PERK_BONUS.force, trained: true, kraken: true });
  const twice = forget(wipe(paid), 'trial');
  assert.deepEqual(hollow(twice), { mana: PERK_BONUS.mana, damage: PERK_BONUS.force, trained: true, kraken: true });
});

test('with every memory gone, a wipe takes nothing', () => {
  let memory: Memory = createMemory();
  for (const id of held(memory)) memory = forget(wipe(memory), id);
  assert.equal(held(memory).length, 0);
  assert.equal(wipe(memory), memory);
});

test('Hollow perks strengthen the hero in battle, and forgetting his training dulls his reveal', () => {
  const memory = forget(wipe(forget(wipe(createMemory()), 'training')), 'feast');
  const battle = createBattle('locust', [], { hollow: hollow(memory) });
  assert.equal(battle.party[0].maxMana, 12);
  assert.equal(battle.party[1].maxMana, 12, 'companions are unchanged');
  let fight = act(battle, 'chameleon', 'suppress');
  fight = resolveEnemy(act(act(fight, 'bear', 'support'), 'vulture', 'support'));
  fight = act(fight, 'chameleon', 'attack');
  assert.equal(fight.enemy.health, ENEMIES.locust.health - (MEMBERS.chameleon.damage + PERK_BONUS.force + 2), 'base, Hollow force, and an untrained reveal');
  const trained = act(createBattle('locust', [], { hollow: hollow(forget(wipe(createMemory()), 'feast')) }), 'chameleon', 'attack');
  assert.equal(trained.enemy.health, ENEMIES.locust.health - (MEMBERS.chameleon.damage + PERK_BONUS.force));
});

test('the tide chooses what it takes, the same each time for the same death, and never what is written down', () => {
  const owed = wipe(createMemory());
  const first = tideTakes(owed, 1);
  assert.ok(first && held(owed).includes(first));
  assert.equal(tideTakes(owed, 1), first, 'reloading does not change it');
  const picks = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(deaths => tideTakes(owed, deaths)));
  assert.ok(picks.size > 3, 'it is not always the same memory');
  // Written down, the feast is safe whatever the roll.
  const safe = wipe(anchor(createMemory(), 'feast'));
  for (let deaths = 1; deaths < 30; deaths++) assert.notEqual(tideTakes(safe, deaths), 'feast');
});

test('a friend the hero remembers can remind him of something lost, until his next death, unless he writes it down', () => {
  let memory = forget(wipe(createMemory()), 'kraken');
  assert.equal(hollow(memory).kraken, false);
  assert.equal(canRemind(memory, 'bear', 'kraken'), true);
  assert.equal(canRemind(memory, 'bear', 'home'), false, 'not what was gone before the game began');
  memory = remind(memory, 'bear', 'kraken');
  assert.ok(held(memory).includes('kraken'));
  assert.equal(hollow(memory).kraken, true);
  assert.equal(hollow(memory).damage, 0, 'its perk goes while it is held again');
  assert.equal(forgettable(memory).includes('kraken'), false, 'the tide takes it back by itself');
  // The next death takes it back, along with whatever the tide chooses.
  const after = forget(wipe(memory), 'feast');
  assert.ok(after.lost.includes('kraken') && after.lost.includes('feast'));
  // Written down, a reminded memory stays.
  const kept = forget(wipe(anchor(memory, 'kraken')), 'feast');
  assert.equal(kept.lost.includes('kraken'), false);
  // Forgetting the bear means he can't remind you of anything.
  const noBear = forget(wipe(forget(wipe(createMemory()), 'kraken')), 'bear');
  assert.equal(canRemind(noBear, 'bear', 'kraken'), false);
  assert.equal(canRemind(noBear, 'vulture', 'kraken'), true);
});

test('forgetting the kraken tightens everyone\'s dodging', async () => {
  const { agility, NO_KRAKEN } = await import('../../src/rules/battle.ts');
  const sharp = createBattle('locust');
  const dull = createBattle('locust', [], { hollow: { mana: 0, damage: 2, trained: true, kraken: false } });
  for (const index of [0, 1, 2]) assert.ok(Math.abs(agility(sharp.party[index]) - agility(dull.party[index]) - NO_KRAKEN / 100) < 1e-9);
});
