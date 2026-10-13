import {test,expect,type Page} from '@playwright/test';
import type {AreaScene} from '../src/scenes/AreaScene';
import type {BattleView} from '../src/ui/BattleView';
import type {Battle,Encounter,MemberId} from '../src/rules/battle';
declare global {interface Window {clarityRun:typeof import('../src/main');}}
test.use({storageState:{cookies:[],origins:[]}});
async function start(page:Page) {
  await page.addInitScript(()=>{
    if(!localStorage.getItem('tide-keeps.world.v1'))localStorage.setItem('tide-keeps.world.v1',JSON.stringify({flags:['bear-free','vulture-free'],carried:[],found:[],coins:20}));
    if(!localStorage.getItem('tide-keeps.memory.v1'))localStorage.setItem('tide-keeps.memory.v1',JSON.stringify({lost:['home','name'],pending:false}));
  });
  await page.goto('/');
  await page.evaluate(async()=>{window.clarityRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();
  await page.waitForFunction(()=>Boolean((window.clarityRun.game?.scene.getScene('church') as AreaScene|undefined)?.player?.active));
}
async function battle(page:Page,encounter:Encounter,roster:MemberId[],company=true) {
  await page.evaluate(async({encounter,roster,company})=>{
    const {BattleView}=await import('/src/ui/BattleView.ts');
    const scene=window.clarityRun.game!.scene.getScene('church') as unknown as {textures:Phaser.Textures.TextureManager;overlay:BattleView;setExplorationEnabled:(enabled:boolean)=>void};
    scene.setExplorationEnabled(false);
    scene.overlay=new BattleView(scene.textures.getBase64('hero'),()=>{},encounter,{roster,company:company?[{name:'Raider',art:'raider',health:20,weapon:'knife',damage:4}]:[]});
  },{encounter,roster,company});
}
test('analyze explains permanent study, keeps the attack target, and supports follow the ally',async({page})=>{
  await start(page);await battle(page,'acolyte',['chameleon','bear','vulture']);
  await page.getByRole('combobox',{name:'Attack target'}).selectOption('1');
  await page.locator('[data-member="chameleon"] .spellcraft summary').click();
  const analyze=page.getByRole('button',{name:'Chameleon analyze',exact:true});
  await analyze.focus();
  await expect(page.locator('#action-preview')).toContainText('Record it permanently');
  await expect(page.locator('#action-preview')).not.toContainText('Salt lance');
  await analyze.click();
  await expect(page.locator('.grimoire-status')).toContainText('Salt lance');
  await expect(page.getByRole('combobox',{name:'Attack target'})).toHaveValue('1');
  await page.getByRole('combobox',{name:'Bear protection target'}).selectOption('vulture');
  const protect=page.getByRole('button',{name:'Bear support',exact:true});
  await protect.focus();await expect(page.locator('#action-preview')).toContainText('Protect Vulture');
  await expect(protect.locator('small')).toHaveText('Vulture');
  await protect.click();await expect(page.locator('[data-member="bear"] .member-status')).toHaveText('Guarding Vulture');
});
test('fallen allies can receive barriers while healing them stays disabled, including on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await start(page);await battle(page,'viper',['chameleon','bear','frog']);
  await page.evaluate(()=>{
    const scene=window.clarityRun.game!.scene.getScene('church') as unknown as {overlay:{state:Battle;render:()=>void}};
    const view=scene.overlay;
    view.state={...view.state,party:view.state.party.map(member=>member.id==='bear'?{...member,health:0}:member)};view.render();
  });
  await page.getByRole('combobox',{name:'Frog dose target'}).selectOption('bear');
  await expect(page.getByRole('button',{name:'Frog support',exact:true})).toBeDisabled();
  await page.locator('[data-member="frog"] .spellcraft summary').click();
  const barrier=page.getByRole('button',{name:'Frog barrier',exact:true});
  await expect(barrier).toBeEnabled();await expect(barrier.locator('small')).toContainText('Protect Bear');
  await barrier.click();await expect(page.locator('[data-member="bear"]')).toHaveAttribute('data-barrier','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const party=await page.locator('.party-roster').boundingBox();
  const enemy=await page.locator('.enemy-row').boundingBox();
  expect(party!.height).toBeGreaterThan(200);expect(party!.y).toBeGreaterThanOrEqual(enemy!.y+enemy!.height);
  await page.screenshot({path:'/tmp/tide-combat-clarity-mobile.png',fullPage:true});
});

test('the first-region travel and resurrection loop returns to a saved church run',async({page})=>{
  await start(page);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  async function place(key:string,x:number,y:number) {
    await page.evaluate(([key,x,y])=>{
      const scene=window.clarityRun.game!.scene.getScene(key) as AreaScene;
      (scene.player.body as Phaser.Physics.Arcade.Body).reset(x,y);
    },[key,x,y] as const);
    await page.locator('#game').focus();
  }
  async function ready(key:string) {
    await page.waitForFunction(key=>Boolean((window.clarityRun.game?.scene.getScene(key) as AreaScene|undefined)?.sys.isActive()),key);
  }
  await place('church',256,330);
  await expect(page.locator('#prompt')).toContainText('Step outside');await page.keyboard.press('e');await ready('farmland');
  await place('farmland',512,752);
  await expect(page.locator('#prompt')).toContainText('Walk on to Millbrook');await page.keyboard.press('e');await ready('town');
  await expect(page.locator('#location-place')).toContainText('Millbrook');
  await place('town',256,30);
  await expect(page.locator('#prompt')).toContainText('Return to the fields');await page.keyboard.press('e');await ready('farmland');
  await place('farmland',456,280);await page.keyboard.down('d');
  await expect(page.getByRole('heading',{name:'Crop locust'})).toBeVisible();await page.keyboard.up('d');
  // Exercise the real wipe callback without depending on a particular combat balance.
  await page.evaluate(()=>{
    const scene=window.clarityRun.game!.scene.getScene('farmland') as unknown as {overlay:{state:Battle;render:()=>void}};
    scene.overlay.state={...scene.overlay.state,phase:'defeat',party:scene.overlay.state.party.map(member=>({...member,health:0}))};scene.overlay.render();
  });
  await page.getByRole('button',{name:'Wake at the cot',exact:true}).click();
  await expect(page.getByRole('button',{name:/Skip scene/})).toBeVisible();await page.getByRole('button',{name:/Skip scene/}).click();
  await expect(page.getByRole('dialog',{name:'The tide takes something.'})).toBeVisible();
  await page.getByRole('button',{name:'Stand up',exact:true}).click();await ready('church');
  await expect(page.locator('#memory-status')).toContainText('7 of 10');
  await page.reload();
  await page.evaluate(async()=>{window.clarityRun=await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);});
  await page.locator('#title-play').click();await ready('church');
  await expect(page.locator('#memory-status')).toContainText('7 of 10');expect(errors).toEqual([]);
});

test('guards remain readable with reduced motion, and barriers show a distinct block result',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await start(page);await battle(page,'locust',['chameleon','bear','vulture'],false);
  for(const name of ['Bear','Chameleon','Vulture'])await page.getByRole('button',{name:`${name} support`,exact:true}).click();
  await expect(page.locator('.combat-feedback')).toContainText('GUARDED');
  await expect(page.locator('.combat-feedback')).toHaveAttribute('data-effect','guard');
  await expect(page.locator('.combat-word')).toHaveCount(0);
  await expect(page.locator('.battle')).toHaveAttribute('data-phase','player');
  await page.evaluate(()=>{
    const scene=window.clarityRun.game!.scene.getScene('church') as unknown as {overlay:BattleView};scene.overlay.destroy(false);
  });
  await battle(page,'acolyte',['chameleon','bear','vulture'],false);
  await page.evaluate(()=>{
    const scene=window.clarityRun.game!.scene.getScene('church') as unknown as {overlay:{state:Battle;render:()=>void}};
    scene.overlay.state={...scene.overlay.state,round:2,studied:['Salt lance']};scene.overlay.render();
  });
  await page.getByRole('combobox',{name:'Vulture barrier target'}).selectOption('bear');
  await page.locator('[data-member="vulture"] .spellcraft summary').click();
  await page.getByRole('button',{name:'Vulture barrier',exact:true}).click();
  await page.getByRole('button',{name:'Bear support',exact:true}).click();
  await page.getByRole('button',{name:'Chameleon support',exact:true}).click();
  await expect(page.locator('.combat-feedback')).toContainText('BLOCKED');
  await expect(page.locator('.combat-feedback')).toHaveAttribute('data-effect','ward');
});

