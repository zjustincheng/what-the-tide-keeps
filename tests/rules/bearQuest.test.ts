import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearReturn, withBearReplies, withBearLedger } from '../../src/content/bearQuest.ts';
import { fields } from '../../src/content/fields.ts';
import { town } from '../../src/content/town.ts';
import { millInside } from '../../src/content/interiors.ts';
import { conversation, replies, apply, createWorld, drop } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';
import { keepMemory, held, forgettable, tideTakesAll, forgetAll, wipe, hollow, anchor } from '../../src/rules/memory.ts';
import { act, canAct, createBattle, cost, nextStrike, resolveEnemy, hesitate } from '../../src/rules/battle.ts';
import { createGear, equip, canEquip } from '../../src/rules/gear.ts';
const ctx = (flags: Flag[] = []): Context => ({ world: { ...createWorld(), flags }, lost: [], studied: [] });
const ready: Flag[] = ['bear-free', 'boar-defeated'];

test('the bear quest can take either route, with the formal route requiring the reeve’s acknowledgment', () => {
  let context = ctx(ready);
  context = apply(context, conversation(bearReturn, 'bear-return', context).then!);
  context = apply(context, conversation(withBearLedger(millInside), 'mill-ledger', context).then!);
  assert.ok(context.world.flags.includes('bear-mill-record'));
  const options = replies(conversation(withBearReplies(fields, 'miller'), 'miller', context).choices, context);
  const speak = options.find(choice => choice.text.startsWith('Let the bear speak'))!;
  assert.ok(speak); assert.equal(speak.choices?.length, 3);
  const formal = apply(context, speak.choices![0].then!);
  assert.equal(conversation(bearReturn, 'bear-return', formal).choices, undefined);
  const acknowledgment = replies(conversation(withBearReplies(town, 'reeve'), 'reeve', formal).choices, formal).find(choice => choice.then?.set === 'bear-reeve-accountable')!;
  assert.ok(acknowledgment);
  const recorded = apply(formal, acknowledgment.then!);
  const privateExit = apply(context, speak.choices![1].then!);
  for (const route of [recorded, privateExit]) {
    const reward = conversation(bearReturn, 'bear-return', route).choices![0].then!;
    assert.equal(reward.find, 'broken-link'); assert.equal(reward.keepMemory, 'bear');
    const completed = apply(route, reward);
    assert.equal(completed.world.found.filter(id => id === 'broken-link').length, 1);
    assert.equal(conversation(bearReturn, 'bear-return', completed).then, undefined);
    assert.equal(conversation(bearReturn, 'bear-return', completed).choices, undefined);
    assert.ok(drop(completed.world).found.includes('broken-link'));
  }
});
test('the quest keeps writs, pest rewards, and the heron clue available and needs a living bear', () => {
  const writ = ctx(['writ-given']);
  assert.equal(conversation(withBearReplies(fields, 'miller'), 'miller', writ).then?.set, 'bear-free');
  const after = ctx(ready);
  assert.ok(conversation(withBearReplies(fields, 'miller'), 'miller', after).choices?.some(choice => choice.text.includes('heron')));
  const clearing = ctx(['pests-field', 'pests-yard']);
  assert.equal(conversation(withBearReplies(town, 'reeve'), 'reeve', clearing).then?.set, 'writ-given');
  const fallen = { ...ctx([...ready, 'bear-mill-record']), world: { ...ctx([...ready, 'bear-mill-record']).world, fallen: ['bear' as const] } };
  assert.ok(!replies(conversation(withBearReplies(fields, 'miller'), 'miller', fallen).choices, fallen).some(choice => choice.text.startsWith('Let the bear speak')));
});
test('quest dialogue follows the actual speakers and retains the older ledger clue', () => {
  const context = ctx([...ready, 'bear-mill-returned', 'bear-mill-record']);
  const speech = replies(conversation(withBearReplies(fields, 'miller'), 'miller', context).choices, context).find(choice => choice.text === 'Let the bear speak.')!;
  assert.equal(speech.voices?.length, speech.lines.length);
  assert.equal(speech.voices?.[0]?.speaker, 'THE BEAR');
  assert.equal(speech.voices?.[1]?.speaker, 'THE MILLER');
  const ledger = conversation(withBearLedger(millInside), 'mill-ledger', context);
  assert.match(ledger.choices!.find(choice => choice.text === 'Earlier pages.')!.lines.join(' '), /PIKE TAKEN FROM THE POND/);
  assert.equal(ledger.voices?.[2]?.portrait, 'bear');
  const reward = conversation(bearReturn, 'bear-return', ctx([...ready, 'bear-mill-left'])).choices![0];
  assert.doesNotMatch(reward.lines.join(' '), /equipment|permanently|mana/);
});
test('the keepsake restores a lost bear memory and protects it through every later wipe without an anchor slot', () => {
  let memory = keepMemory({ lost: ['bear', 'home', 'name'], pending: false, anchors: ['bear'] }, 'bear');
  assert.ok(held(memory).includes('bear')); assert.ok(!memory.lost.includes('bear'));
  assert.deepEqual(memory.anchors, []); assert.equal(anchor(memory, 'bear'), memory);
  assert.equal(hollow(memory).mana, 0);
  for (let death = 1; death < 30; death++) {
    const owed = wipe(memory, 2); const taken = tideTakesAll(owed, death);
    assert.ok(!taken.includes('bear')); assert.ok(!forgettable(owed).includes('bear'));
    memory = forgetAll(owed, taken);
    assert.ok(held(memory).includes('bear')); assert.deepEqual(memory.keepsakeMemories, ['bear']);
  }
});
test('equipping the link protects both allies for mana and an action, and the protection expires', () => {
  const gear = equip(createGear(), ['broken-link'], 'bear', 0, 'broken-link');
  assert.equal(canEquip(['broken-link'], 'chameleon', 'broken-link'), false);
  const battle = createBattle('locust', [], { gear });
  assert.equal(cost(battle.party[1], 'support'), 3);
  const guarding = act(battle, 'bear', 'support', 'chameleon');
  assert.equal(guarding.party[1].mana, 9); assert.equal(canAct(guarding, 'bear', 'attack'), false);
  const watched = { ...guarding, phase: 'enemy' as const, party: guarding.party.map(member => ({ ...member, mana: member.id === 'vulture' ? 20 : member.mana })) };
  assert.equal(nextStrike(watched)?.target.id, 'vulture'); assert.equal(nextStrike(watched)?.damage, 0);
  assert.equal(hesitate({ ...watched, phase: 'player' }).party[2].health, battle.party[2].health);
  const after = resolveEnemy(watched);
  assert.ok(after.party.every(member => member.guardingFor === null));
  const drained = { ...battle, party: battle.party.map(member => ({ ...member, mana: member.id === 'bear' ? 2 : member.mana })) };
  assert.equal(canAct(drained, 'bear', 'support'), false);
  const magic = createBattle('acolyte', [], { gear });
  const magicGuard = act(magic, 'bear', 'support');
  const spell = { ...magicGuard, round: 2, phase: 'enemy' as const };
  assert.equal(nextStrike(spell)?.move.type, 'spell'); assert.ok(nextStrike(spell)!.damage > 0);
});
