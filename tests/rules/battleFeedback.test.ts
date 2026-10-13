import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createBattle, nextStrike, SPELL } from '../../src/rules/battle.ts';
import { strikeFeedback } from '../../src/presentation/battleFeedback.ts';

function guarded() {
  let battle = createBattle('locust');
  for (const id of ['bear', 'chameleon', 'vulture'] as const) battle = act(battle, id, 'support');
  return battle;
}
test('physical guard and a studied spell barrier have distinct feedback', () => {
  assert.equal(strikeFeedback(nextStrike(guarded()), 'miss')!.label, 'GUARDED');
  let battle = createBattle('acolyte', [SPELL]);
  battle = { ...battle, round: 2 };
  battle = act(battle, 'vulture', 'barrier', 'bear'); battle = act(battle, 'bear', 'gather'); battle = act(battle, 'chameleon', 'support');
  // Gather at full mana is unavailable: use an attack to finish the player's side.
  battle = act(battle, 'bear', 'attack');
  assert.equal(strikeFeedback(nextStrike(battle), 'miss')!.label, 'BLOCKED');
});
test('dodges and grazes describe their different damage outcomes', () => {
  let battle = createBattle('locust');
  for (const id of ['bear', 'chameleon', 'vulture'] as const) battle = act(battle, id, 'attack');
  const next = nextStrike(battle);
  assert.equal(strikeFeedback(next, 'perfect')!.kind, 'dodge');
  assert.match(strikeFeedback(next, 'graze')!.message, /half damage/);
});
test('unknown spell feedback keeps the hidden name secret', () => {
  let battle = { ...createBattle('acolyte'), round: 2 };
  for (const id of ['bear', 'chameleon', 'vulture'] as const) battle = act(battle, id, 'attack');
  const feedback = strikeFeedback(nextStrike(battle), 'perfect')!;
  assert.equal(feedback.label, 'UNSTUDIED'); assert.ok(!feedback.message.includes(SPELL));
});
