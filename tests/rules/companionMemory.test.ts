import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bond, canRemindCompanion, companionMods, companionTakes, COMPANION_COSTS, forgetCompanions, forgettableBy, heldBy, INITIAL_MINDS, remembers, remindCompanion } from '../../src/rules/companionMemory.ts';
import type { Minds } from '../../src/rules/companionMemory';
import { canRemind, createMemory, held, keepMemory } from '../../src/rules/memory.ts';
import { createBattle } from '../../src/rules/battle.ts';

test('each companion starts where the guideline puts them', () => {
  assert.deepEqual(heldBy(INITIAL_MINDS, 'bear'), ['hero', 'feast', 'kraken', 'craft'], 'the bear has died least');
  assert.deepEqual(heldBy(INITIAL_MINDS, 'vulture'), ['craft'], 'the vulture has died most and does not know the hero');
  assert.ok(!remembers(INITIAL_MINDS, 'frog', 'feast') && remembers(INITIAL_MINDS, 'frog', 'hero'), 'the frog knows the party but not the frame');
  assert.deepEqual(heldBy(INITIAL_MINDS, 'octopus'), ['hero', 'feast', 'kraken', 'craft']);
  assert.deepEqual(createMemory().companions, INITIAL_MINDS);
});

test('a wipe takes one memory from each companion who fought, the same one however often it is reloaded', () => {
  const taken = companionTakes(INITIAL_MINDS, ['bear', 'frog'], 4);
  assert.deepEqual(Object.keys(taken).sort(), ['bear', 'frog']);
  assert.deepEqual(companionTakes(INITIAL_MINDS, ['bear', 'frog'], 4), taken, 'fixed by the death');
  assert.ok(forgettableBy(INITIAL_MINDS, 'bear').includes(taken.bear!));
  const after = forgetCompanions(INITIAL_MINDS, taken);
  assert.ok(!remembers(after, 'bear', taken.bear!));
  assert.deepEqual(heldBy(after, 'octopus'), ['hero', 'feast', 'kraken', 'craft'], 'whoever waited it out keeps everything');
  // Over enough deaths the tide takes everything there is to take, and then nothing.
  let minds: Minds = INITIAL_MINDS;
  for (let death = 0; death < 12; death++) minds = forgetCompanions(minds, companionTakes(minds, ['bear'], death));
  assert.deepEqual(heldBy(minds, 'bear'), []);
  assert.deepEqual(companionTakes(minds, ['bear'], 99), {});
});

test('what they forget changes how they fight: a softer blow, worse dodging, and more health for each memory gone', () => {
  const minds: Minds = { bear: { lost: ['craft', 'kraken'] } };
  assert.deepEqual(companionMods(minds, 'bear'), { health: 2 * COMPANION_COSTS.perk, damage: -COMPANION_COSTS.craft, agility: -COMPANION_COSTS.kraken });
  const whole = createBattle('locust', [], { minds: {} }).party.find(member => member.id === 'bear')!;
  const hollow = createBattle('locust', [], { minds }).party.find(member => member.id === 'bear')!;
  assert.equal(hollow.maxHealth, whole.maxHealth + 6);
  assert.equal(hollow.gear.damage, whole.gear.damage - 2);
  assert.equal(hollow.gear.agility, whole.gear.agility - 10);
  assert.equal(createBattle('locust', [], { minds }).party.find(member => member.id === 'chameleon')!.maxHealth, createBattle('locust').party[0].maxHealth, 'the hero is unaffected');
});

test('a friend who has forgotten the hero cannot remind him of anything, until reminded who he is', () => {
  const memory = { ...createMemory(), lost: ['home', 'name', 'feast'] as const };
  assert.equal(canRemind(memory as never, 'bear', 'feast'), true);
  assert.equal(canRemind(memory as never, 'vulture', 'feast'), false, 'she does not know him');
  // The hero, who remembers her, can tell her who he is at a fire; then she can remind him in turn, until the next death.
  const minds = remindCompanion(held(memory as never), INITIAL_MINDS, 'vulture', 'hero');
  assert.ok(remembers(minds, 'vulture', 'hero'));
  assert.equal(canRemind({ ...memory, companions: minds } as never, 'vulture', 'feast'), true);
  assert.ok(!remembers(forgetCompanions(minds, {}), 'vulture', 'hero'), 'the reminder fades at the next death');
});

test('he can only give back what he still holds himself, and never their craft', () => {
  const holds = held(createMemory());
  assert.equal(canRemindCompanion(holds, INITIAL_MINDS, 'frog', 'feast'), true, 'he remembers the feast');
  assert.equal(canRemindCompanion(holds.filter(id => id !== 'feast'), INITIAL_MINDS, 'frog', 'feast'), false);
  assert.equal(canRemindCompanion(holds.filter(id => id !== 'vulture'), INITIAL_MINDS, 'vulture', 'hero'), false, 'he has to remember her to tell her who he is');
  assert.equal(canRemindCompanion(holds, { bear: { lost: ['craft'] } }, 'bear', 'craft'), false);
  assert.equal(canRemindCompanion(holds, INITIAL_MINDS, 'bear', 'feast'), false, 'nothing to give back to someone who remembers');
});

test('a finished companion quest holds the bond both ways: they remember the hero for good', () => {
  const memory = keepMemory(createMemory(), 'vulture');
  assert.ok(remembers(memory.companions!, 'vulture', 'hero'));
  assert.ok(!forgettableBy(memory.companions!, 'vulture').includes('hero'), 'the tide cannot take it');
  let minds = memory.companions!;
  for (let death = 0; death < 10; death++) minds = forgetCompanions(minds, companionTakes(minds, ['vulture'], death));
  assert.ok(remembers(minds, 'vulture', 'hero'));
  assert.deepEqual(bond({}, 'bear'), { bear: { lost: [], bonded: true } });
});
