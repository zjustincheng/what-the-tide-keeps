import { test, expect } from '@playwright/test';

test('full screen enlarges the map and can be left again', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Full screen' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName)).toBe('MAIN');
  await expect(page.getByRole('button', { name: 'Exit full screen' })).toBeVisible();
  await expect(page.locator('header')).toBeHidden();
  // The whole map now fits on screen and fills most of its height.
  await expect.poll(async () => {
    const box = (await page.locator('canvas').boundingBox())!;
    const height = await page.evaluate(() => innerHeight);
    return box.y >= 0 && box.y + box.height <= height && box.height > height * 0.7;
  }).toBe(true);
  await page.screenshot({ path: 'test-results/fullscreen.png' });
  await page.getByRole('button', { name: 'Exit full screen' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible();
});

test('F toggles full screen, and Escape opens settings with the controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.locator('#game').focus();
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName)).toBe('MAIN');
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  await page.locator('#game').focus();
  await page.keyboard.press('Escape');
  const settings = page.getByRole('dialog', { name: 'Settings' });
  await expect(settings).toContainText('Equipment');
  await expect(settings.getByRole('row', { name: /Dodge/ })).toContainText('Space or Enter as the ring closes');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.below')).toHaveCount(0);
  await expect(page.locator('.location #purse')).toHaveText('0 coins');
});
