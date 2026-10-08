import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canAct, condition, createBattle, resolveEnemy } from '../../src/rules/battle.ts';

test('an action spends mana once, then only the enemy can act', () => {
  const initial = createBattle();
  const next = act(initial, 'attack');
  assert.equal(next.hero.mana, 8);
  assert.equal(next.enemy.health, 14);
  assert.equal(next.phase, 'enemy');
  assert.equal(act(next, 'attack'), next);
  assert.equal(act(next, 'guard'), next);
  assert.equal(initial.enemy.health, 18, 'input state is immutable');
  const round = resolveEnemy(next);
  assert.equal(round.hero.health, 13);
  assert.equal(round.hero.mana, 10);
  assert.equal(round.round, 2);
  assert.equal(resolveEnemy(round), round, 'cannot replay an enemy turn');
});

test('unaffordable actions do not spend a turn or produce negative mana', () => {
  const battle = createBattle();
  const low = { ...battle, hero: { ...battle.hero, mana: 1 } };
  assert.equal(canAct(low, 'attack'), false);
  assert.equal(act(low, 'attack'), low);
  assert.equal(act(low, 'guard'), low);
});

test('guard absorbs a physical hit, clears next round, and regenerates mana', () => {
  const battle = resolveEnemy(act(createBattle(), 'guard'));
  assert.equal(battle.hero.health, 16);
  assert.equal(battle.hero.mana, 8);
  assert.equal(battle.guarding, false);
  const unguarded = resolveEnemy(act(battle, 'attack'));
  assert.equal(unguarded.hero.health, 9, 'heavy leap is not protected by the last round’s guard');
});

test('reading the alternating physical tell wins; attacking blindly loses', () => {
  let careful = createBattle();
  while (careful.phase === 'player') {
    careful = resolveEnemy(act(careful, careful.round % 2 === 0 ? 'guard' : 'attack'));
    assert.ok(careful.round < 12);
    assert.ok(careful.hero.mana >= 0 && careful.hero.mana <= 10);
  }
  assert.equal(careful.phase, 'victory');
  assert.equal(careful.hero.health, 4);
  assert.equal(careful.enemy.health, 0);
  assert.equal(resolveEnemy(careful), careful, 'a defeated enemy cannot retaliate');
  let reckless = createBattle();
  while (reckless.phase === 'player') reckless = resolveEnemy(act(reckless, 'attack'));
  assert.equal(reckless.phase, 'defeat');
  assert.equal(reckless.hero.health, 0);
  assert.equal(act(reckless, 'guard'), reckless);
});

test('health descriptions handle each threshold without exposing exact numbers', () => {
  const hero = createBattle().hero;
  assert.equal(condition(hero), 'Unhurt');
  assert.equal(condition({ ...hero, health: 15 }), 'Bloodied');
  assert.equal(condition({ ...hero, health: 8 }), 'Wounded');
  assert.equal(condition({ ...hero, health: 4 }), 'Barely standing');
  assert.equal(condition({ ...hero, health: 0 }), 'Downed');
});
