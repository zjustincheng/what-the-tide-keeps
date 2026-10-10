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
  const overlay = (page: Page, run: string) => page.evaluate(async run => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScene('watchtower').overlay;
    return new Function('view', run)(view);
  }, run);
  test.beforeEach(async ({ page }) => {
    await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScenes(true)[0].scene.start('watchtower', { spawn: 'spawn' }); });
    await expect.poll(() => at(page, 'watchtower')).not.toBeNull();
    await page.locator('#game').focus();
    // The foot of the first climb.
    await page.evaluate(async () => {
      const { game } = await import('/src/main.ts');
      const scene = game.scene.getScene('watchtower');
      const foot = scene.points.find((p: { name: string }) => p.name === 'climb-1');
      scene.player.setPosition(foot.x, foot.y + 4);
    });
    await expect(page.locator('#prompt')).toContainText('Climb the ivy');
    await page.keyboard.press('e');
    await expect(page.getByRole('heading', { name: 'The ivy, low down' })).toBeVisible();
    // Nothing falls while the test climbs, unless a test drops it.
    await overlay(page, 'view.timers.forEach(clearTimeout); view.timers = [];');
  });

  test('hold to hold with the arrows, to the top, and onto the ledge above', async ({ page }) => {
    // Work out a way up the wall, then climb it with the keys.
    const ways: string[] = await page.evaluate(async () => {
      const { game } = await import('/src/main.ts');
      const { move } = await import('/src/rules/climb.ts');
      const view = game.scene.getScene('watchtower').overlay;
      const start = view.state;
      const seen = new Map([[`${start.at.col},${start.at.row}`, [] as string[]]]);
      const queue = [start];
      while (queue.length) {
        const climb = queue.shift();
        const path = seen.get(`${climb.at.col},${climb.at.row}`)!;
        if (climb.done === 'top') return path;
        for (const way of ['up', 'left', 'right', 'down']) {
          const next = move(climb, way);
          const key = `${next.at.col},${next.at.row}`;
          if (!seen.has(key)) { seen.set(key, [...path, way]); queue.push(next); }
        }
      }
      return [];
    });
    expect(ways.length).toBeGreaterThan(0);
    const keys: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    for (const way of ways) await page.keyboard.press(keys[way]);
    await expect(page.getByRole('heading', { name: 'The ivy, low down' })).toHaveCount(0);
    const top = await page.evaluate(async () => { const { game } = await import('/src/main.ts'); return game.scene.getScene('watchtower').points.find((p: { name: string }) => p.name === 'top-1'); });
    expect(await at(page, 'watchtower')).toEqual({ x: top.x, y: top.y });
    await expect(page.locator('#prompt')).toContainText('Climb back down');
  });

  test('three stones knock you off the wall, and the landing hurts; letting go costs nothing', async ({ page }) => {
    await overlay(page, 'view.hit(view.state.at.col); view.hit(view.state.at.col); view.hit(view.state.at.col);');
    await expect(page.locator('#climb-note')).toContainText('come off the wall');
    await expect(page.getByRole('heading', { name: 'The ivy, low down' })).toHaveCount(0);
    expect((await saved(page)).wounds.chameleon).toBe(3);
    // Again, and this time let go.
    await page.keyboard.press('e');
    await expect(page.getByRole('heading', { name: 'The ivy, low down' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'The ivy, low down' })).toHaveCount(0);
    expect((await saved(page)).wounds.chameleon).toBe(3);
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
