import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forgettingAtCamp, newlyForgotten } from '../../src/rules/companionTalk.ts';
import { INITIAL_MINDS, remindCompanion } from '../../src/rules/companionMemory.ts';
import type { Minds } from '../../src/rules/companionMemory';
import { bearAtCamp } from '../../src/rules/millbrook.ts';
import { vultureAtCamp } from '../../src/rules/highlandLife.ts';
import { createWorld } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';

const ctx = (flags: Flag[]): Context => ({ world: { ...createWorld(), flags }, lost: [], studied: [] });
const usual = { speaker: 'THE BEAR', lines: ['He passes you the bread.'] };

test('what a companion started without is not news: only what the tide took since counts', () => {
  assert.equal(newlyForgotten(INITIAL_MINDS, 'vulture', 'hero'), false, 'the vulture never knew him in this story');
  assert.equal(newlyForgotten(INITIAL_MINDS, 'frog', 'feast'), false, 'the frog already doubted');
  assert.equal(newlyForgotten({ ...INITIAL_MINDS, bear: { lost: ['hero'] } }, 'bear', 'hero'), true);
  const vulture = vultureAtCamp(ctx(['vulture-free', 'hyena-slain']));
  assert.deepEqual(forgettingAtCamp('vulture', INITIAL_MINDS, vulture), vulture, 'her own camp talk, untouched');
});

test('a companion who has lost the hero sits with a stranger, until reminded who he is', () => {
  const minds: Minds = { ...INITIAL_MINDS, bear: { lost: ['hero'] } };
  const talk = forgettingAtCamp('bear', minds, bearAtCamp(ctx(['bear-free', 'boar-defeated'])))!;
  assert.match(talk.lines.join(' '), /do not know yours/);
  const reminded = remindCompanion(['bear', 'feast', 'kraken', 'training', 'trial', 'vulture', 'frog', 'octopus'], minds, 'bear', 'hero');
  assert.deepEqual(forgettingAtCamp('bear', reminded, usual), usual, 'reminded, he talks as he used to');
});

test('one who has lost the feast doubts, and one who has lost the kraken or their craft reaches for it', () => {
  assert.match(forgettingAtCamp('octopus', { ...INITIAL_MINDS, octopus: { lost: ['feast'] } }, usual)!.lines.join(' '), /nothing on it/);
  const reaching = forgettingAtCamp('bear', { ...INITIAL_MINDS, bear: { lost: ['kraken', 'craft'] } }, usual)!;
  assert.equal(reaching.lines[0], usual.lines[0], 'their own talk, first');
  assert.equal(reaching.lines.length, 3);
  assert.equal(forgettingAtCamp('bear', { bear: { lost: ['hero'] } }, undefined), undefined, 'nothing to say when they would not sit anyway');
});
