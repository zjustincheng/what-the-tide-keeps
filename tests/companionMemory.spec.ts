import { test, expect, type Page } from '@playwright/test';
import type { AreaScene } from '../src/scenes/AreaScene';
declare global { interface Window { mindRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' });

async function ready(page: Page, key: string) {
  await page.waitForFunction(key => Boolean((window.mindRun.game?.scene.getScene(key) as unknown as AreaScene | undefined)?.player?.active), key);
}
async function start(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem('tide-keeps.world.v1')) return;
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'frog-free', 'viper-slain', 'anchors-known'], waiting: [], carried: [], found: [], coins: 0 }));
  });
  await page.goto('/');
  await page.evaluate(async () => { window.mindRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
}

test('a companion who falls with the party forgets something, and the wake screen and party screen say what', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await start(page);
  await page.evaluate(() => window.mindRun.game!.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' })); await ready(page, 'farmland');
  await page.evaluate(() => {
    const s = window.mindRun.game!.scene.getScene('farmland') as unknown as { foes: { encounter: string }[]; beginBattle: (foe: unknown) => void };
    s.beginBattle(s.foes.find(foe => foe.encounter === 'locust'));
  });
  await expect(page.locator('.party-battle')).toBeVisible();
  await page.evaluate(() => {
    const s = window.mindRun.game!.scene.getScene('farmland') as unknown as { overlay: { state: import('../src/rules/battle').Battle; render: () => void } };
    s.overlay.state = { ...s.overlay.state, phase: 'defeat', party: s.overlay.state.party.map(member => ({ ...member, health: 0 })) }; s.overlay.render();
  });
  await page.getByRole('button', { name: 'Wake at the cot', exact: true }).click(); await ready(page, 'church');
  await page.locator('.cinematic[data-story="resurrection"] .cinema-skip').click();
  await expect(page.locator('.companion-forgets').first()).toContainText('FORGETS');
  const forgetting = await page.locator('.companion-forgets').count();
  expect(forgetting).toBe(2);
  await page.getByRole('button', { name: 'Stand up', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!));
  expect(saved.companions.bear.lost).toHaveLength(1);
  expect(saved.fought).toEqual([]);
  // The party screen says what the bear forgot.
  await page.locator('#game').focus(); await page.keyboard.press('p');
  await expect(page.locator('[data-member="bear"] .party-memory')).toContainText('Forgot');
  expect(errors).toEqual([]);
});

test('at a fire, the hero can give the frog back the feast, and she believes again until the next death', async ({ page }) => {
  await start(page);
  await page.evaluate(async () => {
    const { writeDown } = await import('/src/scenes/area/panels.ts');
    writeDown(window.mindRun.game!.scene.getScene('church') as never, () => undefined);
  });
  const gift = page.locator('.gifts input[value="frog:feast"]');
  await expect(gift).toBeVisible();
  await gift.check();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!));
  expect(saved.companions.frog.reminded).toEqual(['feast']);
});
