import { test, expect, type Page } from '@playwright/test';

async function enter(page: Page) {
  await page.goto('/');
  await expect.poll(() => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    return Boolean(game.scene.getScene('church')?.player);
  })).toBe(true);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(335, 113);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.up('d');
  await expect(page.getByRole('heading', { name: 'Hooded exile' })).toBeVisible();
}
async function magic(page: Page, id: string, action: string) {
  const details = page.locator(`[data-member="${id}"] details`);
  if (!(await details.getAttribute('open'))) {
    // Boolean attributes serialize to an empty string, so check the DOM property.
    if (!(await details.evaluate((node: HTMLDetailsElement) => node.open))) await details.locator('summary').click();
  }
  await page.getByRole('button', { name: `${id[0].toUpperCase() + id.slice(1)} ${action}`, exact: true }).click();
}
async function support(page: Page, id: string) {
  await page.getByRole('button', { name: `${id} support`, exact: true }).click();
}

test('analyze, barrier, and grimoire persist through reload', async ({ page }) => {
  await enter(page);
  await expect(page.locator('#enemy-intent')).toContainText('???');
  await expect(page.locator('#enemy-mana')).toHaveText('Mana 2 · veiled');
  await magic(page, 'chameleon', 'analyze');
  await expect(page.locator('.grimoire-status')).toContainText('Salt lance — can be blocked');
  await support(page, 'Bear'); await support(page, 'Vulture');
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await expect(page.locator('#enemy-intent')).toContainText('Salt lance · 1 enemy turn');
  await page.getByRole('combobox', { name: 'Vulture barrier target' }).selectOption('bear');
  await magic(page, 'vulture', 'barrier');
  await expect(page.locator('[data-member="vulture"] .member-mana')).toContainText('Mana 5 / 10');
  await support(page, 'Bear'); await support(page, 'Chameleon');
  await expect(page.locator('#battle-turn')).toHaveText('Round 3 · 3 actions remaining');
  await expect(page.getByRole('log')).toContainText("Bear's barrier stops Salt lance");
  await expect(page.locator('[data-member="bear"] .member-condition')).toHaveText('Unhurt');
  await expect(page.locator('#enemy-mana')).toHaveText('Mana 10');
  await enter(page);
  await expect(page.locator('#enemy-intent')).toContainText('Salt lance');
  await expect(page.locator('#enemy-intent')).not.toContainText('???');
});

test('survive an unknown spell, then conceal and reveal mana on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  await support(page, 'Bear'); await support(page, 'Vulture'); await support(page, 'Chameleon');
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await page.getByRole('combobox', { name: 'Vulture barrier target' }).selectOption('bear');
  await magic(page, 'vulture', 'barrier');
  await support(page, 'Bear'); await support(page, 'Chameleon');
  await expect(page.locator('#battle-turn')).toHaveText('Round 3 · 3 actions remaining');
  await expect(page.getByRole('meter', { name: 'Bear health', exact: true })).toHaveAttribute('aria-valuenow', '40');
  await expect(page.locator('.grimoire-status')).toContainText('Salt lance');
  await magic(page, 'bear', 'suppress');
  await expect(page.locator('[data-member="bear"] .member-mana')).toContainText('showing 1');
  await expect(page.locator('#enemy-intent')).toContainText('Watching Chameleon');
  await support(page, 'Chameleon'); await support(page, 'Vulture');
  await expect(page.locator('#battle-turn')).toHaveText('Round 4 · 3 actions remaining');
  await page.getByRole('button', { name: 'Bear attack', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('burst of revealed mana');
  await expect(page.locator('[data-member="bear"] .member-mana')).toContainText('showing 10');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/magic-mobile.png', fullPage: true });
});

test('malformed or unavailable storage does not interrupt analysis', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tide-keeps.grimoire.v1', '{broken');
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  });
  await enter(page);
  await magic(page, 'chameleon', 'analyze');
  await expect(page.locator('.grimoire-status')).toContainText('browser save unavailable');
  await expect(page.locator('#enemy-intent')).toContainText('Salt lance');
  await support(page, 'Bear'); await support(page, 'Vulture');
  await expect(page.locator('#battle-turn')).toContainText('Round 2');
});
