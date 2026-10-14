import { test, expect, type Page } from '@playwright/test';
import type { AreaScene } from '../src/scenes/AreaScene';
declare global { interface Window { fragileRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' });

async function ready(page: Page, key: string) {
  await page.waitForFunction(key => Boolean((window.fragileRun.game?.scene.getScene(key) as unknown as AreaScene | undefined)?.player?.active), key);
}

test('a glass bead worn into a lost fight breaks: the wake screen says so, and the night market sells another', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    if (localStorage.getItem('tide-keeps.world.v1')) return;
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free'], carried: [], found: ['glass-bead', 'boar-tusk'], coins: 0 }));
    localStorage.setItem('tide-keeps.gear.v1', JSON.stringify({ chameleon: ['glass-bead', 'boar-tusk'] }));
  });
  await page.goto('/');
  await page.evaluate(async () => { window.fragileRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
  await page.evaluate(() => window.fragileRun.game!.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' })); await ready(page, 'farmland');
  await page.evaluate(() => {
    const s = window.fragileRun.game!.scene.getScene('farmland') as unknown as { foes: { encounter: string }[]; beginBattle: (foe: unknown) => void };
    s.beginBattle(s.foes.find(foe => foe.encounter === 'locust'));
  });
  await expect(page.locator('.party-battle')).toBeVisible();
  await page.evaluate(() => {
    const s = window.fragileRun.game!.scene.getScene('farmland') as unknown as { overlay: { state: import('../src/rules/battle').Battle; render: () => void } };
    s.overlay.state = { ...s.overlay.state, phase: 'defeat', party: s.overlay.state.party.map(member => ({ ...member, health: 0 })) }; s.overlay.render();
  });
  await page.getByRole('button', { name: 'Wake at the cot', exact: true }).click(); await ready(page, 'church');
  await page.locator('.cinematic[data-story="resurrection"] .cinema-skip').click();
  await expect(page.locator('.keepsake-broken')).toContainText('A blown-glass bead');
  const saved = await page.evaluate(() => ({ world: JSON.parse(localStorage.getItem('tide-keeps.world.v1')!), gear: JSON.parse(localStorage.getItem('tide-keeps.gear.v1')!) }));
  expect(saved.world.found).toEqual(['boar-tusk']); expect(saved.gear.chameleon).toEqual(['boar-tusk']);
  await page.getByRole('button', { name: 'Stand up', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).broke)).toEqual([]);
  expect(errors).toEqual([]);
});
