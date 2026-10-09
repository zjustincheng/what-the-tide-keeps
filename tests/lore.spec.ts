import { test, expect, type Page } from '@playwright/test';

// A fresh game except for what each test seeds.
test.use({ storageState: { cookies: [], origins: [] } });

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);

const PEOPLE: [area: string, spawn: string, x: number, y: number, prompt: string][] = [
  ['church', 'spawn', 72, 252, 'Speak to the novice'],
  ['farmland', 'spawn', 792, 524, 'Speak to the pilgrim'],
  ['farmland', 'spawn', 632, 428, 'Speak to the seal'],
  ['farmland', 'spawn', 840, 140, 'Speak to the beekeeper'],
  ['town', 'spawn', 280, 220, 'Speak to the scribe'],
  ['inn', 'spawn', 344, 204, 'Speak to the old marine'],
  ['downs', 'from-fields', 168, 524, 'Speak to the crow'],
  ['weir', 'from-fen', 200, 476, 'Speak to the crane'],
  ['fort', 'from-pass', 104, 204, 'Speak to the chaplain'],
  ['fort', 'from-pass', 680, 252, 'Speak to the raven'],
  ['fort', 'from-pass', 344, 348, 'Speak to the schoolmistress'],
];

test('the keepers of lore stand where they should and have things to tell', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'boar-defeated', 'inn-room'], carried: [], found: [], coins: 0 })));
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  for (const [area, spawn, x, y, prompt] of PEOPLE) {
    // Only travel when the hero isn't already there; restarting a scene would put him back at its spawn after we place him.
    await page.evaluate(async ([area, spawn]) => {
      const { game } = await import('/src/main.ts');
      const current = game.scene.getScenes(true)[0];
      if (current.scene.key !== area) current.scene.start(area, { spawn });
    }, [area, spawn]);
    await expect.poll(() => at(page, area)).not.toBeNull();
    await page.evaluate(async ([area, x, y]) => {
      const { game } = await import('/src/main.ts');
      game.scene.getScene(area).player.setPosition(x, y);
    }, [area, x, y] as const);
    await expect(page.locator('#prompt'), prompt).toContainText(prompt);
    await page.locator('#game').focus();
    await page.keyboard.press('e');
    while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
    expect(await page.getByRole('group', { name: 'Replies' }).getByRole('button').count()).toBeGreaterThanOrEqual(3);
    await page.keyboard.press('Escape');
  }
});
