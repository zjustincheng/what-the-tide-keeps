import {test} from 'node:test';
import assert from 'node:assert/strict';
import {actionPreview} from '../../src/presentation/battleActions.ts';
import {act,createBattle,SPELL} from '../../src/rules/battle.ts';

test('analyze preview preserves unknown spell names and explains permanent study',()=>{
  const battle=createBattle('acolyte');
  const preview=actionPreview(battle,'chameleon','analyze');
  assert.match(preview,/Record it permanently/);
  assert.match(preview,/2 mana/);
  assert.ok(!preview.includes(SPELL));
  const after=act(battle,'chameleon','analyze');
  assert.match(actionPreview(after,'bear','analyze'),/already recorded/);
});

test('support descriptions follow the actual ally and warn about soured healing',()=>{
  const battle=createBattle('viper',[],{roster:['chameleon','bear','frog']});
  assert.match(actionPreview(battle,'bear','support','chameleon'),/Protect Chameleon/);
  assert.match(actionPreview({...battle,soured:2},'frog','support','bear'),/soured healing will hurt/);
  const fallen={...battle,party:battle.party.map(member=>member.id==='bear'?{...member,health:0}:member)};
  assert.match(actionPreview(fallen,'frog','support','bear'),/downed/);
  assert.match(actionPreview(fallen,'chameleon','barrier','bear'),/barrier on Bear/);
});

test('unavailable actions explain insufficient mana and spent turns',()=>{
  const battle=createBattle();
  const low={...battle,party:battle.party.map(member=>({...member,mana:1}))};
  assert.match(actionPreview(low,'chameleon','barrier'),/needs 5 mana/);
  assert.match(actionPreview(act(battle,'chameleon','support'),'chameleon','attack'),/already acted/);
});
