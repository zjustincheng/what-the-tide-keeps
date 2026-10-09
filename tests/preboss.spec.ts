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
async function start(page: Page, flags: string[], key: string, spawn: string) {
  await page.goto('/');
  await page.evaluate(flags => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags, carried: [], found: [], coins: 0 })), flags);
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

test('the sister keeps the lane shut until the hero knows the truth, and the boar talks before he fights', async ({ page }) => {
  await start(page, ['bear-free', 'hedge-open', 'kid-found', 'burn-order-seen'], 'border-road', 'spawn');
  // The barricade holds the hero back from the lane.
  await place(page, 'border-road', 256, 330);
  await page.keyboard.down('s'); await page.waitForTimeout(600); await page.keyboard.up('s');
  expect((await at(page, 'border-road'))!.y).toBeLessThan(352);
  await go(page, 'border-road', 212, 320, 'Speak to the sow');
  await talk(page, "I know he didn't do it");
  await go(page, 'border-road', 256, 368, 'Follow the smoke', 'boar-farm');
  await go(page, 'boar-farm', 256, 210, 'Speak to the boar');
  await expect(page.locator('#dialogue-text')).toContainText('sitting in the ashes');
  await talk(page, 'Then we fight');
  await expect(page.getByRole('heading', { name: 'The boar' })).toBeVisible({ timeout: 5000 });
});

test('the monk holds the ossuary key until his yard is buried, and the hyena talks first', async ({ page }) => {
  await start(page, ['bear-free', 'boar-defeated', 'vulture-free', 'bridge-lowered', 'pair-slain'], 'abbey', 'from-battlefield');
  await go(page, 'abbey', 536, 112, 'Go down into the ossuary');
  await expect(page.locator('#dialogue-text')).toContainText('iron grate');
  await talk(page);
  for (const [x, y] of [[392, 284], [456, 172], [504, 364]]) {
    await go(page, 'abbey', x, y, 'Examine the body');
    await talk(page, 'Bury him in the yard');
  }
  await go(page, 'abbey', 552, 216, 'Speak to the monk');
  await talk(page, "They're buried. The key");
  await go(page, 'abbey', 536, 112, 'Go down into the ossuary', 'ossuary');
  await go(page, 'ossuary', 248, 160, 'Speak to the hyena');
  await talk(page, 'The church sent me');
  await expect(page.getByRole('heading', { name: 'The hyena' })).toBeVisible({ timeout: 5000 });
});
