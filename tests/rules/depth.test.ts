import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, intent } from '../../src/rules/battle.ts';
import { buy, canBuy, offered } from '../../src/rules/economy.ts';
import { keepsakeMods } from '../../src/rules/gear.ts';
import { createWorld } from '../../src/rules/world.ts';

test('tempering a keepsake grows its benefits by half and leaves its drawbacks alone, once', () => {
  assert.deepEqual(keepsakeMods('crow-feather', true), { damage: 5, health: -4 });
  assert.deepEqual(keepsakeMods('famine-spoon', true), { shown: -5, health: -3 });
  const ware = { temper: 'crow-feather' as const, price: 30 };
  const world = { ...createWorld(), coins: 40 };
  assert.equal(offered(world, ware), false, 'only keepsakes you own are offered');
  const owner = { ...world, found: ['crow-feather' as const] };
  const tempered = buy(owner, ware);
  assert.deepEqual(tempered.tempered, ['crow-feather']);
  assert.equal(canBuy({ ...tempered, coins: 99 }, ware), false, 'once each');
  // In battle, the tempered feather hits harder.
  const plain = createBattle('locust', [], { gear: { chameleon: [], bear: [], vulture: ['crow-feather'] } });
  const strong = createBattle('locust', [], { gear: { chameleon: [], bear: [], vulture: ['crow-feather'] }, tempered: ['crow-feather'] });
  assert.equal(strong.party[2].gear.damage - plain.party[2].gear.damage, 2);
});

test('a fight in waves goes on when the first enemy falls', () => {
  const battle = createBattle('raider', [], { roster: ['chameleon'], waves: 2 });
  const first = act({ ...battle, enemy: { ...battle.enemy, health: 1 } }, 'chameleon', 'attack');
  assert.notEqual(first.phase, 'victory');
  assert.equal(first.wave, 2);
  assert.equal(first.enemy.health, first.enemy.maxHealth);
  assert.match(first.log.at(-1)!, /Another raider comes on/);
  const second = act({ ...first, phase: 'player', party: first.party.map(member => ({ ...member, acted: false })), enemy: { ...first.enemy, health: 1 } }, 'chameleon', 'attack');
  assert.equal(second.phase, 'victory');
});

test('the deserter captain volleys three times and executes through a guard when someone is down', () => {
  const battle = createBattle('captain');
  assert.equal(intent({ ...battle, round: 3 }).hits, 3);
  const down = { ...battle, round: 2, party: battle.party.map(member => member.id === 'vulture' ? { ...member, health: 0 } : member) };
  assert.equal(intent(down).name, 'Execution');
  assert.ok(intent(down).piercing! > 0);
});
