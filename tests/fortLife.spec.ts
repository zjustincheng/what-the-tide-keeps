import { test, expect, type Page } from '@playwright/test';
declare global { interface Window { fortRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });

async function start(page: Page, lost: string[] = ['home', 'name']) {
  await page.addInitScript(lost => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['boar-defeated', 'bear-free', 'vulture-free'], carried: [], found: [], coins: 20 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost, pending: false }));
  }, lost);
  await page.goto('/');
  await page.evaluate(async () => { window.fortRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click();
  await page.waitForFunction(() => Boolean((window.fortRun.game?.scene.getScene('church') as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active));
  await page.evaluate(() => window.fortRun.game!.scene.getScene('church').scene.start('fort', { spawn: 'from-pass' }));
  await page.waitForFunction(() => Boolean((window.fortRun.game?.scene.getScene('fort') as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active));
}
async function place(page: Page, x: number, y: number) {
  await page.evaluate(([x, y]) => {
    const scene = window.fortRun.game!.scene.getScene('fort') as import('../src/scenes/AreaScene').AreaScene;
    scene.player.setPosition(x, y);
    const body = scene.player.body as import('phaser').Physics.Arcade.Body;
    body.reset(x, y); body.updateFromGameObject();
  }, [x, y]);
  await page.locator('#game').focus();
}

test('the fort quiets after the Hyena while ration cuts and later sea shortages remain', async ({ page }) => {
  await start(page);
  await expect(page.locator('.game-frame')).toHaveAttribute('data-fort-graves', 'disturbed');
  await expect(page.locator('.game-frame')).toHaveAttribute('data-fort-fish', 'cut');
  await place(page, 568, 184);
  await expect(page.locator('#prompt')).toContainText('ration table');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Half-empty barrels');
  await page.keyboard.press('Escape');
  await page.evaluate(() => (window.fortRun.game!.scene.getScene('fort') as unknown as { effect: (e: unknown) => void }).effect({ set: 'hyena-slain' }));
  await expect(page.locator('.game-frame')).toHaveAttribute('data-fort-graves', 'quiet');
  await expect(page.locator('.game-frame')).toHaveAttribute('data-fort-fish', 'cut');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('no more than before');
  await page.keyboard.press('Escape');
  await place(page, 312, 270);
  await expect(page.locator('#prompt')).toContainText('names on the wall');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Small candles burn');
  await page.keyboard.press('Escape');
  await page.evaluate(() => (window.fortRun.game!.scene.getScene('fort') as unknown as { effect: (e: unknown) => void }).effect({ set: 'cuttlefish-slain' }));
  await expect(page.locator('.game-frame')).toHaveAttribute('data-fort-fish', 'stopped');
});

test('forgetting the Vulture changes recognition and her camp conversation', async ({ page }) => {
  await start(page, ['home', 'name', 'vulture']);
  await expect(page.locator('#location-place')).toContainText('A garrison without a name');
  await expect(page.locator('.memory-echo')).toContainText('whose handwriting');
  await place(page, 456, 296);
  await expect(page.locator('#prompt')).toContainText('garrison fire');
  await page.keyboard.press('e');
  await page.getByRole('button', { name: /Sit with the vulture\./ }).click();
  await expect(page.locator('#speaker')).toHaveText('THE VULTURE');
  await expect(page.locator('#dialogue-text')).toContainText('watching her hands');
});
