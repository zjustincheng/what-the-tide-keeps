import { test } from 'node:test';
import assert from 'node:assert/strict';
import { landing, reachable } from '../../src/rules/leap.ts';
import type { Ground } from '../../src/rules/leap.ts';

// A row of ground, left to right: . open, ~ gap, # wall.
const row = (text: string) => (tx: number, ty: number): Ground => ty !== 0 || tx < 0 || tx >= text.length ? 'wall' : text[tx] === '.' ? 'open' : text[tx] === '~' ? 'gap' : 'wall';

test('a leap clears up to two gap tiles and lands beyond them', () => {
  assert.deepEqual(landing(row('.~.'), { tx: 0, ty: 0 }, 1, 0), { tx: 2, ty: 0, falls: false });
  assert.deepEqual(landing(row('.~~.'), { tx: 0, ty: 0 }, 1, 0), { tx: 3, ty: 0, falls: false });
});

test('on open ground a leap is one hop; into a wall it is nothing', () => {
  assert.deepEqual(landing(row('..'), { tx: 0, ty: 0 }, 1, 0), { tx: 1, ty: 0, falls: false });
  assert.equal(landing(row('.#'), { tx: 0, ty: 0 }, 1, 0), undefined);
});

test('a gap too wide, or a wall past the gap, drops the hero into it', () => {
  assert.deepEqual(landing(row('.~~~.'), { tx: 0, ty: 0 }, 1, 0), { tx: 3, ty: 0, falls: true });
  assert.deepEqual(landing(row('.~#'), { tx: 0, ty: 0 }, 1, 0), { tx: 1, ty: 0, falls: true });
});

test('leaping reaches across gaps that walking cannot', () => {
  const ground = row('..~~..~~~.');
  assert.ok(!reachable(ground, [{ tx: 0, ty: 0 }], false).has('4,0'));
  assert.ok(reachable(ground, [{ tx: 0, ty: 0 }], true).has('4,0'));
  assert.ok(!reachable(ground, [{ tx: 0, ty: 0 }], true).has('9,0'), 'three tiles is too far');
});
