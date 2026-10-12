import {test,expect,type Page} from '@playwright/test';
declare global{interface Window{bearRun:typeof import('../src/main');}}
test.use({storageState:{cookies:[],origins:[]},reducedMotion:'reduce'});
async function ready(page:Page,key:string){await page.waitForFunction(key=>Boolean((window.bearRun.game?.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene|undefined)?.player?.active),key);}
async function start(page:Page){
  await page.addInitScript(()=>{
    if(localStorage.getItem('tide-keeps.world.v1'))return;
    localStorage.setItem('tide-keeps.world.v1',JSON.stringify({flags:['bear-free','boar-defeated','anchors-known'],carried:[],found:[],coins:50}));
    localStorage.setItem('tide-keeps.memory.v1',JSON.stringify({lost:['home','name','bear'],pending:false}));
  });
  await page.goto('/');await page.evaluate(async()=>{window.bearRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();await ready(page,'church');await travel(page,'church','farmland');
}
async function travel(page:Page,from:string,to:string){await page.evaluate(([from,to])=>window.bearRun.game!.scene.getScene(from).scene.start(to),[from,to]);await ready(page,to);}
async function talk(page:Page,key:string,x:number,y:number,prompt:string){
  await page.evaluate(([key,x,y])=>{const s=window.bearRun.game!.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene;s.player.setPosition(x,y);const b=s.player.body as import('phaser').Physics.Arcade.Body;b.reset(x,y);b.updateFromGameObject();},[key,x,y] as const);
  await page.locator('#game').focus();await expect(page.locator('#prompt')).toContainText(prompt);await page.keyboard.press('e');
}
async function advanceToChoice(page:Page,choice:RegExp){
  for(let i=0;i<8 && !await page.getByRole('button',{name:choice}).isVisible();i++)await page.locator('#continue').click();
  await expect(page.getByRole('button',{name:choice})).toBeVisible();
}
async function record(page:Page){
  await talk(page,'farmland',120,248,'bear');await expect(page.locator('#dialogue-text')).toContainText('stone');await page.keyboard.press('Escape');
  await travel(page,'farmland','mill-inside');await talk(page,'mill-inside',312,252,'ledger');
  await page.locator('#continue').click();await expect(page.locator('#dialogue-text')).toContainText('UNABLE TO STAND');await page.keyboard.press('Escape');
  await travel(page,'mill-inside','farmland');await talk(page,'farmland',56,240,'miller');
  await advanceToChoice(page,/Let the bear speak about the labour record/);await page.getByRole('button',{name:/Let the bear speak about the labour record/}).click();
  await advanceToChoice(page,/Leave on the bear/);
}
async function reward(page:Page){
  await talk(page,'farmland',120,248,'bear');await advanceToChoice(page,/Keep the broken link/);await page.getByRole('button',{name:/Keep the broken link/}).click();
  await expect(page.locator('#dialogue-text')).toContainText('warm from his paw');await page.keyboard.press('Escape');
  const story=page.locator('.cinematic[data-story="bearChain"]');await expect(story).toBeVisible();await page.screenshot({path:'/tmp/tide-bear-keepsake.png'});
  await story.locator('.cinema-skip').click();await expect(story).toHaveCount(0);
  const saved=await page.evaluate(()=>({world:JSON.parse(localStorage.getItem('tide-keeps.world.v1')!),memory:JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!)}));
  expect(saved.world.found).toContain('broken-link');expect(saved.memory.keepsakeMemories).toEqual(['bear']);expect(saved.memory.lost).not.toContain('bear');
}

test('the formal route changes the labour order before the bear gives the link',async({page})=>{
  await start(page);await record(page);await page.getByRole('button',{name:/Take his signed statement/}).click();await page.keyboard.press('Escape');
  await talk(page,'farmland',120,248,'bear');await expect(page.locator('#dialogue-text')).toContainText('reeve');await expect(page.getByRole('button',{name:/Keep the broken link/})).toHaveCount(0);await page.keyboard.press('Escape');
  await travel(page,'farmland','town');await talk(page,'town',120,128,'reeve');
  await advanceToChoice(page,/Show the miller’s statement/);await page.getByRole('button',{name:/Show the miller’s statement/}).click();
  await page.locator('#continue').click();await page.locator('#continue').click();await expect(page.locator('#dialogue-text')).toContainText('no chained labour');await page.keyboard.press('Escape');
  await travel(page,'town','farmland');await reward(page);
  await talk(page,'farmland',120,248,'bear');await expect(page.locator('#dialogue-text')).toContainText('does not move');await expect(page.getByRole('button',{name:/Keep the broken link/})).toHaveCount(0);await page.keyboard.press('Escape');
  await travel(page,'farmland','mill-inside');await talk(page,'mill-inside',312,252,'ledger');await page.locator('#continue').click();await expect(page.locator('#dialogue-text')).toContainText('NO CHAINED LABOUR');
});

test('leaving on the bear’s terms restores his memory, and it survives death and reload while unequipped',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await start(page);await record(page);await page.getByRole('button',{name:/Leave on the bear/}).click();await page.keyboard.press('Escape');await reward(page);
  await page.locator('#game').focus();await page.keyboard.press('Tab');
  const slot=page.getByRole('combobox',{name:'Bear keepsake 1',exact:true});await slot.selectOption('broken-link');
  await expect(page.locator('.equipment')).toContainText('Protect guards both allies');await slot.selectOption('');
  await page.getByRole('button',{name:'Done',exact:true}).click();
  // A real battle finish invokes the normal death, resurrection, and memory-save path.
  await page.evaluate(()=>{
    const s=window.bearRun.game!.scene.getScene('farmland') as unknown as {foes:{encounter:string}[];beginBattle:(foe:unknown)=>void};s.beginBattle(s.foes.find(foe=>foe.encounter==='locust'));
  });
  await expect(page.locator('.party-battle')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.bearRun.game!.scene.getScene('farmland') as unknown as {overlay:{state:import('../src/rules/battle').Battle;render:()=>void}};
    s.overlay.state={...s.overlay.state,phase:'defeat',party:s.overlay.state.party.map(member=>({...member,health:0}))};s.overlay.render();
  });
  await page.getByRole('button',{name:'Wake at the cot',exact:true}).click();await ready(page,'church');
  await page.locator('.cinematic[data-story="resurrection"] .cinema-skip').click();
  await expect(page.locator('.memory-taken')).not.toContainText('The bear');
  await expect(page.locator('.resurrection')).toContainText('Held permanently by a keepsake');await page.getByRole('button',{name:'Stand up',exact:true}).click();
  await page.reload();await page.evaluate(async()=>{window.bearRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});await page.locator('#title-play').click();await ready(page,'church');
  const saved=await page.evaluate(()=>({memory:JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!),gear:JSON.parse(localStorage.getItem('tide-keeps.gear.v1')!)}));
  expect(saved.memory.keepsakeMemories).toEqual(['bear']);expect(saved.memory.lost).not.toContain('bear');expect(saved.gear.bear).toEqual([]);expect(errors).toEqual([]);
});
