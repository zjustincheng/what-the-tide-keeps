import { test, expect, type Page } from '@playwright/test';

// A fresh game except for what each test seeds.
test.use({ storageState: { cookies: [], origins: [] } });

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
async function fields(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free'], carried: [], found: [], coins: 0 })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' });
  });
  await expect.poll(() => at(page, 'farmland')).not.toBeNull();
}

test('an enemy that sees the hero comes after him, and gives up when he gets away', async ({ page }) => {
  await fields(page);
  const locust = () => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const foe = game.scene.getScene('farmland').foes.find((foe: { home: { x: number } }) => foe.home.x === 488);
    return { x: Math.round(foe.sprite.x), y: Math.round(foe.sprite.y) };
  });
  const place = (x: number, y: number) => page.evaluate(async ([x, y]) => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').player.setPosition(x, y);
  }, [x, y]);
  // Standing still within sight, the hero is reached and the fight starts.
  await place(550, 290);
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /^Run/ }).click();
  await page.getByRole('button', { name: 'Get away' }).click();
  // Far away, it walks back to where it was.
  await place(512, 64);
  await expect.poll(async () => { const { x, y } = await locust(); return Math.hypot(x - 488, y - 280) <= 4; }, { timeout: 10000 }).toBe(true);
});

test('fighters breathe, hop when they act, and flinch when hit', async ({ page }) => {
  await fields(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('farmland').player.setPosition(530, 282);
  });
  await expect(page.getByRole('heading', { name: 'Crop locust' })).toBeVisible({ timeout: 5000 });
  const enemy = page.locator('.enemy-fighter[data-foe="0"]');
  expect(await enemy.locator('img').evaluate(image => getComputedStyle(image).animationName)).toBe('sway');
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(enemy).toHaveClass(/is-hit/);
  await expect(page.locator('.member-card[data-member="chameleon"] .party-fighter')).toHaveClass(/is-lunging/);
  // The struck enemy shows the slash.
  await expect(enemy.locator('.fx-slash')).toHaveCount(1);
});
