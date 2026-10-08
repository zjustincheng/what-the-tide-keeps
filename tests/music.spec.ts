import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

const playing = (page: Page) => page.evaluate(async () => {
  const { music } = await import('/src/audio/music.ts');
  return music.playing;
});
const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);

test('each place has its theme, battles switch to battle music, and the music can be muted and turned down', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  // Browsers only allow sound after the player does something.
  expect(await playing(page)).toBeUndefined();
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => playing(page)).toBe('church');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => playing(page)).toBe('fields');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').player.setPosition(456, 280);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await expect.poll(() => playing(page)).toBe('battle');
  await win(page);
  await expect.poll(() => playing(page)).toBe('fields');
  // M mutes; settings hold the volume, and it is remembered.
  await page.locator('#game').focus();
  await page.keyboard.press('m');
  expect(await page.evaluate(async () => (await import('/src/audio/music.ts')).music.muted)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('checkbox', { name: 'Mute music' })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Mute music' }).uncheck();
  await page.getByRole('slider', { name: 'Music volume' }).fill('30');
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.settings.v1')))!)).toEqual({ music: 0.3, muted: false });
  expect(errors).toEqual([]);
});

test('every theme renders with sound and without clipping', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  const levels = await page.evaluate(async () => {
    const { music } = await import('/src/audio/music.ts');
    const { THEME_IDS } = await import('/src/audio/themes.ts');
    const out: Record<string, { peak: number; rms: number }> = {};
    for (const id of THEME_IDS) out[id] = await music.preview(id, 8);
    return out;
  });
  for (const [id, { peak, rms }] of Object.entries(levels)) {
    expect(peak, `${id} clips`).toBeLessThan(0.9);
    expect(rms, `${id} is near silent`).toBeGreaterThan(0.02);
  }
});
