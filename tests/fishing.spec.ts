import { test, expect, type Page } from '@playwright/test';

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
// Wait for the bite, then press inside the page as the marker crosses the middle of the gold.
async function reelInZone(page: Page) {
  await expect(page.locator('.fishing')).toHaveAttribute('data-state', 'bite', { timeout: 5000 });
  await page.evaluate(() => new Promise<void>(resolve => {
    const bar = document.querySelector<HTMLElement>('.fishing-bar')!;
    const centre = Number(bar.dataset.zone) + Number(bar.dataset.width) / 2;
    const watch = () => {
      if (Math.abs(Number(bar.dataset.marker) - centre) < Number(bar.dataset.width) / 5) {
        document.querySelector('.fishing')!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        resolve();
      } else requestAnimationFrame(watch);
    };
    watch();
  }));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test('reeling as the marker crosses the gold lands a fish, which sells in Millbrook', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await visit(page, 'farmland');
  await place(page, 'farmland', 392, 512);
  await expect(page.locator('#prompt')).toContainText('Fish the pond');
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog', { name: 'The pond' })).toContainText('Wait for a bite');
  await reelInZone(page);
  await expect(page.locator('.fishing-status')).toContainText('You land a');
  await page.getByRole('button', { name: 'Done' }).click();
  const caught = await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).fish);
  const value = caught.minnow * 2 + caught.perch * 3 + caught.eel * 6;
  expect(value).toBeGreaterThan(0);
  await visit(page, 'town');
  await place(page, 'town', 328, 184);
  await expect(page.locator('#prompt')).toContainText('Speak to the fishmonger');
  await page.keyboard.press('e');
  while (await page.locator('#dialogue').isVisible()) {
    // Walk away from any replies on offer, as a player pressing Escape would.
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
  await page.getByRole('button', { name: 'Sell your catch' }).click();
  await expect(page.getByRole('dialog', { name: 'The fishmonger' })).toContainText(`You carry ${value} coins.`);
  expect(errors).toEqual([]);
});

test('reeling before the bite scares the fish off', async ({ page }) => {
  await visit(page, 'farmland');
  await place(page, 'farmland', 216, 224);
  await expect(page.locator('#prompt')).toContainText('Fish the mill stream');
  await page.keyboard.press('e');
  await page.keyboard.press('Space');
  await expect(page.locator('.fishing-status')).toHaveText('Too soon. Whatever was down there is gone.');
  await page.getByRole('button', { name: 'Cast again' }).click();
  await expect(page.locator('.fishing-status')).toContainText('Wait for a bite');
});
