import { test, expect } from '@playwright/test';
declare global { interface Window { humanRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' });

test('the final confrontation reclaims memories, saves them, and opens the mercy conversation', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'frog-free', 'octopus-free', 'lab-remembered'], carried: [], found: [], coins: 30 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['trial', 'training', 'kraken', 'home', 'name'], pending: false }));
  });
  await page.goto('/'); await page.evaluate(async () => { window.humanRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await page.waitForFunction(() => Boolean((window.humanRun.game?.scene.getScene('church') as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active));
  await page.evaluate(() => window.humanRun.game!.scene.getScene('church').scene.start('lamp'));
  await page.waitForFunction(() => Boolean((window.humanRun.game?.scene.getScene('lamp') as import('../src/scenes/AreaScene').AreaScene | undefined)?.player?.active));
  await page.locator('.cinematic[data-story="human"] .cinema-skip').click(); await expect(page.locator('.cinematic')).toHaveCount(0);
  await page.evaluate(() => { const s = window.humanRun.game!.scene.getScene('lamp') as import('../src/scenes/AreaScene').AreaScene; s.player.setPosition(264, 144); const b = s.player.body as import('phaser').Physics.Arcade.Body; b.reset(264, 144); b.updateFromGameObject(); });
  await page.locator('#game').focus(); await expect(page.locator('#prompt')).toContainText('Speak to him'); await page.keyboard.press('e'); await page.locator('#continue').click();
  await page.getByRole('button', { name: /I remember the feast, and the door/ }).click(); await page.locator('#continue').click(); await page.locator('#continue').click();
  const intro = page.locator('.cinematic[data-story="humanChallenge"]'); await expect(intro).toBeVisible();
  await intro.locator('.cinema-skip').click(); await expect(page.locator('.memory-reclamation')).toBeVisible(); await expect(page.locator('.area-title-card')).toBeHidden();
  await expect(page.locator('.reclamation-count')).toContainText('0 / 5');
  // Set only enemy health to reach the phase boundary; the attack and recovery use real game rules.
  await page.evaluate(() => {
    const s = window.humanRun.game!.scene.getScene('lamp') as unknown as { overlay: { state: import('../src/rules/battle').Battle } };
    s.overlay.state = { ...s.overlay.state, enemy: { ...s.overlay.state.enemy, health: 1 } };
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('.cutscene[data-encounter="human"]')).toBeVisible();
  await page.locator('.cutscene-skip').click();
  await expect(page.locator('.reclamation-count')).toContainText('1 / 5');
  await expect(page.locator('[data-memory="trial"]')).toHaveAttribute('data-returned', 'true');
  await expect(page.locator('.reclamation-note')).toContainText('Five brands');
  await page.evaluate(() => {
    const s = window.humanRun.game!.scene.getScene('lamp') as unknown as { overlay: { state: import('../src/rules/battle').Battle; render: () => void } };
    s.overlay.state = { ...s.overlay.state, phase: 'player', enemy: { ...s.overlay.state.enemy, health: 1 }, party: s.overlay.state.party.map(member => ({ ...member, acted: false })) }; s.overlay.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('.reclamation-count')).toContainText('5 / 5');
  await expect(page.locator('#battle-turn')).toContainText('What happens next is your choice');
  await page.getByRole('button', { name: 'Hear him out', exact: true }).click();
  await expect(page.locator('#speaker')).toHaveText('THE HUMAN');
  await expect(page.locator('#dialogue-text')).toContainText('on his knees'); await page.locator('#continue').click();
  await expect(page.getByRole('button', { name: /Spare him/ })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!).lost)).toEqual([]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).coins)).toBe(30);
  expect(errors).toEqual([]);
});
