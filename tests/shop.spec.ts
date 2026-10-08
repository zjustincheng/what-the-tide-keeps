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
async function start(page: Page, world: object) {
  await page.goto('/');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify(world)), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
}
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
async function talkThrough(page: Page, key: string, x: number, y: number, prompt: string) {
  await place(page, key, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  while (await page.locator('#dialogue').isVisible()) await page.getByRole('button', { name: 'Continue' }).click();
}

test('the stallholder overcharges, supplies help in a fight, and a win pays', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await start(page, { flags: ['bear-free', 'vulture-free'], carried: [], found: [], coins: 30 });
  await expect(page.locator('#purse')).toHaveText('30 coins');
  await visit(page, 'town');
  await talkThrough(page, 'town', 168, 184, 'Speak to the stallholder');
  const shop = page.getByRole('dialog', { name: 'The stallholder' });
  await expect(shop).toContainText('You carry 30 coins.');
  await page.getByRole('button', { name: 'Buy Firepot' }).click();
  await expect(shop).toContainText('You carry 18 coins.');
  await expect(shop).toContainText('In your pack: 1');
  await page.getByRole('button', { name: 'Leave' }).click();
  await expect(page.locator('#purse')).toHaveText('18 coins');
  await visit(page, 'farmland');
  await place(page, 'farmland', 456, 280);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await page.locator('[data-member="vulture"] .supplies-menu summary').click();
  await page.getByRole('button', { name: 'Vulture use Firepot' }).click();
  await expect(page.getByRole('log')).toContainText('Vulture throws a firepot.');
  await win(page);
  await expect(page.locator('#purse')).toHaveText('22 coins');
  expect(errors).toEqual([]);
});

test.describe('from a fresh game', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("the bear's fine can be paid instead of earned", async ({ page }) => {
    await start(page, { flags: [], carried: [], found: [], coins: 64 });
    await visit(page, 'town');
    await talkThrough(page, 'town', 88, 124, 'Speak to the reeve');
    await page.getByRole('button', { name: "Buy The bear's writ" }).click();
    await expect(page.getByRole('dialog', { name: 'The reeve' })).toContainText('You carry 4 coins.');
    await page.getByRole('button', { name: 'Leave' }).click();
    await visit(page, 'farmland');
    await place(page, 'farmland', 56, 240);
    await expect(page.locator('#prompt')).toContainText('Speak to the miller');
    await page.keyboard.press('e');
    await expect(page.locator('#dialogue-text')).toContainText('A writ.');
  });
});
