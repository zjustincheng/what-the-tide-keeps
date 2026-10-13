import { test, expect } from './fixtures';

test.use({ storageState: { cookies: [], origins: [] }, storiesSeen: false });

test('the opening can be skipped into the kraken fight, and replayed later without changing progress', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Before the tide turned', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('opening.png') });
  // Skipping the story still leaves the fight that teaches combat.
  await page.keyboard.press('Escape');
  await expect(page.locator('.cinematic')).toHaveCount(0);
  await expect(page.locator('#battle-title')).toHaveText('The Kraken');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.scenes.v1') ?? '[]'))).toContain('prologue');
  // Once the opening has been seen through, it doesn't play again; it can be revisited from Settings.
  await page.evaluate(() => localStorage.setItem('tide-keeps.scenes.v1', JSON.stringify(['prologue', 'krakenSlain', 'waking'])));
  await page.reload();
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect(page.locator('.cinematic')).toHaveCount(0);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Revisit memories', exact: true }).click();
  const before = await page.evaluate(() => localStorage.getItem('tide-keeps.memory.v1'));
  await page.getByRole('button', { name: 'What the tide keeps', exact: true }).click();
  await page.keyboard.press('Tab');
  await expect(page.locator('.cinema-skip')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Revisit memories', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('tide-keeps.memory.v1'))).toBe(before);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('#game')).not.toHaveAttribute('inert', '');
  expect(errors).toEqual([]);
});

test('laboratory flashback waits for dialogue to close and leaves the ending memories intact', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Skip scene/ }).click();
  await page.evaluate(async () => {
    const { game } = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    game.scene.getScenes(true)[0].scene.start('whitehouse');
  });
  await expect(page.locator('#location-place')).toContainText('white house');
  await page.evaluate(async () => {
    const { game } = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    const scene = game.scene.getScenes(true)[0];
    scene.effect({ set: ['house-seen', 'lab-remembered'] });
    scene.say({ speaker: 'THE RECORDS', lines: ['The guard opened a door.'] });
  });
  await expect(page.locator('.cinematic')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'The open door', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Skip scene/ }).click();
  await expect(page.locator('.cinematic')).toHaveCount(0);
  const flags = await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.world.v1')!).flags);
  expect(flags).toEqual(expect.arrayContaining(['house-seen', 'lab-remembered']));
  expect(flags).not.toContain('human-seated');
});

test('resurrection scene resumes the outstanding memory loss and does not forgive the debt', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name'], pending: true }));
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: [], carried: [], deaths: 1 }));
  });
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Something does not return', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Skip scene/ }).click();
  await expect(page.getByRole('button', { name: 'Stand up', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!).pending)).toBe(true);
  await page.getByRole('button', { name: 'Stand up', exact: true }).click();
  const memory = await page.evaluate(() => JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!));
  expect(memory.pending).toBe(false);
  expect(memory.lost).toHaveLength(3);
});

test('mobile reduced-motion scenes remain readable and keyboard operable', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Reduced motion shows each line whole, at once.
  await expect(page.locator('.cinema-line')).toContainText('The harbour bell has not stopped.');
  expect(await page.locator('.cinema-line span').textContent()).toContain('The bear holds a broken gate');
  await page.getByRole('button', { name: 'Continue', exact: false }).click();
  await expect(page.locator('.cinema-caption')).toHaveText('THE OTHERS');
  await page.screenshot({ path: info.outputPath('mobile-memory.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('.cinematic')).toHaveCount(0);
});

test('boss introduction hands control to combat and effects do not consume extra actions', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'vulture-free', 'boar-challenged'], carried: [], found: [] })));
  await page.goto('/');
  await expect(page.locator('#hud')).toContainText('Vulture');
  await page.evaluate(async () => {
    const { game } = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    game.scene.getScenes(true)[0].scene.start('boar-farm');
  });
  await expect(page.locator('#location-place')).toContainText('burned farm');
  await page.evaluate(async () => {
    const { game } = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    const scene = game.scene.getScenes(true)[0];
    scene.beginBattle(scene.foes.find(foe => foe.encounter === 'boar'));
  });
  await expect(page.getByRole('dialog', { name: 'What they burned', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Skip scene/ }).click();
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await expect(page.locator('.combat-particle').first()).toBeAttached();
  await expect(page.locator('.member-card[data-member="chameleon"]')).toHaveAttribute('data-acted', 'true');
  await expect(page.locator('.member-card[data-member="bear"]')).toHaveAttribute('data-acted', 'false');
  await page.locator('.member-card[data-member="bear"] summary').filter({ hasText: 'Spellcraft' }).click();
  await page.getByRole('button', { name: 'Bear barrier', exact: true }).click();
  await expect(page.locator('.member-card[data-member="bear"]')).toHaveAttribute('data-barrier', 'true');
  await page.screenshot({ path: info.outputPath('combat.png') });
  await page.evaluate(async () => {
    const { game } = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src);
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } };
  });
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.locator('.cutscene')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.cutscene-skip')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.cutscene')).toHaveCount(0);
  await expect(page.locator('.party-battle')).toHaveAttribute('data-stage', '2');
  expect(errors).toEqual([]);
});
