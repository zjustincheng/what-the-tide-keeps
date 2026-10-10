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
  assert.equal(battle.enemy.health, health - ENEMY_POISON * 2, 'a scorpion is an insect: the poison bites twice as hard');
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

test('any three fight: anyone can wait, someone always fights, and the hero always faces a lieutenant', () => {
  const world = { ...createWorld(), flags: ['bear-free', 'vulture-free', 'frog-free'] } as never;
  assert.deepEqual(roster(world), ['chameleon', 'bear', 'vulture', 'frog']);
  assert.deepEqual(lineup(world), ['chameleon', 'bear', 'vulture'], 'the newest waits by default');
  // The hero can wait out an ordinary fight.
  const heroWaits = toggleWaiting(world, 'chameleon');
  assert.deepEqual(lineup(heroWaits), ['bear', 'vulture', 'frog']);
  // Against a lieutenant he steps in for the newest.
  assert.deepEqual(lineup(heroWaits, true), ['chameleon', 'bear', 'vulture']);
  // Bringing a waiting one back, with three already fighting, sends the newest fighter to wait.
  const back = toggleWaiting(heroWaits, 'chameleon');
  assert.deepEqual(lineup(back), ['chameleon', 'bear', 'vulture']);
  assert.deepEqual(back.waiting, ['frog']);
  // The last one fighting stays.
  const alone = ['bear', 'vulture', 'frog'].reduce((next, member) => toggleWaiting(next, member as never), world);
  assert.deepEqual(lineup(alone), ['chameleon']);
  assert.deepEqual(lineup(toggleWaiting(alone, 'chameleon')), ['chameleon']);
});

test('whose blows land depends on what the enemy is: bear on armour, vulture on flyers, chameleon on casters, frog\'s poison on insects', async () => {
  const { matchup, venom } = await import('../../src/rules/battle.ts');
  assert.equal(matchup('bear', 'weevil'), 1.5);
  assert.equal(matchup('bear', 'harrier'), 0.5);
  assert.equal(matchup('vulture', 'harrier'), 1.5);
  assert.equal(matchup('vulture', 'captain'), 0.5);
  assert.equal(matchup('chameleon', 'acolyte'), 1.5);
  assert.equal(venom('mosquito'), 2);
  assert.equal(venom('ghoul'), 0);
  // In a fight: the bear's maul on armour hits half again as hard; his strike on the followers is ordinary.
  const bear = act(createBattle('weevil'), 'bear', 'attack');
  assert.equal(createBattle('weevil').enemy.health - bear.enemy.health, Math.round(5 * 1.5));
  assert.match(bear.log.at(-1)!, /lands hard/);
  const dead = act(createBattle('ghoul', [], { roster: ['chameleon', 'frog'] }), 'frog', 'attack');
  assert.equal(dead.enemyPoison, 0, 'the dead don\'t take poison');
});
