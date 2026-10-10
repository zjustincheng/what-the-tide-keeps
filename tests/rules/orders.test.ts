import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leads, orders } from '../../src/rules/orders.ts';
import { createWorld } from '../../src/rules/world.ts';
import type { World } from '../../src/rules/world.ts';

const at = (flags: string[], carried: string[] = []) => ({ ...createWorld(), flags, carried }) as unknown as World;

test('the orders follow the story: each region, and the next step within it', () => {
  assert.equal(orders(at([])).title, 'The farmland');
  assert.match(orders(at([])).next, /bear is chained/);
  assert.match(orders(at(['bear-free', 'kid-found'])).next, /reeve\'s hall/);
  assert.match(orders(at(['bear-free', 'kid-found', 'burn-order-seen', 'lane-open'])).next, /boar waits/);
  assert.equal(orders(at(['boar-defeated'])).title, 'The highlands');
  assert.match(orders(at(['boar-defeated', 'vulture-free', 'pair-slain', 'dead-1', 'dead-2', 'dead-3', 'ossuary-key'])).next, /signal lantern/);
  assert.equal(orders(at(['boar-defeated', 'hyena-slain'])).title, 'The marsh');
  assert.match(orders(at(['boar-defeated', 'hyena-slain', 'brood-slain', 'channel-firm', 'apprentice-slain'], ['venom-vial'])).next, /Show the frog/);
  assert.equal(orders(at(['boar-defeated', 'hyena-slain', 'viper-slain'])).title, 'The mountain holds');
  assert.match(orders(at(['boar-defeated', 'hyena-slain', 'viper-slain', 'duellist-beaten'])).next, /falcons/);
  assert.equal(orders(at(['boar-defeated', 'hyena-slain', 'viper-slain', 'cuckoo-slain'])).title, 'Waiting');
});

test('leads name what is carried and who it is for', () => {
  assert.deepEqual(leads(at(['old-roads'])), []);
  assert.match(leads(at(['old-roads'], ['ring'])).join(' '), /trapper/);
  assert.match(leads(at([])).join(' '), /pilgrim/);
  assert.match(leads(at(['old-roads', 'barrel-bought'])).join(' '), /squid/);
});
