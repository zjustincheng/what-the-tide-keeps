import { test, expect, type Page } from '@playwright/test';
import { lose } from './helpers';

const area = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
async function go(page: Page, from: string, x: number, y: number, prompt: string, to: string, arrive: { x: number; y: number }) {
  await place(page, from, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  await expect.poll(() => area(page, to)).toEqual(arrive);
}

async function outside(page: Page) {
  await page.goto('/?practice');
  await expect.poll(() => area(page, 'church')).not.toBeNull();
  await page.locator('#game').focus();
  await go(page, 'church', 256, 330, 'Step outside', 'farmland', { x: 512, y: 64 });
}

test('the church door opens onto open fields that scroll, and leads back in', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await outside(page);
  await expect(page.locator('#location-region')).toHaveText('THE FARMLAND');
  await expect(page.locator('#location-place')).toHaveText('/ The fields');
  await place(page, 'farmland', 552, 362);
  await expect(page.locator('#prompt')).toContainText('Read the waymark');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('West: the mill');
  await page.keyboard.press('Escape');
  // The camera follows the hero across a map larger than the view.
  await place(page, 'farmland', 900, 600);
  await expect.poll(() => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const camera = game.scene.getScene('farmland').cameras.main;
    return { x: camera.scrollX, y: camera.scrollY };
  })).toEqual({ x: 512, y: 384 });
  await go(page, 'farmland', 512, 64, 'Return to the church', 'church', { x: 256, y: 326 });
  await expect(page.locator('#location-region')).toHaveText('THE CAPITAL');
  expect(errors).toEqual([]);
});

test('a grain weevil waits in the hay yard and fights only physically', async ({ page }) => {
  await outside(page);
  await place(page, 'farmland', 700, 488);
  await page.keyboard.down('a');
  await expect(page.getByRole('heading', { name: 'Grain weevil' })).toBeVisible();
  await page.keyboard.up('a');
  await expect(page.locator('#enemy-mana')).toHaveText('Mana 3');
  await expect(page.locator('#enemy-intent')).toContainText('Physical');
});

test('a wipe in the fields wakes the hero in the church', async ({ page }) => {
  await outside(page);
  await place(page, 'farmland', 456, 280);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await lose(page);
  await page.getByRole('radio', { name: /The bear/ }).check();
  await page.getByRole('button', { name: 'Let it go' }).click();
  await expect.poll(() => area(page, 'church')).toEqual({ x: 88, y: 124 });
  await expect(page.locator('#location-region')).toHaveText('THE CAPITAL');
});

test('Millbrook and the border road can each be reached directly from the fields', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await outside(page);
  await go(page, 'farmland', 512, 752, 'Walk on to Millbrook', 'town', { x: 256, y: 40 });
  await expect(page.locator('#location-place')).toHaveText('/ Millbrook');
  await place(page, 'town', 120, 344);
  await expect(page.locator('#prompt')).toContainText('Speak to the innkeeper');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toHaveText("We're full.");
  await page.keyboard.press('Escape');
  await go(page, 'town', 256, 30, 'Return to the fields', 'farmland', { x: 512, y: 736 });
  // The field track skirts the town and joins the border road north of the brambles.
  await go(page, 'farmland', 990, 656, 'Take the field track to the border', 'border-road', { x: 480, y: 80 });
  await go(page, 'border-road', 500, 80, 'Take the field track', 'farmland', { x: 996, y: 656 });
  expect(errors).toEqual([]);
});
