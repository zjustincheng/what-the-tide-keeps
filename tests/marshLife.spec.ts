import {test,expect,type Page} from '@playwright/test';
declare global{interface Window{marshRun:typeof import('../src/main');}}
test.use({storageState:{cookies:[],origins:[]}});
async function ready(page:Page,key:string){await page.waitForFunction(key=>Boolean((window.marshRun.game?.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene|undefined)?.player?.active),key);}
async function start(page:Page,lost:string[]=['home','name'],joined=false){
  await page.addInitScript(({lost,joined})=>{
    localStorage.setItem('tide-keeps.world.v1',JSON.stringify({flags:['bear-free','vulture-free',...(joined?['frog-free']:[])],carried:[],found:[],coins:30}));
    localStorage.setItem('tide-keeps.memory.v1',JSON.stringify({lost,pending:false}));
  },{lost,joined});
  await page.goto('/');await page.evaluate(async()=>{window.marshRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();await ready(page,'church');
  await page.evaluate(()=>window.marshRun.game!.scene.getScene('church').scene.start('wickmere',{spawn:'from-causeway'}));await ready(page,'wickmere');
}
async function place(page:Page,key:string,x:number,y:number){
  await page.evaluate(([key,x,y])=>{const s=window.marshRun.game!.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene;s.player.setPosition(x,y);const b=s.player.body as import('phaser').Physics.Arcade.Body;b.reset(x,y);b.updateFromGameObject();},[key,x,y] as const);
  await page.locator('#game').focus();
}
const change=(page:Page,key:string,e:unknown)=>page.evaluate(([key,e])=>(window.marshRun.game!.scene.getScene(key) as unknown as {effect:(e:unknown)=>void}).effect(e),[key,e] as const);

test('the decks and hospice move from feared sickness to diagnosed poison to recovery',async({page})=>{
  await start(page);
  await expect(page.locator('.game-frame')).toHaveAttribute('data-marsh-care','feared');
  await change(page,'wickmere',{set:'frog-free'});
  await expect(page.locator('.game-frame')).toHaveAttribute('data-marsh-care','poison');
  await page.evaluate(()=>window.marshRun.game!.scene.getScene('wickmere').scene.start('hospice'));
  await ready(page,'hospice');await place(page,'hospice',120,188);
  await expect(page.locator('#prompt')).toContainText('meal tray');await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('soup has been taken away');await page.keyboard.press('Escape');
  await change(page,'hospice',{set:'viper-slain'});
  await expect(page.locator('.game-frame')).toHaveAttribute('data-marsh-care','recovering');
  await page.keyboard.press('e');await expect(page.locator('#dialogue-text')).toContainText('patients have eaten');await page.keyboard.press('Escape');
  await page.evaluate(()=>window.marshRun.game!.scene.getScene('hospice').scene.start('wickmere',{spawn:'from-hospice'}));await ready(page,'wickmere');
  await expect(page.locator('.game-frame')).toHaveAttribute('data-marsh-fish','inspected');
  await change(page,'wickmere',{set:'cuttlefish-slain'});
  await expect(page.locator('.game-frame')).toHaveAttribute('data-marsh-fish','stopped');
});

test('the Frog camp moment changes from unfamiliar duty to trust and memory returns',async({page})=>{
  await start(page,['home','name','frog'],true);
  await expect(page.locator('#location-place')).toContainText('A town above dark water');
  await expect(page.locator('.memory-echo')).toContainText('Someone used to steady');
  await place(page,'wickmere',152,312);
  await expect(page.locator('#prompt')).toContainText('brazier');await page.keyboard.press('e');
  await expect(page.locator('.memory-echo')).toBeHidden();
  await page.getByRole('button',{name:/Sit with the frog\./}).click();
  await expect(page.locator('#speaker')).toHaveText('THE FROG');
  await expect(page.locator('#dialogue-text')).toContainText('cup of water');await page.keyboard.press('Escape');
  await change(page,'wickmere',{set:'viper-slain',recall:'frog'});
  await expect(page.locator('#location-place')).toContainText('Wickmere');
  await page.keyboard.press('e');await page.getByRole('button',{name:/Sit with the frog\./}).click();
  await expect(page.locator('#dialogue-text')).toContainText('lets you hold the basin');
});

test('the newt can still be freed after the Viper falls',async({page})=>{
  await start(page);await change(page,'wickmere',{set:'viper-slain'});await place(page,'wickmere',376,232);
  await expect(page.locator('#prompt')).toContainText('heron');await page.keyboard.press('e');
  await page.locator('#continue').click();
  await page.getByRole('button',{name:/Let the newt go/}).click();
  await expect(page.locator('#purse')).toContainText('10');
  await expect(page.locator('#dialogue-text')).toContainText('counts it twice');
});