test('spell dodges work with touch keys and explain a wrong key',async({page})=>{
  await page.setViewportSize({width:390,height:844});await start(page);await battle(page,'acolyte',['chameleon'],false);
  async function spellRound() {
    await page.evaluate(()=>{
      const scene=window.clarityRun.game!.scene.getScene('church') as unknown as {overlay:{state:Battle;render:()=>void}};
      scene.overlay.state={...scene.overlay.state,round:2,studied:['Salt lance']};scene.overlay.render();
    });
    await page.getByRole('button',{name:'Chameleon support',exact:true}).click();
    await expect(page.locator('.dodge-sequence')).toBeVisible();
    return (await page.locator('.dodge-sequence span').allTextContents()).map(Number);
  }
  const keys=await spellRound();
  for(const key of keys)await page.getByRole('button',{name:`Dodge key ${key}`,exact:true}).click();
  await expect(page.locator('.combat-feedback')).toContainText('DODGED');
  await expect(page.locator('.battle')).toHaveAttribute('data-phase','player');
  await expect(page.locator('.dodge-sequence')).toHaveCount(0);
  const again=await spellRound();
  await page.getByRole('button',{name:`Dodge key ${again[0]%4+1}`,exact:true}).click();
  await expect(page.locator('.dodge-call')).toContainText('Wrong key');
  await expect(page.locator('.combat-feedback')).toContainText('Wrong key');
  await page.screenshot({path:'/tmp/tide-dodge-feedback-mobile.png',fullPage:true});
});

