import { test, expect, type Page } from './fixtures';

// A battle has to fit the screen it is played on: on a common laptop, the whole frame is in the window, and every
// hero's attack and spell is in view without scrolling. The kraken's five heroes may scroll a little, but never their attacks.
async function measure(page: Page) {
  return page.evaluate(() => {
    const box = (element: Element) => element.getBoundingClientRect();
    const panel = document.querySelector('.party-battle') as HTMLElement;
    return {
      window: innerHeight, frame: box(document.querySelector('.game-frame')!).bottom, panel: box(panel).bottom, scrolls: panel.scrollHeight - panel.clientHeight,
      attacks: [...document.querySelectorAll('[data-action="attack"]')].map(button => box(button).bottom),
      spells: [...document.querySelectorAll('[data-cast]')].map(button => box(button).bottom),
    };
  });
}
async function ready(page: Page, key: string) {
  await expect.poll(() => page.evaluate(async key => Boolean(((await import('/src/main.ts')).game?.scene.getScene(key) as unknown as { player?: { active: boolean } })?.player?.active), key)).toBe(true);
}

for (const [width, height] of [[1366, 768], [1280, 800], [1440, 900], [1920, 1080]] as const) {
  test(`an ordinary fight fits a ${width}×${height} screen`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?practice'); await ready(page, 'church');
    await page.evaluate(async () => (await import('/src/main.ts')).game!.scene.getScene('church').scene.start('farmland', { spawn: 'spawn' }));
    await ready(page, 'farmland');
    await page.evaluate(async () => { const s = (await import('/src/main.ts')).game!.scene.getScene('farmland') as unknown as { foes: { encounter: string }[]; beginBattle: (foe: unknown) => void }; s.beginBattle(s.foes.find(foe => foe.encounter === 'locust')); });
    await expect(page.locator('.party-battle')).toBeVisible();
    const fit = await measure(page);
    expect(fit.frame).toBeLessThanOrEqual(fit.window);
    expect(fit.scrolls).toBeLessThanOrEqual(1);
    for (const bottom of [...fit.attacks, ...fit.spells]) expect(bottom).toBeLessThanOrEqual(fit.panel);
  });

  test(`the kraken's five heroes can all attack on a ${width}×${height} screen`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?practice'); await ready(page, 'church');
    await page.evaluate(async () => { const { beginKrakenTutorial } = await import('/src/scenes/area/battles.ts'); beginKrakenTutorial((await import('/src/main.ts')).game!.scene.getScene('church') as never); });
    await expect(page.locator('.party-battle')).toBeVisible();
    const fit = await measure(page);
    expect(fit.attacks).toHaveLength(5);
    expect(fit.frame).toBeLessThanOrEqual(Math.max(fit.window, 880));
    for (const bottom of fit.attacks) expect(bottom).toBeLessThanOrEqual(fit.panel);
  });
}
