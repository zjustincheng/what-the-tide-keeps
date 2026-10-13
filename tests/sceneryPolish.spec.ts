import { test, expect, type Page } from '@playwright/test';
import type Phaser from 'phaser';
import type { AreaScene } from '../src/scenes/AreaScene';
import type { Scenery } from '../src/presentation/scenery';
declare global { interface Window { sceneryRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });
async function start(page: Page, key: string, spawn: string) {
  await page.addInitScript(() => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'cuckoo-slain'], carried: [], found: [], coins: 20 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name'], pending: false }));
  });
  await page.goto('/'); await page.evaluate(async () => { window.sceneryRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await page.waitForFunction(() => Boolean((window.sceneryRun.game?.scene.getScene('church') as AreaScene | undefined)?.player?.active));
  await page.evaluate(([key, spawn]) => window.sceneryRun.game!.scene.getScene('church').scene.start(key, { spawn }), [key, spawn]);
  await page.waitForFunction(key => Boolean((window.sceneryRun.game?.scene.getScene(key) as AreaScene | undefined)?.sys.isActive()), key);
}
for (const [key, spawn, id] of [
  ['town', 'spawn', 'bread-stall'], ['fort', 'from-pass', 'memorial'],
  ['wickmere', 'from-causeway', 'landing-barrel-520'], ['hospice', 'spawn', 'meal-table'],
  ['hold', 'from-climb', 'sorting-bench'], ['outlaw-port', 'from-sea', 'shared-table'],
]) test(`${key} added furniture blocks walking, sorts at its feet, and rebuilds without ghost walls`, async ({ page }) => {
  await start(page, key, spawn);
  const target = await page.evaluate(([key, id]) => {
    const scene = window.sceneryRun.game!.scene.getScene(key) as AreaScene;
    const life = scene.town.life as unknown as { structures: Scenery };
    const pieces = life.structures.pieces;
    for (const piece of pieces) if (!piece.footprint.body || !piece.footprint.body.enable) throw Error('Missing solid footprint: ' + piece.id);
    const piece = pieces.find(piece => piece.id === id)!;
    const body = piece.footprint.body as Phaser.Physics.Arcade.StaticBody;
    (scene.player.body as Phaser.Physics.Arcade.Body).reset(body.center.x, key === 'hold' ? body.top - 24 : body.bottom + 24);
    return { bottom: body.bottom, top: body.top, depth: piece.art.depth, count: pieces.length };
  }, [key, id]);
  await page.locator('#game').focus(); const direction = key === 'hold' ? 'ArrowDown' : 'ArrowUp'; await page.keyboard.down(direction); await page.waitForTimeout(650); await page.keyboard.up(direction);
  const stopped = await page.evaluate(key => { const scene = window.sceneryRun.game!.scene.getScene(key) as AreaScene; return { y: scene.player.y, depth: scene.player.depth }; }, key);
  if (key === 'hold') { expect(stopped.y).toBeGreaterThan(target.top - 16); expect(stopped.y).toBeLessThanOrEqual(target.top - 10); expect(stopped.depth).toBeLessThan(target.depth); }
  else { expect(stopped.y).toBeGreaterThanOrEqual(target.bottom - 5); expect(stopped.y).toBeLessThan(target.bottom + 5); expect(stopped.depth).toBeGreaterThan(target.depth); }
  const refreshed = await page.evaluate(([key, id]) => {
    const scene = window.sceneryRun.game!.scene.getScene(key) as AreaScene;
    const life = scene.town.life as unknown as { structures: Scenery; refresh: (context: unknown) => void; key: string };
    const before = life.structures.pieces.map(piece => piece.footprint);
    const context = scene.context() as { world: { night?: boolean } }; context.world.night = !context.world.night;
    // Holds and sea refresh on their own story state; exercise the collection lifecycle directly too.
    life.structures.clear();
    life.key = '';
    life.refresh(context);
    return { oldGone: before.every(piece => !piece.active), count: life.structures.pieces.length, found: life.structures.pieces.some(piece => piece.id === id && piece.footprint.body?.enable) };
  }, [key, id]);
  expect(refreshed.oldGone).toBe(true); expect(refreshed.count).toBe(target.count); expect(refreshed.found).toBe(true);
});

test('cuckoo flashback keeps a coherent sequence and grounded cast on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page, 'hold', 'from-climb');
  await page.evaluate(async () => {
    const { CinematicView } = await import('/src/ui/CinematicView.ts'); const { STORIES } = await import('/src/presentation/stories.ts');
    let view: InstanceType<typeof CinematicView>; view = new CinematicView(STORIES.cuckooAfter, () => view.destroy());
  });
  const cinema = page.locator('.cinematic[data-story="cuckooAfter"]');
  for (let shot = 0; shot < 9; shot++) {
    await expect(cinema).toHaveAttribute('data-shot', String(shot));
    if (shot > 0 && shot < 7) await expect(cinema).toHaveClass(/cinema-past/); else await expect(cinema).not.toHaveClass(/cinema-past/);
    if (shot === 2) { await expect(cinema).toHaveAttribute('data-art', 'family-register'); await expect(cinema.locator('.cinema-actors img')).toHaveCount(0); }
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1100 });
      const positions = await cinema.evaluate(root => {
        const stage = root.querySelector('.cinema-stage')!.getBoundingClientRect();
        return [...root.querySelectorAll<HTMLImageElement>('.cinema-actors img')].map(img => { const bounds = img.getBoundingClientRect(); return { bottom: (bounds.bottom - stage.top) / stage.height, x: (bounds.x + bounds.width / 2 - stage.left) / stage.width }; });
      });
      for (const actor of positions) { expect(actor.bottom).toBeGreaterThan(.6); expect(actor.bottom).toBeLessThan(.95); expect(actor.x).toBeGreaterThan(.2); expect(actor.x).toBeLessThan(.8); }
      await expect(cinema.locator('.cinema-next')).toBeInViewport();
    }
    await cinema.locator('.cinema-next').click();
  }
  await expect(cinema).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags)).toEqual(['bear-free', 'cuckoo-slain']);
});

