import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epilogue, endingStory } from '../../src/rules/ending.ts';
import { recall, createMemory } from '../../src/rules/memory.ts';

test('the good ending restores what the tide took and ends resurrection', () => {
  const good = epilogue({ flags: ['cages-opened', 'inquisitor-spoke'] }, 'good', true);
  assert.ok(good.some(line => line.includes('What the tide took comes back')));
  assert.match(good.join(' '), /clear your party[’']s name/);
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


test('the finale closes the frame, memory conduit, sentence, sea agreement, and each companion arc',()=>{
  const story=endingStory({flags:['bear-free','vulture-free','frog-free','octopus-free','inquisitor-spoke']},'good',true);
  const text=story.shots.map(shot=>shot.text).join(' ');
  assert.match(text,/admits to the feast murders and the frame/);
  assert.match(text,/No more memories are poured into the human/);
  assert.match(text,/officials who concealed the project must answer/);
  assert.match(text,/sea is named in the new Covenant/);
  for(const name of ['THE BEAR','THE VULTURE','THE FROG','THE OCTOPUS'])assert.ok(story.shots.some(shot=>shot.caption===name));
  assert.equal(story.finalAction,'Return to the harbor');
  assert.ok(new Set(story.shots.map(shot=>shot.art)).size>=6);
  assert.match(text,/You do not know where he went/);
});

test('the ending accounts for missing reunions without claiming they accompanied the hero',()=>{
  const story=endingStory({flags:[]},'good',false);
  assert.match(story.shots.find(shot=>shot.caption==='THE BEAR')!.text,/pardon reaches the mill/);
  assert.match(story.shots.find(shot=>shot.caption==='THE VULTURE')!.text,/courier finds/);
  assert.doesNotMatch(story.shots.at(-1)!.text,/calls you by name/);
  const freed=epilogue({flags:['cages-opened']},'good',true).join(' ');
  assert.match(freed,/Those freed from the works/);
});
