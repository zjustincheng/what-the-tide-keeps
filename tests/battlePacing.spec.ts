import { test, expect, type Page } from '@playwright/test';
import type { Battle, Encounter, MemberId } from '../src/rules/battle';
import type { BattleView } from '../src/ui/BattleView';
import type { AreaScene } from '../src/scenes/AreaScene';
declare global { interface Window { paceRun: typeof import('../src/main'); paceStart: number; } }
test.use({ storageState: { cookies: [], origins: [] } });
async function start(page: Page, encounter: Encounter, company = false) {
  await page.addInitScript(() => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free'], carried: [], found: [], coins: 20 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name'], pending: false }));
  });
  await page.goto('/'); await page.evaluate(async () => { window.paceRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await page.waitForFunction(() => Boolean((window.paceRun.game?.scene.getScene('church') as AreaScene | undefined)?.player?.active));
  await page.evaluate(async ({ encounter, company }) => {
    const { BattleView } = await import('/src/ui/BattleView.ts');
    const scene = window.paceRun.game!.scene.getScene('church') as unknown as { textures: Phaser.Textures.TextureManager; overlay: BattleView; setExplorationEnabled: (enabled: boolean) => void };
    scene.setExplorationEnabled(false);
    scene.overlay = new BattleView(scene.textures.getBase64('hero'), () => {}, encounter, { roster: ['chameleon', 'bear', 'vulture'], company: company ? [{ name: 'Raider', art: 'raider', health: 20, weapon: 'knife', damage: 4 }, { name: 'Bandit', art: 'raider', health: 20, weapon: 'knife', damage: 4 }] : [] });
  }, { encounter, company });
}
// Animation classes come and go in a fraction of a second: watch for one being added, rather than hoping to catch it.
async function watchClass(page: Page, selector: string, name: string) {
  await page.locator(selector).first().evaluate((node, name) => {
    const seen = ((window as unknown as { seen?: Record<string, boolean> }).seen ??= {}); seen[name] = node.classList.contains(name);
    new MutationObserver(() => { if (node.classList.contains(name)) seen[name] = true; }).observe(node, { attributes: true, attributeFilter: ['class'] });
  }, name);
  return () => expect.poll(() => page.evaluate(name => Boolean((window as unknown as { seen?: Record<string, boolean> }).seen?.[name]), name));
}
async function enemy(page: Page, round = 1, guard = false) {
  await page.evaluate(({ round, guard }) => {
    const view = (window.paceRun.game!.scene.getScene('church') as unknown as { overlay: { state: Battle; render: () => void; afterAction: () => void } }).overlay;
    view.state = { ...view.state, round, phase: 'enemy', step: 0, party: view.state.party.map(member => ({ ...member, acted: true, guardingFor: guard && member.id === 'bear' ? 'bear' as MemberId : null, gear: { ...member.gear, guardAll: guard ? 1 : 0 } })) };
    window.paceStart = performance.now(); view.afterAction();
  }, { round, guard });
}
test('guarded routine turns resolve briskly and followers animate their own attacks', async ({ page }) => {
  await start(page, 'weevil', true);
  const striking = await watchClass(page, '[data-foe="1"] .fighter', 'is-striking');
  await enemy(page, 1, true);
  await striking().toBe(true);
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'player');
  const elapsed = await page.evaluate(() => performance.now() - window.paceStart);
  expect(elapsed).toBeLessThan(2000);
  await expect(page.locator('.dodge-bar')).toBeHidden();
  await expect(page.locator('.combat-feedback .feedback-label')).toContainText('GUARDED');
});
test('mobile boss warnings keep the ring beside the button and impact respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await start(page, 'boar');
  // The wind-up and the impact each last a moment: watch for them from before the boar moves.
  const winding = await watchClass(page, '[data-foe="0"]', 'is-winding');
  const impact = await watchClass(page, '.battle', 'boss-impact');
  await enemy(page, 2);
  await expect(page.locator('.dodge-bar')).toHaveAttribute('data-kind', 'ring');
  await expect(page.locator('.dodge-bar .dodge-ring')).toBeInViewport(); await expect(page.locator('#dodge')).toBeInViewport();
  const bottom = await page.locator('.dodge-bar').evaluate(node => node.getBoundingClientRect().bottom);
  expect(Math.abs(bottom - 828)).toBeLessThan(2);
  await page.locator('.battle').evaluate(node => node.scrollTop = 120);
  expect(Math.abs((await page.locator('.dodge-bar').evaluate(node => node.getBoundingClientRect().bottom)) - bottom)).toBeLessThan(2);
  await winding().toBe(true);
  // A blow that lands in full shakes the panel; a dodge or a graze doesn't. Let this one land.
  await impact().toBe(true);
  await expect(page.locator('.dodge-ring')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(500); await enemy(page, 2); await expect(page.locator('#dodge')).toBeVisible(); await page.locator('#dodge').click();
  await expect(page.locator('.battle')).not.toHaveClass(/boss-impact/);
});
test('unknown spells warn without a dodge button and leaving cancels pending impacts', async ({ page }) => {
  await start(page, 'acolyte'); await enemy(page, 2);
  await expect(page.locator('.dodge-call')).toContainText('???'); await expect(page.locator('.dodge-call')).toContainText('Unstudied');
  await expect(page.locator('#dodge')).toBeHidden();
  await page.evaluate(() => {
    const view = (window.paceRun.game!.scene.getScene('church') as unknown as { overlay: BattleView }).overlay;
    view.destroy();
  });
  await page.waitForTimeout(1000);
  await expect(page.locator('.battle,.dodge-bar')).toHaveCount(0);
});

test('a boss settles after its scene before accepting the next party action', async ({ page }) => {
  await start(page, 'boar');
  await page.evaluate(() => {
    const view = (window.paceRun.game!.scene.getScene('church') as unknown as { overlay: { state: Battle; render: () => void } }).overlay;
    view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } }; view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click(); await expect(page.locator('.cutscene')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.battle')).toHaveClass(/phase-returning/);
  await expect(page.getByRole('button', { name: 'Bear attack', exact: true })).toBeDisabled();
  await expect(page.locator('.battle')).not.toHaveClass(/phase-returning/);
  await expect(page.getByRole('button', { name: 'Bear attack', exact: true })).toBeEnabled();
  await expect(page.locator('[data-member="chameleon"]')).toHaveAttribute('data-acted', 'true');
  await expect(page.locator('.battle')).toHaveAttribute('data-stage', '2');
});


test('closed battle details do not trap keyboard focus in hidden controls', async ({ page }) => {
  await start(page, 'weevil');
  const summary = page.locator('.battle-details > summary');
  await summary.focus(); await page.keyboard.press('Tab'); await expect(page.locator('#flee')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(summary).toBeFocused();
});
