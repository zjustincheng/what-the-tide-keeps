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

test.describe('climbing', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScenes(true)[0].scene.start('watchtower', { spawn: 'spawn' }); });
    await expect.poll(() => at(page, 'watchtower')).not.toBeNull();
    await page.locator('#game').focus();
  });

  test('the ivy can be climbed, slowly, and grip comes back on a ledge', async ({ page }) => {
    await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('watchtower').player.setPosition(240, 540); });
    await page.keyboard.down('w'); await page.waitForTimeout(1000); await page.keyboard.up('w');
    const climbed = 540 - (await at(page, 'watchtower'))!.y;
    // Climbing goes at about half walking speed (70 a second).
    expect(climbed).toBeGreaterThan(20);
    expect(climbed).toBeLessThan(50);
    expect(await page.evaluate(async () => { const { game } = await import('/src/main.ts'); return game.scene.getScene('watchtower').grip; })).toBeLessThan(1);
  });

  test('when grip runs out on the wall, the hero falls back to the ledge, hurt', async ({ page }) => {
    await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('watchtower').player.setPosition(240, 560); });
    await page.waitForTimeout(200);
    await page.evaluate(async () => { const { game } = await import('/src/main.ts'); const s = game.scene.getScene('watchtower'); s.player.setPosition(240, 500); s.grip = 0.02; });
    await page.keyboard.down('w'); await page.waitForTimeout(300); await page.keyboard.up('w');
    await expect(page.locator('#sneaking')).toContainText(/grip goes|You fall/);
    await expect.poll(async () => (await at(page, 'watchtower'))!.y).toBeGreaterThan(540);
  });
});

test('the downs\' watchtower can only be climbed once the pack has gone', async ({ page }) => {
  await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScenes(true)[0].scene.start('downs', { spawn: 'from-tower' }); });
  await expect.poll(() => at(page, 'downs')).not.toBeNull();
  await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('downs').player.setPosition(440, 92); });
  await page.locator('#game').focus();
  await expect(page.locator('#prompt')).toContainText('Climb the ivy inside the tower');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Nobody climbs with the pack at their back');
});
