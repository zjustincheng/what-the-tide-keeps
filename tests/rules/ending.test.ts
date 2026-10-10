import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epilogue } from '../../src/rules/ending.ts';
import { recall, createMemory } from '../../src/rules/memory.ts';

test('the epilogue tells what the hero did: who was freed, what was opened, whether he has a name', () => {
  const bare = epilogue({ flags: [] }, 'dark', false);
  const full = epilogue({ flags: ['bear-free', 'cages-opened', 'elder-thanked', 'inquisitor-spoke'] }, 'dark', true);
  assert.ok(full.length > bare.length);
  assert.ok(full.some(line => line.includes('The bear goes back to the mill')));
  assert.ok(full.some(line => line.includes('seal\'s boat')));
  assert.ok(full.some(line => line.includes('You tell them')));
  assert.ok(bare.some(line => line.includes('don\'t have one to give them')));
  assert.notDeepEqual(epilogue({ flags: [] }, 'kept', false), bare, 'the two endings are different stories');
});

test('a memory found again is his once more', () => {
  const memory = createMemory();
  assert.ok(memory.lost.includes('name'));
  assert.ok(!recall(memory, 'name').lost.includes('name'));
  assert.equal(recall(recall(memory, 'name'), 'name').lost.length, memory.lost.length - 1);
});