test('the actual cuckoo fight hands off to his account and reopens the holds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page, 'hold', 'from-climb');
  await page.evaluate(async () => {
    const { loadWorld, saveWorld } = await import('/src/storage/world.ts');
    saveWorld({ ...loadWorld(), flags: ['bear-free', 'vulture-free', 'cuckoo-challenged'] });
    window.sceneryRun.game!.scene.getScene('hold').scene.start('hall-of-house', { spawn: 'spawn' });
  });
  await page.waitForFunction(() => window.sceneryRun.game!.scene.getScene('hall-of-house').sys.isActive());
  await page.evaluate(() => {
    const scene = window.sceneryRun.game!.scene.getScene('hall-of-house') as unknown as { beginBattle: (foe: unknown) => void; foes: { encounter: string }[] };
    scene.beginBattle(scene.foes.find(foe => foe.encounter === 'cuckoo'));
  });
  await expect(page.locator('.cinematic[data-story="cuckoo"]')).toHaveAttribute('data-art', 'house-hall');
  await page.locator('.cinema-skip').click();
  const corner = () => page.evaluate(() => {
    const scene = window.sceneryRun.game!.scene.getScene('hall-of-house') as unknown as { overlay: { state: import('../src/rules/battle').Battle; render: () => void } };
    const view = scene.overlay; view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } }; view.render();
  });
  await corner(); await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('.cutscene')).toBeVisible(); await page.keyboard.press('Escape');
  await expect(page.locator('.battle')).toHaveAttribute('data-stage', '2');
  await corner(); await page.getByRole('button', { name: 'Bear attack', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.cinematic[data-story="cuckooAfter"]')).toBeVisible();
  await page.locator('.cinema-skip').click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags)).toContain('cuckoo-slain');
});
