import { test, expect } from '@playwright/test';
import type { AreaScene } from '../src/scenes/AreaScene';
import type { Battle } from '../src/rules/battle';
declare global { interface Window { parryRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });

// A new player meets the parry in the fight before the feast, where losing only starts it again.
test('the kraken fight teaches the parry on its third round', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => { window.parryRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click();
  await page.locator('.cinema-skip').click();
  await expect(page.locator('.battle')).toHaveAttribute('data-encounter', 'kraken');
  const round3 = await page.evaluate(async () => {
    const { KRAKEN_PARRY } = await import('/src/rules/battle.ts');
    const view = (window.parryRun.game!.scene.getScene('church') as unknown as AreaScene & { overlay: { state: Battle; render: () => void } }).overlay;
    view.state = { ...view.state, round: KRAKEN_PARRY }; view.render();
    return KRAKEN_PARRY;
  });
  expect(round3).toBe(3);
  await expect(page.locator('#battle-tutorial')).toContainText('get ready to parry');
  for (const attack of await page.getByRole('button', { name: /attack$/ }).all()) if (await attack.isEnabled()) await attack.click();
  await expect(page.locator('.parry-lesson')).toContainText('has to be met');
  await expect(page.locator('.parry-call')).toContainText('Crushing arm');
  await expect(page.locator('.dodge-circle')).toHaveCount(3);
});
