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

// The cuckoo's borrowed blade: its ring stops part-way and holds, so a press on the usual beat is taken in by the feint.
async function faceTheCuckoo(page: Page) {
  await enterLocust(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const { createBattle } = await import('/src/rules/battle.ts');
    const view = game.scene.getScene('church').overlay;
    view.state = createBattle('cuckoo', [], { roster: ['chameleon', 'bear', 'vulture'] });
    view.render();
  });
  await attackAll(page);
  await expect(page.locator('.dodge-ring[data-feint]')).toHaveCount(1);
  await expect(page.locator('.dodge-call')).toContainText('Borrowed blade');
}

test('a feint holds the ring: pressing on the usual beat is taken in, waiting for the close dodges', async ({ page }) => {
  await faceTheCuckoo(page);
  const saw = await recordDodgeCalls(page);
  const feint = await page.evaluate(async () => {
    const { createBattle, intent, timing } = await import('/src/rules/battle.ts');
    return timing(intent({ ...createBattle('cuckoo'), round: 1 })).feint;
  });
  // Where an ordinary ring would have closed.
  await pressAt(page, -feint);
  await saw('Taken in by the feint · hit.');
});

test('a feint\'s ring stops dead and shakes in place, then closes at the usual pace', async ({ page }) => {
  await faceTheCuckoo(page);
  const sizes = await page.evaluate(async () => {
    const { createBattle, intent, timing, FEINT_AT } = await import('/src/rules/battle.ts');
    const { lead, feint, impact: delay } = timing(intent({ ...createBattle('cuckoo'), round: 1 }));
    const battle = document.querySelector<HTMLElement>('.battle')!;
    const start = Number(battle.dataset.impact) - delay;
    const size = () => new DOMMatrix(getComputedStyle(document.querySelector('.dodge-ring-close')!).transform).a;
    const at = (t: number) => new Promise<number>(resolve => setTimeout(() => resolve(size()), start + t - performance.now()));
    const stop = lead * FEINT_AT;
    return { early: await at(stop * 0.5), held: await at(stop + feint * 0.15), stillHeld: await at(stop + feint * 0.85), closing: await at(delay - 120) };
  });
  expect(sizes.early).toBeGreaterThan(1.9);
  expect(sizes.held).toBeCloseTo(1.8, 1);
  expect(sizes.stillHeld).toBeCloseTo(1.8, 1);
  expect(sizes.closing).toBeGreaterThan(1); expect(sizes.closing).toBeLessThan(1.6);
  await expect(page.locator('.dodge-hint, .dodge-bar')).toContainText('wait for it to move again');
});

test('waiting out the feint dodges the cut', async ({ page }) => {
  await faceTheCuckoo(page);
  const saw = await recordDodgeCalls(page);
  await pressAt(page, 0);
  await saw('Dodged!');
});

test('a heavy blow shows itself: a red ring, and the call says so', async ({ page }) => {
  await enterLocust(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const { createBattle, HEAVY } = await import('/src/rules/battle.ts');
    const view = game.scene.getScene('church').overlay;
    view.state = { ...createBattle('hound', [], { roster: ['chameleon', 'bear', 'vulture'] }), round: HEAVY.from };
    view.render();
  });
  await attackAll(page);
  await expect(page.locator('.dodge-ring[data-heavy]')).toHaveCount(1);
  await expect(page.locator('.dodge-call')).toContainText('Heavy · Snap');
  await page.screenshot({ path: test.info().outputPath('heavy.png') });
});
