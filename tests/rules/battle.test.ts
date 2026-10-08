import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canAct, condition, COST, createBattle, drainedAfter, enemyTarget, GATHER, intent, MANA_REGEN, MEMBERS, resolveEnemy } from '../../src/rules/battle.ts';
import type { Battle, MemberId } from '../../src/rules/battle.ts';
import { attackOrGather } from './play.ts';
const member = (battle: Battle, id: MemberId) => battle.party.find(member => member.id === id)!;
// An enemy too tough to finish, for checking how the party falls.
const tough = (battle: Battle): Battle => ({ ...battle, enemy: { ...battle.enemy, health: 999, maxHealth: 999 } });
const round = (battle: Battle, guard = false) => resolveEnemy(attackOrGather(guard ? act(attackOrGather(battle, 'vulture'), 'bear', 'support') : attackOrGather(attackOrGather(battle, 'vulture'), 'bear'), 'chameleon'));

test('all three act once in any order before the enemy; inputs remain immutable', () => {
  const initial = createBattle();
  let next = act(initial, 'vulture', 'attack');
  assert.equal(next.phase, 'player');
  assert.equal(member(next, 'vulture').acted, true);
  assert.equal(member(initial, 'vulture').acted, false);
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
  assert.ok(next.party.every(member => !member.acted));
  assert.ok(next.party.every(member => member.mana === member.maxMana), 'attacks are physical and cost no mana');
  assert.equal(resolveEnemy(next), next);
});

test('an empty mana pool stops spellcraft but never a physical attack or support', () => {
  const initial = createBattle();
  const low = { ...initial, party: initial.party.map(member => ({ ...member, mana: 0 })) };
  assert.equal(canAct(low, 'chameleon', 'suppress'), false);
  assert.equal(canAct(low, 'chameleon', 'barrier'), false);
  assert.equal(canAct(low, 'chameleon', 'attack'), true);
  assert.equal(canAct(low, 'chameleon', 'support'), true);
  let next = act(act(act(low, 'chameleon', 'support'), 'bear', 'support'), 'vulture', 'support');
  next = resolveEnemy(next);
  assert.ok(next.party.every(member => member.mana === MANA_REGEN));
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
  assert.equal(member(battle, 'chameleon').health, member(battle, 'chameleon').maxHealth);
  assert.equal(member(battle, 'bear').health, member(battle, 'bear').maxHealth);
  assert.ok(battle.party.every(member => member.guardingFor === null));
  const leap = intent(battle).damage;
  battle = round(battle);
  assert.equal(member(battle, 'chameleon').health, member(battle, 'chameleon').maxHealth - leap);
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
  assert.equal(before - battle.enemy.health, MEMBERS.vulture.damage + 3);
  assert.equal(member(battle, 'vulture').focused, false);
});

test('a downed member is skipped; a wipe requires every companion to fall', () => {
  let battle = tough(createBattle());
  while(member(battle, 'bear').health > 0) { battle = round(battle); assert.ok(battle.round < 12); }
  assert.equal(battle.phase, 'player');
  battle = act(act(battle, 'chameleon', 'attack'), 'vulture', 'attack');
  assert.equal(battle.phase, 'enemy', 'no action is required from a downed bear');
  battle = resolveEnemy(battle);
  while(battle.phase === 'player') {
    for(const member of battle.party) battle = attackOrGather(battle, member.id);
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
  const max = hero.maxHealth;
  for(const [health, label] of [[max, 'Unhurt'], [max - 1, 'Bloodied'], [max / 2, 'Wounded'], [max / 4, 'Barely standing'], [0, 'Downed']] as const) {
    assert.equal(condition({ ...hero, health }), label);
  }
});

test('mana spent in one fight stays spent in the next, and gathering draws it back', () => {
  let battle = createBattle();
  battle = resolveEnemy(act(act(act(battle, 'vulture', 'attack'), 'bear', 'support'), 'chameleon', 'suppress'));
  const drained = drainedAfter(battle);
  assert.deepEqual(drained, {}, 'one point of hiding is back by the end of the round');
  battle = resolveEnemy(act(act(act(battle, 'vulture', 'barrier', 'bear'), 'bear', 'support'), 'chameleon', 'attack'));
  assert.deepEqual(drainedAfter(battle), { vulture: COST.barrier - MANA_REGEN });
  const next = createBattle('locust', [], { drained: { chameleon: 9 } });
  assert.equal(next.party[0].mana, 1);
  assert.equal(canAct(next, 'chameleon', 'suppress'), true);
  assert.equal(canAct(next, 'chameleon', 'barrier'), false, 'too drained for a barrier');
  const gathered = act(next, 'chameleon', 'gather');
  assert.equal(gathered.party[0].mana, 1 + GATHER);
  assert.equal(gathered.party[0].acted, true, 'gathering is the hero\'s action');
  assert.equal(canAct(createBattle(), 'chameleon', 'gather'), false, 'nothing to gather when full');
});
