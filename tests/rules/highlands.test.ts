import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, FEED, intent, nextStrike, resolveEnemy, SPELL, strike } from '../../src/rules/battle.ts';

test('an ambush gives the enemy the first turn', () => {
  const battle = createBattle('raider', [], { ambush: true });
  assert.equal(battle.phase, 'enemy');
  assert.match(battle.log.at(-1)!, /Ambush/);
  assert.equal(resolveEnemy(battle).phase, 'player');
  assert.equal(createBattle('raider').phase, 'player');
});

test('the vulture cannot be brought down; living through three rounds wins the duel', () => {
  let battle = createBattle('vulture', [], { roster: ['chameleon', 'bear'] });
  battle = { ...battle, enemy: { ...battle.enemy, health: 2 } };
  battle = act(battle, 'chameleon', 'attack');
  assert.equal(battle.enemy.health, 1);
  for (let round = 0; round < 3 && battle.phase !== 'victory'; round++) {
    battle = { ...battle, party: battle.party.map(member => ({ ...member, health: 99, maxHealth: 99 })) };
    battle = act(battle, 'chameleon', 'support');
    battle = act(battle, 'bear', 'support');
    battle = resolveEnemy(battle);
  }
  assert.equal(battle.phase, 'victory');
  assert.equal(battle.round, 3);
});

test('the hexer and the brute land a spell and a heavy physical blow in the same round', () => {
  let battle = createBattle('pair', [SPELL]);
  battle = { ...battle, round: 2, phase: 'enemy' };
  const first = nextStrike(battle)!;
  assert.equal(first.move.type, 'spell');
  battle = strike(battle);
  const second = nextStrike(battle)!;
  assert.equal(second.move.name, "brute's pick");
  assert.equal(second.move.damage, 7);
  // The hexer's spell can be analyzed like the exile's.
  assert.equal(act(createBattle('pair'), 'chameleon', 'analyze').studied.includes(SPELL), true);
});

test('the hyena feeds on the fallen and grows stronger, unless a barrier covers the body', () => {
  const start = createBattle('hyena', [], { roster: ['chameleon', 'bear'] });
  const fallen = { ...start, round: 3, phase: 'enemy' as const, party: start.party.map(member => member.id === 'bear' ? { ...member, health: 0 } : member) };
  assert.equal(intent(fallen).feed, true);
  const fed = strike(fallen);
  assert.equal(fed.fury, FEED);
  assert.match(fed.log.join(' '), /feeds on Bear/);
  // Covered by a barrier, the bear is safe; with no other body she finds nothing.
  const covered = { ...fallen, party: fallen.party.map(member => member.id === 'bear' ? { ...member, barrier: true } : member) };
  assert.notEqual(intent(covered).feed, true);
  // A fallen ghoul feeds her too, and she cannot raise it again.
  const ghoul = { ...covered, followers: covered.followers.map((follower, index) => index === 0 ? { ...follower, health: 0 } : follower) };
  const ate = strike(ghoul);
  assert.equal(ate.followers[0].eaten, true);
  assert.match(ate.log.join(' '), /barrier holds her off/);
  const raise = resolveEnemy({ ...ate, round: 4, phase: 'enemy' as const, step: 0 });
  assert.equal(raise.followers[0].health, 0);
});

test('a written-down memory survives the next death, then has to be written again', async () => {
  const { anchor, createMemory, forget, forgettable, wipe } = await import('../../src/rules/memory.ts');
  let memory = anchor(createMemory(), 'feast');
  assert.deepEqual(memory.anchors, ['feast']);
  memory = wipe(memory);
  assert.equal(forgettable(memory).includes('feast'), false);
  assert.equal(forget(memory, 'feast'), memory, 'an anchored memory cannot be chosen');
  memory = forget(memory, 'trial');
  assert.deepEqual(memory.anchors, []);
  assert.ok(memory.lost.includes('trial'));
  // One slot: writing another replaces it.
  assert.deepEqual(anchor(anchor(memory, 'feast'), 'bear').anchors, ['bear']);
});

test("a companion's own grimoire cannot be borrowed before they join, and comes back when they do", async () => {
  const { settle, STARTING_BOOKS } = await import('../../src/rules/spells.ts');
  // The chameleon took the vulture's Windward before she joined.
  const borrowed = { chameleon: 'windward' as const, bear: 'riverstone' as const, vulture: null };
  const before = settle(borrowed, ['chameleon', 'bear']);
  assert.equal(before.chameleon, 'thornwork', 'he gets his own back');
  assert.equal(before.vulture, 'windward');
  assert.deepEqual(settle(borrowed, ['chameleon', 'bear', 'vulture']), { chameleon: 'windward', bear: 'riverstone', vulture: null });
  // Joined with nothing, she gets Windward back once it is free.
  assert.deepEqual(settle({ chameleon: 'pond-primer', bear: 'riverstone', vulture: null }, ['chameleon', 'bear', 'vulture']), { chameleon: 'pond-primer', bear: 'riverstone', vulture: 'windward' });
  assert.deepEqual(settle(STARTING_BOOKS, ['chameleon']), STARTING_BOOKS);
});

test('joining takes back your own grimoire from whoever carried it', async () => {
  const { reclaim } = await import('../../src/rules/spells.ts');
  assert.deepEqual(reclaim({ chameleon: 'windward', bear: 'riverstone', vulture: null }, 'vulture'), { chameleon: 'thornwork', bear: 'riverstone', vulture: 'windward' });
  assert.deepEqual(reclaim({ chameleon: 'pond-primer', bear: 'riverstone', vulture: null }, 'vulture'), { chameleon: 'pond-primer', bear: 'riverstone', vulture: 'windward' });
});
