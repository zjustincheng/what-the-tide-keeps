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
// Jump straight to an area; walking there is covered by the road and quest checks.
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
async function meetBoar(page: Page) {
  await visit(page, 'boar-farm');
  await place(page, 'boar-farm', 256, 196);
  await page.keyboard.down('s');
  await expect(page.getByRole('heading', { name: 'The boar' })).toBeVisible();
  await page.keyboard.up('s');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test('striking a follower lands on the boar and makes him furious', async ({ page }) => {
  await meetBoar(page);
  await expect(page.getByRole('heading', { name: 'Badger' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Attack target' }).selectOption({ label: 'Badger' });
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('throws himself in front of the badger');
  await expect(page.locator('#enemy-mana')).toContainText('Fury 3');
  await expect(page.getByRole('meter', { name: 'Badger health' })).toHaveAttribute('aria-valuenow', '100');
});

test('fighting the boar directly frees the grain and changes the farmland', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await meetBoar(page);
  for (let round = 1; round <= 8; round++) {
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · 3 actions remaining`);
    await page.getByRole('button', { name: 'Bear support', exact: true }).click();
    await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
    if (round < 8 || await page.locator('.battle').getAttribute('data-phase') === 'player') await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  }
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'victory');
  await page.getByRole('button', { name: 'Return to the church' }).click();
  await place(page, 'boar-farm', 256, 212);
  await expect(page.locator('#prompt')).toContainText('Examine the cup');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('gilded cup');
  await page.keyboard.press('Escape');
  await place(page, 'boar-farm', 216, 216);
  await expect(page.locator('#prompt')).toContainText('Speak to the badger');
  await page.keyboard.press('e'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('no fur on him at all');
  await page.keyboard.press('Escape');
  // The boar stays beaten after a reload, and Millbrook has heard.
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await visit(page, 'boar-farm');
  await place(page, 'boar-farm', 256, 196);
  await page.keyboard.down('s'); await page.waitForTimeout(400); await page.keyboard.up('s');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await visit(page, 'town');
  await place(page, 'town', 88, 124);
  await expect(page.locator('#prompt')).toContainText('Speak to the reeve');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('The carts went through at dawn.');
  expect(errors).toEqual([]);
});
