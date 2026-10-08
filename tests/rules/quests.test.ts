import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, intent, resolveEnemy } from '../../src/rules/battle.ts';
import type { Battle } from '../../src/rules/battle.ts';
import { apply, conversation, createWorld, holds } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { fields } from '../../src/content/fields.ts';
import { town } from '../../src/content/town.ts';

const turn = (battle: Battle, at: [number, number] = [1, 2]) => resolveEnemy(act(act(act(battle, 'chameleon', 'attack', 'chameleon', at[0]), 'bear', 'support'), 'vulture', 'attack', 'vulture', at[1]));

test("the swarm-mother's brood can be killed, but every third round she calls it back", () => {
  let battle = createBattle('swarm');
  battle = turn(battle);
  battle = turn(battle);
  assert.ok(battle.followers.every(nymph => nymph.health === 0), 'both nymphs fall');
  assert.equal(intent(battle).name, 'Brood call');
  battle = turn(battle, [0, 0]);
  assert.ok(battle.followers.every(nymph => nymph.health === nymph.maxHealth), 'and rise again');
  assert.ok(battle.log.some(line => line.includes('Her fallen brood rises again.')));
  assert.equal(battle.party[1].health, battle.party[1].maxHealth, 'the guarding bear turns aside every buffet and bite');
});

test('quests are told, not marked: the shepherd, the barrel, and the bounty', () => {
  let context: Context = { world: createWorld(), lost: [], studied: [] };
  const talk = (dialogue: typeof fields, name: string) => {
    const said = conversation(dialogue, name, context);
    if (said.then) context = apply(context, said.then);
    return said.lines.join(' ');
  };
  assert.match(talk(fields, 'shepherd'), /Send them home/);
  for (const where of ['sheep-woods', 'sheep-orchard', 'sheep-yard']) talk(fields, where);
  assert.match(talk(fields, 'shepherd'), /Wool charm/);
  assert.deepEqual([context.world.coins, context.world.found], [15, ['wool-charm']]);
  assert.match(talk(fields, 'shepherd'), /flock is whole/);
  const hidden = (name: string) => fields[name].hiddenIf!.some(condition => holds(context, condition));
  assert.equal(hidden('stream-bank'), true, 'nothing to release until the barrel is bought');
  context = apply(context, { set: 'barrel-bought' });
  assert.match(talk(town, 'barrel'), /young squid/);
  assert.match(talk(fields, 'stream-bank'), /toward the sea/);
  assert.equal(hidden('stream-bank'), true);
  context = apply(context, { set: 'swarm-slain' });
  assert.match(talk(town, 'reeve'), /Twenty-five coins/);
  assert.equal(context.world.coins, 40);
  assert.doesNotMatch(talk(town, 'reeve'), /Twenty-five coins/, 'the bounty pays once');
});

test("killing the swarm-mother does not end the fight while her brood still stands", async () => {
  const { canAct, won } = await import('../../src/rules/battle.ts');
  let battle = createBattle('swarm');
  battle = { ...battle, enemy: { ...battle.enemy, health: 1 } };
  battle = act(battle, 'vulture', 'attack');
  assert.equal(battle.enemy.health, 0);
  assert.equal(battle.phase, 'player', 'the nymphs fight on');
  assert.ok(battle.log.includes('The swarm-mother falls. The nymphs fight on.'));
  assert.equal(canAct(battle, 'chameleon', 'attack'), false, 'she cannot be struck again');
  battle = resolveEnemy(act(act(battle, 'chameleon', 'attack', 'chameleon', 1), 'bear', 'attack', 'bear', 2));
  assert.ok(!battle.log.some(line => line.includes('Wing buffet') || line.includes('shrills')), 'a dead mother takes no turn');
  assert.ok(battle.log.some(line => line.includes("nymph's bite")));
  while (battle.phase === 'player') {
    for (const member of battle.party) for (const foe of [1, 2]) battle = act(battle, member.id, 'attack', member.id, foe);
    battle = resolveEnemy(battle);
  }
  assert.equal(battle.phase, 'victory');
  assert.ok(won(battle));
});

test('the boar’s followers yield the moment he falls', () => {
  let battle = createBattle('boar');
  battle = act({ ...battle, enemy: { ...battle.enemy, health: 1 } }, 'vulture', 'attack');
  assert.equal(battle.phase, 'victory');
  assert.ok(battle.followers.every(follower => follower.health > 0));
});
