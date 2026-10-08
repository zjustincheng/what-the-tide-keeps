import { test, expect, type Page } from '@playwright/test';

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
async function fields(page: Page) {
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await page.locator('#game').focus();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test('a keepsake found off the road can be equipped and changes the fight', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('#game').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('dialog', { name: 'Equipment' })).toContainText('Nothing found yet');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await fields(page);
  await place(page, 'farmland', 56, 598);
  await expect(page.locator('#prompt')).toContainText('Search the bundle');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('cracked straight across');
  await page.keyboard.press('Escape');
  await expect(page.locator('#prompt')).not.toContainText('Search the bundle');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Equipment' }).click();
  const screen = page.getByRole('dialog', { name: 'Equipment' });
  await expect(page.getByRole('combobox', { name: 'Bear keepsake 1' })).toBeDisabled();
  await page.getByRole('combobox', { name: 'Chameleon keepsake 1' }).selectOption({ label: 'Cracked mirror' });
  await expect(screen).toContainText('His reveal hits 3 harder. Hiding costs 2 mana instead of 1.');
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // Kept through a reload, and felt in battle.
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await fields(page);
  await place(page, 'farmland', 456, 280);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await expect(page.locator('[data-member="chameleon"] [data-action="suppress"]')).toHaveText('Suppress · 2 mana');
  expect(errors).toEqual([]);
});

test('the equipment screen fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free'], carried: [], found: ['covenant-token', 'yoke-peg'] })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Equipment' }).click();
  await page.getByRole('combobox', { name: 'Bear keepsake 1' }).selectOption({ label: 'Yoke peg' });
  await page.getByRole('combobox', { name: 'Bear keepsake 2' }).selectOption({ label: 'Covenant token' });
  await expect(page.locator('[data-member="bear"] .equipment-stats')).toHaveText('Health 44 · Mana 12 · Damage 3');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/equipment-mobile.png', fullPage: true });
});
