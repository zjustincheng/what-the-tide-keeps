import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scramble, settle } from '../../src/rules/piecing.ts';
import { FRAGMENTS, STIRS, TELLING } from '../../src/content/piecing.ts';

test('every memory a friend can tell is told out of order, the same way each time, with every piece out of place', () => {
  for (const id of Object.keys(FRAGMENTS)) {
    const order = scramble(id);
    assert.deepEqual([...order].sort(), [0, 1, 2, 3], id);
    assert.ok(order.every((piece, place) => piece !== place), `${id} starts with nothing in place`);
    assert.deepEqual(scramble(id), order);
  }
});

test('putting it back keeps the pieces in the right place, and is whole only when all four are', () => {
  assert.deepEqual(settle([0, 2, 1, 3]), { right: [true, false, false, true], whole: false });
  assert.deepEqual(settle([0, 1, 2, 3]), { right: [true, true, true, true], whole: true });
  assert.equal(settle([0, 1, 2]).whole, false);
});

test('each friend has a voice for it, and each memory a place that stirs it', () => {
  for (const who of ['bear', 'vulture', 'frog', 'octopus'] as const) assert.ok(TELLING[who].open && TELLING[who].wrong && TELLING[who].done);
  assert.deepEqual(Object.keys(STIRS).sort(), Object.keys(FRAGMENTS).sort());
  // A memory of a friend never needs that friend to tell it.
  for (const id of Object.keys(FRAGMENTS)) assert.equal(FRAGMENTS[id as keyof typeof FRAGMENTS].length, 4);
});

test('a friend asks two things only someone who was there would know, with the true answer in a different place each time', async () => {
  const { ASKING, HEARING } = await import('../../src/content/piecing.ts');
  const { answerOrder } = await import('../../src/rules/piecing.ts');
  const all = [...ASKING.feast, ...ASKING.kraken, ...Object.values(ASKING.hero).flat()];
  for (const question of all) assert.equal(new Set(question.answers).size, 3, question.ask);
  for (const who of ['bear', 'vulture', 'frog', 'octopus'] as const) { assert.equal(ASKING.hero[who].length, 2); assert.ok(HEARING[who].wrong && HEARING[who].right); }
  assert.deepEqual([0, 1, 2].map(q => answerOrder(q).indexOf(0)), [1, 2, 0]);
});
