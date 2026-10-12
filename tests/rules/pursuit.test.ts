import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advancePursuit, CHASE_TIME, ENCOUNTER_CHECK, endPursuit, initialPursuit, parsePursuit, pursuitAllowed, pursuitPath, WARNING_TIME } from '../../src/rules/pursuit.ts';

test('a hunt warns, pursues for 45 seconds, then gives a long cooldown', () => {
  const warning = advancePursuit(initialPursuit(), ENCOUNTER_CHECK, .01);
  assert.equal(warning.phase, 'warning');
  assert.equal(warning.remaining, WARNING_TIME);
  const chase = advancePursuit(warning, WARNING_TIME);
  assert.deepEqual(chase, { phase: 'chasing', remaining: CHASE_TIME });
  const afterTravel = parsePursuit(JSON.parse(JSON.stringify(advancePursuit(chase, 12000))));
  assert.equal(afterTravel.remaining, 33000, 'changing maps or reloading preserves the remaining time');
  assert.deepEqual(advancePursuit(afterTravel, 0), afterTravel, 'paused exploration cannot run out the clock');
  const escaped = advancePursuit(afterTravel, 33000);
  assert.equal(escaped.phase, 'idle');
  assert.ok(escaped.remaining >= 300000 && escaped.remaining <= 480000);
  assert.equal(endPursuit(0).remaining, 300000);
  assert.equal(endPursuit(1).remaining, 480000);
  assert.deepEqual(parsePursuit(endPursuit(1)), endPursuit(1), 'saving preserves the full cooldown');
});

test('an encounter roll can fail repeatedly instead of forcing a scheduled hunt', () => {
  let state = initialPursuit();
  for(let check = 0; check < 10; check++) {
    state = advancePursuit(state, ENCOUNTER_CHECK, .9);
    assert.deepEqual(state, initialPursuit());
  }
  assert.equal(advancePursuit(state, ENCOUNTER_CHECK, .049).phase, 'warning');
  assert.equal(advancePursuit(state, ENCOUNTER_CHECK, .05).phase, 'idle');
  assert.equal(advancePursuit(state, ENCOUNTER_CHECK - 1, 0).phase, 'idle', 'no roll until the check is due');
  assert.equal(advancePursuit(endPursuit(0), ENCOUNTER_CHECK, 0).phase, 'idle', 'a successful roll cannot bypass cooldown');
});

test('hunts follow the story and never reach the ocean or island', () => {
  assert.equal(pursuitAllowed([], 'THE CAPITAL'), false);
  assert.equal(pursuitAllowed(['hyena-slain'], 'THE CAPITAL'), true);
  assert.equal(pursuitAllowed(['hyena-slain'], 'THE FARMLAND'), true);
  assert.equal(pursuitAllowed(['hyena-slain'], 'THE OCEAN'), false);
  assert.equal(pursuitAllowed(['hyena-slain'], 'THE ISLAND'), false);
  assert.equal(pursuitAllowed(['hyena-slain', 'inquisitor-spoke'], 'THE HIGHLANDS'), false);
  assert.equal(pursuitAllowed(['hyena-slain', 'human-spared'], 'THE CAPITAL'), false);
});

test('the hunter routes around walls, with no diagonal cuts or impassable shortcuts', () => {
  const map = ['.....', '.###.', '...#.'];
  const walk = (x: number, y: number) => map[y]?.[x] === '.';
  const path = pursuitPath({ x: 0, y: 1 }, { x: 4, y: 2 }, 5, 3, walk);
  assert.deepEqual(path.at(-1), { x: 4, y: 2 });
  let previous = { x: 0, y: 1 };
  for (const cell of path) {
    assert.ok(walk(cell.x, cell.y));
    assert.equal(Math.abs(cell.x-previous.x)+Math.abs(cell.y-previous.y), 1);
    previous = cell;
  }
  assert.deepEqual(pursuitPath({ x: 0, y: 0 }, { x: 2, y: 0 }, 3, 1, x=>x!==1), []);
});

test('malformed pursuit saves cannot create infinite or negative timers', () => {
  for (const value of [null, {}, { phase: 'chasing', remaining: Infinity }, { phase: 'chasing', remaining: -1 }]) assert.deepEqual(parsePursuit(value), initialPursuit());
  assert.deepEqual(parsePursuit({ phase: 'chasing', remaining: 999999 }), { phase: 'chasing', remaining: CHASE_TIME });
});
