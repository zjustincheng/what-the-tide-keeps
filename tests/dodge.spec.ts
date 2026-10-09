import { test, expect, type Page } from '@playwright/test';

async function enterLocust(page: Page) {
  await page.goto('/?practice');
  await expect.poll(() => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    return Boolean(game.scene.getScene('church')?.player);
  })).toBe(true);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(335, 313);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.up('d');
}
async function attackAll(page: Page) {
  for (const name of ['Chameleon', 'Bear', 'Vulture']) await page.getByRole('button', { name: `${name} attack`, exact: true }).click();
}
// Press Space inside the page, offset from the moment the blow lands, so test timing does not depend on the driver.
async function pressAt(page: Page, offset: number) {
  await expect(page.getByRole('button', { name: /Dodge/ })).toBeVisible();
  await page.evaluate(offset => new Promise<void>(resolve => {
    const battle = document.querySelector<HTMLElement>('.battle')!;
    setTimeout(() => {
      battle.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      resolve();
    }, Number(battle.dataset.impact) - performance.now() + offset);
  }), offset);
}

test('pressing as the ring closes dodges the blow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await enterLocust(page);
  await attackAll(page);
  await expect(page.locator('.dodge-ring')).toHaveCount(1);
  await expect(page.locator('.dodge-call')).toContainText(/Mandible strike \(1 of 2\) → Bear/);
  await pressAt(page, 0);
  await expect(page.getByRole('log')).toContainText('finds only air');
  await expect(page.locator('.dodge-call')).toHaveText('Dodged!');
  // It strikes twice: dodge the second blow too.
  await expect(page.locator('.dodge-call')).toContainText(/Mandible strike \(2 of 2\) → Bear/);
  await pressAt(page, 0);
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await expect(page.locator('[data-member="bear"] .member-condition')).toHaveText('Unhurt');
  expect(errors).toEqual([]);
});

test('pressing too soon or not at all takes the full blow', async ({ page }) => {
  await enterLocust(page);
  await attackAll(page);
  await pressAt(page, -500);
  await expect(page.locator('.dodge-call')).toHaveText('Too soon.');
  await expect(page.getByRole('log')).toContainText('The mandible strike (1 of 2) catches Bear.');
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  // Hold the vulture back so the locust survives to leap.
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Bear attack', exact: true }).click();
  await page.getByRole('button', { name: 'Vulture support', exact: true }).click();
  await expect(page.getByRole('button', { name: /Dodge/ })).toBeVisible();
  await expect(page.locator('.dodge-call')).toHaveText('Too slow.');
  await expect(page.getByRole('log')).toContainText('The crushing leap catches');
});

test('guarded blows skip the prompt', async ({ page }) => {
  await enterLocust(page);
  await page.getByRole('button', { name: 'Bear support', exact: true }).click();
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await expect(page.getByRole('log')).toContainText('Bear turns aside');
  await expect(page.locator('.dodge-ring')).toHaveCount(0);
});
