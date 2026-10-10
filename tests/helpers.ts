import { expect, type Page } from '@playwright/test';

// Rig the open fight so the party cannot win: one health each against an enemy it cannot finish.
// This keeps checks about dying independent of combat tuning.
export async function doom(page: Page) {
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, party: view.state.party.map((member: object) => ({ ...member, health: 1 })), enemy: { ...view.state.enemy, health: 999, maxHealth: 999 } };
    view.render();
  });
}

// Rig the open fight so the next hit wins it, for checks about what winning unlocks: followers already down, the leader at one health,
// and a boss already in its second stage, so this fall is the last.
export async function win(page: Page) {
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, stage: 2, enemy: { ...view.state.enemy, health: 1 }, followers: view.state.followers.map((follower: object) => ({ ...follower, health: 0 })) };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  // A region's lieutenant offers the way back to the priest; tests stay where they are unless they ask.
  if (await page.locator('#dialogue').isVisible() && await page.locator('#speaker').textContent() === 'THE BRAND') {
    while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: /Not yet/ }).click();
    while (await page.locator('#dialogue').isVisible()) await page.getByRole('button', { name: 'Continue' }).click();
  }
}

// Everyone still standing attacks, round after round, until the party wipes, however many blows each enemy turn lands.
export async function lose(page: Page) {
  await doom(page);
  await attackUntilWiped(page);
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
}

export async function attackUntilWiped(page: Page) {
  const wake = page.getByRole('button', { name: 'Wake at the cot' });
  for (let round = 1; round < 10 && !(await wake.isVisible()); round++) {
    await expect(page.locator('.battle')).toHaveAttribute('data-phase', /player|defeat/, { timeout: 15000 });
    for (const name of ['Chameleon', 'Bear', 'Vulture']) {
      const attack = page.getByRole('button', { name: `${name} attack`, exact: true });
      if (await page.locator('.battle').getAttribute('data-phase') === 'player' && await attack.count() && await attack.isEnabled()) await attack.click();
    }
  }
  await expect(wake).toBeVisible({ timeout: 15000 });
}
