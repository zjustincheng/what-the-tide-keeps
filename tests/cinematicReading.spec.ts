import {test,expect,type Page} from '@playwright/test';
import type {AreaScene} from '../src/scenes/AreaScene';
import type {Battle} from '../src/rules/battle';
declare global {interface Window {readingRun:typeof import('../src/main');sceneGap:boolean;}}
test.use({storageState:{cookies:[],origins:[]}});
async function boot(page:Page) {
  await page.goto('/');await page.evaluate(async()=>{window.readingRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();await page.waitForFunction(()=>Boolean((window.readingRun.game?.scene.getScene('church') as AreaScene|undefined)?.player?.active));
}
async function gallery(page:Page) {
  await page.addInitScript(()=>{
    localStorage.setItem('tide-keeps.world.v1',JSON.stringify({flags:['bear-free'],carried:[],found:[],coins:20}));
    localStorage.setItem('tide-keeps.memory.v1',JSON.stringify({lost:['home','name'],pending:false}));
    localStorage.setItem('tide-keeps.scenes.v1',JSON.stringify(['waking','krakenSlain']));
  });await boot(page);
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Revisit memories',exact:true}).click();
}
async function advance(page:Page) {
  const line=page.locator('.cinema-line');
  if((await line.locator('span').textContent())!==(await line.getAttribute('data-full')))await page.locator('.cinema-next').click();
  await page.locator('.cinema-next').click();
}

test('long mobile lines reserve their space and going back rereads without changing progress',async({page})=>{
  await page.setViewportSize({width:390,height:844});await gallery(page);
  const before=await page.evaluate(()=>[localStorage.getItem('tide-keeps.world.v1'),localStorage.getItem('tide-keeps.memory.v1')]);
  await page.getByRole('button',{name:'The sea falls silent',exact:true}).click();
  await expect(page.locator('.cinema-back')).toBeDisabled();
  const picture=await page.locator('.cinema-picture').boundingBox();const button=await page.locator('.cinema-next').boundingBox();
  await page.locator('.cinema-next').click();
  await expect(page.locator('.cinema-next')).toContainText('Continue');
  expect(Math.abs((await page.locator('.cinema-picture').boundingBox())!.height-picture!.height)).toBeLessThan(2);
  expect(Math.abs((await page.locator('.cinema-next').boundingBox())!.y-button!.y)).toBeLessThan(2);
  await page.locator('.cinema-next').click();await expect(page.locator('.cinematic')).toHaveAttribute('data-shot','1');
  await page.locator('.cinema-back').focus();await page.keyboard.press('Enter');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-shot','0');
  const full=await page.locator('.cinema-line').getAttribute('data-full');await expect(page.locator('.cinema-line span')).toHaveText(full!);
  await page.screenshot({path:'/tmp/tide-cinematic-reading-mobile.png',fullPage:true});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Revisit memories',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>[localStorage.getItem('tide-keeps.world.v1'),localStorage.getItem('tide-keeps.memory.v1')])).toEqual(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('reduced-motion reading shows full text and keyboard navigation skips disabled controls',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await gallery(page);
  await page.getByRole('button',{name:'What the tide keeps',exact:true}).click();
  await expect(page.locator('.cinema-next')).toContainText('Continue');
  await page.keyboard.press('Tab');await expect(page.locator('.cinema-skip')).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.locator('.cinema-next')).toBeFocused();
  await page.keyboard.press('ArrowRight');await expect(page.locator('.cinematic')).toHaveAttribute('data-shot','1');
  await page.keyboard.press('ArrowLeft');await expect(page.locator('.cinematic')).toHaveAttribute('data-shot','0');
  await expect(page.locator('.cinema-line span')).toHaveText((await page.locator('.cinema-line').getAttribute('data-full'))!);
});

test('the octopus stands on the harbor and the kraken-to-feast handoff stays covered',async({page})=>{
  await boot(page);const intro=page.locator('.cinematic[data-story="prologue"]');await expect(intro).toBeVisible();
  // The second scene of the prologue gathers the vulture, the frog, and the octopus on the harbour.
  await advance(page);
  await expect(intro).toHaveAttribute('data-art','harbor');await expect(intro.locator('[data-actor="octopus"]')).toBeVisible();
  await page.screenshot({path:'/tmp/tide-prologue-octopus.png'});
  await intro.locator('.cinema-skip').click();await expect(page.locator('.battle')).toHaveAttribute('data-encounter','kraken');
  await page.evaluate(()=>{
    window.sceneGap=false;
    new MutationObserver(()=>{if(!document.querySelector('.cinematic,.battle'))window.sceneGap=true;}).observe(document.querySelector('.game-frame')!,{childList:true,subtree:true});
    const scene=window.readingRun.game!.scene.getScene('church') as unknown as {overlay:{state:Battle;render:()=>void}};
    scene.overlay.state={...scene.overlay.state,phase:'victory',enemy:{...scene.overlay.state.enemy,health:0}};scene.overlay.render();
  });
  await page.getByRole('button',{name:'The final blow',exact:true}).click();
  await expect(page.locator('.cinematic[data-story="krakenSlain"]')).toBeVisible();
  for(let shot=0;shot<5;shot++)await advance(page);
  await expect(page.locator('.cinematic[data-story="waking"]')).toBeVisible();
  expect(await page.evaluate(()=>window.sceneGap)).toBe(false);
});
