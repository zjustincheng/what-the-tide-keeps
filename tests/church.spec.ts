import { test, expect } from '@playwright/test';

async function position(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const path = '/src/main.ts';
    const { game } = await import(/* @vite-ignore */ path);
    const player = game.scene.getScene('church')?.player;
    return { x: player?.x ?? -1, y: player?.y ?? -1 };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(async () => (await position(page)).x).toBe(88);
});

test('loads without errors, walks, and stops at the church wall', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('#game').focus();
  await page.keyboard.down('ArrowLeft');
  await expect.poll(async () => (await position(page)).x).toBeLessThan(65);
  await page.waitForTimeout(900);
  await page.keyboard.up('ArrowLeft');
  const stopped = await position(page);
  expect(stopped.x).toBeGreaterThanOrEqual(36);
  expect(stopped.x).toBeLessThan(39);
  await page.waitForTimeout(150);
  expect((await position(page)).x).toBeCloseTo(stopped.x, 1);
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Return to the cot' }).click();
  await expect.poll(async () => (await position(page)).x).toBe(88);
});

test('priest dialogue pauses movement and can be completed', async ({ page }) => {
  await page.evaluate(async () => {
    const path = '/src/main.ts';
    const { game } = await import(/* @vite-ignore */ path);
    game.scene.getScene('church').player.setPosition(248, 148);
  });
  await expect(page.locator('#prompt')).toContainText('Speak to the priest');
  await page.locator('#game').focus();
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue')).toBeVisible();
  await expect(page.locator('#dialogue-text')).toContainText('Sit up slowly');
  const before = await position(page);
  await page.keyboard.down('d');
  await page.waitForTimeout(250);
  await page.keyboard.up('d');
  expect((await position(page)).x).toBe(before.x);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#dialogue-text')).toContainText('You asked me to remember');
  await page.getByRole('button', { name: 'Continue' }).press('Enter');
  await expect(page.locator('#dialogue-text')).toContainText('grain');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#dialogue-text')).toContainText('Take the south door');
  await page.getByRole('button', { name: '4. I should go.' }).click();
  await expect(page.locator('#dialogue-text')).toHaveText('Go on, then. Try to come back on your feet.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#dialogue')).toBeHidden();
});

test('furniture blocks walking and the south door leads outside', async ({ page }) => {
  await page.evaluate(async () => {
    const path='/src/main.ts'; const {game}=await import(/* @vite-ignore */ path);
    game.scene.getScene('church').player.setPosition(120, 187);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('w');
  await page.waitForTimeout(500);
  await page.keyboard.up('w');
  expect((await position(page)).y).toBeGreaterThan(165);
  await page.evaluate(async () => {
    const path='/src/main.ts'; const {game}=await import(/* @vite-ignore */ path);
    game.scene.getScene('church').player.setPosition(256, 330);
  });
  await expect(page.locator('#prompt')).toContainText('Step outside');
  await page.keyboard.press('e');
  await expect(page.locator('#location-region')).toHaveText('THE FARMLAND');
});

test('mobile controls move and release without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const down=page.getByRole('button',{name:'Move down'});
  const bounds=(await down.boundingBox())!;
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
  await page.mouse.down();
  await expect.poll(async () => (await position(page)).y).toBeGreaterThan(136);
  await page.mouse.up();
  await page.waitForTimeout(100);
  const stopped=await position(page);
  await page.waitForTimeout(150);
  expect((await position(page)).y).toBeCloseTo(stopped.y,1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
