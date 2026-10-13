import { test, expect, type Page } from './fixtures';
import { recordDodgeCalls } from './helpers';

async function enterLocust(page: Page) {
  await page.goto('/?practice');
  await expect.poll(() => page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    return Boolean(game.scene.getScene('church')?.player);
  })).toBe(true);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').player.setPosition(335, 313);
  });
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.up('d');
}
async function attackAll(page: Page) {
  for (const name of ['Chameleon', 'Bear', 'Vulture']) await page.getByRole('button', { name: `${name} attack`, exact: true }).click();
}
// Press Space inside the page, offset from the moment the blow lands, so test timing does not depend on the driver.
// Press at a blow's impact, plus an offset. after: the impact of a blow already answered, so this waits for the next one
// to begin, inside the page, without stopping to read anything that might have changed by then.
async function pressAt(page: Page, offset: number, after?: number): Promise<number> {
  return page.evaluate(([offset, after]) => new Promise<number>(resolve => {
    const battle = document.querySelector<HTMLElement>('.battle')!;
    const wait = () => {
      const impact = Number(battle.dataset.impact);
      if (!impact || impact === after) { setTimeout(wait, 5); return; }
      setTimeout(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })); resolve(impact); }, impact - performance.now() + offset);
    };
    wait();
  }), [offset, after ?? 0] as const);
}

test('pressing as the ring closes dodges the blow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await enterLocust(page);
  const saw = await recordDodgeCalls(page);
  await attackAll(page);
  await expect(page.locator('.dodge-ring')).toHaveCount(1);
  // It strikes twice: dodge both, the second as soon as it comes.
  const first = await pressAt(page, 0);
  await pressAt(page, 0, first);
  await saw(/Mandible strike \(1 of 2\) → Bear/);
  await saw(/Mandible strike \(2 of 2\) → Bear/);
  await saw('Dodged!');
  await expect(page.getByRole('log')).toContainText('finds only air');
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await expect(page.locator('[data-member="bear"] .member-condition')).toHaveText('Unhurt');
  expect(errors).toEqual([]);
});

test('pressing too soon or not at all takes the full blow', async ({ page }) => {
  await enterLocust(page);
  const saw = await recordDodgeCalls(page);
  await attackAll(page);
  // Press the moment the prompt appears: far too soon, however slow the machine.
  await expect(page.getByRole('button', { name: /Dodge/ })).toBeVisible();
  await page.keyboard.press(' ');
  await saw('Too soon · hit.');
  await expect(page.getByRole('log')).toContainText('The mandible strike (1 of 2) catches Bear.');
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  // Hold the vulture back so the locust survives to leap.
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Bear attack', exact: true }).click();
  await page.getByRole('button', { name: 'Vulture support', exact: true }).click();
  // The heavy leap closes a ring like any blow; not pressing means it lands.
  await expect(page.locator('.dodge-call')).toContainText('Crushing leap');
  await saw(/Too slow · hit\.|Time ran out · hit\./);
  await expect(page.getByRole('log')).toContainText('The crushing leap catches');
});

test('guarded blows skip the prompt', async ({ page }) => {
  await enterLocust(page);
  await page.getByRole('button', { name: 'Bear support', exact: true }).click();
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Vulture attack', exact: true }).click();
  await expect(page.locator('#battle-turn')).toHaveText('Round 2 · 3 actions remaining');
  await expect(page.getByRole('log')).toContainText('Bear turns aside');
  await expect(page.locator('.dodge-ring')).toHaveCount(0);
});
