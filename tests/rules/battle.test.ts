import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canAct, condition, createBattle, enemyTarget, resolveEnemy } from '../../src/rules/battle.ts';
import type { Battle, MemberId } from '../../src/rules/battle.ts';
const member = (battle: Battle, id: MemberId) => battle.party.find(member => member.id === id)!;
const round = (battle: Battle, guard = false) => resolveEnemy(act(act(act(battle, 'vulture', 'attack'), 'bear', guard ? 'support' : 'attack'), 'chameleon', 'attack'));

test('all three act once in any order before the enemy; inputs remain immutable', () => {
  const initial = createBattle();
  let next = act(initial, 'vulture', 'attack');
  assert.equal(next.phase, 'player');
  assert.equal(member(next, 'vulture').mana, 8);
  assert.equal(member(initial, 'vulture').mana, 10);
  assert.equal(act(next, 'vulture', 'attack'), next);
  assert.equal(resolveEnemy(next), next);
  next = act(next, 'chameleon', 'attack');
  assert.equal(next.phase, 'player');
  next = act(next, 'bear', 'support');
  assert.equal(next.phase, 'enemy');
  assert.equal(act(next, 'bear', 'attack'), next);
  next = resolveEnemy(next);
  assert.equal(next.round, 2);
  assert.equal(next.phase, 'player');
  assert.ok(next.party.every(member => !member.acted && member.mana === member.maxMana));
  assert.equal(resolveEnemy(next), next);
});

test('low mana prevents attacks but always permits a support action', () => {
  const initial = createBattle();
  const low = { ...initial, party: initial.party.map(member => ({ ...member, mana: 0 })) };
  assert.equal(canAct(low, 'chameleon', 'attack'), false);
  assert.equal(act(low, 'chameleon', 'attack'), low);
  assert.equal(canAct(low, 'chameleon', 'support'), true);
  let next = act(act(act(low, 'chameleon', 'support'), 'bear', 'support'), 'vulture', 'support');
  next = resolveEnemy(next);
  assert.ok(next.party.every(member => member.mana === 3));
});

test('enemy reads current mana, uses stable ties, and ignores downed companions', () => {
  let battle = createBattle();
  assert.equal(enemyTarget(battle)?.id, 'bear');
  battle = act(battle, 'bear', 'attack');
  assert.equal(enemyTarget(battle)?.id, 'bear', 'bear wins a tie');
  const down = { ...battle, party: battle.party.map(member => member.id === 'bear' ? { ...member, health: 0 } : member) };
  assert.equal(enemyTarget(down)?.id, 'chameleon');
});

test('bear protects another ally; protection expires after one enemy turn', () => {
  const initial = createBattle();
  let battle = { ...initial, party: initial.party.map(member => member.id === 'bear' ? { ...member, mana: 1 } : member) };
  battle = act(act(act(battle, 'bear', 'support', 'chameleon'), 'chameleon', 'attack'), 'vulture', 'attack');
  assert.equal(enemyTarget(battle)?.id, 'chameleon');
  battle = resolveEnemy(battle);
  assert.equal(member(battle, 'chameleon').health, 16);
  assert.equal(member(battle, 'bear').health, 24);
  assert.ok(battle.party.every(member => member.guardingFor === null));
  battle = round(battle);
  assert.equal(member(battle, 'chameleon').health, 2);
});

test('invalid ally support does not spend a turn', () => {
  const initial = createBattle();
  assert.equal(act(initial, 'chameleon', 'support', 'vulture'), initial);
  const down = { ...initial, party: initial.party.map(member => member.id === 'vulture' ? { ...member, health: 0 } : member) };
  assert.equal(act(down, 'bear', 'support', 'vulture'), down);
  assert.equal(act(down, 'vulture', 'support'), down);
});

test('vulture focus persists between rounds and boosts only the next attack', () => {
  let battle = act(act(act(createBattle(), 'vulture', 'support'), 'bear', 'support'), 'chameleon', 'support');
  battle = resolveEnemy(battle);
  assert.equal(member(battle, 'vulture').focused, true);
  const before = battle.enemy.health;
  battle = act(battle, 'vulture', 'attack');
  assert.equal(before - battle.enemy.health, 9);
  assert.equal(member(battle, 'vulture').focused, false);
});

test('a downed member is skipped; a wipe requires every companion to fall', () => {
  let battle = createBattle();
  for(let i=0;i<3;i++) battle = round(battle);
  assert.equal(member(battle, 'bear').health, 0);
  assert.equal(battle.phase, 'player');
  battle = act(act(battle, 'chameleon', 'attack'), 'vulture', 'attack');
  assert.equal(battle.phase, 'enemy', 'no action is required from a downed bear');
  battle = resolveEnemy(battle);
  while(battle.phase === 'player') {
    for(const member of battle.party) battle = act(battle, member.id, 'attack');
    battle = resolveEnemy(battle);
    assert.ok(battle.round < 12);
  }
  assert.equal(battle.phase, 'defeat');
  assert.ok(battle.party.every(member => member.health === 0));
  assert.equal(act(battle, 'chameleon', 'support'), battle);
});

test('coordinated guarding wins and victory cancels unused actions and retaliation', () => {
  let battle = createBattle();
  while(battle.phase === 'player') { battle = round(battle, true); assert.ok(battle.round < 12); }
  assert.equal(battle.phase, 'victory');
  assert.ok(battle.party.every(member => member.health === member.maxHealth));
  assert.equal(resolveEnemy(battle), battle);
  assert.equal(act(battle, 'bear', 'attack'), battle);
});

test('health descriptions use words at each threshold', () => {
  const hero = member(createBattle(), 'chameleon');
  for(const [health, label] of [[16, 'Unhurt'], [15, 'Bloodied'], [8, 'Wounded'], [4, 'Barely standing'], [0, 'Downed']] as const) {
    assert.equal(condition({ ...hero, health }), label);
  }
});
