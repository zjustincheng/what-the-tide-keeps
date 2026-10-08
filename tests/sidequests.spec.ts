import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

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
async function talk(page: Page, key: string, x: number, y: number, prompt: string) {
  await place(page, key, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  while (await page.locator('#dialogue').isVisible()) {
    // Walk away from any replies on offer, as a player pressing Escape would.
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test("the shepherd's three strays are scattered across the fields", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await visit(page, 'farmland');
  await talk(page, 'farmland', 440, 720, 'Speak to the shepherd');
  await talk(page, 'farmland', 104, 496, 'Call the sheep');
  await talk(page, 'farmland', 616, 272, 'Call the sheep');
  await talk(page, 'farmland', 744, 544, 'Call the sheep');
  await place(page, 'farmland', 104, 496);
  await expect(page.locator('#prompt')).not.toContainText('Call the sheep');
  await talk(page, 'farmland', 440, 720, 'Speak to the shepherd');
  await expect(page.locator('#purse')).toHaveText('15 coins');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('dialog', { name: 'Equipment' })).toContainText('Wool charm');
  expect(errors).toEqual([]);
});

test("the fishmonger's barrel can be bought and its captive set free", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free'], carried: [], found: [], coins: 30 })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await visit(page, 'town');
  await talk(page, 'town', 328, 184, 'Speak to the fishmonger');
  await page.getByRole('button', { name: 'Buy The barrel' }).click();
  await page.getByRole('button', { name: 'Leave' }).click();
  await place(page, 'town', 352, 136);
  await expect(page.locator('#prompt')).toContainText('Examine barrel');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('young squid');
  await page.keyboard.press('Escape');
  await visit(page, 'farmland');
  await talk(page, 'farmland', 216, 392, 'Tip the barrel into the stream');
  await place(page, 'farmland', 216, 392);
  await expect(page.locator('#prompt')).not.toContainText('Tip the barrel');
});

test('the swarm-mother waits deep in the woods, and the reeve pays her bounty', async ({ page }) => {
  await visit(page, 'farmland');
  await place(page, 'farmland', 72, 680);
  await page.keyboard.down('s');
  await expect(page.getByRole('heading', { name: 'Swarm-mother' })).toBeVisible();
  await page.keyboard.up('s');
  await expect(page.getByRole('heading', { name: 'Nymph' })).toHaveCount(2);
  // Felling the mother first leaves her brood fighting.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } };
    view.render();
  });
  await page.getByRole('combobox', { name: 'Attack target' }).selectOption({ label: 'Swarm-mother' });
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('The swarm-mother falls. The nymphs fight on.');
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'player');
  await expect(page.locator('#enemy-intent')).toContainText('fights on');
  await expect(page.getByRole('combobox', { name: 'Attack target' })).not.toHaveValue('0');
  await win(page);
  await visit(page, 'town');
  await talk(page, 'town', 88, 124, 'Speak to the reeve');
  await expect(page.locator('#purse')).toHaveText('37 coins');
});
