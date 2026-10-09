import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance, darkness, DAY_MS, NIGHT, phase, timeName } from '../../src/rules/clock.ts';

test('the day turns from day to dusk to night and back to dawn', () => {
  assert.equal(phase(0), 'day');
  assert.equal(phase(0.6), 'dusk');
  assert.equal(phase(NIGHT), 'night');
  assert.ok(Math.abs(advance(0.9, DAY_MS * 0.2) - 0.1) < 1e-9, 'past midnight it wraps to the next day');
  assert.equal(darkness(0.2), 0);
  assert.ok(darkness(0.7) > 0 && darkness(0.7) < 1, 'dusk dims');
  assert.equal(darkness(0.8), 1);
  assert.equal(timeName(0.3), 'Afternoon');
  assert.equal(timeName(0.8), 'Night');
});
