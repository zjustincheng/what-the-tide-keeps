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
const saved = async (page: Page) => JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);
async function start(page: Page, world: object, key: string, spawn: string) {
  await page.goto('/');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ carried: [], found: [], coins: 0, ...world })), world);
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
// Walk into a standing enemy until its fight opens.
async function touch(page: Page, key: string, x: number, y: number, heading: string) {
  await place(page, key, x, y + 20);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  await page.keyboard.up('w');
}
const LATE = ['bear-free', 'boar-defeated', 'vulture-free', 'hyena-slain', 'frog-free', 'viper-slain', 'channel-firm', 'apprentice-slain'];

test('the pens: past the warder, the church\'s caught are let out', async ({ page }) => {
  await start(page, { flags: LATE }, 'far-bank', 'from-wickmere');
  await go(page, 'far-bank', 620, 248, 'Follow the bank east, to the pens', 'pens');
  await go(page, 'pens', 184, 152, 'Read the ledger');
  await expect(page.locator('#dialogue-text')).toContainText('VENOMOUS. FIT FOR WORK. SHIPPED.');
  await talk(page);
  await touch(page, 'pens', 200, 168, 'The pen-warder');
  await expect(page.locator('.enemy-traits')).toHaveText('Armoured');
  await win(page);
  await go(page, 'pens', 328, 140, 'Examine the cages');
  await talk(page, 'Open every cage');
  const world = await saved(page);
  expect(world.flags).toContain('pens-freed');
  expect(world.found).toContain('adders-coil');
});

test('the smugglers\' creek: a seal who sells what the church won\'t, and talks about the lighthouse boats', async ({ page }) => {
  await start(page, { flags: LATE, coins: 20 }, 'causeway', 'from-weir');
  await go(page, 'causeway', 584, 555, 'Follow the smugglers\' walk down to the creek', 'creek');
  await go(page, 'creek', 200, 104, 'Speak to the seal');
  await talk(page, 'Show me what you have');
  await expect(page.getByRole('heading', { name: 'The seal\'s oilcloth' })).toBeVisible();
});

test('the cellars: the real lord and the wren\'s son, and what each is owed', async ({ page }) => {
  await start(page, { flags: [...LATE, 'duellist-beaten', 'stair-open', 'cuckoo-slain'] }, 'hall-of-house', 'spawn');
  await go(page, 'hall-of-house', 20, 216, 'Go down to the cellars', 'cellars');
  await go(page, 'cellars', 88, 136, 'Speak to the falcon');
  await talk(page, 'Open the door');
  await go(page, 'cellars', 232, 136, 'Speak to the wren');
  await talk(page, 'Go home');
  let world = await saved(page);
  expect(world.flags).toEqual(expect.arrayContaining(['lord-freed', 'son-freed']));
  expect(world.found).toContain('house-signet');
  await start(page, { flags: world.flags, found: world.found }, 'hold', 'from-climb');
  await go(page, 'hold', 488, 376, 'Speak to the wren');
  await talk(page);
  world = await saved(page);
  expect(world.found).toContain('wren-feather');
});

test('the old eyrie: the lost flight, and the hermit\'s bell', async ({ page }) => {
  await start(page, { flags: [...LATE, 'duellist-beaten'] }, 'climb', 'from-hold');
  await go(page, 'climb', 560, 120, 'Climb up to the old eyrie', 'summit');
  await touch(page, 'summit', 216, 104, 'The lost flight');
  await expect(page.locator('.enemy-traits')).toHaveText('Dead · Flying');
  await expect(page.locator('.follower h4')).toHaveText(['Courier', 'Courier']);
  await win(page);
  await go(page, 'summit', 344, 136, 'Speak to the eagle');
  await talk(page);
  expect((await saved(page)).found).toContain('courier-bell');
});
