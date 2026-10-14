import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withMarine, withShark, withWolf } from '../../src/content/masters.ts';
import { fort } from '../../src/content/highlands.ts';
import { innLore } from '../../src/content/lore.ts';
import { port } from '../../src/content/ocean.ts';
import { apply, conversation, createWorld, drop, replies, techniques } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';
import type { MemoryId } from '../../src/rules/memory';
import { createBattle, DODGE, FOOTING, grade, nextStrike, RIPOSTE, strike } from '../../src/rules/battle.ts';
import type { Battle, Technique } from '../../src/rules/battle';

const ctx = (flags: Flag[] = [], lost: MemoryId[] = []): Context => ({ world: { ...createWorld(), flags }, lost, studied: [] });
const offered = (dialogue: ReturnType<typeof withWolf>, point: string, context: Context) => replies(conversation(dialogue, point, context).choices, context);

test('each master teaches only once they would: the wolf after the captain, the marine to someone who remembers the wall, the shark after his nephew', () => {
  const masters = [
    { dialogue: withWolf(fort), point: 'veteran', text: 'Teach me to fight.', ready: ctx(['captain-slain']), early: ctx(), flag: 'learned-riposte' },
    { dialogue: withMarine(innLore), point: 'marine', text: 'How did you stand on the wall?', ready: ctx(), early: ctx([], ['kraken']), flag: 'learned-footing' },
    { dialogue: withShark(port), point: 'pirate', text: 'Where did you learn to fight?', ready: ctx(['shark-slain']), early: ctx(), flag: 'learned-breath' },
  ] as const;
  for (const master of masters) {
    const refusal = offered(master.dialogue, master.point, master.early).find(choice => choice.text === master.text)!;
    assert.ok(refusal, `${master.point}: the question can always be asked`);
    assert.equal(refusal.then, undefined, `${master.point}: but nothing is taught too early`);
    const lesson = offered(master.dialogue, master.point, master.ready).find(choice => choice.text === master.text)!;
    assert.equal(lesson.then?.set, master.flag);
    assert.match(lesson.lines.at(-1)!, /^Learned: /);
    const taught = apply(master.ready, lesson.then!);
    assert.ok(!offered(master.dialogue, master.point, taught).some(choice => choice.text === master.text), 'taught once');
    assert.ok(drop(taught.world).flags.includes(master.flag), 'no death takes it');
  }
  // Each points the way to another, and what they already said stays.
  assert.match(offered(withWolf(fort), 'veteran', ctx(['captain-slain'])).find(choice => choice.then?.set)!.lines.join(' '), /Millbrook inn/);
  const purse = { ...ctx(), world: { ...ctx().world, coins: 20 } };
  assert.ok(offered(withWolf(fort), 'veteran', purse).some(choice => choice.text.startsWith('Play bones')));
  assert.deepEqual(techniques({ ...createWorld(), flags: ['learned-breath', 'learned-riposte'] }), ['riposte', 'breath']);
});

// An enemy turn with one physical blow coming at someone.
function blowAt(techniques: Technique[]): Battle {
  const battle = createBattle('locust', [], { techniques });
  return { ...battle, phase: 'enemy', step: 0, party: battle.party.map(member => ({ ...member, mana: 4 })) };
}

test('riposte: a perfect dodge of a blow strikes the main enemy back, but never kills it, and needs the technique', () => {
  const before = blowAt(['riposte']);
  assert.equal(nextStrike(before)?.move.type, 'physical');
  const after = strike(before, 'perfect');
  assert.equal(after.enemy.health, before.enemy.health - RIPOSTE);
  assert.match(after.log.join(' '), /strikes back/);
  assert.equal(strike(before, 'graze').enemy.health, before.enemy.health, 'only a clean dodge answers');
  assert.equal(strike(blowAt([]), 'perfect').enemy.health, before.enemy.health, 'not without the technique');
  const last = { ...before, enemy: { ...before.enemy, health: 2 } };
  assert.equal(strike(last, 'perfect').enemy.health, 1, 'never the last blow');
});

test('second breath: a perfect dodge gives the dodger back a point of mana', () => {
  const before = blowAt(['breath']);
  const target = nextStrike(before)!.target.id;
  const after = strike(before, 'perfect');
  assert.equal(after.party.find(member => member.id === target)!.mana, 5);
  assert.equal(strike(before, 'graze').party.find(member => member.id === target)!.mana, 4);
});

test('footing: a graze comes from further off, but a perfect dodge is no easier', () => {
  const move = nextStrike(blowAt([]))!.move;
  const late = DODGE.graze * 1.15;
  assert.equal(grade(late, move), 'miss');
  assert.equal(grade(late, move, 1, true), 'graze');
  assert.equal(grade(DODGE.graze * FOOTING + 1, move, 1, true), 'miss');
  assert.equal(grade(DODGE.perfect + 5, move, 1, true), 'graze', 'the perfect window does not grow');
});
