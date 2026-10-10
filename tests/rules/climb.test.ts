import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNS, HITS, holdAt, makeWall, move, reachableHolds, startClimb, strike } from '../../src/rules/climb.ts';

test('every wall has a way to the top, the same wall every time for the same seed', () => {
  for (let seed = 1; seed < 60; seed++) {
    const wall = makeWall(seed, 12);
    const reached = reachableHolds(wall);
    assert.ok([...reached].some(key => key.endsWith(',11')), `wall ${seed} has a way up`);
    assert.equal(reached.size, wall.holds.length, `every hold on wall ${seed} can be reached`);
  }
  assert.deepEqual(makeWall(7, 10), makeWall(7, 10));
});

test('moves go only to the hold right next to you; there is no reaching across a gap', () => {
  const wall = { height: 3, holds: [{ col: 2, row: 0 }, { col: 4, row: 0 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 3, row: 2 }] };
  let climb = startClimb(wall);
  assert.deepEqual(move(climb, 'right').at, climb.at, 'the hold two columns over is across a gap');
  climb = move(climb, 'up');
  assert.deepEqual(climb.at, { col: 2, row: 1 });
  assert.deepEqual(move(climb, 'up').at, climb.at, 'nothing straight above');
  climb = move(move(climb, 'right'), 'up');
  assert.deepEqual(climb.at, { col: 3, row: 2 });
  assert.equal(climb.done, 'top');
  assert.ok(COLUMNS >= 5 && holdAt(wall, 4, 0));
});

test('a falling stone in your column knocks you down; the third knocks you off', () => {
  const wall = makeWall(3, 12);
  // Somewhere high on the wall.
  let climb = { ...startClimb(wall), at: wall.holds.find(hold => hold.row === 8)! };
  const high = climb.at.row;
  assert.deepEqual(strike(climb, (climb.at.col + 1) % COLUMNS), climb, 'a stone down another column misses');
  climb = strike(climb, climb.at.col);
  assert.ok(climb.at.row < high);
  for (let i = 1; i < HITS; i++) climb = strike(climb, climb.at.col);
  assert.equal(climb.done, 'fell');
});
