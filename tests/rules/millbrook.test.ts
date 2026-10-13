import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearAtCamp, millbrookState } from '../../src/rules/millbrook.ts';
import { millbrookStreet } from '../../src/content/millbrook.ts';
import { conversation, createWorld, drop } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';

const context = (flags: Flag[] = [], lost: Context['lost'] = []): Context => ({ world: { ...createWorld(), flags }, lost, studied: [] });

test('Millbrook recovers its grain trade without curing later fish shortages', () => {
  assert.equal(millbrookState(context()).grain, false);
  assert.equal(millbrookState(context(['boar-defeated'])).grain, true);
  assert.equal(millbrookState(context(['boar-defeated', 'hyena-slain'])).fish, 'scarce');
  assert.equal(millbrookState(context(['boar-defeated', 'cuttlefish-slain'])).fish, 'stopped');
  const changed = context(['boar-defeated']);
  assert.equal(millbrookState({ ...changed, world: drop(changed.world) }).grain, true, 'the town stays recovered across deaths');
});

test('forgetting the Bear changes recognition, and a reminder restores it', () => {
  const forgotten = context(['bear-free', 'boar-defeated'], ['bear']);
  assert.equal(millbrookState(forgotten).name, 'An unfamiliar market town');
  assert.match(conversation(millbrookStreet, 'grain-driver', forgotten).lines.join(' '), /without recognition/);
  const reminded = { ...forgotten, remembered: ['bear'] as const };
  assert.equal(millbrookState(reminded).name, 'Millbrook');
  assert.match(conversation(millbrookStreet, 'grain-driver', reminded).lines.join(' '), /empty wagon/);
});

test('street conversations distinguish a closed grain road, recovery, and the failed fish trade', () => {
  assert.match(conversation(millbrookStreet, 'bread-stall', context()).lines.join(' '), /boards are shut/);
  assert.match(conversation(millbrookStreet, 'bread-stall', context(['boar-defeated'])).lines.join(' '), /Warm loaves/);
  const night = context(['boar-defeated']);
  assert.match(conversation(millbrookStreet, 'bread-stall', { ...night, world: { ...night.world, night: true } }).lines.join(' '), /latched for the night/);
  assert.match(conversation(millbrookStreet, 'ration-queue', context(['boar-defeated', 'hyena-slain'])).lines.join(' '), /Half a portion/);
  assert.match(conversation(millbrookStreet, 'ration-queue', context(['boar-defeated', 'cuttlefish-slain'])).lines.join(' '), /No boats/);
});

test('camp moments respect reunion, death, memory, and regional progress', () => {
  assert.equal(bearAtCamp(context()), undefined);
  assert.equal(bearAtCamp({ ...context(['bear-free']), world: { ...context(['bear-free']).world, fallen: ['bear'] } }), undefined);
  assert.match(bearAtCamp(context(['bear-free']))!.lines.join(' '), /mill chain/);
  assert.match(bearAtCamp(context(['bear-free', 'boar-defeated']))!.lines.join(' '), /nobody.*sorry/i);
  assert.match(bearAtCamp(context(['bear-free'], ['bear']))!.lines.join(' '), /farther away/);
});
