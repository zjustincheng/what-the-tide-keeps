import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepsakeDescription } from '../../src/presentation/equipment.ts';

test('equipment descriptions show rounded tempered benefits and unchanged drawbacks', () => {
  const mirror = keepsakeDescription('cracked-mirror', true);
  assert.match(mirror.benefit, /5 harder/); assert.match(mirror.drawback, /1 extra mana/);
  const cloak = keepsakeDescription('night-cloak', true);
  assert.match(cloak.benefit, /30% wider/); assert.match(cloak.benefit, /2 less mana/); assert.match(cloak.drawback, /3 less health/);
});
test('the link separates its combat cost from its permanent memory protection', () => {
  const link = keepsakeDescription('broken-link', true);
  assert.match(link.benefit, /whole party/); assert.match(link.drawback, /3 mana/); assert.match(link.memory, /even when kept in the pack/);
});
