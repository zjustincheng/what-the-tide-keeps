import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, cost, createBattle, MEMBERS, resolveEnemy, UNHOLLOWED, visibleMana } from '../../src/rules/battle.ts';
import { createGear, equip, KEEPSAKE_IDS } from '../../src/rules/gear.ts';
import { apply, createWorld, drop, holds } from '../../src/rules/world.ts';

test('only found keepsakes can be equipped, some only by one hero, and each sits in one slot', () => {
  let gear = createGear();
  assert.equal(equip(gear, [], 'chameleon', 0, 'covenant-token'), gear, 'a keepsake must be found first');
  assert.equal(equip(gear, KEEPSAKE_IDS, 'bear', 0, 'cracked-mirror'), gear, 'the mirror is the chameleon\'s');
  assert.equal(equip(gear, KEEPSAKE_IDS, 'bear', 2, 'yoke-peg'), gear, 'there are only two slots');
  gear = equip(gear, KEEPSAKE_IDS, 'bear', 0, 'covenant-token');
  gear = equip(gear, KEEPSAKE_IDS, 'bear', 1, 'yoke-peg');
  assert.deepEqual(gear.bear, ['covenant-token', 'yoke-peg']);
  gear = equip(gear, KEEPSAKE_IDS, 'vulture', 0, 'covenant-token');
  assert.deepEqual(gear.bear, ['yoke-peg'], 'equipping elsewhere moves it');
  assert.deepEqual(gear.vulture, ['covenant-token']);
  assert.deepEqual(equip(gear, KEEPSAKE_IDS, 'vulture', 0, null).vulture, [], 'an empty choice takes it off');
});

test('keepsakes change their holder in battle, drawbacks included', () => {
  let gear = createGear();
  gear = equip(gear, KEEPSAKE_IDS, 'chameleon', 0, 'cracked-mirror');
  gear = equip(gear, KEEPSAKE_IDS, 'vulture', 0, 'crow-feather');
  gear = equip(gear, KEEPSAKE_IDS, 'bear', 0, 'covenant-token');
  gear = equip(gear, KEEPSAKE_IDS, 'bear', 1, 'yoke-peg');
  const plain = createBattle();
  const battle = createBattle('locust', [], UNHOLLOWED, gear);
  const [hero, bear, vulture] = battle.party;
  assert.equal(bear.maxHealth, plain.party[1].maxHealth + 6 + 8);
  assert.equal(visibleMana(bear), bear.mana + 2, 'the token makes the bear easy to see');
  assert.equal(cost(bear, 'attack'), 3);
  assert.equal(vulture.maxHealth, plain.party[2].maxHealth - 4);
  assert.equal(act(battle, 'vulture', 'attack').enemy.health, battle.enemy.health - (MEMBERS.vulture.damage + 3));
  assert.equal(cost(hero, 'suppress'), 2);
  let reveal = act(battle, 'chameleon', 'suppress');
  assert.equal(reveal.party[0].mana, hero.mana - 2);
  reveal = act(resolveEnemy(act(act(reveal, 'bear', 'support'), 'vulture', 'support')), 'chameleon', 'attack');
  assert.equal(reveal.enemy.health, battle.enemy.health - (MEMBERS.chameleon.damage + 4 + 3), 'the mirror adds to his reveal');
});

test('found keepsakes are kept through a wipe', () => {
  let context = { world: createWorld(), lost: [], studied: [] };
  assert.equal(holds(context, { owns: 'yoke-peg' }), false);
  context = apply(context, { find: 'yoke-peg', give: 'bell' });
  assert.equal(holds(context, { owns: 'yoke-peg' }), true);
  assert.deepEqual(drop(context.world), { flags: [], carried: [], found: ['yoke-peg'] });
});
