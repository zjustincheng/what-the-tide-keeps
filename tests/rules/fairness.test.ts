import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, agility, createBattle, grade, hesitate, nextStrike, strike } from '../../src/rules/battle.ts';

test('agility widens or narrows the dodge window: the vulture is quick, the bear is not', () => {
  const battle = createBattle();
  const [chameleon, bear, vulture] = battle.party;
  assert.ok(agility(vulture) > agility(chameleon) && agility(chameleon) > agility(bear));
  const move = { name: 'Blow', type: 'physical' as const, damage: 5 };
  assert.equal(grade(85, move, agility(vulture)), 'perfect');
  assert.equal(grade(85, move, agility(chameleon)), 'graze');
  // Keepsakes can change it.
  const shelled = createBattle('locust', [], { gear: { chameleon: ['tide-shell'], bear: [], vulture: [] } });
  assert.ok(agility(shelled.party[0]) > agility(chameleon));
});

test('some blows land several times, each dodged on its own, and some go through any guard', () => {
  let battle = createBattle('locust', [], { roster: ['chameleon'] });
  battle = { ...battle, round: 1, phase: 'enemy' as const };
  assert.match(nextStrike(battle)!.move.name, /1 of 2/);
  battle = strike(battle, 'perfect');
  assert.equal(battle.phase, 'enemy');
  assert.match(nextStrike(battle)!.move.name, /2 of 2/);
  // The boar's trample goes through the bear's guard.
  let boar = createBattle('boar', [], { roster: ['chameleon', 'bear'] });
  boar = act(boar, 'bear', 'support', 'chameleon');
  boar = { ...boar, stage: 2, round: 3, phase: 'enemy' as const };
  const trample = nextStrike(boar)!;
  assert.equal(trample.move.name, 'Trample');
  assert.equal(trample.guarded, undefined);
  assert.ok(trample.damage > 0);
});

test('hesitating gives the enemy a free blow, which a guard still holds', () => {
  const battle = createBattle('locust', [], { roster: ['chameleon'] });
  const late = hesitate(battle);
  assert.ok(late.party[0].health < battle.party[0].health);
  assert.match(late.log.at(-1)!, /You hesitate/);
  assert.equal(late.phase, 'player');
  const guarded = hesitate({ ...battle, party: battle.party.map(member => ({ ...member, guardingFor: member.id })) });
  assert.equal(guarded.party[0].health, battle.party[0].health);
});

test('each blow asks for its own kind of dodge, and every caster has a spell to study', async () => {
  const { dodgeKind, ENEMY_SPELLS, intent: plan } = await import('../../src/rules/battle.ts');
  assert.equal(dodgeKind({ type: 'physical', damage: 5 }), 'ring');
  assert.equal(dodgeKind({ type: 'physical', damage: 12 }), 'ring', 'heavy blows close a ring too, with a narrower perfect window');
  assert.equal(dodgeKind({ type: 'physical', damage: 12, hits: 2 }), 'ring');
  assert.equal(dodgeKind({ type: 'spell', damage: 14 }), 'keys');
  assert.equal(dodgeKind({ type: 'physical', damage: 8, drain: true }), 'bar');
  // The warden's Judgement is hidden until studied, then has a name and can be barred.
  const warden = { ...createBattle('warden'), round: 3 };
  assert.equal(plan(warden).name, '???');
  assert.equal(ENEMY_SPELLS.warden, 'Judgement');
  const studied = act({ ...warden, round: 3 }, 'chameleon', 'analyze');
  assert.ok(studied.studied.includes('Judgement'));
  assert.equal(plan(studied).name, 'Judgement');
});
