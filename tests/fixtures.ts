import { test as base, expect } from '@playwright/test';
export { expect, type Page } from '@playwright/test';

// Every illustrated story that plays only once. Checks that aren't about the stories start with them already seen.
const ONE_TIME_STORIES = ['prologue', 'krakenSlain', 'waking', 'bear', 'vulture', 'transfer', 'boar', 'hyena', 'viper', 'cuckoo', 'cuttlefish',
  'boarAfter', 'hyenaAfter', 'viperAfter', 'cuckooAfter', 'cuttlefishAfter', 'laboratory', 'kraken', 'bearChain', 'vultureStone', 'frogDropper', 'octopusKnot', 'humanChallenge', 'human'];

// The game opens on a title screen and starts when Play is pressed. Checks written before the title screen go straight
// to the game: after every load, this presses Play for them, and waits for the game to exist.
// storiesSeen: start with the one-time stories already watched (the default), so a check about a fight isn't held up by them.
// Stories that play every time, like waking after a death, are skipped whenever they stand in the way of a click.
export const test = base.extend<{ storiesSeen: boolean }>({
  storiesSeen: [true, { option: true }],
  page: async ({ page, storiesSeen }, use) => {
    if (storiesSeen) await page.addInitScript(ids => {
      if (!localStorage.getItem('tide-keeps.scenes.v1')) localStorage.setItem('tide-keeps.scenes.v1', JSON.stringify(ids));
    }, ONE_TIME_STORIES);
    if (storiesSeen) await page.addLocatorHandler(page.locator('.cinematic'), async () => {
      await page.locator('.cinema-skip').click().catch(() => undefined);
    }, { noWaitAfter: true });
    const pastTitle = async () => {
      const play = page.locator('#title-play');
      if (!(await play.isVisible().catch(() => false))) return;
      await play.click();
      await expect.poll(() => page.evaluate(async () => Boolean((await import(/* @vite-ignore */ '/src/main.ts')).game)), { timeout: 10000 }).toBe(true);
    };
    const goto = page.goto.bind(page), reload = page.reload.bind(page);
    page.goto = async (...args: Parameters<typeof goto>) => { const response = await goto(...args); await pastTitle(); return response; };
    page.reload = async (...args: Parameters<typeof reload>) => { const response = await reload(...args); await pastTitle(); return response; };
    await use(page);
  },
});
