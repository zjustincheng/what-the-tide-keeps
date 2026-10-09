import { test, expect, type Page } from '@playwright/test';

// What the ground sounds like where the hero stands.
const surface = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  scene.player.setPosition(x, y);
  return scene.surface();
}, [key, x, y] as const);

test('footsteps sound different on each surface', async ({ page }) => {
  await page.goto('/?practice');
  await expect.poll(() => page.evaluate(async () => Boolean((await import('/src/main.ts')).game.scene.getScene('church')?.player))).toBe(true);
  expect(await surface(page, 'church', 248, 200)).toBe('stone');
  await page.evaluate(async () => (await import('/src/main.ts')).game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' }));
  await expect.poll(() => page.evaluate(async () => Boolean((await import('/src/main.ts')).game.scene.getScene('farmland')?.player?.active))).toBe(true);
  expect(await surface(page, 'farmland', 512, 300)).toBe('dirt');
  expect(await surface(page, 'farmland', 184, 356)).toBe('wood');
  expect(await surface(page, 'farmland', 600, 100)).toBe('grass');
  expect(await surface(page, 'farmland', 184, 632)).toBe('water');
  expect(await surface(page, 'farmland', 72, 520)).toBe('leaves');
});
