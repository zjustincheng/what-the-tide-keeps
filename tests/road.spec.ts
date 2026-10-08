import { test, expect, type Page } from '@playwright/test';

const area = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);

async function outside(page: Page) {
  await page.goto('/');
  await expect.poll(() => area(page, 'church')).not.toBeNull();
  await place(page, 'church', 256, 330);
  await page.locator('#game').focus();
  await page.keyboard.press('e');
  await expect.poll(() => area(page, 'farm-road')).toEqual({ x: 256, y: 64 });
}

test('the church door opens onto the farm road and leads back in', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await outside(page);
  await expect(page.locator('#location-region')).toHaveText('THE FARMLAND');
  await expect(page.locator('#location-place')).toHaveText('/ The farm road');
  await place(page, 'farm-road', 296, 312);
  await expect(page.locator('#prompt')).toContainText('Read the waymark');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('Millbrook');
  await page.keyboard.press('Escape');
  await place(page, 'farm-road', 256, 64);
  await expect(page.locator('#prompt')).toContainText('Return to the church');
  await page.keyboard.press('e');
  await expect.poll(() => area(page, 'church')).toEqual({ x: 256, y: 326 });
  await expect(page.locator('#location-region')).toHaveText('THE CAPITAL');
  expect(errors).toEqual([]);
});

test('a grain weevil waits in the hay yard and fights only physically', async ({ page }) => {
  await outside(page);
  await place(page, 'farm-road', 340, 296);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Grain weevil' })).toBeVisible();
  await page.keyboard.up('d');
  await expect(page.locator('#enemy-mana')).toHaveText('Mana 3');
  await expect(page.locator('#enemy-intent')).toContainText('Physical');
});

test('a wipe on the road wakes the hero in the church', async ({ page }) => {
  await outside(page);
  await place(page, 'farm-road', 200, 232);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  for (let round = 1; round <= 6; round++) {
    const living = round <= 3 ? ['Chameleon', 'Bear', 'Vulture'] : round <= 5 ? ['Chameleon', 'Vulture'] : ['Vulture'];
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · ${living.length} actions remaining`);
    for (const name of living) await page.getByRole('button', { name: `${name} attack`, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
  await page.getByRole('radio', { name: /The bear/ }).check();
  await page.getByRole('button', { name: 'Let it go' }).click();
  await expect.poll(() => area(page, 'church')).toEqual({ x: 88, y: 124 });
  await expect(page.locator('#location-region')).toHaveText('THE CAPITAL');
});

test('the road leads to Millbrook, whose people react to the brand', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await outside(page);
  await place(page, 'farm-road', 256, 360);
  await expect(page.locator('#prompt')).toContainText('Walk on to Millbrook');
  await page.keyboard.press('e');
  await expect.poll(() => area(page, 'town')).toEqual({ x: 256, y: 40 });
  await expect(page.locator('#location-place')).toHaveText('/ Millbrook');
  await place(page, 'town', 120, 344);
  await expect(page.locator('#prompt')).toContainText('Speak to the innkeeper');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toHaveText('We are full.');
  await page.keyboard.press('Escape');
  await place(page, 'town', 424, 128);
  await expect(page.locator('#prompt')).toContainText('Speak to the fox');
  await place(page, 'town', 256, 30);
  await expect(page.locator('#prompt')).toContainText('Return to the farm road');
  await page.keyboard.press('e');
  await expect.poll(() => area(page, 'farm-road')).toEqual({ x: 256, y: 344 });
  expect(errors).toEqual([]);
});
