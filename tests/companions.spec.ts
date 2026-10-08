import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

// A fresh game, with no companions yet.
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
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
async function fight(page: Page, key: string, x: number, y: number, direction: string, enemy: string) {
  await place(page, key, x, y);
  await page.keyboard.down(direction);
  await expect(page.getByRole('heading', { name: enemy })).toBeVisible();
  await page.keyboard.up(direction);
}
async function talk(page: Page, key: string, x: number, y: number, prompt: string) {
  await place(page, key, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test('the chameleon sets out alone', async ({ page }) => {
  await visit(page, 'farmland');
  await fight(page, 'farmland', 456, 280, 'd', 'Crop locust');
  await expect(page.locator('.party-roster [data-member]')).toHaveCount(1);
  await expect(page.locator('[data-member="chameleon"]')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("clearing the reeve's fields earns the writ that frees the bear", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await visit(page, 'farmland');
  await talk(page, 'farmland', 104, 258, 'Speak to the bear');
  await expect(page.locator('#dialogue-text')).toContainText('You look thinner');
  await page.keyboard.press('Escape');
  await fight(page, 'farmland', 340, 184, 'a', 'Crop locust');
  await win(page);
  await fight(page, 'farmland', 700, 488, 'a', 'Grain weevil');
  await win(page);
  await visit(page, 'town');
  await talk(page, 'town', 88, 124, 'Speak to the reeve');
  await expect(page.locator('#dialogue-text')).toContainText('The wheat is standing');
  await page.keyboard.press('Escape');
  await visit(page, 'farmland');
  await talk(page, 'farmland', 56, 240, 'Speak to the miller');
  await page.keyboard.press('e'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('The bear joins you.');
  await page.keyboard.press('Escape');
  // He has left the mill, and fights beside the hero from now on, even after a reload.
  await place(page, 'farmland', 104, 258);
  await expect(page.locator('#prompt')).not.toContainText('Speak to the bear');
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await visit(page, 'farmland');
  await fight(page, 'farmland', 456, 280, 'd', 'Crop locust');
  await expect(page.locator('.party-roster [data-member]')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Bear support', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
