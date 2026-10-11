import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epilogue } from '../../src/rules/ending.ts';
import { recall, createMemory } from '../../src/rules/memory.ts';

test('the good ending restores what the tide took and ends resurrection', () => {
  const good = epilogue({ flags: ['cages-opened', 'inquisitor-spoke'] }, 'good', true);
  assert.ok(good.some(line => line.includes('What the tide took comes back')));
  assert.ok(good.some(line => line.includes('clear your party\'s name')));
  assert.ok(good.some(line => line.includes('resurrections stop')));
  assert.ok(good.some(line => line.includes('The cell is empty')));
});

test('the bad ending leaves the hero seated beside the human', () => {
  const bad = epilogue({ flags: [] }, 'bad', false);
  assert.ok(bad.some(line => line.includes('You sit beside him')));
  assert.ok(bad.some(line => line.includes('as if it happened to someone else')));
  assert.notDeepEqual(epilogue({ flags: [] }, 'good', true), bad, 'the two endings follow different choices');
});

test('a memory found again is his once more', () => {
  const memory = createMemory();
  assert.ok(memory.lost.includes('name'));
  assert.ok(!recall(memory, 'name').lost.includes('name'));
  assert.equal(recall(recall(memory, 'name'), 'name').lost.length, memory.lost.length - 1);
});
