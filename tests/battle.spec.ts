import { test, expect, type Page } from '@playwright/test';
import { attackUntilWiped, doom } from './helpers';

async function enterEncounter(page: Page) {
  await page.evaluate(async () => {
    const path = '/src/main.ts';
    const { game } = await import(/* @vite-ignore */ path);
    game.scene.getScene('church').player.setPosition(335, 313);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.up('d');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?practice');
  await expect.poll(() => page.evaluate(async () => {
    const path = '/src/main.ts';
    const { game } = await import(/* @vite-ignore */ path);
    return Boolean(game.scene.getScene('church')?.player);
  })).toBe(true);
});


const card = (page: Page, id: string) => page.locator(`[data-member="${id}"]`);
async function drag(page: Page, from: string, to: string) {
  const start = (await page.locator(from).boundingBox())!;
  const end = (await page.locator(to).boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await page.mouse.up();
}

test('party acts in any order, locks spent turns, and wins with protection', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await enterEncounter(page);
  await expect(page.locator('#battle-turn')).toHaveText('Round 1 · 3 actions remaining');
  await drag(page, '[data-member="vulture"] .party-fighter', '.enemy-fighter');
  await expect(page.locator('#battle-turn')).toHaveText('Round 1 · 2 actions remaining');
  await expect(page.getByRole('button', { name: 'Vulture attack', exact: true })).toBeDisabled();
  await expect(card(page, 'vulture').locator('.member-mana')).toHaveText('Mana 10 / 10 · showing 10');
  await expect(card(page, 'bear').locator('.member-condition')).toHaveText('Unhurt');
  await page.getByRole('button', { name: 'Bear support', exact: true }).click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 1 · 1 actions remaining');
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'enemy');
  await expect(page.getByRole('button', { name: 'Bear attack', exact: true })).toBeDisabled();
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await expect(page.getByRole('log')).toContainText('Bear turns aside');
  for(let round=2;round<=3;round++) {
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · 3 actions remaining`);
    await page.getByRole('button', { name: 'Bear support', exact: true }).click();
    await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
    await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  }
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'victory');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.down('d'); await page.waitForTimeout(150); await page.keyboard.up('d');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Return to the cot' }).click();
  await enterEncounter(page);
  await expect(card(page, 'bear').locator('.member-condition')).toHaveText('Unhurt');
  expect(errors).toEqual([]);
});

test('bear can drag onto an ally and vulture can tap to focus', async ({ page }) => {
  await enterEncounter(page);
  await drag(page, '[data-member="bear"] .party-fighter', '[data-member="chameleon"] .party-fighter');
  await expect(card(page, 'bear').locator('.member-status')).toHaveText('Guarding Chameleon');
  await card(page, 'vulture').locator('.party-fighter').click();
  await expect(card(page, 'vulture').locator('.member-status')).toHaveText('Focused');
  await page.getByRole('button', { name: 'Chameleon support', exact: true }).click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('with focused force');
  await expect(card(page, 'vulture').locator('.member-status')).toHaveText('Acted');
});

test('downed companions are skipped and only a full party wipe returns to the cot', async ({ page }) => {
  await enterEncounter(page);
  await doom(page);
  // The first enemy turn downs someone; their actions are skipped from then on.
  for(const id of ['chameleon','bear','vulture']) await page.getByRole('button', { name: `${id[0].toUpperCase()+id.slice(1)} attack`, exact: true }).click();
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', /player|defeat/, { timeout: 15000 });
  const downed = page.locator('.member-card[data-downed="true"]');
  expect(await downed.count()).toBeGreaterThan(0);
  const fallen = await downed.first().getAttribute('data-member');
  if(await page.locator('.battle').getAttribute('data-phase') === 'player') {
    await expect(page.getByRole('button', { name: `${fallen![0].toUpperCase()+fallen!.slice(1)} attack`, exact: true })).toBeDisabled();
    await expect(page.locator('#battle-turn')).toHaveText(`Round 2 · ${3 - await downed.count()} actions remaining`);
  }
  // Only the whole party falling ends it.
  await attackUntilWiped(page);
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
  await page.getByRole('button', { name: 'Stand up' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const position = await page.evaluate(async () => {
    const path='/src/main.ts'; const { game } = await import(/* @vite-ignore */ path);
    const hero=game.scene.getScene('church').player;
    return { x: hero.x, y: hero.y };
  });
  expect(position).toEqual({ x: 88, y: 124 });
  await enterEncounter(page);
  await expect(card(page, 'bear').locator('.member-mana')).toHaveText('Mana 12 / 12 · showing 12');
});

test('mobile party controls, ally selector, and focus remain accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterEncounter(page);
  await expect(page.locator('#settings')).toHaveAttribute('inert', '');
  for(let i=0;i<12;i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('.battle')))).toBe(true);
  }
  await page.getByRole('combobox', { name: 'Bear protection target' }).selectOption('vulture');
  await page.getByRole('button', { name: 'Bear support', exact: true }).click();
  await expect(card(page, 'bear').locator('.member-status')).toHaveText('Guarding Vulture');
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/party-mobile.png', fullPage: true });
});
