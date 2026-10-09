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
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
async function enter(page: Page, from: string, x: number, y: number, prompt: string, to: string) {
  await place(page, from, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  await expect.poll(() => at(page, to)).not.toBeNull();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?practice');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test("the reeve's hall and the tannery can be entered, with people and records inside", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await visit(page, 'town');
  await enter(page, 'town', 88, 90, "Enter the reeve's hall", 'hall');
  await expect(page.locator('#location-place')).toHaveText("/ Millbrook · The reeve's hall");
  await place(page, 'hall', 168, 136);
  await expect(page.locator('#prompt')).toContainText('Read the records');
  await page.keyboard.press('e'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText("CLEAR THE BOAR'S HOLDING BY FIRE");
  await page.keyboard.press('Escape');
  await enter(page, 'hall', 264, 280, 'Go back outside', 'town');
  await expect.poll(() => at(page, 'town')).toEqual({ x: 72, y: 100 });
  await enter(page, 'town', 456, 282, 'Enter the tannery', 'tannery');
  await place(page, 'tannery', 280, 168);
  await expect(page.locator('#prompt')).toContainText('Speak to the tanner');
  expect(errors).toEqual([]);
});

test('the mill can be entered from the fields', async ({ page }) => {
  await visit(page, 'farmland');
  await enter(page, 'farmland', 88, 200, 'Enter the mill', 'mill-inside');
  await place(page, 'mill-inside', 312, 248);
  await expect(page.locator('#prompt')).toContainText('Read the ledger');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('PIKE TAKEN FROM THE POND');
  await page.keyboard.press('Escape');
  await enter(page, 'mill-inside', 264, 296, 'Go back outside', 'farmland');
});
