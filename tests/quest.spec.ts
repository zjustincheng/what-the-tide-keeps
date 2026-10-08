import { test, expect, type Page } from '@playwright/test';
import { lose } from './helpers';

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
async function go(page: Page, from: string, x: number, y: number, prompt: string, to: string) {
  await place(page, from, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  await expect.poll(() => at(page, to)).not.toBeNull();
}
async function talk(page: Page, key: string, x: number, y: number, prompt: string) {
  await place(page, key, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.locator('#game').focus();
});

test('the brambles block the border road until the lamb teaches their word', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await go(page, 'church', 256, 330, 'Step outside', 'farm-road');
  // Skirt the locust along the top of the clearing.
  await talk(page, 'farm-road', 88, 147, 'Pick up the bell');
  await expect(page.locator('#dialogue-text')).toContainText('small brass bell');
  await page.keyboard.press('Escape');
  await expect(page.locator('#prompt')).not.toContainText('bell');
  await go(page, 'farm-road', 256, 360, 'Walk on to Millbrook', 'town');
  await go(page, 'town', 256, 360, 'Take the border road', 'border-road');
  await talk(page, 'border-road', 256, 116, 'Examine the brambles');
  await expect(page.locator('#dialogue-text')).toContainText('grown straight across the road');
  await page.keyboard.press('Escape');
  await page.keyboard.down('s'); await page.waitForTimeout(600); await page.keyboard.up('s');
  expect((await at(page, 'border-road'))!.y).toBeLessThan(140);
  await go(page, 'border-road', 256, 30, 'Return to Millbrook', 'town');
  await talk(page, 'town', 232, 236, 'Speak to the lamb');
  await expect(page.locator('#dialogue-text')).toContainText('My bell!');
  for (let i = 0; i < 2; i++) await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toHaveText("Bramble's leave is written into the grimoire.");
  await page.keyboard.press('e');
  await go(page, 'town', 256, 360, 'Take the border road', 'border-road');
  await talk(page, 'border-road', 256, 116, 'Examine the brambles');
  await expect(page.locator('#dialogue-text')).toContainText("the lamb's word");
  await page.keyboard.press('Escape');
  await page.keyboard.down('s'); await page.waitForTimeout(1200); await page.keyboard.up('s');
  expect((await at(page, 'border-road'))!.y).toBeGreaterThan(190);
  await talk(page, 'border-road', 152, 240, 'Speak to the carter');
  await expect(page.locator('#dialogue-text')).toContainText('turn back, by order');
  // The opened hedge and the learned spell are saved.
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  expect(await page.evaluate(() => ['tide-keeps.world.v1', 'tide-keeps.grimoire.v1'].map(key => JSON.parse(localStorage.getItem(key)!)))).toEqual([
    { flags: ['lamb-thanked', 'hedge-open'], carried: [] }, ["Bramble's leave"],
  ]);
  expect(errors).toEqual([]);
});

test('a wipe drops the bell back in the clearing', async ({ page }) => {
  await go(page, 'church', 256, 330, 'Step outside', 'farm-road');
  await talk(page, 'farm-road', 88, 147, 'Pick up the bell');
  await page.keyboard.press('Escape');
  await place(page, 'farm-road', 200, 232);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await lose(page);
  await page.getByRole('radio', { name: /The kraken/ }).check();
  await page.getByRole('button', { name: 'Let it go' }).click();
  await go(page, 'church', 256, 330, 'Step outside', 'farm-road');
  await place(page, 'farm-road', 88, 147);
  await expect(page.locator('#prompt')).toContainText('Pick up the bell');
});
