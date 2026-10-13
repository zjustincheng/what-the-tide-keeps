import { test as plain, expect as plainExpect } from '@playwright/test';
import { test, expect, type Page } from './fixtures';

const playing = (page: Page) => page.evaluate(async () => (await import('/src/audio/music.ts')).music.playing);
const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game?.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);

plain('the soundtracks can be listened to from the title screen, and Play still starts the game after', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Soundtracks' }).click();
  const player = page.getByRole('dialog', { name: 'Soundtracks' });
  await plainExpect(player).toBeVisible();
  await player.getByRole('button', { name: /The fields/ }).click();
  await plainExpect.poll(() => playing(page)).toBe('fields');
  await plainExpect(player.locator('.soundtrack-status')).toHaveText('Playing · The fields');
  // Searching finds a boss's theme by its foe.
  await player.getByRole('searchbox', { name: 'Search soundtracks' }).fill('boar');
  await plainExpect(player.locator('[data-track]:visible')).toHaveCount(1);
  await plainExpect(player.locator('[data-track]:visible')).toContainText('The farm they burned');
  await page.keyboard.press('Escape');
  await plainExpect(player).toBeHidden();
  await plainExpect.poll(() => playing(page)).toBeUndefined();
  await plainExpect(page.getByRole('button', { name: 'Soundtracks' })).toBeFocused();
  await page.locator('#title-play').click();
  await plainExpect.poll(() => page.evaluate(async () => Boolean((await import('/src/main.ts')).game))).toBe(true);
});

test('Settings opens the soundtracks, and closing them brings back the place\'s own music', async ({ page }) => {
  await page.goto('/?practice');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => playing(page)).toBe('church');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Soundtracks' }).click();
  const player = page.getByRole('dialog', { name: 'Soundtracks' });
  await expect(player).toBeVisible();
  await player.getByRole('button', { name: /^Battle/ }).click();
  await expect.poll(() => playing(page)).toBe('battle');
  await player.getByRole('button', { name: 'Close soundtracks' }).click();
  await expect(player).toBeHidden();
  await expect.poll(() => playing(page)).toBe('church');
});
