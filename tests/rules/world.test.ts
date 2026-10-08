import { test } from 'node:test';
import assert from 'node:assert/strict';
import { church } from '../../src/content/church.ts';
import { conversation as say } from '../../src/content/dialogue.ts';
import { createMemory, forget, wipe } from '../../src/rules/memory.ts';

const conversation = (name: string, lost: Parameters<typeof say>[2]) => say(church, name, lost);

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
  assert.equal(conversation('basin', noTrial.lost).speaker, 'THE TIDAL BASIN');
});
