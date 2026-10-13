import {MEMBERS} from '../rules/battle.ts';
import type {Dodge,nextStrike} from '../rules/battle';
import type {CombatEffect} from './combat';

export type BattleFeedback={kind:CombatEffect;label:string;message:string};

export function strikeFeedback(next:ReturnType<typeof nextStrike>,dodge:Dodge):BattleFeedback|undefined {
  if(!next || next.move.revive)return;
  const name=MEMBERS[next.target.id].name;
  if(next.blocked)return {kind:'ward',label:'BLOCKED',message:`${name}'s barrier stops the spell.`};
  if(next.guarded && next.damage===0)return {kind:'guard',label:'GUARDED',message:`${MEMBERS[next.guarded.id].name} guards ${name} against the physical blow.`};
  if(next.damage===0)return;
  if(next.dodgeable && dodge==='perfect')return {kind:'dodge',label:'DODGED',message:`${name} avoids the blow completely.`};
  if(next.dodgeable && dodge==='graze')return {kind:'graze',label:'GRAZED',message:`${name} takes a glancing hit: half damage.`};
  if(next.guarded)return {kind:'hit',label:'PIERCED',message:`The blow pierces ${name}'s guard.`};
  if(next.move.type==='spell' && next.move.name==='???')return {kind:'spell',label:'UNSTUDIED',message:`${name} is hit by an unknown spell. Study it to unlock barriers and dodges.`};
  return {kind:next.move.type==='spell'?'spell':'hit',label:'HIT',message:`${name} takes the ${next.move.type==='spell'?'spell':'physical blow'}.`};
}
