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

// Rig the open fight so the next hit wins it, for checks about what winning unlocks.
export async function win(page: Page) {
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, enemy: { ...view.state.enemy, health: 1 } };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Return to the church' }).click();
}

// Everyone attacks; each enemy turn downs the member showing the most mana until the party wipes.
export async function lose(page: Page) {
  await doom(page);
  for (const [round, living] of [[1, ['Chameleon', 'Bear', 'Vulture']], [2, ['Chameleon', 'Vulture']], [3, ['Vulture']]] as const) {
    await expect(page.locator('#battle-turn')).toHaveText(`Round ${round} · ${living.length} actions remaining`);
    for (const name of living) await page.getByRole('button', { name: `${name} attack`, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
}
