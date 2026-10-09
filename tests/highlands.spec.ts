import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

// A fresh game except for what each test seeds.
test.use({ storageState: { cookies: [], origins: [] } });

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
async function start(page: Page, world: object, key: string, spawn: string) {
  await page.goto('/');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify(world)), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async ([key, spawn]) => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start(key, { spawn });
  }, [key, spawn]);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
async function go(page: Page, from: string, x: number, y: number, prompt: string, to?: string) {
  await place(page, from, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  if (to) await expect.poll(() => at(page, to)).not.toBeNull();
}
// Read through, choosing a reply if one is named, then walk away from any further questions.
async function talk(page: Page, reply?: string) {
  if (reply) {
    while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: new RegExp(reply) }).click();
  }
  while (await page.locator('#dialogue').isVisible()) {
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
}
const rig = (page: Page, change: string) => page.evaluate(async change => {
  const { game } = await import('/src/main.ts');
  const view = game.scene.getScenes(true)[0].overlay;
  view.state = new Function('state', `return ${change}`)(view.state);
  view.render();
}, change);

const BEAR = { flags: ['bear-free', 'boar-defeated'], carried: [], found: [], coins: 0 };

test('the pass opens once the boar is dead, and its raiders ambush from nowhere', async ({ page }) => {
  await start(page, { ...BEAR, flags: ['bear-free'] }, 'border-road', 'spawn');
  await go(page, 'border-road', 488, 256, 'Take the track up to the pass');
  await expect(page.locator('#dialogue-text')).toContainText('Nobody goes up to the pass');
  await start(page, BEAR, 'border-road', 'spawn');
  await go(page, 'border-road', 488, 256, 'Take the track up to the pass', 'pass');
  // The raider's signature is gone by the time the hero is close; then it strikes first.
  await place(page, 'pass', 328, 960);
  await expect.poll(() => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    return game.scene.getScene('pass').foes[0].sprite.alpha;
  })).toBe(0);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'Highland raider' })).toBeVisible();
  await page.keyboard.up('w');
  await expect(page.locator('.battle-log')).toContainText('Ambush!');
});

test('the courier\'s letter is lost on a wipe, and pays at the fort when delivered', async ({ page }) => {
  await start(page, BEAR, 'pass', 'from-border');
  await go(page, 'pass', 136, 696, 'Search the body');
  await talk(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('pass').scene.start('fort', { spawn: 'from-pass' });
  });
  await expect.poll(() => at(page, 'fort')).not.toBeNull();
  await go(page, 'fort', 568, 174, 'Speak to the quartermaster');
  await expect(page.locator('#dialogue-text')).toContainText('church seal');
  await talk(page);
  await expect(page.locator('#purse')).toHaveText('15 coins');
});

test('the vulture duel, her note, and writing a memory down', async ({ page }) => {
  await start(page, BEAR, 'fort', 'from-pass');
  await go(page, 'fort', 744, 288, 'Go down to the battlefield', 'battlefield');
  // Without her note, she attacks as a grave thief; the duel only has to be survived.
  await place(page, 'battlefield', 520, 236);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'The vulture' })).toBeVisible();
  await page.keyboard.up('w');
  await rig(page, "({ ...state, round: 3, party: state.party.map(member => ({ ...member, health: 99, maxHealth: 99 })) })");
  await page.getByRole('button', { name: 'Chameleon support' }).click();
  await page.getByRole('button', { name: 'Bear support' }).click();
  await expect(page.locator('#battle-turn')).toHaveText('You lived through it.', { timeout: 15000 });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await go(page, 'battlefield', 520, 210, 'Speak to the vulture');
  await talk(page);
  // Her note is under her old bunk in the barracks.
  await go(page, 'battlefield', 28, 320, 'Climb back up to the fort', 'fort');
  await go(page, 'fort', 152, 168, 'Enter the barracks', 'barracks');
  await go(page, 'barracks', 352, 232, 'Search the far bunk');
  await expect(page.locator('#dialogue-text')).toContainText('built for wings');
  await talk(page);
  await go(page, 'barracks', 248, 264, 'Go back outside', 'fort');
  await go(page, 'fort', 744, 288, 'Go down to the battlefield', 'battlefield');
  // Her own note wins her over.
  await go(page, 'battlefield', 520, 210, 'Speak to the vulture');
  await talk(page, 'Give her the note');
  await expect(page.locator('#hud .hud-member')).toHaveCount(3);
  // The ravine: she lowers the bridge.
  await go(page, 'battlefield', 680, 312, 'Examine the bridge');
  await talk(page, 'Ask the vulture');
  await place(page, 'battlefield', 690, 312);
  await page.keyboard.down('d'); await page.waitForTimeout(1200); await page.keyboard.up('d');
  expect((await at(page, 'battlefield'))!.x).toBeGreaterThan(760);
  // At a fire, a memory can now be written down, and the next death cannot take it.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('battlefield').scene.start('fort', { spawn: 'from-battlefield' });
  });
  await expect.poll(() => at(page, 'fort')).not.toBeNull();
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ ...JSON.parse(localStorage.getItem('tide-keeps.world.v1')!), coins: 10 })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('fort', { spawn: 'from-pass' });
  });
  await expect.poll(() => at(page, 'fort')).not.toBeNull();
  await go(page, 'fort', 456, 296, 'Rest by the garrison fire');
  await talk(page, 'Sleep until dawn');
  await expect(page.getByRole('heading', { name: 'Write something down.' })).toBeVisible();
  await page.getByRole('radio', { name: /The feast/ }).check();
  await page.getByRole('button', { name: 'Write it down' }).click();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.memory.v1')))!).anchors).toEqual(['feast']);
});

