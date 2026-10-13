import { test, expect, type Page } from '@playwright/test';
declare global { interface Window { holdsRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });
async function ready(page: Page, key: string) { await page.waitForFunction(key => Boolean((window.holdsRun.game?.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active), key); }
async function start(page: Page, lost: string[] = ['home', 'name']) {
  await page.addInitScript(lost => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'frog-free'], carried: [], found: [], coins: 30 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost, pending: false }));
  }, lost);
  await page.goto('/'); await page.evaluate(async () => { window.holdsRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
  await page.evaluate(() => window.holdsRun.game!.scene.getScene('church').scene.start('hold', { spawn: 'from-climb' })); await ready(page, 'hold');
}
async function place(page: Page, x: number, y: number) {
  await page.evaluate(([x, y]) => { const s = window.holdsRun.game!.scene.getScene('hold') as import('../src/scenes/AreaScene').AreaScene; s.player.setPosition(x, y); const b = s.player.body as import('phaser').Physics.Arcade.Body; b.reset(x, y); b.updateFromGameObject(); }, [x, y]);
  await page.locator('#game').focus();
}
const change = (page: Page, e: unknown) => page.evaluate(e => (window.holdsRun.game!.scene.getScene('hold') as unknown as { effect: (e: unknown) => void }).effect(e), e);

test('the rookery reopens visibly and the shop remains usable', async ({ page }) => {
  await start(page); await expect(page.locator('.game-frame')).toHaveAttribute('data-holds-routes', 'closed');
  await change(page, { set: 'cuckoo-slain' }); await expect(page.locator('.game-frame')).toHaveAttribute('data-holds-routes', 'open');
  await place(page, 232, 350); await expect(page.locator('#prompt')).toContainText('magpie'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('first flight'); await page.locator('#continue').click();
  await expect(page.getByRole('button', { name: /Show me what you have/ })).toBeVisible();
});
test('the hero reflects on recovered memories without granting them at camp', async ({ page }) => {
  await start(page, ['home', 'name', 'training']); await expect(page.locator('#location-place')).toContainText('Terraces you cannot place');
  await expect(page.locator('.memory-echo')).toContainText('old guard');
  await place(page, 536, 484); await expect(page.locator('#prompt')).toContainText('porters'); await page.keyboard.press('e');
  await page.getByRole('button', { name: /Sit quietly by the fire/ }).click();
  await expect(page.locator('#dialogue-text')).toContainText('cannot find it'); await page.locator('#continue').click();
  await expect(page.locator('#dialogue-text')).toContainText('copies of things'); await page.keyboard.press('Escape');
  await change(page, { set: 'lab-remembered', recall: 'training' });
  // Finish the discovery just as closing the archive conversation would.
  await page.evaluate(() => (window.holdsRun.game!.scene.getScene('hold') as unknown as { closeDialogue: () => void }).closeDialogue());
  await page.locator('.cinema-skip').click();
  await expect(page.locator('.cinematic')).toHaveCount(0);
  await expect(page.locator('#location-place')).toContainText('The hold');
  await page.keyboard.press('e'); await page.getByRole('button', { name: /Sit quietly by the fire/ }).click();
  await page.locator('#continue').click(); await expect(page.locator('#dialogue-text')).toContainText('The order named you');
});
