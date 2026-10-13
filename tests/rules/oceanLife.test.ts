import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oceanState, octopusAtCamp } from '../../src/rules/oceanLife.ts';
import { port, seaPens, krakenGrave } from '../../src/content/ocean.ts';
import { portLife } from '../../src/content/oceanLife.ts';
import { createWorld, drop, conversation } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';
const context = (flags: Flag[] = [], lost: Context['lost'] = []): Context => ({ world: { ...createWorld(), flags }, lost, studied: [] });

test('rescue deeds affect the port and survive a wipe without restoring the fish trade', () => {
  assert.equal(oceanState(context()).reception, 'wary');
  assert.equal(oceanState(context(['crab-freed'])).reception, 'recognized');
  const freed = context(['crab-freed', 'squid-freed', 'nets-cut', 'cuttlefish-slain']);
  assert.equal(oceanState(freed).reception, 'welcomed');
  const after = oceanState({ ...freed, world: drop(freed.world) });
  assert.equal(after.pens, 'empty'); assert.equal(after.trade, 'truce'); assert.equal(after.rescues, 3);
  assert.match(conversation(portLife, 'moorings', freed).lines.join(' '), /NO LIVE CARGO/);
});
test('memory loss changes the port and grave descriptions; reminders restore recognition', () => {
  const forgotten = context(['octopus-free'], ['octopus', 'kraken']);
  assert.equal(oceanState(forgotten).name, 'A port of borrowed decks');
  assert.match(conversation(krakenGrave, 'ribs', forgotten).lines.join(' '), /cannot remember the fight/);
  assert.equal(oceanState({ ...forgotten, remembered: ['octopus', 'kraken'] }).name, 'Wrecktown');
});
test('the octopus reflects on the reunion, grave, truce, and forgetting without restoring memories', () => {
  assert.equal(octopusAtCamp(context()), undefined);
  const joined = context(['octopus-free']);
  assert.equal(octopusAtCamp({ ...joined, world: { ...joined.world, fallen: ['octopus'] } }), undefined);
  assert.match(octopusAtCamp(joined)!.lines.join(' '), /cupbearer/);
  assert.match(octopusAtCamp(context(['octopus-free', 'grave-seen']))!.lines.join(' '), /saving your kingdom/);
  assert.match(octopusAtCamp(context(['octopus-free', 'grave-seen', 'cuttlefish-slain']))!.lines.join(' '), /truce is a beginning/);
  const unfamiliar = octopusAtCamp(context(['octopus-free', 'cuttlefish-slain'], ['octopus']))!;
  assert.match(unfamiliar.lines.join(' '), /beside the hammock, and stays/); assert.equal(unfamiliar.then, undefined);
});
test('empty pens have no captive and aftermath dialogue preserves existing routes and rewards', () => {
  assert.match(conversation(seaPens, 'caught', context(['nets-cut'])).lines.join(' '), /Nothing looks back/);
  const after = conversation(port, 'portmaster', context(['cuttlefish-slain']));
  assert.equal(after.choices?.length, 2);
  assert.match(after.lines.join(' '), /fish trade stays shut/);
  const earned = context(['nets-cut', 'crab-freed', 'newt-freed']);
  assert.equal(conversation(seaPens, 'elder', earned).then?.find, 'elder-pearl');
  assert.equal(conversation(port, 'stranger', context(['shark-slain'])).choices?.[0].then?.set, 'octopus-free');
});
