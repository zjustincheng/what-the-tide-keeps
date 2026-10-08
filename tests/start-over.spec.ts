import { test, expect } from '@playwright/test';

// A save with progress in it, from a fresh browser.
test.use({ storageState: { cookies: [], origins: [] } });

test('starting over erases progress but keeps preferences, after asking first', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'boar-defeated'], carried: [], found: ['yoke-peg'], coins: 40 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name', 'feast'], pending: false }));
    localStorage.setItem('tide-keeps.settings.v1', JSON.stringify({ music: 0.2, effects: 0.7, muted: false, hud: 'compact' }));
  });
  await page.reload();
  await expect(page.locator('#purse')).toHaveText('40 coins');
  await expect(page.locator('#memory-status')).toContainText('7 of 10 memories remain');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Start over…' }).click();
  await expect(page.getByText('This erases your memories')).toBeVisible();
  // Changing your mind keeps everything.
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await expect(page.getByText('This erases your memories')).toBeHidden();
  await page.getByRole('button', { name: 'Start over…' }).click();
  await page.getByRole('button', { name: 'Erase and start over' }).click();
  await page.waitForLoadState('load');
  await expect(page.locator('#purse')).toHaveText('0 coins');
  await expect(page.locator('#memory-status')).toContainText('8 of 10 memories remain');
  await expect(page.locator('#hud .hud-member')).toHaveCount(1);
  expect(await page.evaluate(() => ['world', 'memory', 'grimoire', 'gear', 'books'].map(key => localStorage.getItem(`tide-keeps.${key}.v1`)))).toEqual([null, null, null, null, null]);
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.settings.v1')))!)).toMatchObject({ music: 0.2, hud: 'compact' });
});
