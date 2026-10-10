import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canAct, createBattle, enemyTarget, UNHOLLOWED, woundsAfter } from '../../src/rules/battle.ts';
import { STARTING_BOOKS } from '../../src/rules/spells.ts';
import { createWorld, drop, rest } from '../../src/rules/world.ts';

const start = (wounds = {}) => createBattle('locust', [], { wounds });

test('wounds carry from one fight into the next, and the fallen stay down', () => {
  const won = { ...start(), party: start().party.map(member => ({ ...member, health: member.id === 'bear' ? 0 : member.id === 'chameleon' ? 12 : member.maxHealth })) };
  const wounds = woundsAfter(won);
  assert.deepEqual(wounds, { chameleon: 8, bear: 30 });
  const next = start(wounds);
  assert.deepEqual(next.party.map(member => member.health), [12, 0, 16]);
  assert.equal(canAct(next, 'bear', 'attack'), false, 'a fallen bear cannot fight');
  assert.notEqual(enemyTarget(next)?.id, 'bear');
  assert.equal(act(next, 'chameleon', 'attack').party[0].health, 12);
});

test('resting at a fire or waking in the church heals every wound', () => {
  const world = { ...createWorld(), wounds: { chameleon: 8 }, coins: 5 };
  assert.deepEqual([rest({ ...world, drained: { chameleon: 6 } }).wounds, rest({ ...world, drained: { chameleon: 6 } }).drained], [{}, {}], 'rest restores mana too');
  assert.equal(rest(world).coins, 5, 'resting costs nothing');
  assert.deepEqual(drop(world).wounds, {});
});

test('a hero still down after a fight has fallen: rest doesn\'t raise them, and they don\'t fight until the church does', async () => {
  const { apply, drop, fell, lineup, rest, toggleWaiting } = await import('../../src/rules/world.ts');
  const { createMemory } = await import('../../src/rules/memory.ts');
  const world = { ...createWorld(), flags: ['bear-free', 'vulture-free', 'frog-free'] as const };
  const down = fell(world as never, ['bear']);
  assert.deepEqual(down.fallen, ['bear']);
  assert.deepEqual(lineup(down), ['chameleon', 'vulture', 'frog'], 'the frog fights in the bear\'s place');
  assert.deepEqual(rest(down).fallen, ['bear'], 'a fire closes wounds, not death');
  assert.equal(toggleWaiting(down, 'bear'), down, 'the fallen can\'t be sent to fight');
  const context = { world: down, studied: [], lost: createMemory().lost };
  assert.deepEqual(apply(context, { raise: 'bear', pay: 40 }).world.fallen, [], 'the church raises them');
  assert.deepEqual(drop(down).fallen, [], 'a wipe wakes everyone at the cot');
  // Against a lieutenant the hero fights, unless he is the one who fell.
  assert.ok(!lineup(fell(world as never, ['chameleon']), true).includes('chameleon'));
});
