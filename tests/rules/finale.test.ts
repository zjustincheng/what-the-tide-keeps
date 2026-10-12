import {test} from 'node:test';
import assert from 'node:assert/strict';
import {whitehouse,lamp} from '../../src/content/island.ts';
import {church} from '../../src/content/church.ts';
import {square} from '../../src/content/capital.ts';
import {createWorld,conversation,replies} from '../../src/rules/world.ts';
import type {Context,Flag} from '../../src/rules/world';
const context=(flags:Flag[]=[],lost:Context['lost']=[]):Context=>({world:{...createWorld(),flags},lost,studied:[]});

test('island records reveal the created human and resurrection memory conduit',()=>{
  const origin=conversation(whitehouse,'records',context()).lines.join(' ');
  assert.match(origin,/neither predator nor prey/);assert.match(origin,/made him flesh/);
  assert.doesNotMatch(origin,/last of the old people|The Covenant was theirs/);
  assert.match(conversation(whitehouse,'basin-records',context()).lines.join(' '),/sends it to SUBJECT 9/);
});
test('the final mercy restores memories, releases remaining prisoners, and lifts the sentence',()=>{
  const ready=context(['human-beaten','lab-remembered']);
  const spare=replies(conversation(lamp,'stranger',ready).choices,ready).find(choice=>choice.text==='Spare him.')!;
  assert.deepEqual(spare.then?.set,['human-spared','cages-opened']);assert.equal(spare.then?.recallAll,true);
  const after=context(['human-spared','cuttlefish-slain','boar-defeated']);
  const priest=conversation(church,'priest',after);
  assert.match(priest.lines.join(' '),/No orders/);
  assert.ok(priest.choices?.every(choice=>!choice.then?.raise&&!choice.then?.tithe));
  assert.match(conversation(square,'crier',after).lines.join(' '),/sentences are lifted/);
});
test('the final fight still requires the feast, a companion, and the recovered laboratory',()=>{
  const refusal=(ctx:Context)=>replies(conversation(lamp,'stranger',ctx).choices,ctx).some(choice=>choice.then?.set==='human-challenged');
  assert.equal(refusal(context()),false);
  assert.equal(refusal(context(['lab-remembered'])),true);
  assert.equal(refusal(context(['lab-remembered'],['feast'])),false);
  assert.equal(refusal(context(['lab-remembered'],['bear','vulture','frog','octopus'])),false);
});
