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
  await page.getByRole('slider', { name: 'Sound effects volume' }).fill('50');
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.settings.v1')))!)).toMatchObject({ music: 0.3, effects: 0.5, muted: false });
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

const sounded = (page: Page) => page.evaluate(async () => (await import('/src/audio/music.ts')).music.played);

test('talking, attacking, and casting make their sounds', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(248, 148);
  });
  await page.locator('#game').focus();
  await expect(page.locator('#prompt')).toContainText('Speak to the priest');
  await page.keyboard.press('e');
  await expect.poll(() => sounded(page)).toContain('blip');
  await page.keyboard.press('Escape');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(335, 313);
  });
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.up('d');
  await page.getByRole('button', { name: 'Bear attack', exact: true }).click();
  await expect.poll(() => sounded(page)).toContain('maul');
  await page.getByRole('button', { name: 'Vulture cast Gale quill' }).click();
  for (const key of (await page.locator('.spell-bar').getAttribute('data-sequence'))!.split('')) await page.keyboard.press(key);
  await expect.poll(() => sounded(page)).toContain('spell');
  expect(await sounded(page)).toContain('key');
});

test('the party display collapses to portraits and stays that way', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await expect(page.locator('#hud .hud-name').first()).toBeVisible();
  await page.getByRole('button', { name: 'Hide party details' }).click();
  await expect(page.locator('#hud')).toHaveAttribute('data-mode', 'compact');
  await expect(page.locator('#hud .hud-name').first()).toBeHidden();
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await expect(page.locator('#hud')).toHaveAttribute('data-mode', 'compact');
  await page.locator('#game').focus();
  await page.keyboard.press('h');
  await expect(page.locator('#hud')).toHaveAttribute('data-mode', 'full');
});

test('every sound effect is audible without clipping', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  const peaks = await page.evaluate(async () => {
    const { playEffect } = await import('/src/audio/effects.ts');
    const names = ['blip', 'step', 'select', 'open', 'door', 'find', 'coins', 'rest', 'cast-line', 'plop', 'splash', 'catch', 'lash', 'maul', 'talons', 'hit', 'block', 'barrier', 'dodge', 'graze', 'key', 'spell', 'fizzle', 'heal', 'gather', 'victory', 'defeat'] as const;
    const out: Record<string, number> = {};
    for (const name of names) {
      const context = new OfflineAudioContext(1, 44100 * 2.5, 44100);
      const noise = context.createBuffer(1, 44100, 44100);
      noise.getChannelData(0).forEach((_, i, data) => { data[i] = Math.random() * 2 - 1; });
      // At the default effects volume.
      const bus = context.createGain(); bus.gain.value = 0.7 * 1.2; bus.connect(context.destination);
      playEffect(context, bus, noise, name);
      const rendered = await context.startRendering();
      out[name] = rendered.getChannelData(0).reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0);
    }
    return out;
  });
  for (const [name, peak] of Object.entries(peaks)) {
    expect(peak, `${name} clips`).toBeLessThan(0.9);
    expect(peak, `${name} is inaudible`).toBeGreaterThan(0.01);
  }
});

test('the music comes back after its engine is shut down, and the top bar shows when it is muted', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => playing(page)).toBe('church');
  // As happens when the game reloads under the player: the old engine is closed.
  await page.evaluate(async () => (await import('/src/audio/music.ts')).music.stop());
  expect(await playing(page)).toBeUndefined();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => playing(page)).toBe('church');
  await expect.poll(() => page.evaluate(async () => ((await import('/src/audio/music.ts')).music as unknown as { context: AudioContext }).context.state)).toBe('running');
  // The button in the top bar mutes, and shows it.
  await page.getByRole('button', { name: 'Mute music' }).click();
  await expect(page.getByRole('button', { name: 'Unmute music' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#game').focus();
  await page.keyboard.press('m');
  await expect(page.getByRole('button', { name: 'Mute music' })).toHaveAttribute('aria-pressed', 'false');
});
