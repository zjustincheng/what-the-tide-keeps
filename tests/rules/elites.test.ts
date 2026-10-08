import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, intent, resolveEnemy, strike, warded } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';

test('the shrine warden cannot be harmed while its votives burn, and relights them', () => {
  let battle = createBattle('warden');
  assert.equal(warded(battle), true);
  battle = act(battle, 'vulture', 'attack');
  assert.equal(battle.enemy.health, battle.enemy.maxHealth, 'the blow breaks on the candlelight');
  assert.match(battle.log.at(-1)!, /breaks on the candlelight/);
  battle = act(act(battle, 'chameleon', 'attack', 'chameleon', 1), 'bear', 'attack', 'bear', 2);
  battle = resolveEnemy(battle);
  // Snuff both votives, then the warden is open.
  while (!battle.followers.every(votive => votive.health === 0)) {
    for (const member of battle.party) for (const foe of [1, 2]) battle = act(battle, member.id, 'attack', member.id, foe);
    if (battle.phase === 'enemy') battle = resolveEnemy(battle);
  }
  assert.equal(warded(battle), false);
  const opened = act(battle, battle.party.find(member => !member.acted && member.health > 0)!.id, 'attack');
  assert.ok(opened.enemy.health < battle.enemy.health);
  const rekindle = { ...createBattle('warden'), round: 4, phase: 'enemy' as const, followers: battle.followers };
  assert.equal(intent(rekindle).name, 'Rekindle');
  assert.ok(resolveEnemy(rekindle).followers.every(votive => votive.health === votive.maxHealth), 'the votives burn again');
  assert.equal(intent({ ...rekindle, round: 3 }).piercing, 7, 'Judgement drives through guards');
});

test('the mire leech heals by what it takes, so dodging or guarding starves it', () => {
  const hurt: Battle = { ...createBattle('leech'), enemy: { ...createBattle('leech').enemy, health: 30 } };
  const exposed = act(act(act(hurt, 'chameleon', 'attack'), 'bear', 'attack'), 'vulture', 'attack');
  assert.equal(intent(exposed).name, 'Latch');
  const fed = strike(exposed, 'miss');
  assert.equal(fed.enemy.health, exposed.enemy.health + 8);
  assert.ok(fed.log.includes('The leech swells with what it took.'));
  assert.equal(strike(exposed, 'graze').enemy.health, exposed.enemy.health + 4);
  assert.equal(strike(exposed, 'perfect').enemy.health, exposed.enemy.health, 'nothing taken, nothing gained');
  const guarded = act(act(act(hurt, 'bear', 'support'), 'chameleon', 'attack'), 'vulture', 'attack');
  assert.equal(resolveEnemy(guarded).enemy.health, guarded.enemy.health);
});
