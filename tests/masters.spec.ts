import { test, expect, type Page } from '@playwright/test';
import type { AreaScene } from '../src/scenes/AreaScene';
declare global { interface Window { masterRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' });

async function ready(page: Page, key: string) {
  await page.waitForFunction(key => Boolean((window.masterRun.game?.scene.getScene(key) as unknown as AreaScene | undefined)?.player?.active), key);
}
async function travel(page: Page, from: string, to: string, spawn: string) {
  await page.evaluate(([from, to, spawn]) => window.masterRun.game!.scene.getScene(from).scene.start(to, { spawn }), [from, to, spawn]); await ready(page, to);
}

test('the old wolf teaches riposte once the captain is dead, and it goes with the party into a real fight', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    if (!localStorage.getItem('tide-keeps.world.v1')) localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'captain-slain'], carried: [], found: [], coins: 0 }));
  });
  await page.goto('/');
  await page.evaluate(async () => { window.masterRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
  await travel(page, 'church', 'fort', 'from-battlefield');
  await page.evaluate(() => {
    const s = window.masterRun.game!.scene.getScene('fort') as unknown as AreaScene;
    const at = s.point('veteran'); const body = s.player.body as import('phaser').Physics.Arcade.Body;
    s.player.setPosition(at.x, at.y + 18); body.reset(at.x, at.y + 18);
  });
  await page.locator('#game').focus(); await expect(page.locator('#prompt')).toContainText('old wolf'); await page.keyboard.press('e');
  for (let i = 0; i < 6 && !await page.getByRole('button', { name: /Teach me to fight/ }).isVisible(); i++) await page.locator('#continue').click();
  await page.getByRole('button', { name: /Teach me to fight/ }).click();
  for (let i = 0; i < 8 && !(await page.locator('#dialogue-text').textContent())?.startsWith('Learned'); i++) await page.locator('#continue').click();
  await expect(page.locator('#dialogue-text')).toContainText('Learned: Riposte');
  await page.keyboard.press('Escape');
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!).flags).toContain('learned-riposte');
  // A fight in the fields carries it.
  await travel(page, 'fort', 'farmland', 'spawn');
  await page.evaluate(() => {
    const s = window.masterRun.game!.scene.getScene('farmland') as unknown as { foes: { encounter: string }[]; beginBattle: (foe: unknown) => void };
    s.beginBattle(s.foes.find(foe => foe.encounter === 'locust'));
  });
  await expect(page.locator('.party-battle')).toBeVisible();
  expect(await page.evaluate(() => (window.masterRun.game!.scene.getScene('farmland') as unknown as { overlay: { state: { techniques: string[] } } }).overlay.state.techniques)).toEqual(['riposte']);
  expect(errors).toEqual([]);
});