test('failed spell input shows its cost after the temporary typing panel closes',async({page})=>{
  await start(page);await battle(page,'locust',['chameleon','bear','vulture'],false);
  await page.getByRole('button',{name:'Chameleon cast Thorn volley',exact:true}).click();
  const first=Number((await page.locator('.spell-bar').getAttribute('data-sequence'))![0]);
  await page.keyboard.press(String(first%4+1));
  await expect(page.locator('.combat-feedback')).toContainText('FIZZLED');
  await expect(page.locator('.combat-feedback')).toContainText('action and mana were spent');
  await expect(page.locator('.spell-bar')).toBeHidden();
  await expect(page.locator('.combat-feedback')).toBeVisible();
});

test('the frog’s poison has its own impact and damage-over-time cue',async({page})=>{
  await start(page);await battle(page,'locust',['chameleon','bear','frog'],false);
  await page.getByRole('button',{name:'Frog attack',exact:true}).click();
  await expect(page.locator('.enemy-fighter .combat-word[data-effect="poison"]')).toHaveText('POISONED');
  await expect(page.locator('#enemy-mana')).toContainText('poisoned');
  await page.getByRole('button',{name:'Bear support',exact:true}).click();
  await page.getByRole('button',{name:'Chameleon support',exact:true}).click();
  await expect(page.locator('.battle')).toHaveAttribute('data-phase','player');
  await expect(page.locator('.enemy-fighter .combat-word[data-effect="poison"]')).toHaveText('POISON');
});


test('battle keeps explanations collapsed while essential cues remain visible',async({page})=>{
  await start(page);await battle(page,'acolyte',['chameleon','bear','vulture']);
  const details=page.locator('.battle-details');
  await expect(details).not.toHaveAttribute('open','');
  await expect(page.locator('#action-preview')).not.toBeVisible();
  // The log of what happened stays in view; only the explanations fold away.
  await expect(page.locator('.battle-log')).toBeVisible();
  await expect(page.locator('.grimoire-status')).not.toBeVisible();
  await expect(page.locator('#enemy-intent')).toBeVisible();
  await expect(page.locator('[data-member="bear"] .member-mana')).toHaveText('Mana 12 / 12');
  await expect(page.locator('[data-member="bear"] .member-condition')).not.toBeInViewport();
  await page.getByRole('button',{name:'Bear support',exact:true}).focus();
  await expect(page.getByRole('button',{name:'Bear support',exact:true})).toHaveAttribute('title',/Protect Bear/);
  await page.screenshot({path:'/tmp/tide-battle-uncluttered.png'});
  await details.locator(':scope > summary').click();
  await expect(page.locator('#action-preview')).toBeVisible();
  await expect(page.locator('.battle-log')).toBeVisible();
  await expect(page.locator('.grimoire-status')).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await details.locator(':scope > summary').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'/tmp/tide-battle-uncluttered-mobile.png',fullPage:true});
});
