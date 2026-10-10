import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOUTS, nextBout } from '../../src/rules/ring.ts';

test('the Talon Ring\'s bouts are fought in order, ending with the champion', () => {
  assert.equal(nextBout([]), 0);
  assert.equal(nextBout(['ring-1']), 1);
  assert.equal(nextBout(['ring-1', 'ring-2', 'ring-3']), 3);
  assert.equal(BOUTS[3].encounter, 'champion');
  assert.equal(nextBout(['ring-1', 'ring-2', 'ring-3', 'ring-champion']), undefined);
});
