import { test, expect, type Page } from './fixtures';

// Each hidden room: the area and a way into it, the tile just outside its cracked face, the key that walks into it, and what is inside.
const SECRETS = [
  { area: 'downs', spawn: 'from-fields', from: [14, 33], key: 'd', flag: 'secret-barrow', prompt: 'Search the tunnel', supply: 'smelling-salts', says: 'CHURCH GOT THERE FIRST' },
  { area: 'pass', spawn: 'from-border', from: [36, 5], key: 'w', flag: 'secret-cleft', prompt: 'Search the cleft', supply: 'trail-cake', says: 'Tell Mother' },
  { area: 'wickmere', spawn: 'from-causeway', from: [12, 8], key: 'w', flag: 'secret-plastered', prompt: 'Search the room', supply: 'antivenom', says: 'QUARANTINE' },
  { area: 'hold', spawn: 'from-climb', from: [35, 15], key: 'w', flag: 'secret-wall', prompt: 'Search the space', supply: 'herb-salve', says: 'ATTENTION OF THE LIGHT' },
  { area: 'lanes', spawn: 'from-harbour', from: [33, 6], key: 'w', flag: 'secret-door', prompt: 'Search the room', supply: 'firepot', says: 'FOR THE LIGHT' },
] as const;

const world = (page: Page) => page.evaluate(async () => (await import('/src/storage/world.ts')).loadWorld());
async function visit(page: Page, area: string, spawn = 'spawn') {
  await page.evaluate(async ([area, spawn]) => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(area, { spawn });
  }, [area, spawn]);
  await expect.poll(() => page.evaluate(async area => {
    const { game } = await import('/src/main.ts');
    const scene = game.scene.getScene(area);
    return Boolean(scene?.sys.isActive() && scene.player?.active);
  }, area)).toBe(true);
}
// Feet on a tile: the hero's body sits low on his sprite.
const stand = (page: Page, area: string, [x, y]: readonly [number, number]) => page.evaluate(async ([area, x, y]) => {
  const { game } = await import('/src/main.ts');
  const player = game.scene.getScene(area).player;
  player.setPosition(x * 16 + 8, y * 16);
  player.body.reset(x * 16 + 8, y * 16);
}, [area, x, y] as const);
// Whether the wall still covers the room's middle.
const covered = (page: Page, area: string, flag: string) => page.evaluate(async ([area, flag]) => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(area);
  const point = scene.points.find((point: { name: string }) => point.name === flag);
  return Boolean(scene.walls.getTileAtWorldXY(point.x, point.y));
}, [area, flag]);

for (const secret of SECRETS) test(`a cracked face in ${secret.area} gives way to a hidden room, which stays open`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?practice');
  await expect.poll(() => page.evaluate(async () => Boolean((await import('/src/main.ts')).game?.scene.getScene('church')?.player))).toBe(true);
  await visit(page, secret.area, secret.spawn);
  // Until it is found, the room is behind wall, and nothing says it is there but the crack.
  expect(await covered(page, secret.area, secret.flag)).toBe(true);
  await stand(page, secret.area, secret.from);
  await page.locator('#game').focus();
  await page.keyboard.down(secret.key);
  await expect(page.locator('#sneaking')).toHaveText('A HIDDEN WAY');
  await page.keyboard.up(secret.key);
  await expect.poll(async () => (await world(page)).flags).toContain(secret.flag);
  await expect.poll(() => covered(page, secret.area, secret.flag)).toBe(false);
  // What was left there.
  const before = (await world(page)).supplies[secret.supply];
  await page.evaluate(async ([area, flag]) => {
    const { game } = await import('/src/main.ts');
    const scene = game.scene.getScene(area);
    const point = scene.points.find((point: { name: string }) => point.name === flag);
    scene.player.setPosition(point.x, point.y - 8);
    scene.player.body.reset(point.x, point.y - 8);
  }, [secret.area, secret.flag]);
  await expect(page.locator('#prompt')).toContainText(secret.prompt);
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue')).toBeVisible();
  while (await page.locator('#continue').isVisible()) {
    if ((await page.locator('#dialogue-text').textContent())?.includes(secret.says)) break;
    await page.locator('#continue').click();
  }
  await expect(page.locator('#dialogue-text')).toContainText(secret.says);
  await page.keyboard.press('Escape');
  expect((await world(page)).supplies[secret.supply]).toBe(before + 1);
  // Gone for good: back again, and the room stands open.
  await visit(page, 'church');
  await visit(page, secret.area, secret.spawn);
  expect(await covered(page, secret.area, secret.flag)).toBe(false);
  expect(errors).toEqual([]);
});
