import { test, expect, type Page } from '@playwright/test';

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
async function touch(page: Page, key: string, x: number, y: number) {
  await place(page, key, x, y);
  await expect(page.locator('#prompt')).toContainText('Touch the waystone');
  await page.keyboard.press('e');
}

test('waystones sleep until the hero knows the old roads, then wake, and carry him between them', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: [], carried: [], found: [], coins: 0 })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' }); });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await page.locator('#game').focus();
  await touch(page, 'farmland', 568, 440);
  await expect(page.locator('#dialogue-text')).toContainText("doesn't answer");
  await page.keyboard.press('Escape');
  // Knowing the old roads, the crossroads stone wakes; with the fort's awake too, it leads there.
  await page.evaluate(async () => {
    const { loadWorld, saveWorld } = await import('/src/storage/world.ts');
    saveWorld({ ...loadWorld(), flags: [...loadWorld().flags, 'old-roads', 'way-fort'] });
  });
  await touch(page, 'farmland', 568, 440);
  await expect(page.locator('#dialogue-text')).toContainText('It is awake.');
  await page.keyboard.press('Escape');
  await touch(page, 'farmland', 568, 440);
  await page.getByRole('button', { name: /Walk the old road to the fort town/ }).click();
  await expect.poll(() => at(page, 'fort'), { timeout: 5000 }).not.toBeNull();
});
