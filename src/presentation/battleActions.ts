import { canAct, cost, ENEMIES, ENEMY_SPELLS, GATHER, intent, MEMBERS, mimicCost } from '../rules/battle.ts';
import type { Action, Battle, Foe, MemberId } from '../rules/battle';

// Describe the player's choices without exposing hidden enemy stats or spell names.
export function actionPreview(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0): string {
  const member = battle.party.find(member => member.id === actor)!;
  const name = MEMBERS[actor].name;
  const mana = action === 'support' && actor === 'octopus' ? mimicCost(member) : cost(member, action);
  const price = `${mana} mana · uses ${name}'s action.`;
  if (member.health <= 0) return `${name} is downed and cannot act.`;
  if (battle.phase !== 'player') return battle.phase === 'enemy' ? 'The enemy is moving. Wait for your turn.' : 'This fight is over.';
  if (member.acted) return `${name} has already acted this round.`;
  if (member.mana < mana) return `${name} needs ${mana} mana for this action; ${member.mana} remains.`;
  const ally = MEMBERS[target].name;
  const enemy = foe > 0 ? battle.followers[foe - 1]?.name : ENEMIES[battle.encounter].name;
  const spell = battle.encounter === 'human' ? intent(battle).spell : ENEMY_SPELLS[battle.encounter];
  if (action === 'analyze') {
    if (!spell) return 'This enemy has no spell to study.';
    if (battle.studied.includes(spell)) return `${spell} is already recorded in the grimoire.`;
    return `Study ${ENEMIES[battle.encounter].name}'s spell. Record it permanently so it can be blocked and dodged. ${price}`;
  }
  if (action === 'suppress') return member.suppressed ? 'Already hidden. Attack to reveal your mana.' : `Hide ${name}'s mana to draw less attention; their next attack reveals it for a stronger hit. ${price}`;
  if (action === 'gather') return member.mana >= member.maxMana ? 'Mana is full.' : `Recover up to ${GATHER} mana for ${name}. ${price}`;
  if (action === 'barrier') return `Raise a barrier on ${ally} for the enemy turn. Stops studied spells; physical blows pass through. ${price}`;
  if (action === 'attack') return `Attack ${enemy}${member.suppressed ? ' and reveal hidden mana for a stronger hit' : ''}. ${price}`;
  if (action === 'support') {
    if (!canAct(battle, actor, action, target)) return actor === 'octopus' ? 'No studied spell can be copied at the main enemy right now.' : `${ally} is downed. Choose a standing ally for support.`;
    const effect = actor === 'bear' ? member.gear.guardAll > 0 ? 'Protect the whole party from physical blows this enemy turn.' : `Protect ${ally} from physical blows this enemy turn.`
      : actor === 'chameleon' ? `Guard ${name} against physical blows this enemy turn.`
      : actor === 'vulture' ? `Focus ${name}'s next attack for a stronger hit.`
      : actor === 'frog' ? battle.soured ? `Dose ${ally}; soured healing will hurt them.` : `Heal ${ally} and remove their poison.`
      : 'Copy the last usable studied spell at the main enemy.';
    return `${effect} ${price}`;
  }
  return `Strike ${ally} to test their disguise. A mistaken strike hurts your companion. ${price}`;
}
