import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    tideRun: typeof import('../src/main');
    tideHunt: typeof import('../src/storage/pursuit');
  }
}
test.use({ storageState: { cookies: [], origins: [] } });

async function start(page: Page, remaining = 44000) {
  await page.addInitScript(remaining => {
    if (!localStorage.getItem('tide-keeps.world.v1')) localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['hyena-slain', 'bear-free', 'vulture-free'], carried: [], found: [] }));
    if (!localStorage.getItem('tide-keeps.pursuit.v1')) localStorage.setItem('tide-keeps.pursuit.v1', JSON.stringify({ phase: 'chasing', remaining }));
  }, remaining);
  await page.goto('/');
  await page.evaluate(async () => {
    window.tideRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    // Vite may version modules after an edit. Use the exact module loaded by
    // the game, rather than creating a second session cache with another URL.
    const loaded = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === '/src/storage/pursuit.ts');
    window.tideHunt = await import(loaded!.name);
  });
  await expect(page.locator('#title-soundtracks')).toHaveCount(0);
  await page.locator('#title-play').click();
  await ready(page, 'church');
}

async function ready(page: Page, key: string) {
  await page.waitForFunction(key => {
    const scene = window.tideRun.game?.scene.getScene(key);
    return scene?.sys.isActive() && (scene as { player?: { active: boolean } })?.player?.active;
  }, key);
}
const state = (page: Page) => page.evaluate(() => window.tideHunt.loadPursuit());

test('the hunt follows a real exit, pauses in Settings, expires, and stops at sea', async ({ page }) => {
  await start(page);
  await page.evaluate(() => window.tideRun.game!.scene.getScene('church').scene.start('farmland', { spawn: 'from-town' }));
  await ready(page, 'farmland');
  await page.evaluate(() => {
    const scene = window.tideRun.game!.scene.getScene('farmland') as import('../src/scenes/AreaScene').AreaScene;
    scene.player.setPosition(512, 742);
    const body = scene.player.body as import('phaser').Physics.Arcade.Body;
    body.reset(512, 742); body.updateFromGameObject();
  });
  await expect(page.locator('#prompt')).toContainText('Walk on to Millbrook');
  const before = (await state(page)).remaining;
  await page.locator('#game').focus(); await page.keyboard.press('e');
  await ready(page, 'town');
  expect((await state(page)).remaining).toBeLessThanOrEqual(before);
  expect((await state(page)).remaining).toBeGreaterThan(before - 4000);
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(1600); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => {
    const scene = window.tideRun.game!.scene.getScene('town') as unknown as { hunter?: { sprite: { y: number } } };
    return scene.hunter && scene.hunter.sprite.y > 50;
  });
  await expect(page.locator('.hunt-hud')).toContainText('He follows through doors');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.locator('[data-action="soundtracks"]')).toHaveCount(0);
  const paused = await state(page);
  await page.waitForTimeout(500);
  expect(await state(page)).toEqual(paused);
  // Test timeout with clear separation; capture has its own test below.
  await page.evaluate(() => {
    const scene = window.tideRun.game!.scene.getScene('town') as unknown as { hunter?: { fledAt?: number }; time: { now: number } };
    if(scene.hunter) scene.hunter.fledAt = scene.time.now;
    window.tideHunt.keepPursuit({ phase: 'chasing', remaining: 100 });
  });
  await page.locator('[data-action="close"]').click();
  await expect.poll(async () => (await state(page)).phase).toBe('idle');
  await expect(page.locator('.hunt-hud')).toBeHidden();
  await page.evaluate(() => {
    window.tideHunt.keepPursuit({ phase: 'chasing', remaining: 35000 });
    window.tideRun.game!.scene.getScene('town').scene.start('outlaw-port', { spawn: 'from-creek' });
  });
  await ready(page, 'outlaw-port');
  expect((await state(page)).phase).toBe('idle');
  // A due encounter check stays untouched at sea rather than rolling at all.
  await page.evaluate(() => window.tideHunt.keepPursuit({ phase: 'idle', remaining: 0 }));
  await page.waitForTimeout(500);
  expect(await state(page)).toEqual({ phase: 'idle', remaining: 0 });
  await expect(page.locator('.hunt-hud')).toBeHidden();
});

test('being caught starts the Inquisitor fight and preserves the hunt clock', async ({ page }) => {
  await start(page);
  await page.evaluate(() => window.tideRun.game!.scene.getScene('church').scene.start('town', { spawn: 'spawn' }));
  await ready(page, 'town');
  await page.locator('#game').focus();
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(1600); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => Boolean((window.tideRun.game!.scene.getScene('town') as unknown as { hunter?: unknown }).hunter));
  await page.evaluate(() => {
    const scene = window.tideRun.game!.scene.getScene('town') as unknown as { player: { x: number; y: number }; hunter: { sprite: import('phaser').Physics.Arcade.Sprite } };
    scene.hunter.sprite.setPosition(scene.player.x, scene.player.y-1);
    const body = scene.hunter.sprite.body as import('phaser').Physics.Arcade.Body;
    body.reset(scene.player.x, scene.player.y-1); body.updateFromGameObject();
  });
  await expect(page.locator('.enemy-fighter img').first()).toHaveAttribute('src', /inquisitor\.svg$/);
  const caught = await state(page);
  await page.waitForTimeout(500);
  expect(await state(page)).toEqual(caught);
});

test('reloading preserves a pursuit and starting over clears its saved state', async ({ page }) => {
  await start(page);
  await page.evaluate(() => {
    window.tideHunt.keepPursuit({ phase: 'chasing', remaining: 32000 });
    window.tideHunt.savePursuit();
  });
  await page.reload();
  await page.evaluate(async () => {
    window.tideRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    const loaded = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === '/src/storage/pursuit.ts');
    window.tideHunt = await import(loaded!.name);
  });
  const resumed = await state(page);
  expect(resumed.phase).toBe('chasing');
  expect(resumed.remaining).toBeLessThanOrEqual(32000);
  expect(resumed.remaining).toBeGreaterThan(31000);
  await page.locator('#title-play').click();
  await ready(page, 'church');
  expect((await state(page)).remaining).toBeLessThanOrEqual(32000);
  expect((await state(page)).phase).toBe('chasing');
  const erased = await page.evaluate(async () => {
    const { eraseProgress } = await import('/src/storage/progress.ts');
    return eraseProgress() && localStorage.getItem('tide-keeps.pursuit.v1') === null;
  });
  expect(erased).toBe(true);
});
