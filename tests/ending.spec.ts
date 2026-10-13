import { test, expect, type Page } from '@playwright/test';
declare global { interface Window { finaleRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' });
async function ready(page: Page, key: string) { await page.waitForFunction(key => Boolean((window.finaleRun.game?.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active), key); }
async function start(page: Page, bad = false) {
  await page.addInitScript(bad => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'frog-free', 'octopus-free', 'cuttlefish-slain', ...(bad ? [] : ['human-beaten', 'lab-remembered', 'inquisitor-spoke'])], carried: [], found: [], coins: 30 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: bad ? ['home', 'name', 'feast'] : ['home', 'name'], pending: false }));
  }, bad);
  await page.goto('/'); await page.evaluate(async () => { window.finaleRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
  await page.evaluate(() => window.finaleRun.game!.scene.getScene('church').scene.start('lamp')); await ready(page, 'lamp');
  if (bad) { await page.locator('.cinema-skip').click(); await expect(page.locator('.cinematic')).toHaveCount(0); }
  await page.evaluate(() => { const s = window.finaleRun.game!.scene.getScene('lamp') as import('../src/scenes/AreaScene').AreaScene; s.player.setPosition(264, 144); const b = s.player.body as import('phaser').Physics.Arcade.Body; b.reset(264, 144); b.updateFromGameObject(); });
  await page.locator('#game').focus(); await expect(page.locator('#prompt')).toContainText('Speak to him'); await page.keyboard.press('e');
  await page.locator('#continue').click();
}

test('mercy leads through the full aftermath, restores the save, and returns to a pardoned capital', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await start(page); await page.getByRole('button', { name: /Spare him/ }).click(); await page.locator('#continue').click(); await page.locator('#continue').click();
  const ending = page.locator('.cinematic[data-story="ending-good"]'); await expect(ending).toBeVisible();
  await expect(ending.locator('.cinema-line')).toContainText('will not put you back in a cage');
  const captions: string[] = [];
  for (let i = 0; i < 16; i++) {
    const caption = await ending.locator('.cinema-caption').innerText(); captions.push(caption);
    if (caption.includes('A TOAST')) {
      await expect(ending).toHaveAttribute('data-art', 'home-table');
      await expect(ending.locator('.cinema-actors img')).toHaveCount(5);
      const bottoms = await ending.locator('.cinema-actors img').evaluateAll(images => images.map(image => image.getBoundingClientRect().bottom));
      expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(2);
    }
    if (caption === 'BY MORNING') { await expect(ending).toHaveAttribute('data-art', 'empty-cell'); }
    await ending.locator('.cinema-next').click();
  }
  await ready(page, 'harbour'); await expect(ending).toHaveCount(0);
  for (const name of ['THE BEAR', 'THE VULTURE', 'THE FROG', 'THE OCTOPUS', 'THE LAST ENTRY']) expect(captions).toContain(name);
  const saved = await page.evaluate(() => ({ world: JSON.parse(localStorage.getItem('tide-keeps.world.v1')!), memory: JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!) }));
  expect(saved.world.flags).toContain('human-spared'); expect(saved.world.flags).toContain('cages-opened'); expect(saved.memory.lost).toEqual([]);
  await page.keyboard.press('Escape'); await page.getByRole('button', { name: 'Revisit memories', exact: true }).click();
  await page.getByRole('button', { name: 'The door stays open', exact: true }).click(); await expect(ending).toBeVisible();
  await ending.locator('.cinema-skip').click(); await expect(ending).toHaveCount(0); await expect(page.locator('.memory-gallery')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the lost-memory ending stays distinct and does not grant the pardon', async ({ page }) => {
  await start(page, true); await page.getByRole('button', { name: /Take the seat beside him/ }).click(); await page.locator('#continue').click(); await page.locator('#continue').click();
  const ending = page.locator('.cinematic[data-story="ending-bad"]'); await expect(ending).toBeVisible();
  await expect(ending.locator('.cinema-line')).toContainText("can't remember why");
  for (let i = 0; i < 5; i++) await ending.locator('.cinema-next').click(); await expect(ending).toHaveCount(0);
  const flags = await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags);
  expect(flags).toContain('human-seated'); expect(flags).not.toContain('human-spared');
});
