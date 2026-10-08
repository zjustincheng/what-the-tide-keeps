import { act } from '../../src/rules/battle.ts';
import type { Battle, Foe, MemberId } from '../../src/rules/battle.ts';

// What a sensible player does with a hero: attack if there is mana for it, otherwise gather, otherwise guard.
export function attackOrGather(battle: Battle, actor: MemberId, foe: Foe = 0): Battle {
  for (const action of ['attack', 'gather', 'support'] as const) {
    const next = act(battle, actor, action, actor, action === 'attack' ? foe : 0);
    if (next !== battle) return next;
  }
  return battle;
}
