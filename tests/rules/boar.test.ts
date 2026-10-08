import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canAct, createBattle, FURY_PER_HIT, intent, resolveEnemy } from '../../src/rules/battle.ts';
import type { Battle, Foe } from '../../src/rules/battle.ts';
const round = (battle: Battle, foe: Foe) => resolveEnemy(act(act(act(battle, 'bear', 'support'), 'chameleon', 'attack', 'chameleon', foe), 'vulture', 'attack', 'vulture', foe));

test('hits aimed at a follower land on the boar and feed his fury', () => {
  const battle = act(createBattle('boar'), 'vulture', 'attack', 'vulture', 1);
  assert.equal(battle.followers[0].health, 18, 'the badger is untouched');
  assert.equal(battle.enemy.health, 74);
  assert.equal(battle.fury, FURY_PER_HIT);
  assert.match(battle.log.at(-1)!, /throws himself in front of the badger/);
  assert.equal(intent({ ...battle, round: 2 }).damage, 12 + FURY_PER_HIT);
  assert.equal(canAct(createBattle('boar'), 'vulture', 'attack', 'vulture', 3), false, 'there is no third follower');
});

test('every enemy acts in turn, and a guard stops ordinary blows but not fury', () => {
  const calm = round(createBattle('boar'), 0);
  assert.equal(calm.party[1].health, 24, 'the guarding bear turns aside the boar and both cudgels');
  assert.equal(calm.log.filter(line => line.includes('turns aside')).length, 3);
  const angry = round(createBattle('boar'), 1);
  assert.equal(angry.party[1].health, 24 - 2 * FURY_PER_HIT, 'fury drives through the guard');
  assert.ok(angry.log.some(line => line.includes('fury drives through')));
});

test('fighting the boar directly wins; clearing his followers first is the trap', () => {
  let direct = createBattle('boar');
  while (direct.phase === 'player') direct = round(direct, 0);
  assert.equal(direct.phase, 'victory');
  assert.ok(direct.party.every(member => member.health === member.maxHealth));
  let trap = createBattle('boar');
  while (trap.phase === 'player') trap = round(trap, 1);
  assert.equal(trap.phase, 'defeat');
  assert.ok(trap.enemy.health > 0);
});
