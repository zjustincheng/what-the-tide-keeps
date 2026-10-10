import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLIMB_SECONDS, grip, HANG_SECONDS, REACH } from '../../src/rules/climb.ts';

test('grip runs out climbing, lasts longer hanging still, and comes back on a ledge', () => {
  assert.equal(grip(1, CLIMB_SECONDS, { climbing: true, moving: true }), 0);
  assert.equal(grip(1, CLIMB_SECONDS, { climbing: true, moving: false }), 1 - CLIMB_SECONDS / HANG_SECONDS);
  assert.equal(grip(0, 5, { climbing: false, moving: false }), 1);
});

test('a full grip carries the hero up about nine tiles of wall', () => {
  assert.equal(REACH, 9);
});
