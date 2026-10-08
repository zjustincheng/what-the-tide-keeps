import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await page.locator('#game').focus();
});

test('the Covenant token lies behind a warden who cannot be harmed while its votives burn', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await place(page, 'farmland', 920, 600);
  await expect(page.locator('#prompt')).not.toContainText('Search behind the shrine');
  await place(page, 'farmland', 852, 568);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Shrine warden' })).toBeVisible();
  await page.keyboard.up('d');
  await expect(page.getByRole('heading', { name: 'Votive' })).toHaveCount(2);
  await expect(page.locator('#enemy-mana')).toContainText('warded by its votives');
  await page.getByRole('combobox', { name: 'Attack target' }).selectOption({ label: 'Shrine warden' });
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('breaks on the candlelight');
  await win(page);
  await place(page, 'farmland', 864, 568);
  await expect(page.locator('#prompt')).toContainText('Search behind the shrine');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Where the warden stood');
  expect(errors).toEqual([]);
});

test('the yoke peg lies where the mire leech guards the ford', async ({ page }) => {
  await place(page, 'farmland', 216, 700);
  await expect(page.locator('#prompt')).not.toContainText('Search the reeds');
  await place(page, 'farmland', 184, 620);
  await page.keyboard.down('s');
  await expect(page.getByRole('heading', { name: 'Mire leech' })).toBeVisible();
  await page.keyboard.up('s');
  await expect(page.locator('#enemy-intent')).toContainText('Whatever it takes, it keeps.');
  await win(page);
  await place(page, 'farmland', 216, 700);
  await expect(page.locator('#prompt')).toContainText('Search the reeds');
});
