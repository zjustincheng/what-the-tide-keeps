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

// A fresh game: the chameleon alone.
test.use({ storageState: { cookies: [], origins: [] } });

test('wounds linger after a won fight until the hero rests at a campfire', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?practice');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await expect(page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: 'Chameleon health', exact: true })).toHaveAttribute('aria-valuetext', '20 of 20');
  await expect(page.locator('.hud-hint')).toHaveCount(0);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await place(page, 'farmland', 456, 280);
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  // Rig the fight: the hero is badly hurt, and one more blow finishes the locust.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, party: view.state.party.map((member: object) => ({ ...member, health: 7 })), enemy: { ...view.state.enemy, health: 1 } };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('#battle-turn')).toContainText('Your wounds will linger until you rest at a fire.');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: 'Chameleon health', exact: true })).toHaveAttribute('aria-valuetext', '7 of 20');
  await expect(page.locator('.hud-hint')).toHaveText('Rest at a fire to heal and recover mana');
  // The next fight finds him as hurt as he was.
  await place(page, 'farmland', 312, 152);
  await page.keyboard.down('s');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('s');
  await expect(page.getByRole('meter', { name: 'Chameleon health' })).toHaveAttribute('aria-valuenow', '35');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  // Rest at the crossroads fire.
  await place(page, 'farmland', 600, 410);
  await expect(page.locator('#prompt')).toContainText('Rest by the fire');
  await page.keyboard.press('e');
  // A fire offers cooking or sleep.
  await page.getByRole('button', { name: '2. Sleep. (4 coins)' }).click();
  await expect(page.locator('#dialogue-text')).toHaveText('You pay 4 coins for wood and a place by the fire.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#dialogue-text')).toContainText('You sleep until the ache goes out of you.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: 'Chameleon health', exact: true })).toHaveAttribute('aria-valuetext', '20 of 20');
  await expect(page.locator('.hud-hint')).toHaveCount(0);
  await expect.poll(() => at(page, 'farmland')).toEqual({ x: 600, y: 392 });
  expect(errors).toEqual([]);
});
