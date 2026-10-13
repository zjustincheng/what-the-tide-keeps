import {test,expect,type Page} from '@playwright/test';
import type {AreaScene} from '../src/scenes/AreaScene';
import type {Memory} from '../src/rules/memory';
declare global {interface Window {loadoutRun:typeof import('../src/main');}}
test.use({storageState:{cookies:[],origins:[]}});
async function boot(page:Page) {
  await page.evaluate(async()=>{window.loadoutRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();await page.waitForFunction(()=>Boolean((window.loadoutRun.game?.scene.getScene('church') as AreaScene|undefined)?.player?.active));
}
async function start(page:Page,memory:Memory,found:string[]=[],tempered:string[]=[]) {
  await page.addInitScript(({memory,found,tempered})=>{
    if(!localStorage.getItem('tide-keeps.world.v1'))localStorage.setItem('tide-keeps.world.v1',JSON.stringify({flags:['bear-free','anchors-known'],carried:[],found,tempered,coins:20,deaths:1}));
    if(!localStorage.getItem('tide-keeps.memory.v1'))localStorage.setItem('tide-keeps.memory.v1',JSON.stringify(memory));
  },{memory,found,tempered});await page.goto('/');await boot(page);
}
async function die(page:Page) {
  await page.evaluate(async()=>{
    const {loadMemory,saveMemory}=await import('/src/storage/memory.ts');const {wipe}=await import('/src/rules/memory.ts');
    const {loadWorld,saveWorld}=await import('/src/storage/world.ts');const {drop}=await import('/src/rules/world.ts');
    saveMemory(wipe(loadMemory()));saveWorld(drop(loadWorld()));
  });await page.reload();await boot(page);
}

test('a friend’s reminder can be written down in the same visit and survives death',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await start(page,{lost:['home','name','trial'],pending:false,anchors:['feast'],keepsakeMemories:['bear']},['broken-link']);
  await page.evaluate(()=>(window.loadoutRun.game!.scene.getScene('church') as unknown as {writeDown:(then:()=>void)=>void}).writeDown(()=>{}));
  await page.getByRole('radio',{name:/Bear: The trial/}).check();
  await expect(page.locator('.anchor-summary')).toContainText('removes its Hollow bonus (+2 mana)');
  await page.getByRole('radio',{name:/Write down The trial/}).check();
  await expect(page.locator('.anchor-summary')).toContainText('The trial will be protected');
  await expect(page.locator('.anchor-summary')).toContainText('replaces the page for The feast');
  await page.screenshot({path:'/tmp/tide-anchor-reminder-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Done',exact:true}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!).anchors)).toEqual(['trial']);
  await die(page);await page.locator('.cinema-skip').click();
  await expect(page.locator('.resurrection')).toContainText('Restored through the written page · The trial');
  await page.getByRole('button',{name:'Stand up',exact:true}).click();
  const memory=await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!));
  expect(memory.lost).not.toContain('trial');expect(memory.anchors).toEqual([]);expect(memory.reminded).toEqual([]);expect(memory.keepsakeMemories).toEqual(['bear']);
});

test('a protected last memory survives once, then its used page must be written again',async({page})=>{
  await start(page,{lost:['trial','kraken','bear','vulture','frog','octopus','training','home','name'],pending:true,anchors:['feast']});
  await expect(page.locator('#memory-status')).toContainText('1 of 10');
  await expect(page.locator('.cinematic,.resurrection')).toHaveCount(0);
  let memory=await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!));
  expect(memory.pending).toBe(false);expect(memory.anchors).toEqual([]);expect(memory.lost).not.toContain('feast');
  await expect(page.locator('#game')).not.toHaveAttribute('inert','');
  await die(page);await page.locator('.cinema-skip').click();await page.getByRole('button',{name:'Stand up',exact:true}).click();
  await expect(page.locator('#memory-status')).toContainText('0 of 10');
  memory=await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!));expect(memory.lost).toContain('feast');
});

test('keepsake comparisons show actual tempered values, wearer, and Hollow attack strength on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await start(page,{lost:['home','name','feast'],pending:false,keepsakeMemories:['bear']},['cracked-mirror','broken-link'],['cracked-mirror']);
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Equipment',exact:true}).click();
  await expect(page.locator('.area-title-card')).not.toBeVisible();
  await page.getByRole('combobox',{name:'Chameleon keepsake 1'}).selectOption('cracked-mirror');
  await expect(page.locator('[data-member="chameleon"] .equipment-behavior')).toContainText('hiding costs 2 mana');
  const actual=await page.evaluate(async()=>{
    const {createBattle,act}=await import('/src/rules/battle.ts');const {hollow}=await import('/src/rules/memory.ts');
    const {loadMemory}=await import('/src/storage/memory.ts');const {loadGear}=await import('/src/storage/gear.ts');
    const battle=createBattle('locust',[],{hollow:hollow(loadMemory()),gear:loadGear()});
    return battle.enemy.health-act(battle,'chameleon','attack').enemy.health;
  });
  await expect(page.locator('[data-member="chameleon"] .equipment-stats')).toContainText(`Damage ${actual}`);
  await page.getByRole('combobox',{name:'Bear keepsake 1'}).selectOption('broken-link');
  await page.locator('.keepsake-catalog summary').click();
  const mirror=page.locator('[data-keepsake="cracked-mirror"]');
  await expect(mirror.locator('.keepsake-benefit')).toContainText('5 harder');await expect(mirror.locator('.keepsake-drawback')).toContainText('1 extra mana');
  await expect(mirror.locator('.keepsake-holder')).toContainText('Worn by Chameleon');
  await expect(page.locator('[data-keepsake="broken-link"] .keepsake-memory')).toContainText('even when kept in the pack');
  await page.screenshot({path:'/tmp/tide-keepsake-comparison-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Done',exact:true}).click();await page.reload();await boot(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('tide-keeps.gear.v1')!).bear)).toEqual(['broken-link']);
});
