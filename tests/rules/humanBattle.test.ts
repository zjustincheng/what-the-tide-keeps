import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,createBattle,intent,enemyMana,resolveEnemy} from '../../src/rules/battle.ts';
import type {Battle} from '../../src/rules/battle';
import {hollow} from '../../src/rules/memory.ts';
import type {MemoryId} from '../../src/rules/memory';

const lost:MemoryId[]=['trial','training','kraken','home','name'];
function hitAt(battle:Battle,health:number):Battle {
  return act({...battle,phase:'player',enemy:{...battle.enemy,health},party:battle.party.map(member=>({...member,acted:false}))},'chameleon','attack');
}
test('the human returns every memory in stages and each Hollow perk falls away exactly once',()=>{
  const start=createBattle('human',[],{lostMemories:lost,hollow:hollow({lost,pending:false})});
  const risen=hitAt(start,1);
  assert.equal(risen.stage,2);assert.deepEqual(risen.recoveredMemories,['trial']);
  assert.equal(risen.hollow.mana,2);assert.equal(risen.party[0].maxMana,12);
  assert.deepEqual(start.lostMemories,lost);assert.deepEqual(start.recoveredMemories,[]);
  const training=hitAt(risen,Math.round(risen.enemy.maxHealth*.35*.8));
  assert.ok(training.recoveredMemories.includes('training'));
  assert.equal(training.hollow.trained,true);assert.equal(training.hollow.mana,0);
  assert.equal(training.party[0].maxMana,10);assert.ok(training.party[0].mana<=10);
  const kraken=hitAt(training,Math.round(risen.enemy.maxHealth*.35*.55));
  assert.ok(kraken.recoveredMemories.includes('kraken'));assert.equal(kraken.hollow.kraken,true);
  assert.equal(kraken.hollow.damage,0);
  assert.equal(kraken.party[1].gear.agility,start.party[1].gear.agility+10);
  const won=hitAt(kraken,1);
  assert.equal(won.phase,'victory');assert.deepEqual(won.recoveredMemories,lost);assert.deepEqual(won.lostMemories,[]);
  assert.equal(won.hollow.mana,0);assert.equal(won.hollow.damage,0);
});
test('recovered memories are never cast again and empty hands are a guardable physical attack',()=>{
  let battle=createBattle('human',[],{lostMemories:['home','name']});
  battle=hitAt(battle,1);
  assert.deepEqual(battle.lostMemories,['name']);
  assert.equal(intent(battle).spell,'His Name');
  const empty=createBattle('human',[],{lostMemories:[]});
  assert.equal(intent(empty).type,'physical');assert.equal(intent(empty).spell,undefined);
  assert.equal(intent(empty).damage,4);
  assert.deepEqual(hitAt(empty,1).recoveredMemories,[]);
});
test('the human has no mana even after casting his borrowed spells',()=>{
  const start=createBattle('human',['His Home'],{lostMemories:['home']});
  const after=resolveEnemy({...start,phase:'enemy'});
  assert.equal(after.enemy.mana,0);assert.equal(enemyMana(after),0);
});
test('crossing several thresholds in one hit returns all those memories without duplicates',()=>{
  const start=hitAt(createBattle('human',[],{lostMemories:lost,hollow:hollow({lost,pending:false})}),1);
  const nearEnd=hitAt(start,20);
  assert.ok(nearEnd.recoveredMemories.length>=4);
  const held=hitAt(nearEnd,nearEnd.enemy.health+7);
  assert.equal(new Set(held.recoveredMemories).size,held.recoveredMemories.length);
  assert.ok(held.party.every(member=>member.mana<=member.maxMana));
});
