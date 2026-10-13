import { test, expect, type Page } from '@playwright/test';
declare global { interface Window { oceanRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });
async function ready(page: Page, key: string) { await page.waitForFunction(key => Boolean((window.oceanRun.game?.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active), key); }
async function start(page: Page, lost: string[] = ['home', 'name']) {
  await page.addInitScript(lost => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'frog-free', 'octopus-free'], carried: [], found: [], coins: 30 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost, pending: false }));
  }, lost);
  await page.goto('/'); await page.evaluate(async () => { window.oceanRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
  await travel(page, 'church', 'outlaw-port', 'from-creek');
}
async function travel(page: Page, from: string, to: string, spawn?: string) { await page.evaluate(([from, to, spawn]) => window.oceanRun.game!.scene.getScene(from).scene.start(to, { spawn }), [from, to, spawn] as const); await ready(page, to); }
async function place(page: Page, key: string, x: number, y: number) {
  await page.evaluate(([key, x, y]) => { const s = window.oceanRun.game!.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene; s.player.setPosition(x, y); const b = s.player.body as import('phaser').Physics.Arcade.Body; b.reset(x, y); b.updateFromGameObject(); }, [key, x, y] as const);
  await page.locator('#game').focus();
}
const change = (page: Page, key: string, e: unknown) => page.evaluate(([key, e]) => (window.oceanRun.game!.scene.getScene(key) as unknown as { effect: (e: unknown) => void }).effect(e), [key, e] as const);

test('rescue deeds change the port and the truce leaves the fish trade closed', async ({ page }) => {
  await start(page); await expect(page.locator('.game-frame')).toHaveAttribute('data-sea-reception', 'wary');
  await change(page, 'outlaw-port', { set: 'crab-freed' }); await expect(page.locator('.game-frame')).toHaveAttribute('data-sea-reception', 'recognized');
  await place(page, 'outlaw-port', 344, 364); await expect(page.locator('#prompt')).toContainText('returned crab'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Twenty coins'); await page.keyboard.press('Escape');
  await change(page, 'outlaw-port', { set: 'newt-freed' }); await change(page, 'outlaw-port', { set: 'nets-cut' });
  await expect(page.locator('.game-frame')).toHaveAttribute('data-sea-reception', 'welcomed');
  await change(page, 'outlaw-port', { set: 'cuttlefish-slain' }); await place(page, 'outlaw-port', 480, 350);
  await expect(page.locator('#prompt')).toContainText('mooring board'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('NO LIVE CARGO'); await page.keyboard.press('Escape');
});
test('cutting the nets empties the pen and persists after leaving', async ({ page }) => {
  await start(page); await travel(page, 'outlaw-port', 'sea-pens', 'from-sea');
  await place(page, 'sea-pens', 152, 184); await expect(page.locator('#prompt')).toContainText('nets');
  await page.keyboard.press('e'); await page.getByRole('button', { name: /Cut the nets/ }).click();
  await page.keyboard.press('Escape'); await expect(page.locator('.game-frame')).toHaveAttribute('data-sea-pens', 'empty');
  await place(page, 'sea-pens', 328, 192); await expect(page.locator('#prompt')).toContainText('pen'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Nothing looks back'); await page.keyboard.press('Escape');
  await travel(page, 'sea-pens', 'outlaw-port', 'from-sea'); await travel(page, 'outlaw-port', 'sea-pens', 'from-sea');
  await expect(page.locator('.game-frame')).toHaveAttribute('data-sea-pens', 'empty');
});
test('an unfamiliar octopus keeps watch and remembered grief changes the camp conversation', async ({ page }) => {
  await start(page, ['home', 'name', 'octopus']); await expect(page.locator('#location-place')).toContainText('A port of borrowed decks');
  await expect(page.locator('.memory-echo')).toContainText('voice that once said your name');
  await place(page, 'outlaw-port', 72, 386); await expect(page.locator('#prompt')).toContainText('hammock'); await page.keyboard.press('e');
  await page.getByRole('button', { name: /Sit with the octopus/ }).click(); await expect(page.locator('#dialogue-text')).toContainText('hammock rope'); await page.keyboard.press('Escape');
  await change(page, 'outlaw-port', { recall: 'octopus', set: 'grave-seen' }); await expect(page.locator('#location-place')).toContainText('Wrecktown');
  await page.evaluate(() => (window.oceanRun.game!.scene.getScene('outlaw-port') as unknown as { closeDialogue: () => void }).closeDialogue());
  await page.locator('.cinema-skip').click(); await expect(page.locator('.cinematic')).toHaveCount(0);
  await page.keyboard.press('e'); await page.getByRole('button', { name: /Sit with the octopus/ }).click();
  await expect(page.locator('#dialogue-text')).toContainText('knot of net');
});
