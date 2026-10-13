import { test } from 'node:test';
import assert from 'node:assert/strict';
import { holdsState, heroAtCamp } from '../../src/rules/holdsLife.ts';
import { createWorld, drop } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';
const context = (flags: Flag[] = [], lost: Context['lost'] = []): Context => ({ world: { ...createWorld(), flags }, lost, studied: [] });

test('the rookery remains open across death, independently of the recovered laboratory', () => {
  assert.equal(holdsState(context()).open, false);
  assert.equal(holdsState(context(['lab-remembered'])).open, false);
  const opened = context(['cuckoo-slain']);
  assert.equal(holdsState({ ...opened, world: drop(opened.world) }).open, true);
});
test('lost training changes recognition and a reminder restores it', () => {
  const lost = context([], ['training']);
  assert.equal(holdsState(lost).name, 'Terraces you cannot place');
  assert.equal(holdsState({ ...lost, remembered: ['training'] }).name, 'The hold');
});
test('camp reflection reveals the laboratory only after the archive, even when training is lost', () => {
  const before = context([], ['training']);
  assert.doesNotMatch(heroAtCamp(before).lines.join(' '), /cage|keys|child/);
  assert.match(heroAtCamp(before).lines.join(' '), /cannot find/);
  const after = context(['lab-remembered', 'cuckoo-slain'], ['training']);
  assert.match(heroAtCamp(after).lines.join(' '), /cage, a child/);
  assert.match(heroAtCamp(after).lines.join(' '), /next departure/);
  assert.equal(heroAtCamp(after).then, undefined);
  assert.deepEqual(before.world.flags, []);
});
