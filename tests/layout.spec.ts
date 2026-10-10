import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });

// Nobody should stand with their feet in a stall, a counter, or a wall, and no exit's arrow should sit on a person.
// Some people are meant to be inside something: behind a grate, in a cage, in a tank.
const CAGED = new Set(['frog', 'newt-boy', 'adder', 'brother', 'crab', 'newt', 'lord', 'son', 'hide-1', 'hide-2', 'hide-3']);

test('no one stands inside a stall or a wall, and no arrow sits on anyone', async ({ page }) => {
  test.setTimeout(240000);
  await page.goto('/');
  await expect.poll(() => page.evaluate(async () => { const { game } = await import('/src/main.ts'); return Boolean(game.scene.getScene('church')?.player); })).toBe(true);
  const keys: string[] = await page.evaluate(async () => { const { game } = await import('/src/main.ts'); return game.scene.getScenes(false).map((s: { scene: { key: string } }) => s.scene.key).filter((k: string) => game.scene.getScene(k).area); });
  const problems: string[] = [];
  for (const key of keys) {
    await page.evaluate(async key => {
      const { game } = await import('/src/main.ts');
      const scene = game.scene.getScene(key);
      const map = await (await fetch(`/maps/${scene.area.map}.json`)).json();
      const names = map.layers[2].objects.map((o: { name: string }) => o.name);
      const spawn = names.find((n: string) => n === 'spawn') ?? names.find((n: string) => n.startsWith('from-'));
      game.scene.getScenes(true)[0].scene.start(key, { spawn });
    }, key);
    await expect.poll(() => page.evaluate(async key => { const { game } = await import('/src/main.ts'); return Boolean(game.scene.getScene(key)?.player?.active); }, key)).toBe(true);
    problems.push(...await page.evaluate(async ([key, caged]) => {
      const { game } = await import('/src/main.ts');
      const scene = game.scene.getScene(key);
      const out: string[] = [];
      for (const { point } of scene.area.npcs) {
        const at = scene.points.find((p: { name: string }) => p.name === point);
        if (!at || (caged as string[]).includes(point)) continue;
        if ([[0, 11], [-6, 11], [6, 11]].some(([dx, dy]) => scene.walls.getTileAtWorldXY(at.x + dx, at.y + dy)?.collides)) out.push(`${key}: ${point} stands in something solid`);
        for (const { name, marker } of scene.exitMarkers) if (Math.abs(marker.x - at.x) < 14 && Math.abs(marker.y - at.y) < 22) out.push(`${key}: the arrow for ${name} sits on ${point}`);
      }
      return out;
    }, [key, [...CAGED]] as const));
  }
  expect(problems).toEqual([]);
});
