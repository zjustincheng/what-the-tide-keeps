import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, DART, DOSE, ENEMY_POISON, intent, POISON, resolveEnemy, SOUR, SOURING, strike, useSupply } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';
import { createWorld, lineup, roster, toggleWaiting } from '../../src/rules/world.ts';

const MARSH = ['chameleon', 'bear', 'frog'] as const;
const everyone = (battle: Battle, action: 'attack' | 'support' = 'attack') => battle.party.reduce((next, member) => act(next, member.id, action), battle);

test('a poisoned blow leaves poison that bites at the end of every enemy turn, unless dodged clean', () => {
  const battle = { ...everyone(createBattle('mosquito', [], { roster: [...MARSH] })), round: 1 };
  assert.equal(intent(battle).poison, 3);
  // Its needle is its only blow, so the enemy turn ends with it, and the poison bites straight away.
  const stung = strike(battle, 'miss');
  const bitten = stung.party.find(member => member.poison > 0)!;
  assert.equal(bitten.poison, 2, 'three rounds, one gone');
  assert.equal(bitten.health, bitten.maxHealth - 5 - POISON);
  assert.equal(strike(battle, 'perfect').party.every(member => member.poison === 0), true, 'a perfect dodge keeps it out');
  // Next turn it bites again.
  const later = resolveEnemy(everyone({ ...stung, round: 3 }, 'support'));
  assert.equal(later.party.find(member => member.id === bitten.id)!.poison, 1);
});

test("the frog's dart poisons the enemy, and her dose mends an ally and draws out their poison", () => {
  let battle = createBattle('scorpion', [], { roster: [...MARSH] });
  battle = act(battle, 'frog', 'attack');
  assert.equal(battle.enemyPoison, DART);
  const health = battle.enemy.health;
  battle = resolveEnemy(act(act(battle, 'chameleon', 'support'), 'bear', 'support'));
  assert.equal(battle.enemy.health, health - ENEMY_POISON);
  const hurt: Battle = { ...createBattle('scorpion', [], { roster: [...MARSH] }), party: createBattle('scorpion', [], { roster: [...MARSH] }).party.map(member => member.id === 'bear' ? { ...member, health: 10, poison: 3 } : member) };
  const dosed = act(hurt, 'frog', 'support', 'bear');
  assert.deepEqual([dosed.party[1].health, dosed.party[1].poison], [10 + DOSE, 0]);
});

test('Souring turns every heal into harm for two turns', () => {
  // The apprentice casts Souring on even rounds.
  let battle = { ...createBattle('apprentice', [], { roster: [...MARSH] }), round: 2 };
  assert.equal(intent(battle).name, '???', 'unstudied, its name is hidden');
  assert.equal(intent({ ...battle, studied: [SOURING] }).name, SOURING);
  battle = resolveEnemy(everyone(battle, 'support'));
  assert.equal(battle.soured, SOUR);
  assert.match(battle.log.join(' '), /healing will burn/);
  const hurt = { ...battle, party: battle.party.map(member => member.id === 'bear' ? { ...member, health: 20 } : member) };
  assert.equal(act(hurt, 'frog', 'support', 'bear').party[1].health, 20 - DOSE, 'the dose burns');
  const fed = useSupply({ ...hurt, supplies: { ...hurt.supplies, 'fish-stew': 1 } }, 'chameleon', 'fish-stew', 'bear');
  assert.equal(fed.party[1].health, 2, 'so does food');
  // Antivenom heals nothing, so Souring can't turn it.
  const cured = useSupply({ ...hurt, party: hurt.party.map(member => ({ ...member, poison: 3 })), supplies: { ...hurt.supplies, antivenom: 1 } }, 'chameleon', 'antivenom', 'bear');
  assert.deepEqual([cured.party[1].health, cured.party[1].poison], [20, 0]);
});

test('everyone starts poisoned in the viper\'s apothecary', () => {
  const battle = createBattle('viper', [], { roster: [...MARSH] });
  assert.ok(battle.party.every(member => member.poison > 0));
  assert.match(battle.log.join(' '), /poisoned already/);
});

test('up to three fight: any companion can be sent to wait, never the hero, and bringing a fourth back sends the newest to wait', () => {
  const world = { ...createWorld(), flags: ['bear-free', 'vulture-free', 'frog-free'] } as never;
  assert.deepEqual(roster(world), ['chameleon', 'bear', 'vulture', 'frog']);
  assert.deepEqual(lineup(world), ['chameleon', 'bear', 'vulture'], 'the newest waits by default');
  const bearWaits = toggleWaiting(world, 'bear');
  assert.deepEqual(lineup(bearWaits), ['chameleon', 'vulture', 'frog']);
  assert.deepEqual(lineup(toggleWaiting(world, 'chameleon')), lineup(world), 'the hero always fights');
  // Two can wait: the hero goes in with one companion.
  assert.deepEqual(lineup(toggleWaiting(bearWaits, 'vulture')), ['chameleon', 'frog']);
  // Bringing the bear back, with three already fighting, sends the newest fighter to wait.
  const back = toggleWaiting(bearWaits, 'bear');
  assert.deepEqual(lineup(back), ['chameleon', 'bear', 'vulture']);
  assert.deepEqual(back.waiting, ['frog']);
});
