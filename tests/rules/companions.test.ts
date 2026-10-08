import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBattle, ENEMIES, FOLLOWERS, PARTY_SCALE, UNHOLLOWED } from '../../src/rules/battle.ts';
import { STARTING_BOOKS } from '../../src/rules/spells.ts';
import { apply, conversation, createWorld, roster } from '../../src/rules/world.ts';
import type { Context } from '../../src/rules/world.ts';
import { town } from '../../src/content/town.ts';
import { fields } from '../../src/content/fields.ts';

test('the hero starts alone and enemies are scaled to the party that faces them', () => {
  assert.deepEqual(roster(createWorld()), ['chameleon']);
  const solo = createBattle('locust', [], { roster: ['chameleon'] });
  assert.deepEqual(solo.party.map(member => member.id), ['chameleon']);
  assert.equal(solo.enemy.maxHealth, Math.round(ENEMIES.locust.health * PARTY_SCALE[0]));
  const pair = createBattle('boar', [], { roster: ['chameleon', 'bear'] });
  assert.equal(pair.enemy.maxHealth, Math.round(ENEMIES.boar.health * PARTY_SCALE[1]));
  assert.equal(pair.followers[0].maxHealth, Math.round(FOLLOWERS.boar![0].health * PARTY_SCALE[1]));
  assert.equal(createBattle().enemy.maxHealth, ENEMIES.locust.health, 'a full party meets full strength');
});

test("clearing the reeve's fields earns a writ, and the writ frees the bear", () => {
  let context: Context = { world: createWorld(), lost: [], studied: [] };
  const talk = (dialogue: typeof town, name: string) => {
    const said = conversation(dialogue, name, context);
    if (said.then) context = apply(context, said.then);
    return said.lines.join(' ');
  };
  assert.match(talk(town, 'reeve'), /sign a writ for him/);
  assert.match(talk(fields, 'miller'), /until the reeve says otherwise/);
  context = apply(context, { set: 'pests-field' });
  assert.match(talk(town, 'reeve'), /sign a writ for him/, 'one field is not enough');
  context = apply(context, { set: 'pests-yard' });
  assert.match(talk(town, 'reeve'), /A writ releasing the bear/);
  assert.match(talk(town, 'reeve'), /Go and show the miller/);
  assert.deepEqual(roster(context.world), ['chameleon']);
  assert.match(talk(fields, 'miller'), /The bear joins you/);
  assert.deepEqual(roster(context.world), ['chameleon', 'bear']);
  assert.match(talk(fields, 'miller'), /Wheel turns slower/);
});
