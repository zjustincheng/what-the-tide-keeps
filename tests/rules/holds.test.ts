import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, enemyMana, enemyTarget, FALSE_MANA, intent, resolveEnemy, UNMASK } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';

const everyone = (battle: Battle, action: 'attack' | 'support' = 'support') => battle.party.reduce((next, member) => act(next, member.id, action), battle);

test('a false display never moves, even when it casts, and the log says what that means', () => {
  let battle = { ...createBattle('duellist'), round: 2 };
  assert.equal(enemyMana(battle), FALSE_MANA.duellist);
  battle = resolveEnemy(everyone(battle));
  assert.ok(battle.enemy.mana < createBattle('duellist').enemy.mana, 'its real mana dropped');
  assert.equal(enemyMana(battle), FALSE_MANA.duellist, 'the display did not move');
  assert.match(battle.log.join(' '), /mana display did not move/);
});

test('the cuckoo slips into the party as whoever shows the most mana; their mana stops moving and everyone else\'s is shaken', () => {
  let battle = { ...createBattle('cuckoo'), round: 2 };
  battle = resolveEnemy(everyone(battle));
  assert.ok(battle.impostor, 'he is among you');
  const shape = battle.impostor!.as;
  assert.notEqual(shape, 'chameleon', 'never the hero');
  const frozen = battle.party.find(member => member.id === shape)!.mana;
  // Orders to that shape are quietly betrayed; striking at the empty chair finds nothing.
  const struck = act(battle, 'chameleon', 'attack');
  assert.equal(struck.enemy.health, battle.enemy.health);
  assert.match(struck.log.at(-1)!, /somewhere among you/);
  assert.equal(intent(battle).name, 'Knife in the ranks');
  assert.notEqual(enemyTarget(battle)!.id, shape, 'the knife never finds him');
  // A round later, the real ones' mana has moved and his has not.
  const later = resolveEnemy(everyone(battle));
  assert.equal(later.party.find(member => member.id === shape)!.mana, frozen);
  assert.ok(later.party.filter(member => member.id !== shape).some(member => member.mana !== battle.party.find(other => other.id === member.id)!.mana));
});

test('striking the right friend throws the cuckoo out of their shape; the wrong one only hurts a friend', () => {
  const hidden: Battle = { ...createBattle('cuckoo'), impostor: { as: 'bear', shown: 12 } };
  const found = act(hidden, 'chameleon', 'unmask', 'bear');
  assert.equal(found.impostor, null);
  assert.equal(found.enemy.health, hidden.enemy.health - UNMASK);
  assert.equal(found.party[1].health, hidden.party[1].health, 'the real bear is unhurt');
  const wrong = act(hidden, 'chameleon', 'unmask', 'vulture');
  assert.ok(wrong.impostor);
  assert.ok(wrong.party[2].health < hidden.party[2].health);
  assert.match(wrong.log.at(-1)!, /It is really Vulture/);
  // The impostor's own orders come to nothing.
  const betrayed = act(hidden, 'bear', 'support', 'vulture');
  assert.equal(betrayed.party[2].guardingFor, null);
  assert.equal(act(createBattle('locust'), 'chameleon', 'unmask', 'bear').log.length, createBattle('locust').log.length, 'only against the cuckoo');
});
