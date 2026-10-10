import { test, expect, type Page } from '@playwright/test';

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
// Jump straight to an area; walking there is covered by the road and quest checks.
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
// These checks are about the fight, so the hero has already talked to him and challenged him.
async function challenged(page: Page) {
  await page.evaluate(async () => {
    const { loadWorld, saveWorld } = await import('/src/storage/world.ts');
    saveWorld({ ...loadWorld(), flags: [...loadWorld().flags, 'boar-challenged'] });
  });
}
async function meetBoar(page: Page) {
  await challenged(page);
  await visit(page, 'boar-farm');
  await place(page, 'boar-farm', 256, 196);
  await page.keyboard.down('s');
  await expect(page.getByRole('heading', { name: 'The boar' })).toBeVisible();
  await page.keyboard.up('s');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?practice');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});

test('striking a follower lands on the boar and makes him furious', async ({ page }) => {
  await meetBoar(page);
  await expect(page.getByRole('heading', { name: 'Badger' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Attack target' }).selectOption({ label: 'Badger' });
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('throws himself in front of the badger');
  await expect(page.locator('#enemy-mana')).toContainText('Fury 3');
  await expect(page.getByRole('meter', { name: 'Badger health' })).toHaveAttribute('aria-valuenow', '100');
});

test('fighting the boar directly frees the grain and changes the farmland', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await meetBoar(page);
  // The bear guards; the others strike the boar himself.
  // When he first goes down, he gets back up after a short scene; click through it whenever it plays.
  const throughScene = async () => { while (await page.locator('.cutscene').count()) await page.locator('.cutscene-next').click(); };
  for (let round = 1; await page.locator('.battle').getAttribute('data-phase') !== 'victory'; round++) {
    expect(round).toBeLessThan(16);
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · 3 actions remaining`);
    for (const action of ['Bear support', 'Chameleon attack', 'Vulture attack']) {
      await throughScene();
      if (await page.locator('.battle').getAttribute('data-phase') === 'player') await page.getByRole('button', { name: action, exact: true }).click();
    }
    await throughScene();
    await expect(page.locator('.battle')).not.toHaveAttribute('data-phase', 'enemy', { timeout: 20000 });
  }
  await expect(page.locator('.battle')).toHaveAttribute('data-phase', 'victory');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  // The brand offers the way back to the priest; not yet.
  await expect(page.locator('#speaker')).toHaveText('THE BRAND');
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Not yet/ }).click();
  while (await page.locator('#dialogue').isVisible()) await page.getByRole('button', { name: 'Continue' }).click();
  await place(page, 'boar-farm', 256, 212);
  await expect(page.locator('#prompt')).toContainText('Examine the cup');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('gilded cup');
  await page.keyboard.press('Escape');
  await place(page, 'boar-farm', 216, 216);
  await expect(page.locator('#prompt')).toContainText('Speak to the badger');
  await page.keyboard.press('e'); await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('No fur on him.');
  await page.keyboard.press('Escape');
  // The boar stays beaten after a reload, and Millbrook has heard.
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await visit(page, 'boar-farm');
  await place(page, 'boar-farm', 256, 196);
  await page.keyboard.down('s'); await page.waitForTimeout(400); await page.keyboard.up('s');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await visit(page, 'town');
  await place(page, 'town', 88, 124);
  await expect(page.locator('#prompt')).toContainText('Speak to the reeve');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('The carts went through at dawn.');
  expect(errors).toEqual([]);
});

test('brought down the first time, the boar gets back up after a scene, as his second stage', async ({ page }) => {
  await meetBoar(page);
  await expect(page.locator('#battle-title')).toHaveText('Stand together.');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  // The scene plays line by line before anything else moves.
  const scene = page.locator('.cutscene');
  await expect(scene).toHaveAttribute('aria-label', 'The boar, cornered');
  await expect(scene.locator('.cutscene-line')).toHaveText('The boar goes down on his knees in the ash of his own house.');
  await scene.getByRole('button', { name: /Continue/ }).click();
  await expect(scene.locator('.cutscene-speaker')).toHaveText('THE BADGER');
  // The speaker appears as themselves, and the line types out.
  await expect(scene.locator('img')).toHaveAttribute('src', /badger\.svg/);
  await expect(scene.locator('.cutscene-line')).toHaveText("Stay down! It's done. Stay down!");
  await scene.getByRole('button', { name: /Continue/ }).click();
  await expect(scene.locator('.cutscene-line')).toHaveText('I stayed down last time.');
  await scene.getByRole('button', { name: /Continue/ }).click();
  await expect(scene.locator('.cutscene-line')).toHaveText('He gets up. Smoke is rising off his bristles.');
  await scene.getByRole('button', { name: /Continue/ }).click();
  await expect(scene).toHaveCount(0);
  await expect(page.locator('#battle-title')).toHaveText('The boar, cornered.');
  await expect(page.locator('.battle-heading .eyebrow')).toHaveText('SECOND STAGE');
  await expect(page.getByRole('meter', { name: 'The boar health' })).not.toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('#enemy-intent')).toContainText('A charge is coming');
});
