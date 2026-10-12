import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fortState,vultureAtCamp} from '../../src/rules/highlandLife.ts';
import {fortStreet} from '../../src/content/fortLife.ts';
import {fort} from '../../src/content/highlands.ts';
import {conversation,createWorld,drop} from '../../src/rules/world.ts';
import type {Context,Flag} from '../../src/rules/world';
const context=(flags:Flag[]=[],lost:Context['lost']=[]):Context=>({world:{...createWorld(),flags},lost,studied:[]});

test('the Hyena quiets the graves without restoring fish, and region victories persist through death',()=>{
  assert.equal(fortState(context(['boar-defeated'])).quiet,false);
  const world=context(['boar-defeated','hyena-slain']);
  assert.deepEqual(fortState(world),{quiet:true,grain:true,fish:'cut',familiar:true,name:'The fort town'});
  assert.equal(fortState({...world,world:drop(world.world)}).quiet,true);
  assert.equal(fortState(context(['hyena-slain','frog-free'])).fish,'spoiled');
  assert.equal(fortState(context(['hyena-slain','frog-free','viper-slain'])).fish,'cut');
  assert.equal(fortState(context(['hyena-slain','frog-free','viper-slain','cuttlefish-slain'])).fish,'stopped');
});
test('the memorial and town recognition respond to the Vulture memory and reminders',()=>{
  const forgotten=context(['hyena-slain','vulture-free'],['vulture']);
  assert.equal(fortState(forgotten).name,'A garrison without a name');
  assert.match(conversation(fortStreet,'mourning-wall',forgotten).lines.join(' '),/do not know whose/);
  const reminded={...forgotten,remembered:['vulture'] as const};
  assert.equal(fortState(reminded).name,'The fort town');
  assert.match(conversation(fortStreet,'mourning-wall',reminded).lines.join(' '),/uneven handwriting/);
});
test('ration dialogue respects later shortages and does not swallow quest rewards',()=>{
  assert.match(conversation(fortStreet,'ration-table',context(['hyena-slain'])).lines.join(' '),/no more than before/);
  assert.match(conversation(fortStreet,'ration-table',context(['hyena-slain','cuttlefish-slain'])).lines.join(' '),/barrels are empty/);
  const delivery=conversation(fort,'quartermaster',{...context(['hyena-slain']),world:{...context(['hyena-slain']).world,carried:['letter']}});
  assert.equal(delivery.then?.earn,15);
  assert.equal(conversation(fort,'merchant',context(['hyena-slain'])).then?.earn,10);
  assert.equal(conversation(fort,'merchant',context(['hyena-slain','merchant-thanked'])).then?.shop,'merchant');
  assert.equal(conversation(fort,'lynx',context(['hyena-slain'])).choices?.length,1);
});
test('camp moments require the living companion and vary with trust, memory and the Hyena',()=>{
  assert.equal(vultureAtCamp(context()),undefined);
  const joined=context(['vulture-free']);
  assert.equal(vultureAtCamp({...joined,world:{...joined.world,fallen:['vulture']}}),undefined);
  assert.match(vultureAtCamp(joined)!.lines.join(' '),/copies the same line/);
  assert.match(vultureAtCamp(context(['vulture-free','hyena-slain']))!.lines.join(' '),/under the abbey/);
  assert.match(vultureAtCamp(context(['vulture-free'],['vulture']))!.lines.join(' '),/Neither of you.*pretend/);
});
