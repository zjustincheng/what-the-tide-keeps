import { test, expect, type Page } from '@playwright/test';

declare global { interface Window { townRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });

async function start(page: Page, lost: string[] = ['home', 'name']) {
  await page.addInitScript(lost => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free'], carried: [], found: [], coins: 20 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost, pending: false }));
  }, lost);
  await page.goto('/');
  await page.evaluate(async () => { window.townRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click();
  await ready(page, 'church');
  await page.evaluate(() => window.townRun.game!.scene.getScene('church').scene.start('town'));
  await ready(page, 'town');
}
async function ready(page: Page, key: string) {
  await page.waitForFunction(key => {
    const scene = window.townRun.game?.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene | undefined;
    return scene?.sys.isActive() && scene.player?.active;
  }, key);
}
async function place(page: Page, key: string, x: number, y: number) {
  await page.evaluate(([key, x, y]) => {
    const scene = window.townRun.game!.scene.getScene(key) as import('../src/scenes/AreaScene').AreaScene;
    scene.player.setPosition(x, y);
    const body = scene.player.body as import('phaser').Physics.Arcade.Body;
    body.reset(x, y); body.updateFromGameObject();
  }, [key, x, y] as const);
  await page.locator('#game').focus();
}

test('the market scenery and conversations change after reopening the grain road', async ({ page }) => {
  await start(page);
  await expect(page.locator('.game-frame')).toHaveAttribute('data-millbrook-grain', 'stalled');
  await place(page, 'town', 152, 232);
  await expect(page.locator('#prompt')).toContainText('bread stall');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('boards are shut');
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const scene = window.townRun.game!.scene.getScene('town') as unknown as { effect: (effect: unknown) => void };
    scene.effect({ set: 'boar-defeated' });
  });
  await expect(page.locator('.game-frame')).toHaveAttribute('data-millbrook-grain', 'moving');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Warm loaves');
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const scene = window.townRun.game!.scene.getScene('town') as unknown as { effect: (effect: unknown) => void };
    scene.effect({ set: 'ration-ledger' });
  });
  await expect(page.locator('.game-frame')).toHaveAttribute('data-millbrook-fish', 'scarce');
  await expect(page.locator('.game-frame')).toHaveAttribute('data-millbrook-grain', 'moving');
});

test('a forgotten friendship changes the town name and the optional camp conversation', async ({ page }) => {
  await start(page, ['home', 'name', 'bear']);
  await expect(page.locator('#location-place')).toContainText('An unfamiliar market town');
  await expect(page.locator('.memory-echo')).toContainText('cannot remember');
  await page.evaluate(() => window.townRun.game!.scene.getScene('town').scene.start('farmland', { spawn: 'camp-fields' }));
  await ready(page, 'farmland');
  await expect(page.locator('.memory-echo')).toHaveCount(0);
  await expect(page.locator('#prompt')).toContainText('Rest by the fire');
  await page.locator('#game').focus(); await page.keyboard.press('e');
  await page.getByRole('button', { name: /Sit with the bear\./ }).click();
  await expect(page.locator('#speaker')).toHaveText('THE BEAR');
  await expect(page.locator('#dialogue-text')).toContainText('other side of the fire');
});
