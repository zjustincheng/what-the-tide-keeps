import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, DODGE, grade, intent, LEAD, nextStrike, resolveEnemy, SPELL, strike, timing } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';
// Everyone attacks, so nothing is guarded.
const exposed = (battle: Battle) => act(act(act(battle, 'chameleon', 'attack'), 'bear', 'attack'), 'vulture', 'attack');

test('timing is graded, never rolled, and heavy blows leave a narrower perfect window', () => {
  const light = { name: 'jab', type: 'physical' as const, damage: 4 };
  const heavy = { name: 'leap', type: 'physical' as const, damage: 10 };
  assert.equal(grade(0, light), 'perfect');
  assert.equal(grade(-DODGE.perfect, light), 'perfect');
  assert.equal(grade(DODGE.perfect, heavy), 'graze');
  assert.equal(grade(DODGE.heavyPerfect, heavy), 'perfect');
  assert.equal(grade(DODGE.graze, light), 'graze');
  assert.equal(grade(-(DODGE.graze + 1), light), 'miss', 'moving too soon is as bad as too late');
});

test('a perfect dodge avoids the blow and a graze halves it', () => {
  const battle = exposed(createBattle());
  const next = nextStrike(battle)!;
  assert.equal(next.dodgeable, true);
  const health = next.target.health;
  const dodged = strike(battle, 'perfect');
  assert.equal(dodged.party.find(member => member.id === next.target.id)!.health, health);
  assert.match(dodged.log.at(-1)!, /finds only air/);
  const grazed = strike(battle, 'graze');
  assert.equal(grazed.party.find(member => member.id === next.target.id)!.health, health - Math.ceil(next.damage / 2));
  assert.equal(strike(battle, 'miss').party.find(member => member.id === next.target.id)!.health, health - next.damage);
  // Without dodges, striking blow by blow matches resolving the whole turn at once.
  let blows = battle;
  while (blows.phase === 'enemy') blows = strike(blows);
  assert.deepEqual(blows, resolveEnemy(battle));
});

test('guarded blows need no dodge, and an unknown spell cannot be dodged', () => {
  const guarded = act(act(act(createBattle(), 'bear', 'support'), 'chameleon', 'attack'), 'vulture', 'attack');
  assert.equal(nextStrike(guarded)!.dodgeable, false);
  let exile = resolveEnemy(exposed(createBattle('acolyte')));
  exile = exposed(exile);
  assert.equal(intent(exile).type, 'spell');
  const unknown = nextStrike(exile)!;
  assert.equal(unknown.dodgeable, false);
  const health = unknown.target.health;
  assert.equal(strike(exile, 'perfect').party.find(member => member.id === unknown.target.id)!.health, health - 18, 'a perfect press does nothing against ???');
  const studied = exposed(resolveEnemy(exposed(createBattle('acolyte', [SPELL]))));
  assert.equal(nextStrike(studied)!.dodgeable, true);
});

test("each of the boar's blows is its own dodge, and the turn ends after the last", () => {
  let battle = exposed(createBattle('boar'));
  assert.equal(nextStrike(battle)!.move.name, 'Shoulder blow');
  battle = strike(battle, 'perfect');
  assert.equal(battle.phase, 'enemy');
  assert.match(nextStrike(battle)!.move.name, /badger's cudgel/);
  battle = strike(strike(battle, 'perfect'), 'perfect');
  assert.equal(battle.phase, 'player');
  assert.equal(battle.round, 2);
  assert.ok(battle.party.every(member => member.health === member.maxHealth));
});

test('stronger blows leave a narrower window, and some cannot be dodged at all', () => {
  const tusk = intent({ ...createBattle('boar'), round: 2 });
  assert.equal(grade(50, tusk), 'graze', 'the boar charges too fast for an ordinary perfect dodge');
  assert.equal(grade(130, tusk), 'miss');
  const exposed = (encounter: Parameters<typeof createBattle>[0], round: number) =>
    act(act(act({ ...createBattle(encounter), round }, 'chameleon', 'attack'), 'bear', 'attack'), 'vulture', 'attack');
  // The warden's Judgement is a spell, nameless and undodgeable until it has been studied.
  for (const [encounter, round, name] of [['leech', 3, 'Coil'], ['warden', 3, '???'], ['weevil', 3, 'Rolling charge']] as const) {
    const battle = exposed(encounter, round);
    const next = nextStrike(battle)!;
    assert.equal(next.move.name, name);
    assert.equal(next.dodgeable, false, `${name} cannot be dodged`);
    assert.match(intent(battle).tell, /dodge/);
    const hit = strike(battle, 'perfect');
    assert.ok(hit.party.find(member => member.id === next.target.id)!.health < next.target.health, 'a perfect press does nothing');
  }
});

// A boss's blow at a given round and stage, at the start of its turn.
const blowAt = (encounter: Parameters<typeof createBattle>[0], round: number, stage = 1) => nextStrike({ ...createBattle(encounter), round, stage, phase: 'enemy' })!;

test('bosses keep their own time: slow charges, quick strikes, and feints that hold the ring', () => {
  // An ordinary blow closes at the usual pace.
  assert.deepEqual(timing(blowAt('locust', 1).move), { lead: LEAD, feint: 0, impact: LEAD });
  // The boar paws the ash a long time before his charge; the viper's fang is the fastest thing in the marsh.
  const charge = intent({ ...createBattle('boar'), round: 2 });
  assert.equal(charge.name, 'Tusk charge');
  assert.ok(timing(charge).lead > LEAD);
  const fang = [1, 2, 3, 4].map(round => intent({ ...createBattle('viper'), round })).find(move => move.name === 'Fang')!;
  assert.ok(timing(fang).lead < LEAD);
  // The cuckoo fences the way the lord was taught: the ring stops and holds, so a press on the usual beat is far too soon.
  const blade = intent({ ...createBattle('cuckoo'), round: 1 });
  assert.equal(blade.name, 'Borrowed blade');
  const { impact, feint } = timing(blade);
  assert.ok(feint > 0 && impact === LEAD + feint);
  assert.equal(grade(LEAD - impact, blade), 'miss');
  assert.equal(grade(0, blade), 'perfect');
});

test('a combo keeps its uneven rhythm hit by hit, so it cannot be dodged on one beat', () => {
  let battle: Battle = { ...createBattle('duellist'), round: 1, phase: 'enemy' };
  const leads: number[] = [];
  while (nextStrike(battle)?.move.name.startsWith('Rapier')) { leads.push(timing(nextStrike(battle)!.move).lead); battle = strike(battle, 'perfect'); }
  assert.equal(leads.length, 2);
  assert.ok(leads[1] < leads[0], 'the second thrust comes quicker');
  assert.match(intent({ ...createBattle('duellist'), round: 1 }).tell, /quick one after/);
});
