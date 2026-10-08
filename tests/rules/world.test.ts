import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conversation } from '../../src/content/church.ts';
import { createMemory, forget, wipe } from '../../src/rules/memory.ts';

test('forgetting a memory changes what the church says, and only that', () => {
  const start = createMemory();
  assert.match(conversation('basin', start.lost).lines[0], /feast you almost remember/);
  assert.match(conversation('priest', start.lost).lines[1], /remember something for you/);
  const noFeast = forget(wipe(start), 'feast');
  assert.match(conversation('basin', noFeast.lost).lines[0], /nothing else/);
  assert.match(conversation('priest', noFeast.lost).lines[1], /stopped saying it/);
  assert.match(conversation('ledger', noFeast.lost).lines[0], /column of dates/);
  const noTrial = forget(wipe(start), 'trial');
  assert.match(conversation('ledger', noTrial.lost).lines[1], /do not know what you did/);
  assert.equal(conversation('door', noTrial.lost).speaker, 'THE CAPITAL');
});