test('coming to the vulture with her note in hand, there is no fight', async ({ page }) => {
  await start(page, { ...BEAR, carried: ['note'] }, 'battlefield', 'from-fort');
  await place(page, 'battlefield', 520, 236);
  await page.keyboard.down('w'); await page.waitForTimeout(500); await page.keyboard.up('w');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await go(page, 'battlefield', 520, 210, 'Speak to the vulture');
  await expect(page.locator('#dialogue-text')).toContainText('talons out, then stops');
  await talk(page, 'Give her the note');
  await expect(page.locator('#hud .hud-member')).toHaveCount(3);
});

test('the deserters, the hyena, her ledger, and the inquisitor on the road', async ({ page }) => {
  await start(page, { ...BEAR, flags: ['bear-free', 'boar-defeated', 'vulture-free', 'bridge-lowered', 'ossuary-key', 'hyena-challenged', 'lantern'] }, 'abbey', 'from-battlefield');
  await place(page, 'abbey', 260, 240);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Deserter hexer' })).toBeVisible();
  await page.keyboard.up('d');
  await expect(page.locator('.follower h4')).toHaveText(['Brute']);
  await win(page);
  await go(page, 'abbey', 536, 112, 'Go down into the ossuary', 'ossuary');
  await place(page, 'ossuary', 248, 180);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'The hyena' })).toBeVisible();
  await page.keyboard.up('w');
  await win(page);
  await go(page, 'ossuary', 248, 160, 'Speak to the hyena');
  await expect(page.locator('#dialogue-text')).toContainText('still breathing');
  await talk(page);
  await go(page, 'ossuary', 328, 112, 'Read the ledger');
  await talk(page);
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!).flags).toEqual(expect.arrayContaining(['hyena-slain', 'ration-ledger', 'pair-slain']));
  // On the way back, something far larger is on the pass.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('ossuary').scene.start('pass', { spawn: 'from-fort' });
  });
  await expect.poll(() => at(page, 'pass')).not.toBeNull();
  await place(page, 'pass', 360, 120);
  await page.keyboard.down('s');
  await expect(page.getByRole('heading', { name: 'The inquisitor' })).toBeVisible();
  await page.keyboard.up('s');
  await page.getByRole('button', { name: /^Run/ }).click();
  await page.getByRole('button', { name: 'Get away' }).click();
});

test('the old border fort: the captain holds the lantern, and the smith tempers what you carry', async ({ page }) => {
  await start(page, { ...BEAR, flags: ['bear-free', 'boar-defeated', 'vulture-free'], found: ['crow-feather'], coins: 40 }, 'fort', 'from-pass');
  // The smith offers only what you own.
  await go(page, 'fort', 680, 348, 'Speak to the smith');
  await talk(page);
  await expect(page.getByRole('heading', { name: 'The smith' })).toBeVisible();
  await page.getByRole('button', { name: /Buy Temper the Crow's feather/ }).click();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!).tempered).toEqual(['crow-feather']);
  await page.getByRole('button', { name: 'Leave' }).click();
  // Up to the border fort, through the captain, to the lantern.
  await go(page, 'fort', 384, 24, 'Climb to the old border fort', 'border-keep');
  await place(page, 'border-keep', 424, 200);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'Deserter captain' })).toBeVisible();
  await page.keyboard.up('w');
  await expect(page.locator('.follower h4')).toHaveText(['Lieutenant']);
  await win(page);
  await go(page, 'border-keep', 472, 152, 'Take the lantern');
  await talk(page);
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!).flags).toEqual(expect.arrayContaining(['captain-slain', 'lantern']));
});

test('the rookery road: the raven\'s letter goes under the holds\' gate, and her sister\'s order comes back down', async ({ page }) => {
  await start(page, { ...BEAR, flags: ['bear-free', 'boar-defeated', 'vulture-free', 'captain-slain'] }, 'fort', 'from-pass');
  await go(page, 'fort', 344, 216, 'Speak to the raven');
  await talk(page, 'I\'ll carry a letter to the holds');
  await go(page, 'fort', 384, 24, 'Climb to the old border fort', 'border-keep');
  await go(page, 'border-keep', 64, 20, 'Climb the rookery road', 'rookery-road');
  // The courier in the falls: her satchel.
  await go(page, 'rookery-road', 472, 232, 'Look into the ice');
  await talk(page, 'Break the ice and take the satchel');
  await go(page, 'rookery-road', 408, 72, 'Examine the gate');
  await talk(page, 'Slide the raven\'s letter under the gate');
  let world = JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);
  expect(world.flags).toContain('letter-left');
  expect(world.carried).toEqual(['sealed-order']);
  // Back to the raven with the order.
  await start(page, { ...BEAR, flags: world.flags, carried: world.carried }, 'fort', 'from-pass');
  await go(page, 'fort', 344, 216, 'Speak to the raven');
  await talk(page, 'I found this on a courier in the ice');
  world = JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);
  expect(world.found).toContain('raven-quill');
  expect(world.carried).toEqual([]);
});
