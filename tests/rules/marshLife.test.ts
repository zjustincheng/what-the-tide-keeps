import {test} from 'node:test';
import assert from 'node:assert/strict';
import {frogAtCamp,marshState} from '../../src/rules/marshLife.ts';
import {marshStreet,hospiceLife} from '../../src/content/marshLife.ts';
import {hospice,wickmere} from '../../src/content/marsh.ts';
import {conversation,createWorld,drop,replies} from '../../src/rules/world.ts';
import type {Context,Flag} from '../../src/rules/world';
const context=(flags:Flag[]=[],lost:Context['lost']=[]):Context=>({world:{...createWorld(),flags},lost,studied:[]});

test('marsh care progresses from fear to poison to recovery without restoring the sea trade',()=>{
  assert.equal(marshState(context()).care,'feared');
  assert.equal(marshState(context(['frog-free'])).care,'poison');
  assert.equal(marshState(context(['frog-free','viper-slain'])).care,'recovering');
  const ended=context(['frog-free','viper-slain','cuttlefish-slain']);
  assert.equal(marshState(ended).fish,'stopped');
  assert.equal(marshState({...ended,world:drop(ended.world)}).care,'recovering');
});
test('the forgotten Frog changes recognition and a reminder restores it',()=>{
  const forgotten=context(['frog-free'],['frog']);
  assert.equal(marshState(forgotten).name,'A town above dark water');
  assert.match(conversation(marshStreet,'deck-marker',forgotten).lines.join(' '),/should remember/);
  assert.equal(marshState({...forgotten,remembered:['frog']}).name,'Wickmere');
});
test('the Frog joins for the sick and only starts trusting the party after the Viper',()=>{
  assert.equal(frogAtCamp(context()),undefined);
  const joined=context(['frog-free']);
  assert.equal(frogAtCamp({...joined,world:{...joined.world,fallen:['frog']}}),undefined);
  assert.match(frogAtCamp(joined)!.lines.join(' '),/here for the people/);
  assert.match(frogAtCamp(context(['frog-free','viper-slain']))!.lines.join(' '),/no longer.*proof against/);
  assert.match(frogAtCamp(context(['frog-free'],['frog']))!.lines.join(' '),/stop the poison/);
  assert.match(frogAtCamp(context(['frog-free','viper-slain'],['frog']))!.lines.join(' '),/do not have to know my name/);
});
test('recovery keeps the newt rescue and hospice reward available',()=>{
  const saved=context(['viper-slain']);
  const rich={...saved,world:{...saved.world,coins:20}};
  assert.ok(replies(conversation(wickmere,'magistrate',rich).choices,rich).some(choice=>choice.then?.set==='newt-freed'));
  assert.equal(conversation(hospice,'sister',saved).then?.find,'hospice-bell');
  assert.match(conversation(hospiceLife,'meal-tray',saved).lines.join(' '),/patients have eaten/);
  assert.match(conversation(hospice,'ward-book',saved).lines.join(' '),/No new admissions/);
  assert.match(conversation(marshStreet,'barrel-inspector',context(['viper-slain','cuttlefish-slain'])).lines.join(' '),/nothing to inspect/);
});
