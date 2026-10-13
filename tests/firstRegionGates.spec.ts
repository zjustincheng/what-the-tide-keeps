import {test,expect,type Page} from '@playwright/test';
import type {AreaScene} from '../src/scenes/AreaScene';
declare global {interface Window {gateRun:typeof import('../src/main');}}
test.use({storageState:{cookies:[],origins:[]}});
async function ready(page:Page,key:string) {
  await page.waitForFunction(key=>Boolean((window.gateRun.game?.scene.getScene(key) as AreaScene|undefined)?.sys.isActive() && (window.gateRun.game?.scene.getScene(key) as AreaScene|undefined)?.player?.active),key);
}
async function boot(page:Page) {
  await page.evaluate(async()=>{window.gateRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();await ready(page,'church');
}
async function start(page:Page,flags:string[]=[]) {
  await page.addInitScript(flags=>{
    if(!localStorage.getItem('tide-keeps.world.v1'))localStorage.setItem('tide-keeps.world.v1',JSON.stringify({flags,carried:[],found:[],coins:20,deaths:1}));
    if(!localStorage.getItem('tide-keeps.memory.v1'))localStorage.setItem('tide-keeps.memory.v1',JSON.stringify({lost:['home','name'],pending:false}));
  },flags);await page.goto('/');await boot(page);
}
async function visit(page:Page,key:string) {
  await page.evaluate(key=>window.gateRun.game!.scene.getScenes(true)[0].scene.start(key,{spawn:key==='gorge'?'from-pass':'spawn'}),key);await ready(page,key);
}
async function place(page:Page,key:string,x:number,y:number) {
  await page.evaluate(([key,x,y])=>{
    const scene=window.gateRun.game!.scene.getScene(key) as AreaScene;
    (scene.player.body as Phaser.Physics.Arcade.Body).reset(x,y);
  },[key,x,y] as const);await page.locator('#game').focus();
}
async function y(page:Page,key:string) {return page.evaluate(key=>(window.gateRun.game!.scene.getScene(key) as AreaScene).player.y,key);}
async function down(page:Page,time:number) {await page.keyboard.down('ArrowDown');await page.waitForTimeout(time);await page.keyboard.up('ArrowDown');}
async function talk(page:Page,key:string,x:number,y:number,prompt:string) {await place(page,key,x,y);await expect(page.locator('#prompt')).toContainText(prompt);await page.keyboard.press('e');await expect(page.locator('#dialogue')).toBeVisible();}

test('brambles stop walking and repeated hops, then the lamb’s real favor opens a persistent passage',async({page})=>{
  await start(page);await visit(page,'border-road');await place(page,'border-road',256,132);await down(page,200);
  for(let i=0;i<3;i++) {await page.keyboard.press('Shift');await page.waitForTimeout(300);}
  expect(await y(page,'border-road')).toBeLessThan(140);
  await visit(page,'farmland');await talk(page,'farmland',280,138,'Pick up the bell');
  await expect(page.locator('#dialogue-text')).toContainText('small brass bell');await page.keyboard.press('Escape');
  await visit(page,'town');await talk(page,'town',232,236,'Speak to the lamb');
  await expect(page.locator('#dialogue-text')).toHaveText('My bell!');await page.keyboard.press('Escape');
  await visit(page,'border-road');await talk(page,'border-road',256,116,'Examine the brambles');
  await expect(page.locator('#dialogue-text')).toContainText('lamb');await page.keyboard.press('Escape');
  await place(page,'border-road',256,132);await down(page,800);expect(await y(page,'border-road')).toBeGreaterThan(180);
  await page.reload();await boot(page);await visit(page,'border-road');
  await place(page,'border-road',256,132);await page.keyboard.press('Shift');await page.waitForTimeout(400);
  expect(await y(page,'border-road')).toBeGreaterThan(140);
  const saved=await page.evaluate(()=>({world:JSON.parse(localStorage.getItem('tide-keeps.world.v1')!),spells:JSON.parse(localStorage.getItem('tide-keeps.grimoire.v1')!)}));
  expect(saved.world.flags).toContain('hedge-open');expect(saved.spells).toContain("Bramble's leave");
});

test('the sister’s barricade cannot be walked around, hopped through, or bypassed at the exit',async({page})=>{
  await start(page,['hedge-open']);await visit(page,'border-road');
  // Sneak past the exile so this check can inspect the barricade without a fight.
  await page.locator('#game').focus();await page.keyboard.press('q');
  for(const x of [256,184]) {
    await place(page,'border-road',x,334);await down(page,400);
    for(let i=0;i<2;i++){await page.keyboard.press('Shift');await page.waitForTimeout(300);}
    expect(await y(page,'border-road')).toBeLessThan(345);
  }
  await place(page,'border-road',256,372);await expect(page.locator('#prompt')).toContainText('Follow the smoke');await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Speak to me first');await page.keyboard.press('Escape');
  await page.evaluate(()=>(window.gateRun.game!.scene.getScene('border-road') as unknown as {effect:(effect:unknown)=>void}).effect({set:['kid-found','burn-order-seen']}));
  await talk(page,'border-road',212,318,'Speak to the sow');
  while(!(await page.locator('#choices').isVisible()))await page.locator('#continue').click();
  await page.getByRole('button',{name:/I know he didn't do it/}).click();await page.keyboard.press('Escape');
  await place(page,'border-road',256,334);await down(page,850);expect(await y(page,'border-road')).toBeGreaterThan(360);
  await page.keyboard.press('e');await ready(page,'boar-farm');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags)).toContain('lane-open');
  await page.reload();await boot(page);await visit(page,'border-road');await place(page,'border-road',256,372);await expect(page.locator('#prompt')).toContainText('Follow the smoke');await page.keyboard.press('e');await ready(page,'boar-farm');
});

test('the earned writ frees the bear and the reunion survives resurrection and reload',async({page})=>{
  await start(page,['pests-field','pests-yard']);await visit(page,'town');await talk(page,'town',120,84,'Speak to the reeve');
  await expect(page.locator('#dialogue-text')).toContainText('hay yard is quiet');await page.keyboard.press('Escape');
  await visit(page,'farmland');await talk(page,'farmland',56,200,'Speak to the miller');
  await expect(page.locator('#dialogue-text')).toContainText('reeve');await page.keyboard.press('Escape');
  await expect(page.locator('.cinematic[data-story="bear"]')).toBeVisible();await page.locator('.cinema-skip').click();
  await expect(page.locator('#hud')).toContainText('Bear');
  await page.evaluate(async()=>{
    const {loadMemory,saveMemory}=await import('/src/storage/memory.ts');const {wipe}=await import('/src/rules/memory.ts');
    const {loadWorld,saveWorld}=await import('/src/storage/world.ts');const {drop}=await import('/src/rules/world.ts');
    saveMemory(wipe(loadMemory()));saveWorld(drop(loadWorld()));
  });
  await page.reload();await boot(page);
  await expect(page.locator('.cinema-skip')).toBeVisible();await page.locator('.cinema-skip').click();
  await page.getByRole('button',{name:'Stand up',exact:true}).click();await expect(page.locator('#hud')).toContainText('Bear');
  await visit(page,'farmland');
  const bears=await page.evaluate(()=>{
    const scene=window.gateRun.game!.scene.getScene('farmland') as unknown as {props:{sprite:Phaser.Physics.Arcade.Sprite}[]};
    return scene.props.filter(({sprite})=>sprite.texture.key==='bear').map(({sprite})=>({active:sprite.active,body:sprite.body!.enable}));
  });
  expect(bears.every(bear=>!bear.active&&!bear.body)).toBe(true);
  const flags=await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags);expect(flags).toContain('bear-free');expect(flags).toContain('writ-given');
});

test('solid-prop checks still allow a legitimate leap across the gorge crack',async({page})=>{
  await start(page);await visit(page,'gorge');await place(page,'gorge',136,196);
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(()=>(window.gateRun.game!.scene.getScene('gorge') as AreaScene).player.x)).toBeLessThan(144);
  await page.keyboard.press('Shift');
  await expect.poll(()=>page.evaluate(()=>(window.gateRun.game!.scene.getScene('gorge') as AreaScene).player.x)).toBe(168);
});
