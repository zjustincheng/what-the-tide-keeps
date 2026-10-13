import { test, expect } from './fixtures';
test.use({ storageState: { cookies: [], origins: [] } });

// Nobody should stand with their feet in a stall, a counter, or a wall, and no exit's arrow should sit on a person.
// Every arrow should sit across the middle of its doorway: a door in the wall ahead, or a narrow way off the edge.
// Some people are meant to be inside something: behind a grate, in a cage, in a tank.
const CAGED = new Set(['frog', 'newt-boy', 'adder', 'brother', 'crab', 'newt', 'lord', 'son', 'hide-1', 'hide-2', 'hide-3', 'caged-1', 'caged-2', 'caged-3']);

test('no one stands inside a stall or a wall, no arrow sits on anyone, and every arrow is centred on its doorway', async ({ page }) => {
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
      const W = scene.walls.layer.width, H = scene.walls.layer.height;
      const tile = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H ? null : scene.walls.getTileAt(x, y, true);
      const solid = (x: number, y: number) => tile(x, y) === null || Boolean(tile(x, y)?.collides);
      for (const { name, marker } of scene.exitMarkers) {
        const dx = Math.round(Math.cos(marker.rotation)), dy = Math.round(Math.sin(marker.rotation));
        const ax = Math.abs(dy), ay = Math.abs(dx);
        // Walk from the arrow the way it points to the first thing in the way.
        let tx = Math.floor(marker.x / 16), ty = Math.floor(marker.y / 16);
        for (let k = 0; k < 4 && !solid(tx, ty); k++) { tx += dx; ty += dy; }
        let lo = 0, hi = 0;
        if (tile(tx, ty) === null) {
          // Off the edge: the opening is the open run just inside it.
          tx -= dx; ty -= dy;
          while (lo > -7 && !solid(tx + ax * (lo - 1), ty + ay * (lo - 1))) lo--;
          while (hi < 7 && !solid(tx + ax * (hi + 1), ty + ay * (hi + 1))) hi++;
          if (hi - lo + 1 > 4) continue;
        } else {
          // A door: a short run of one tile in the wall.
          const index = tile(tx, ty).index;
          while (lo > -5 && tile(tx + ax * (lo - 1), ty + ay * (lo - 1))?.index === index) lo--;
          while (hi < 5 && tile(tx + ax * (hi + 1), ty + ay * (hi + 1))?.index === index) hi++;
          if (hi - lo + 1 > 4) continue;
        }
        const middle = ((ax ? tx : ty) + (lo + hi + 1) / 2) * 16;
        const off = (ax ? marker.x : marker.y) - middle;
        if (Math.abs(off) > 1) out.push(`${key}: the arrow for ${name} is ${Math.round(off)}px off the middle of its doorway`);
      }
      return out;
    }, [key, [...CAGED]] as const));
  }
  expect(problems).toEqual([]);
});
