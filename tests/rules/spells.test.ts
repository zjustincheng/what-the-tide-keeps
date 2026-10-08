import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, canCast, cast, createBattle, ENEMIES, intent, nextStrike, resolveEnemy, UNHOLLOWED } from '../../src/rules/battle.ts';
import { carry, checkSequence, SPELLS, STARTING_BOOKS } from '../../src/rules/spells.ts';

test('a sequence casts only when every key is right, and fails on the first wrong one', () => {
  assert.equal(checkSequence([3, 1, 4], [3]), 'typing');
  assert.equal(checkSequence([3, 1, 4], [3, 1, 4]), 'cast');
  assert.equal(checkSequence([3, 1, 4], [3, 2]), 'fizzle');
});

test('a cast spends the turn and the mana; a fizzle does nothing else', () => {
  const battle = createBattle();
  const hit = cast(battle, 'vulture', true);
  assert.equal(hit.enemy.health, ENEMIES.locust.health - SPELLS['gale-quill'].power);
  assert.equal(hit.party[2].mana, battle.party[2].mana - SPELLS['gale-quill'].cost);
  assert.equal(hit.party[2].acted, true);
  const fizzle = cast(battle, 'vulture', false);
  assert.equal(fizzle.enemy.health, ENEMIES.locust.health);
  assert.equal(fizzle.party[2].mana, hit.party[2].mana);
  assert.match(fizzle.log.at(-1)!, /unravels/);
  assert.equal(canCast(hit, 'vulture'), false, 'one action per turn');
  const drained = { ...battle, party: battle.party.map(member => ({ ...member, mana: 3 })) };
  assert.equal(canCast(drained, 'vulture'), false);
});

test('stone ward guards everyone, still water heals, and a snare costs the enemy its move', () => {
  let battle = cast(createBattle(), 'bear', true);
  battle = act(act(battle, 'chameleon', 'attack'), 'vulture', 'attack');
  assert.equal(nextStrike(battle)!.dodgeable, false, 'the ward turns the blow aside');
  const healer = createBattle('locust', [], UNHOLLOWED, undefined, carry(STARTING_BOOKS, ['pond-primer'], 'chameleon', 'pond-primer'));
  assert.equal(healer.party[0].spell, 'still-water');
  const wounded = { ...healer, party: healer.party.map(member => ({ ...member, health: member.id === 'vulture' ? 0 : 5 })) };
  const mended = cast(wounded, 'chameleon', true);
  assert.deepEqual(mended.party.map(member => member.health), [5 + 8, 5 + 8, 0], 'the fallen stay down');
  const snareBooks = carry(STARTING_BOOKS, ['snare-primer'], 'vulture', 'snare-primer');
  let boar = createBattle('boar', [], UNHOLLOWED, undefined, snareBooks);
  boar = cast(boar, 'vulture', true);
  boar = act(act(boar, 'chameleon', 'attack'), 'bear', 'attack');
  assert.match(nextStrike(boar)!.move.name, /badger's cudgel/, 'the boar himself does not move');
  boar = resolveEnemy(boar);
  assert.ok(boar.log.includes('The boar strains against the thorns and cannot move.'));
  assert.equal(boar.snared, false);
  assert.equal(intent(boar).name, 'Tusk charge');
});

test('a grimoire is carried by one hero at a time, and only once found', () => {
  assert.equal(carry(STARTING_BOOKS, [], 'bear', 'pond-primer'), STARTING_BOOKS);
  const swapped = carry(STARTING_BOOKS, ['thornwork'], 'bear', 'thornwork');
  assert.deepEqual(swapped, { chameleon: null, bear: 'thornwork', vulture: 'windward' });
  assert.equal(createBattle('locust', [], UNHOLLOWED, undefined, swapped).party[0].spell, null);
});
