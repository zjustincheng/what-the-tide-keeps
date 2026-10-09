import { test, expect, type Page } from '@playwright/test';

// A fresh game except for what each test seeds.
test.use({ storageState: { cookies: [], origins: [] } });

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
async function start(page: Page, world: object, key = 'farmland', spawn = 'spawn') {
  await page.goto('/');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: [], carried: [], found: [], coins: 0, ...world })), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async ([key, spawn]) => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start(key, { spawn });
  }, [key, spawn]);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!));

test('pick thyme, catch nothing new, and cook a stew at the fire', async ({ page }) => {
  await start(page, { fish: { minnow: 2, perch: 0, eel: 0, char: 0 } });
  await place(page, 'farmland', 232, 504);
  await expect(page.locator('#prompt')).toContainText('Pick wild thyme');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('You pick 2 wild thyme');
  await page.keyboard.press('Escape');
  expect((await saved(page)).pantry.herb).toBe(2);
  // Picked, it is gone until the next rest.
  await expect(page.locator('#prompt')).not.toContainText('Pick wild thyme');
  await place(page, 'farmland', 600, 410);
  await expect(page.locator('#prompt')).toContainText('Rest by the fire');
  await page.keyboard.press('e');
  await page.getByRole('button', { name: '1. Cook something.' }).click();
  await expect(page.getByRole('heading', { name: 'Cook something.' })).toBeVisible();
  await page.getByRole('button', { name: /Fish stew/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  const world = await saved(page);
  expect(world.supplies['fish-stew']).toBe(1);
  expect(world.fish.minnow).toBe(0);
});

test('with hidden mana the hero is slower, silent, and unseen, and strikes first', async ({ page }) => {
  await start(page, { flags: ['bear-free'] });
  await page.keyboard.press('q');
  await expect(page.locator('#sneaking')).toBeVisible();
  // Standing within the locust's sight, it doesn't come.
  await place(page, 'farmland', 550, 290);
  await page.waitForTimeout(1500);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // Walking into it, the hero strikes first.
  await page.keyboard.down('a');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('a');
  await expect(page.locator('.battle-log')).toContainText('It never saw you coming.');
});

test('what people say is written in the journal, and bones can be won or lost', async ({ page }) => {
  await start(page, { flags: ['inn-room', 'boar-defeated'], coins: 20 }, 'farmland');
  await place(page, 'farmland', 632, 428);
  await expect(page.locator('#prompt')).toContainText('Speak to the seal');
  await page.keyboard.press('e');
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Are you a citizen/ }).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('j');
  await expect(page.getByRole('heading', { name: 'Journal' })).toBeVisible();
  await page.locator('.journal summary', { hasText: 'A SEAL WITH A FISH CART' }).click();
  await expect(page.locator('.journal-entries')).toContainText("I'm from the sea. The sea was never at the Long Table.");
  await page.getByRole('button', { name: 'Close' }).click();
  // Bones with the carter in the inn.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').scene.start('inn', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'inn')).not.toBeNull();
  await place(page, 'inn', 232, 196);
  await expect(page.locator('#prompt')).toContainText('Speak to the carter');
  await page.keyboard.press('e');
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Play him at bones/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Against/ })).toBeVisible();
  await page.locator('[data-die="0"]').click();
  await page.getByRole('button', { name: 'Throw again', exact: true }).click();
  await expect(page.locator('.dice-result')).toHaveText(/You win 5 coins\.|You lose 5 coins\.|A draw\. Nobody pays\./);
  const result = await page.locator('.dice-result').textContent();
  await page.getByRole('button', { name: 'Done' }).click();
  expect((await saved(page)).coins).toBe(result!.includes('win') ? 25 : result!.includes('lose') ? 15 : 20);
});
