import { test, expect, type Page } from '@playwright/test';

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
async function enterLocust(page: Page) {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(335, 313);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.up('d');
}
const sequence = async (page: Page) => (await page.locator('.spell-bar').getAttribute('data-sequence'))!.split('');

test('typing the shown sequence casts the spell', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await enterLocust(page);
  await page.getByRole('button', { name: 'Vulture cast Gale quill' }).click();
  await expect(page.locator('.spell-bar')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chameleon attack', exact: true })).toBeDisabled();
  const keys = await sequence(page);
  expect(keys).toHaveLength(6);
  for (const key of keys) await page.keyboard.press(key);
  await expect(page.locator('.spell-name')).toHaveText('Gale quill!');
  await expect(page.getByRole('log')).toContainText('Vulture casts Gale quill. It tears into the locust.');
  await expect(page.locator('[data-member="vulture"] .member-mana')).toContainText('Mana 5 / 10');
  expect(errors).toEqual([]);
});

test('one wrong key, or running out of time, fizzles the spell and spends the turn', async ({ page }) => {
  await enterLocust(page);
  await page.getByRole('button', { name: 'Bear cast Stone ward' }).click();
  const [first] = await sequence(page);
  await page.keyboard.press(String(first === '1' ? 2 : 1));
  await expect(page.locator('.spell-name')).toHaveText('Stone ward fizzles.');
  await expect(page.getByRole('log')).toContainText("Bear's stone ward unravels half-spoken.");
  await expect(page.getByRole('button', { name: 'Bear attack', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Chameleon cast Thorn volley' }).click();
  await expect(page.locator('.spell-name')).toHaveText('Thorn volley fizzles.', { timeout: 5000 });
});

test('the on-screen keys cast on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterLocust(page);
  await page.getByRole('button', { name: 'Chameleon cast Thorn volley' }).click();
  for (const key of await sequence(page)) await page.locator(`.spell-pad [data-key="${key}"]`).dispatchEvent('pointerdown');
  await expect(page.getByRole('log')).toContainText('Chameleon casts Thorn volley.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the heron's primer can be given to any hero, who then casts its spell", async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').player.setPosition(296, 624);
  });
  await page.locator('#game').focus();
  await expect(page.locator('#prompt')).toContainText('Speak to the heron');
  await page.keyboard.press('e');
  await page.keyboard.press('Escape');
  await page.keyboard.press('i');
  await page.getByRole('combobox', { name: 'Bear grimoire' }).selectOption({ label: "Pond-keeper's primer" });
  await expect(page.locator('[data-member="bear"]')).toContainText('Still water · 4 mana · 5 keys');
  await page.getByRole('combobox', { name: 'Chameleon grimoire' }).selectOption({ label: 'Windward (from Vulture)' });
  await expect(page.getByRole('combobox', { name: 'Vulture grimoire' })).toHaveValue('');
  await expect(page.locator('[data-member="vulture"]')).toContainText('No spell.');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').player.setPosition(456, 280);
  });
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await expect(page.getByRole('button', { name: 'Bear cast Still water' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chameleon cast Gale quill' })).toBeVisible();
  await expect(page.locator('[data-member="vulture"] [data-cast]')).toHaveCount(0);
});
