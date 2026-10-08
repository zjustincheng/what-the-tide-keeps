import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canAct, createBattle, ENEMIES, enemyMana, enemyTarget, intent, MEMBERS, resolveEnemy, SPELL, visibleMana } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';
const finish = (battle: Battle) => {
  for (const member of battle.party) if (!member.acted) battle = act(battle, member.id, 'support');
  return resolveEnemy(battle);
};

test('suppression pays mana, spends a turn, changes targeting, and reveals once on attack', () => {
  let battle = act(createBattle(), 'bear', 'suppress');
  assert.equal(battle.party[1].mana, 11);
  assert.equal(visibleMana(battle.party[1]), 1);
  assert.equal(enemyTarget(battle)?.id, 'chameleon');
  assert.equal(act(battle, 'bear', 'attack'), battle);
  battle = finish(battle);
  assert.equal(canAct(battle, 'bear', 'suppress'), false);
  const before = battle.enemy.health;
  battle = act(battle, 'bear', 'attack');
  assert.equal(before - battle.enemy.health, MEMBERS.bear.damage + 2);
  assert.equal(battle.party[1].suppressed, false);
  let hero = finish(act(createBattle(), 'chameleon', 'suppress'));
  hero = act(hero, 'chameleon', 'attack');
  assert.equal(hero.enemy.health, ENEMIES.locust.health - (MEMBERS.chameleon.damage + 4), 'chameleon has the strongest reveal bonus');
});

test('unknown spell countdown reveals after surviving; an unknown spell ignores barriers and guards', () => {
  let battle = createBattle('acolyte');
  assert.match(intent(battle).tell, /\?\?\?.*2 enemy turns/);
  assert.equal(enemyMana(battle), 2);
  battle = finish(battle);
  assert.equal(intent(battle).name, '???');
  assert.match(intent(battle).tell, /1 enemy turn/);
  // Casting on an ally spends the caster's mana, so Bear remains the target.
  battle = act(battle, 'vulture', 'barrier', 'bear');
  assert.equal(battle.party[2].mana, 5);
  battle = finish(battle);
  assert.equal(battle.party[1].health, battle.party[1].maxHealth - 18, 'unknown magic bypasses both physical guard and barrier');
  assert.deepEqual(battle.studied, [SPELL]);
  assert.equal(battle.enemyRevealed, true);
  assert.equal(enemyMana(battle), 10);
  assert.ok(battle.party.every(member => !member.barrier));
});

test('analysis consumes an action and mana; known barriers stop magic but never physical blows', () => {
  let battle = act(createBattle('acolyte'), 'chameleon', 'analyze');
  assert.equal(battle.party[0].mana, 8);
  assert.deepEqual(battle.studied, [SPELL]);
  assert.equal(canAct(battle, 'bear', 'analyze'), false);
  battle = finish(battle);
  assert.equal(intent(battle).name, SPELL);
  battle = finish(act(battle, 'vulture', 'barrier', 'bear'));
  assert.equal(battle.party[1].health, battle.party[1].maxHealth);
  assert.ok(battle.log.some(line => line.includes('barrier stops')));
  // Physical attacks pass through a barrier if nobody guards.
  let physical = act(createBattle('acolyte', [SPELL]), 'vulture', 'barrier', 'bear');
  physical = resolveEnemy(act(act(physical, 'bear', 'attack'), 'chameleon', 'attack'));
  assert.equal(physical.party[1].health, physical.party[1].maxHealth - 4);
});

test('barriers cost five, cannot target the fallen, and spells are not learned on a total wipe', () => {
  const initial = createBattle('acolyte');
  const low = { ...initial, party: initial.party.map(member => ({ ...member, mana: 4 })) };
  assert.equal(canAct(low, 'chameleon', 'barrier'), false);
  const fallen = { ...initial, party: initial.party.map(member => ({ ...member, health: member.id === 'bear' ? 1 : 0 })) };
  assert.equal(canAct(fallen, 'bear', 'barrier', 'vulture'), false);
  const wipe = resolveEnemy({ ...fallen, round: 2, phase: 'enemy' });
  assert.equal(wipe.phase, 'defeat');
  assert.deepEqual(wipe.studied, []);
  assert.deepEqual(createBattle('acolyte', [SPELL]).studied, [SPELL]);
});

test('studying, guarding physical blows, and shielding the mana target can win the exile encounter', () => {
  let battle = createBattle('acolyte');
  while (battle.phase === 'player') {
    // The chameleon studies the spell, shields the bear when it falls due, and gathers mana in between.
    battle = act(battle, 'chameleon', battle.round === 1 ? 'analyze' : battle.round % 2 === 0 ? 'barrier' : 'gather', 'bear');
    battle = act(battle, 'bear', battle.round % 2 === 0 ? 'attack' : 'support');
    battle = act(battle, 'vulture', 'attack');
    battle = resolveEnemy(battle);
    assert.ok(battle.round <= 12);
    assert.ok(battle.party.every(member => member.mana >= 0 && member.health === member.maxHealth));
  }
  assert.equal(battle.phase, 'victory');
  assert.deepEqual(battle.studied, [SPELL]);
});
