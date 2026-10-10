import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, cast, createBattle, intent, MIMIC_COST, resolveEnemy, SPELL_POWER } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';
import { createMemory, forgetAll, tideTakesAll, wipe } from '../../src/rules/memory.ts';
import { SPELLS } from '../../src/rules/spells.ts';

const SEA = ['chameleon', 'bear', 'octopus'] as const;
const everyone = (battle: Battle) => battle.party.reduce((next, member) => act(next, member.id, member.id === 'octopus' ? 'attack' : 'support'), battle);

test('the octopus throws back the last spell written into the grimoire, and needs one to throw', () => {
  const bare = createBattle('shark', [], { roster: [...SEA] });
  assert.equal(act(bare, 'octopus', 'support'), bare, 'nothing studied, nothing to copy');
  const studied = createBattle('shark', ['Salt lance'], { roster: [...SEA] });
  const thrown = act(studied, 'octopus', 'support');
  // Magic is the equaliser: the copied spell hits for its own power, whatever the shark's hide.
  assert.equal(studied.enemy.health - thrown.enemy.health, SPELL_POWER['Salt lance']);
  assert.equal(thrown.party[2].mana, studied.party[2].mana - MIMIC_COST);
  assert.match(thrown.log.at(-1)!, /Salt lance/);
});

test('the cuttlefish throws back the last spell you cast: damage at you, a heal on itself, a ward round itself', () => {
  // Cast thorn volley, then let it answer on an even round.
  let battle: Battle = { ...createBattle('cuttlefish', [], { roster: [...SEA] }), round: 2 };
  battle = cast(battle, 'chameleon', true);
  assert.equal(battle.lastSpell, 'thorn-volley');
  assert.match(intent(battle).name, /Thorn volley, thrown back/);
  assert.equal(intent(battle).damage, SPELLS['thorn-volley'].power);
  // A ward comes back as a ward round it: blows half land.
  const warded = resolveEnemy(everyone({ ...createBattle('cuttlefish', [], { roster: [...SEA] }), round: 2, lastSpell: 'stone-ward' }));
  assert.ok(warded.enemyWard > 0);
  const hit = act(warded, 'chameleon', 'attack');
  assert.equal(warded.enemy.health - hit.enemy.health, Math.floor(7 * 1.5 / 2), 'half of a caster-strong lash');
  // A snare comes back as a lost move for a hero.
  const snared = resolveEnemy(everyone({ ...createBattle('cuttlefish', [], { roster: [...SEA] }), round: 2, lastSpell: 'ink-cloud' }));
  assert.ok(snared.party.some(member => member.acted), 'someone loses their next move');
});

test('dying at sea costs two memories, never the same one twice, and nothing written down', () => {
  const owed = wipe(createMemory(), 2);
  const taken = tideTakesAll(owed, 3);
  assert.equal(taken.length, 2);
  assert.notEqual(taken[0], taken[1]);
  const paid = forgetAll(owed, taken);
  assert.equal(paid.lost.length, createMemory().lost.length + 2);
  assert.equal(paid.pending, false);
  const once = tideTakesAll(wipe(createMemory()), 3);
  assert.equal(once.length, 1);
});
