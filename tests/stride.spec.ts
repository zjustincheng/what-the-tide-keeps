import { test, expect } from './fixtures';

// Walking: the picture hops and sways with each step; the body, which meets walls and gaps, doesn't bounce at all.
test('the hero hops and sways as he walks, while his feet stay level', async ({ page }) => {
  await page.goto('/?practice');
  await expect.poll(() => page.evaluate(async () => Boolean(((await import('/src/main.ts')).game?.scene.getScene('church') as any)?.player?.active))).toBe(true);
  await page.evaluate(async () => {
    const scene = (await import('/src/main.ts')).game!.scene.getScene('church') as any;
    // An open stretch of floor, so nothing stops him.
    scene.player.setPosition(200, 290); scene.player.body.reset(200, 290);
    const seen: { feet: number; origin: number; angle: number }[] = (window as any).stride = [];
    scene.events.on('postupdate', () => seen.push({ feet: scene.player.body.y, origin: scene.player.originY, angle: scene.player.angle }));
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d'); await page.waitForTimeout(700); await page.keyboard.up('d');
  const seen = await page.evaluate(() => (window as any).stride as { feet: number; origin: number; angle: number }[]);
  const walking = seen.slice(5, -5);
  expect(walking.length).toBeGreaterThan(10);
  const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
  expect(spread(walking.map(s => s.origin))).toBeGreaterThan(0.05);
  expect(spread(walking.map(s => s.angle))).toBeGreaterThan(3);
  expect(spread(walking.map(s => s.feet))).toBeLessThan(0.01);
});
