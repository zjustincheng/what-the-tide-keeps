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

test('out of the church into the capital, down to the harbour, and into the hall of the Long Table', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: [], carried: [], found: [], coins: 30 })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.locator('#game').focus();
  await go(page, 'church', 56, 192, 'Go out into the city', 'square');
  await go(page, 'square', 328, 328, 'Examine the statue');
  await expect(page.locator('#dialogue-text')).toContainText('The five who killed the kraken');
  await talk(page);
  // The hall is chained until someone gives you the staff key.
  await go(page, 'square', 312, 168, 'Enter the hall of the Long Table');
  await expect(page.locator('#dialogue-text')).toContainText('CLOSED BY ORDER OF THE REGENCY');
  await talk(page);
  await go(page, 'square', 328, 488, 'Go down to the harbour', 'harbour');
  await go(page, 'harbour', 600, 172, 'Speak to the stoat');
  await talk(page, 'Buy him a drink');
  await go(page, 'harbour', 280, 268, 'Speak to the gull');
  await talk(page, 'Buy the crab');
  const world = JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);
  expect(world.coins).toBe(7);
  expect(world.found).toContain('tide-shell');
  await go(page, 'harbour', 344, 24, 'Climb the steps to the square', 'square');
  await go(page, 'square', 312, 168, 'Enter the hall of the Long Table', 'feast-hall');
  await go(page, 'feast-hall', 376, 268, 'Speak to the cleaner');
  await talk(page, 'Who was the cupbearer');
  await expect(page.locator('#dialogue')).toBeHidden();
});
