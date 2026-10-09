import { test, expect, type Page } from '@playwright/test';

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
async function start(page: Page, world: object) {
  await page.goto('/?practice');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify(world)), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await page.locator('#game').focus();
}
// Stand somewhere, check what is on offer, and take it.
async function go(page: Page, from: string, x: number, y: number, prompt: string, to?: string) {
  await place(page, from, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  if (to) await expect.poll(() => at(page, to)).not.toBeNull();
}
async function choose(page: Page, text: string) {
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: new RegExp(text) }).click();
  // Read the answer through, then walk away from any further questions.
  while (await page.locator('#dialogue').isVisible()) {
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
}
async function walk(page: Page, key: string, direction: string, until: (spot: { x: number; y: number }) => boolean) {
  await page.keyboard.down(direction);
  await expect.poll(async () => until((await at(page, key))!), { timeout: 8000 }).toBe(true);
  await page.keyboard.up(direction);
}

test('the track runs east onto the downs, where feeding the hound mother sends the pack away', async ({ page }) => {
  await start(page, { flags: [], carried: [], found: [], coins: 0, fish: { minnow: 2, perch: 1, eel: 0 } });
  await go(page, 'farmland', 1000, 368, 'Climb onto the downs', 'downs');
  await go(page, 'downs', 368, 464, 'Squeeze past the slab into the barrow', 'barrow');
  await go(page, 'barrow', 264, 156, 'Speak to the hound');
  await choose(page, 'Give her three fish');
  await expect(page.locator('#purse')).toHaveText('6 coins');
  await go(page, 'barrow', 248, 264, 'Go back out into the light', 'downs');
  // With the pack gone, the collar under the tower stair can be searched.
  await go(page, 'downs', 552, 120, 'Search the rubble');
  await expect(page.locator('#dialogue-text')).toContainText('an iron collar');
});

test('the fen is up the stream; the sluice uncovers the causeway, and the otter opens her run', async ({ page }) => {
  await start(page, { flags: [], carried: [], found: [], coins: 0 });
  await go(page, 'farmland', 224, 30, 'Follow the stream up into the fen', 'fen');
  // The causeway is under water at first.
  await place(page, 'fen', 440, 124);
  await page.keyboard.down('a'); await page.waitForTimeout(800); await page.keyboard.up('a');
  expect((await at(page, 'fen'))!.x).toBeGreaterThan(400);
  await go(page, 'fen', 392, 560, 'Examine the sluice');
  await choose(page, 'Open the sluice');
  await place(page, 'fen', 440, 124);
  await walk(page, 'fen', 'a', spot => spot.x < 230);
  // The otter's reeds part once she trusts you.
  await go(page, 'fen', 712, 280, 'Speak to the otter');
  await choose(page, "I won't tell anyone");
  await place(page, 'fen', 792, 200);
  await walk(page, 'fen', 'w', spot => spot.y < 170);
  await expect(page.locator('#prompt')).toContainText('Fish');
});

test('the new enemies fight with their own art', async ({ page }) => {
  await start(page, { flags: ['bear-free'], carried: [], found: [], coins: 0 });
  await go(page, 'farmland', 1000, 368, 'Climb onto the downs', 'downs');
  const art = () => page.locator('.battle img').evaluateAll(images => images.map(image => (image as HTMLImageElement).naturalWidth > 0));
  // The pack leader, with his two hounds.
  await place(page, 'downs', 488, 120);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'Pack leader' })).toBeVisible();
  await page.keyboard.up('w');
  await expect(page.locator('.follower h4')).toHaveText(['Hound', 'Hound']);
  await expect.poll(art).not.toContain(false);
  await page.getByRole('button', { name: /^Run/ }).click();
  await page.getByRole('button', { name: 'Get away' }).click();
  // A lone hound in the gorse.
  await place(page, 'downs', 200, 248);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'Starved hound' })).toBeVisible();
  await page.keyboard.up('w');
  await expect.poll(art).not.toContain(false);
});

test('the way to the drowned can be walked without lining up to the pixel', async ({ page }) => {
  await start(page, { flags: ['sluice-open'], carried: [], found: [], coins: 0 });
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').scene.start('fen', { spawn: 'from-fields' });
  });
  await expect.poll(() => at(page, 'fen')).not.toBeNull();
  await page.locator('#game').focus();
  // A few pixels off the boardwalk's line, walking up still gets on it.
  await place(page, 'fen', 451, 236);
  await walk(page, 'fen', 'w', spot => spot.y < 180);
  // From where the boardwalk meets the causeway, walking west goes all the way along it, wherever the hero's feet are.
  await place(page, 'fen', 440, 142);
  await walk(page, 'fen', 'a', spot => spot.x < 230);
});
