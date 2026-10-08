import { test, expect, type Page } from '@playwright/test';

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
  await page.goto('/');
  await expect.poll(() => page.evaluate(async () => {
    const path = '/src/main.ts';
    const { game } = await import(/* @vite-ignore */ path);
    return Boolean(game.scene.getScene('church')?.player);
  })).toBe(true);
});

test('touching the visible enemy begins battle; drag attack and tap support respect turns', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await enterEncounter(page);
  await expect(page.locator('#hero-mana')).toHaveText('Mana 10 / 10');
  const hero = (await page.locator('.hero-fighter').boundingBox())!;
  const enemy = (await page.locator('.enemy-fighter').boundingBox())!;
  await page.mouse.move(hero.x + hero.width / 2, hero.y + hero.height / 2);
  await page.mouse.down();
  await page.mouse.move(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'enemy');
  await expect(page.getByRole('button', { name: 'Attack Thorn' })).toBeDisabled();
  await expect(page.locator('#hero-mana')).toHaveText('Mana 8 / 10');
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · Your turn');
  await expect(page.locator('#enemy-intent')).toContainText('crushing leap');
  await page.locator('.hero-fighter').click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 3 · Your turn');
  await expect(page.getByRole('log')).toContainText('You turn aside the crushing leap');
  // Win the remaining turns using the accessible action buttons.
  for (let round = 3; round <= 9; round++) {
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · Your turn`);
    await page.getByRole('button', { name: round % 2 ? 'Attack Thorn' : 'Support Guard' }).click();
  }
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'victory');
  await page.getByRole('button', { name: 'Return to the church' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.down('d');
  await page.waitForTimeout(250);
  await page.keyboard.up('d');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Return to the cot' }).click();
  await enterEncounter(page);
  await expect(page.locator('#hero-condition')).toHaveText('Unhurt');
  expect(errors).toEqual([]);
});

test('defeat returns to the cot and leaves the encounter available', async ({ page }) => {
  await enterEncounter(page);
  for (let round = 1; round <= 4; round++) {
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · Your turn`);
    await page.getByRole('button', { name: 'Attack Thorn' }).click();
  }
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const position = await page.evaluate(async () => {
    const path='/src/main.ts'; const { game } = await import(/* @vite-ignore */ path);
    const hero=game.scene.getScene('church').player;
    return { x: hero.x, y: hero.y };
  });
  expect(position).toEqual({ x: 88, y: 124 });
  await enterEncounter(page);
  await expect(page.locator('#hero-mana')).toHaveText('Mana 10 / 10');
});

test('mobile battle actions remain reachable and keyboard focus stays in battle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterEncounter(page);
  await expect(page.locator('#restart')).toHaveAttribute('inert', '');
  for(let i=0;i<5;i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('.battle')))).toBe(true);
  }
  await page.getByRole('button', { name: 'Support Guard' }).click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · Your turn');
  await expect(page.locator('#hero-condition')).toHaveText('Unhurt');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
