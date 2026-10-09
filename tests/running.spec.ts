import { test, expect, type Page } from '@playwright/test';
// From a fresh browser, with whatever each test seeds.
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
async function start(page: Page, world: object) {
  await page.goto('/?practice');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify(world)), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
  await page.locator('#game').focus();
}

test('running away drops half the coins and takes a parting blow, and the enemy stays', async ({ page }) => {
  await start(page, { flags: ['bear-free', 'vulture-free'], carried: [], found: [], coins: 21 });
  await place(page, 'farmland', 456, 280);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(page.locator('#battle-turn')).toHaveText('You run. Half your coins scatter behind you.');
  await page.getByRole('button', { name: 'Get away' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#purse')).toHaveText('10 coins');
  // The parting blow shows on the party display.
  const health = await page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: /health/ }).evaluateAll(meters => meters.map(meter => meter.getAttribute('aria-valuetext')));
  expect(health.some(text => !/^(\d+) of \1$/.test(text ?? ''))).toBe(true);
  // A moment to get clear, and the locust is still there.
  await page.waitForTimeout(300);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('resting at a campfire costs coins', async ({ page }) => {
  await start(page, { flags: [], carried: [], found: [], coins: 3, wounds: { chameleon: 5 } });
  await place(page, 'farmland', 600, 410);
  await expect(page.locator('#prompt')).toContainText('Rest by the fire (4 coins)');
  await page.keyboard.press('e');
  await page.getByRole('button', { name: '2. Sleep until dawn. (4 coins)' }).click();
  await expect(page.locator('#dialogue-text')).toHaveText('Wood and a place by the fire cost 4 coins. You have 3.');
  await page.keyboard.press('Escape');
  await expect(page.locator('#purse')).toHaveText('3 coins');
});

test('the dark woods can only be reached across the ford, through the leech', async ({ page }) => {
  await start(page, { flags: [], carried: [], found: [], coins: 0 });
  // The path from the track is blocked by a fallen oak.
  await place(page, 'farmland', 112, 400);
  await expect(page.locator('#prompt')).toContainText('Examine the fallen oak');
  await page.keyboard.down('s'); await page.waitForTimeout(700); await page.keyboard.up('s');
  expect((await at(page, 'farmland'))!.y).toBeLessThan(415);
  // Crossing the ford's dark water away from the leech is impossible.
  await place(page, 'farmland', 216, 664);
  await page.keyboard.down('a'); await page.waitForTimeout(700); await page.keyboard.up('a');
  expect((await at(page, 'farmland'))!.x).toBeGreaterThan(205);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // The middle of the ford leads straight into it.
  await place(page, 'farmland', 216, 648);
  await page.keyboard.down('a');
  await expect(page.getByRole('heading', { name: 'Mire leech' })).toBeVisible();
  await page.keyboard.up('a');
});

test("the priest's count goes up each time the party falls", async ({ page }) => {
  await start(page, { flags: [], carried: [], found: [], coins: 0 });
  await place(page, 'farmland', 456, 280);
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  // A lone chameleon: rig the fight so he falls on the first blow.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, party: view.state.party.map((member: object) => ({ ...member, health: 1 })), enemy: { ...view.state.enemy, health: 999, maxHealth: 999 } };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Let it go' }).click();
  await place(page, 'church', 248, 148);
  await expect(page.locator('#prompt')).toContainText('Speak to the priest');
  await page.keyboard.press('e');
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '1. How many times have I died?' }).click();
  await expect(page.locator('#dialogue-text')).toHaveText('Forty-two, by the ledger.');
});
