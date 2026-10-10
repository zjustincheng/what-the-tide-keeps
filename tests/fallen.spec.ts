import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

// A hero still down when a fight ends has fallen: no fire raises them, only the church, for coins or for a memory.
test.use({ storageState: { cookies: [], origins: [] } });

const saved = async (page: Page) => JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);
async function start(page: Page, world: object) {
  await page.goto('/?practice');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free'], carried: [], found: [], coins: 0, ...world })), world);
  await page.reload();
  await expect.poll(() => page.evaluate(async () => { const { game } = await import('/src/main.ts'); return Boolean(game.scene.getScene('church')?.player); })).toBe(true);
  await page.locator('#game').focus();
}
async function finish(page: Page) {
  while (await page.locator('#dialogue').isVisible()) {
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
}
async function priest(page: Page, reply: RegExp) {
  await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('church').player.setPosition(248, 148); });
  await expect(page.locator('#prompt')).toContainText('Speak to the priest');
  await page.keyboard.press('e');
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: reply }).click();
}

test('the bear goes down in a won fight and stays down through tending, until the priest raises him for coins', async ({ page }) => {
  await start(page, { coins: 50 });
  await page.evaluate(async () => { const { game } = await import('/src/main.ts'); game.scene.getScene('church').player.setPosition(335, 313); });
  await page.keyboard.down('d');
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible();
  await page.keyboard.up('d');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, party: view.state.party.map((member: { id: string }) => member.id === 'bear' ? { ...member, health: 0 } : member) };
    view.render();
  });
  await win(page);
  expect((await saved(page)).fallen).toEqual(['bear']);
  await expect(page.locator('#sneaking')).toContainText('Carry them to the church');
  // Tending closes wounds; it doesn't raise the dead.
  await priest(page, /Tend my wounds/);
  await finish(page);
  expect((await saved(page)).fallen).toEqual(['bear']);
  await priest(page, /Raise the bear\. \(40 coins\)/);
  await finish(page);
  const world = await saved(page);
  expect(world.fallen).toEqual([]);
  expect(world.coins).toBe(50 + 4 - 40);
});

test('with no coins, the priest raises the fallen for a memory instead', async ({ page }) => {
  await start(page, { fallen: ['bear'] });
  const before = JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.memory.v1'))) ?? '{"lost":["home","name"]}').lost.length;
  await priest(page, /Raise the bear\. \(No coins/);
  while (!(await page.locator('#dialogue-text').textContent())?.includes('The ledger does')) await page.getByRole('button', { name: 'Continue' }).click();
  expect((await saved(page)).fallen).toEqual([]);
  const after = JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.memory.v1')))!).lost.length;
  expect(after).toBe(before + 1);
});
