import { test, expect, type Page } from '@playwright/test';

// Leaping: Shift clears a narrow gap; loose ground gives way under someone who stands on it; a fall puts you back, hurt.
test.use({ storageState: { cookies: [], origins: [] } });

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, x: number, y: number) => page.evaluate(async ([x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene('gorge').player.setPosition(x, y);
}, [x, y] as const);
const saved = async (page: Page) => JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('church').scene.start('gorge', { spawn: 'from-pass' }); });
  await expect.poll(() => at(page, 'gorge')).not.toBeNull();
  await page.locator('#game').focus();
});

test('walking stops at the crack; a leap clears it', async ({ page }) => {
  await place(page, 136, 196);
  await page.keyboard.down('d'); await page.waitForTimeout(400); await page.keyboard.up('d');
  expect((await at(page, 'gorge'))!.x).toBeLessThan(144);
  await page.keyboard.press('Shift');
  await expect.poll(async () => (await at(page, 'gorge'))!.x).toBe(168);
  await expect(page.locator('#sneaking')).toContainText('Shift (or Leap) to jump a gap');
});

test('loose ground gives way under someone standing still, and the fall hurts', async ({ page }) => {
  await place(page, 340, 140);
  await page.keyboard.down('d'); await page.waitForTimeout(500); await page.keyboard.up('d');
  // Standing on the loose ledge.
  await expect(page.locator('#sneaking')).toContainText('You fall', { timeout: 4000 });
  expect((await saved(page)).wounds.chameleon).toBe(3);
  await expect.poll(async () => (await at(page, 'gorge'))!.x).toBeLessThanOrEqual(352);
});

test('facing a sheer drop with nothing to land on, a leap goes nowhere', async ({ page }) => {
  // From the third island's south edge, south is a drop with nothing to land on: no leap at all.
  await place(page, 300, 188);
  await page.keyboard.down('s'); await page.waitForTimeout(300); await page.keyboard.up('s');
  const before = await at(page, 'gorge');
  await page.keyboard.press('Shift');
  await page.waitForTimeout(700);
  expect(await at(page, 'gorge')).toEqual(before);
});
