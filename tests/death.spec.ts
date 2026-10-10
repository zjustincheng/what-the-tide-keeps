import { test, expect, type Page } from '@playwright/test';
import { lose } from './helpers';

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    return Boolean(game.scene.getScene('church')?.player);
  })).toBe(true);
}
async function enterLocust(page: Page) {
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(335, 313);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
}
test.beforeEach(async ({ page }) => { await page.goto('/?practice'); await ready(page); });

test('a wipe takes a memory the tide chooses, grants its Hollow perk, and survives reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('#memory-status')).toContainText('8 of 10 memories remain');
  await enterLocust(page);
  await lose(page);
  const wake = page.getByRole('dialog', { name: 'The tide takes something.' });
  await expect(wake).toBeVisible();
  // The first death's roll takes the vulture: no choice, and nothing was written down.
  await expect(wake.getByRole('region', { name: 'What the tide took' })).toContainText('The vulture');
  await expect(wake).toContainText('Hollow · +2 mana');
  await expect(wake).toContainText('Nothing was written down');
  await expect(wake).toContainText('Already gone · His home · His name');
  await page.getByRole('button', { name: 'Stand up' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#memory-status')).toContainText('7 of 10 memories remain');
  await page.reload(); await ready(page);
  await expect(page.locator('#memory-status')).toContainText('7 of 10 memories remain');
  await enterLocust(page);
  await expect(page.locator('[data-member="chameleon"] .member-mana')).toHaveText('Mana 12 / 12 · showing 12');
  expect(errors).toEqual([]);
});

test('reloading before choosing does not escape the cost', async ({ page }) => {
  await enterLocust(page);
  await lose(page);
  await expect(page.getByRole('dialog', { name: 'The tide takes something.' })).toBeVisible();
  await page.reload(); await ready(page);
  await expect(page.getByRole('dialog', { name: 'The tide takes something.' })).toBeVisible();
  await expect(page.locator('#settings')).toHaveAttribute('inert', '');
  await expect(page.getByRole('region', { name: 'What the tide took' })).toContainText('The vulture');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#memory-status')).toContainText('7 of 10 memories remain');
});

test('the memory choice fits a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterLocust(page);
  await lose(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Stand up' })).toBeInViewport();
  await page.screenshot({ path: 'test-results/resurrection-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Stand up' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('a forgotten memory changes what the church says', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name', 'feast'], pending: false })));
  await page.reload(); await ready(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(248, 148);
  });
  await page.locator('#game').focus();
  await page.keyboard.press('e');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('You did not say it this time.');
});
