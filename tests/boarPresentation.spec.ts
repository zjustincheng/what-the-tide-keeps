import { test, expect, type Page } from '@playwright/test';
import type { AreaScene } from '../src/scenes/AreaScene';
import type { Battle } from '../src/rules/battle';
declare global { interface Window { boarPolish: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });
async function ready(page: Page, key: string) {
  await page.waitForFunction(key => Boolean((window.boarPolish.game?.scene.getScene(key) as AreaScene | undefined)?.player?.active), key);
}
async function start(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem('tide-keeps.world.v1')) localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'boar-challenged'], carried: [], found: [], coins: 20 }));
    if (!localStorage.getItem('tide-keeps.memory.v1')) localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name'], pending: false }));
  });
  await page.goto('/'); await page.evaluate(async () => { window.boarPolish = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
  await visit(page);
}
async function visit(page: Page) {
  await page.evaluate(() => window.boarPolish.game!.scene.getScenes(true)[0].scene.start('boar-farm', { spawn: 'spawn' })); await ready(page, 'boar-farm');
  await page.evaluate(() => {
    const scene = window.boarPolish.game!.scene.getScene('boar-farm') as unknown as { beginBattle: (foe: unknown) => void; foes: { encounter: string }[] };
    scene.beginBattle(scene.foes.find(foe => foe.encounter === 'boar'));
  });
}
async function corner(page: Page) {
  await page.evaluate(() => {
    const scene = window.boarPolish.game!.scene.getScene('boar-farm') as unknown as { overlay: { state: Battle; render: () => void } };
    const view = scene.overlay; view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } }; view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('.cutscene')).toBeVisible();
}

test('the boar’s full scene chain grounds the cast and returns from the flashback before opening the road', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page);
  const intro = page.locator('.cinematic[data-story="boar"]');
  await expect(intro).toHaveAttribute('data-art', 'grain-road');
  for (let shot = 0; shot < 5; shot++) {
    await expect(intro).toHaveAttribute('data-shot', String(shot));
    await intro.locator('.cinema-next').click();
  }
  await expect(page.locator('.battle')).toBeVisible(); await corner(page);
  const phase = page.locator('.cutscene');
  await expect(phase).toHaveAttribute('data-pose', 'fallen');
  await expect(phase.locator('.phase-cast [data-actor="boar"]')).toBeVisible();
  await phase.locator('.cutscene-next').click();
  await expect(phase.locator('.cutscene-speaker')).toHaveText('THE BADGER');
  await expect(phase.locator('.phase-cast [data-actor="boar"]')).toBeVisible();
  await expect(phase.locator('[data-actor="badger"]')).toHaveAttribute('data-speaking', 'true');
  for (let shot = 1; shot < 4; shot++) await phase.locator('.cutscene-next').click();
  await expect(phase).toHaveCount(0); await expect(page.locator('.battle')).toHaveAttribute('data-stage', '2');
  await page.evaluate(() => {
    const scene = window.boarPolish.game!.scene.getScene('boar-farm') as unknown as { overlay: { state: Battle; render: () => void } };
    const view = scene.overlay; view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } }; view.render();
  });
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const after = page.locator('.cinematic[data-story="boarAfter"]');
  for (let shot = 0; shot < 7; shot++) {
    await expect(after).toHaveAttribute('data-shot', String(shot));
    if (shot >= 1 && shot <= 3) await expect(after).toHaveClass(/cinema-past/);
    if (shot === 4) { await expect(after).not.toHaveClass(/cinema-past/); await expect(after.locator('.cinema-caption')).toHaveText('BACK AT THE COLD HEARTH'); }
    if (shot === 6) { await expect(after).toHaveAttribute('data-art', 'grain-road-open'); }
    await after.locator('.cinema-next').click();
  }
  await expect(page.locator('#speaker')).toHaveText('THE BRAND');
  while (!(await page.locator('#choices').isVisible())) await page.locator('#continue').click();
  await page.getByRole('button', { name: /Not yet/ }).click(); await page.locator('#continue').click();
  await page.evaluate(() => {
    const scene = window.boarPolish.game!.scene.getScene('boar-farm') as AreaScene;
    (scene.player.body as Phaser.Physics.Arcade.Body).reset(256, 212);
  });
  await expect(page.locator('#prompt')).toContainText('Examine the cup');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags)).toContain('boar-defeated');
});

test('mobile phase scenes fit, skip safely, and revisiting does not repeat the introduction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await start(page);
  await page.locator('.cinema-skip').click(); await corner(page);
  await expect(page.locator('.cutscene .cutscene-next')).toBeInViewport();
  await expect(page.locator('.cutscene .cutscene-skip')).toBeInViewport();
  await expect(page.locator('.cutscene .cutscene-line')).toHaveText('The boar goes down on his knees in the ash of his own house.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape'); await expect(page.locator('.cutscene')).toHaveCount(0);
  await expect(page.locator('.battle')).toHaveAttribute('data-stage', '2');
  await expect(page.locator('[data-member="chameleon"]')).toHaveAttribute('data-acted', 'true');
  await expect(page.locator('[data-member="bear"]')).toHaveAttribute('data-acted', 'false');
  await visit(page); await expect(page.locator('.cinematic')).toHaveCount(0); await expect(page.locator('.battle')).toHaveAttribute('data-stage', '1');
});
