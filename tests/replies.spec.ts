import { test, expect, type Page } from '@playwright/test';

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
// A fresh game, so the chameleon is alone.
async function start(page: Page, memory?: object, world?: object) {
  await page.goto('/');
  await page.evaluate(([memory, world]) => {
    if (memory) localStorage.setItem('tide-keeps.memory.v1', JSON.stringify(memory));
    if (world) localStorage.setItem('tide-keeps.world.v1', JSON.stringify(world));
  }, [memory, world]);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.locator('#game').focus();
}
async function lamb(page: Page) {
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('town', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'town')).not.toBeNull();
  await place(page, 'town', 232, 236);
  await expect(page.locator('#prompt')).toContainText('Speak to the lamb');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toHaveText('Are you the one who killed the king?');
}

test('the hero can answer, by number key or by clicking, and the talk goes on from there', async ({ page }) => {
  await start(page);
  await lamb(page);
  const replies = page.getByRole('group', { name: 'Replies' }).getByRole('button');
  await expect(replies).toHaveText(["1. No. I don't think so.", '2. They say I did.']);
  await expect(page.getByRole('button', { name: 'Continue' })).toBeHidden();
  await page.keyboard.press('2');
  await expect(page.locator('#dialogue-text')).toHaveText('Mum says.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#dialogue-text')).toContainText("There's thorns all over the south road now");
});

test('once the feast is forgotten, the hero can no longer say he is innocent', async ({ page }) => {
  await start(page, { lost: ['home', 'name', 'feast'], pending: false });
  await lamb(page);
  await expect(page.getByRole('group', { name: 'Replies' }).getByRole('button')).toHaveText(["1. I don't remember.", '2. They say I did.']);
  await page.getByRole('button', { name: "1. I don't remember." }).click();
  await expect(page.locator('#dialogue-text')).toHaveText("That's what everyone says.");
});

test('the priest can tend wounds', async ({ page }) => {
  await start(page, undefined, { flags: [], carried: [], found: [], coins: 0, wounds: { chameleon: 12 } });
  await expect(page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: 'Chameleon health', exact: true })).toHaveAttribute('aria-valuetext', '8 of 20');
  await place(page, 'church', 248, 148);
  await expect(page.locator('#prompt')).toContainText('Speak to the priest');
  await page.keyboard.press('e');
  for (let i = 0; i < 3; i++) await page.keyboard.press('e');
  await page.getByRole('button', { name: '3. Tend my wounds.' }).click();
  await expect(page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: 'Chameleon health', exact: true })).toHaveAttribute('aria-valuetext', '20 of 20');
});

test('people speak with a portrait above the text; objects show only a name', async ({ page }) => {
  await start(page);
  await place(page, 'church', 248, 148);
  await expect(page.locator('#prompt')).toContainText('Speak to the priest');
  await page.keyboard.press('e');
  await expect(page.locator('#portrait')).toBeVisible();
  await expect(page.locator('#portrait img')).toHaveAttribute('src', /^data:image\/png/);
  await expect(page.locator('#speaker')).toHaveText('THE PRIEST');
  await page.keyboard.press('Escape');
  await place(page, 'church', 408, 124);
  await expect(page.locator('#prompt')).toContainText('Examine ledger');
  await page.keyboard.press('e');
  await expect(page.locator('#speaker')).toHaveText('THE RESURRECTION LEDGER');
  await expect(page.locator('#portrait')).toBeHidden();
});
