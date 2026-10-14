import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGear, equip, KEEPSAKE_IDS, KEEPSAKES, shatter } from '../../src/rules/gear.ts';
import { apply, breakFragile, createWorld, drop } from '../../src/rules/world.ts';
import { SHOPS } from '../../src/content/shops.ts';
import { keepsakeDescription } from '../../src/presentation/equipment.ts';

const owned = ['glass-bead', 'eggshell-charm', 'boar-tusk'] as const;

test('a fragile keepsake worn in the fight breaks when the party falls; one in the pack, or on someone who waited, does not', () => {
  let gear = equip(createGear(), [...owned], 'chameleon', 0, 'glass-bead');
  gear = equip(gear, [...owned], 'chameleon', 1, 'boar-tusk');
  gear = equip(gear, [...owned], 'frog', 0, 'eggshell-charm');
  const { gear: after, broken } = shatter(gear, ['chameleon', 'bear', 'vulture']);
  assert.deepEqual(broken, ['glass-bead']);
  assert.deepEqual(after.chameleon, ['boar-tusk'], 'ordinary keepsakes survive');
  assert.deepEqual(after.frog, ['eggshell-charm'], 'the frog waited it out');
  assert.equal(shatter(createGear(), ['chameleon']).broken.length, 0);
  // It is gone from what he owns, and from the smith's tempering, and the wake screen is told once.
  const world = { ...createWorld(), found: [...owned], tempered: ['glass-bead', 'boar-tusk'] as const };
  const woken = breakFragile(drop(world as never), broken);
  assert.deepEqual(woken.found, ['eggshell-charm', 'boar-tusk']);
  assert.deepEqual(woken.tempered, ['boar-tusk']);
  assert.deepEqual(woken.broke, ['glass-bead']);
  assert.deepEqual(apply({ world: woken, lost: [], studied: [] }, {}).world.broke, ['glass-bead'], 'nothing else clears it before he wakes');
});

test('the fragile ones are the strongest things for sale, each sold somewhere, and say they are fragile', () => {
  const fragile = KEEPSAKE_IDS.filter(id => KEEPSAKES[id].fragile);
  assert.deepEqual(fragile, ['glass-bead', 'eggshell-charm', 'dried-star']);
  for (const id of fragile) {
    assert.ok(Object.values(SHOPS).some(shop => shop.wares.some(ware => 'gear' in ware && ware.gear === id)), `${id} is sold`);
    assert.match(KEEPSAKES[id].drawback, /Fragile/);
    assert.match(keepsakeDescription(id).drawback, /Fragile/);
    assert.ok(!KEEPSAKES[id].holder, 'anyone can wear one');
  }
});
