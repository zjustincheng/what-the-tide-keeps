import { test, expect, type Page } from '@playwright/test';
import { win } from './helpers';

// A fresh game except for what each test seeds.
test.use({ storageState: { cookies: [], origins: [] } });

const at = (page: Page, key: string) => page.evaluate(async key => {
  const { game } = await import('/src/main.ts');
  const scene = game.scene.getScene(key);
  return scene?.sys.isActive() && scene.player?.active ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null;
}, key);
const place = (page: Page, key: string, x: number, y: number) => page.evaluate(async ([key, x, y]) => {
  const { game } = await import('/src/main.ts');
  game.scene.getScene(key).player.setPosition(x, y);
}, [key, x, y] as const);
const saved = async (page: Page) => JSON.parse((await page.evaluate(() => localStorage.getItem('tide-keeps.world.v1')))!);
async function start(page: Page, world: object, key: string, spawn: string) {
  await page.goto('/');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ carried: [], found: [], coins: 0, ...world })), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
  await page.evaluate(async ([key, spawn]) => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('church').scene.start(key, { spawn });
  }, [key, spawn]);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
async function go(page: Page, from: string, x: number, y: number, prompt: string, to?: string) {
  await place(page, from, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  if (to) await expect.poll(() => at(page, to)).not.toBeNull();
}
// Read through, choosing a reply if one is named, then walk away from any further questions.
async function talk(page: Page, reply?: string) {
  if (reply) {
    while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: new RegExp(reply) }).click();
  }
  while (await page.locator('#dialogue').isVisible()) {
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
}
// Walk into a standing enemy until its fight opens.
async function touch(page: Page, key: string, x: number, y: number, heading: string) {
  await place(page, key, x, y + 20);
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  await page.keyboard.up('w');
}
const HIGHLANDS_DONE = ['bear-free', 'boar-defeated', 'vulture-free', 'hyena-slain'];

test('downriver: the queen, the ferryman\'s word, the apprentice\'s vial, and the frog', async ({ page }) => {
  // The crane takes nobody downriver until the highlands are settled.
  await start(page, { flags: ['bear-free', 'boar-defeated', 'vulture-free'] }, 'weir', 'from-fen');
  await go(page, 'weir', 264, 456, 'Take the ferry downriver');
  await expect(page.locator('#dialogue-text')).toContainText('Downriver');
  await start(page, { flags: HIGHLANDS_DONE }, 'weir', 'from-fen');
  await go(page, 'weir', 264, 456, 'Take the ferry downriver', 'causeway');
  // The channel is shut until the ferryman has a reason to teach his word.
  await start(page, { flags: HIGHLANDS_DONE }, 'wickmere', 'from-causeway');
  await go(page, 'wickmere', 584, 260, 'Speak the word, and walk across the channel');
  await expect(page.locator('#dialogue-text')).toContainText('Deep, fast water');
  await talk(page);
  // The reed-bed queen, out on the causeway.
  await start(page, { flags: HIGHLANDS_DONE }, 'causeway', 'from-weir');
  await touch(page, 'causeway', 632, 184, 'The reed-bed queen');
  await expect(page.locator('.follower h4')).toHaveText(['Wriggler', 'Wriggler']);
  await win(page);
  expect((await saved(page)).flags).toContain('brood-slain');
  await go(page, 'causeway', 744, 488, 'Walk on to Wickmere', 'wickmere');
  // The ferryman's word opens the channel.
  await go(page, 'wickmere', 584, 300, 'Speak to the beaver');
  await talk(page, 'The reed-bed queen is dead');
  expect((await saved(page)).flags).toContain('channel-firm');
  await go(page, 'wickmere', 584, 260, 'Speak the word, and walk across the channel', 'far-bank');
  // The apprentice in the storehouse, and what he carried.
  await touch(page, 'far-bank', 328, 120, 'The apprentice');
  await win(page);
  await go(page, 'far-bank', 264, 152, 'Search the sacks');
  await talk(page);
  expect((await saved(page)).carried).toEqual(['venom-vial']);
  // The apothecary needs someone who knows poison.
  await go(page, 'far-bank', 552, 344, 'Wade into the apothecary');
  await expect(page.locator('#dialogue-text')).toContainText('Something inside is breathing');
  await talk(page);
  // The frog, behind her grate, believes the vial.
  await go(page, 'far-bank', 40, 232, 'Walk back across the channel', 'wickmere');
  await go(page, 'wickmere', 552, 136, 'Enter the hospice', 'hospice');
  await go(page, 'hospice', 262, 152, 'Speak to the frog');
  await talk(page, 'It isn.t plague. It.s poison');
  const world = await saved(page);
  expect(world.flags).toContain('frog-free');
  expect(world.carried).toEqual([]);
  // Four have joined: the newest waits until someone else is sent to the bench.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('heading', { name: 'Equipment' })).toBeVisible();
  await expect(page.locator('.equipment [data-member="frog"] .bench-toggle')).toHaveText(/Waits/);
  await page.locator('.equipment [data-member="bear"] .bench-toggle').click();
  await expect(page.locator('.equipment [data-member="frog"] .bench-toggle')).toHaveText(/Fights/);
  await page.getByRole('button', { name: 'Done' }).click();
  expect((await saved(page)).bench).toBe('bear');
});

test('the viper talks, then fights: everyone starts poisoned, and the frog fights beside you', async ({ page }) => {
  await start(page, { flags: [...HIGHLANDS_DONE, 'brood-slain', 'channel-firm', 'apprentice-slain', 'frog-free'], bench: 'bear' }, 'far-bank', 'from-wickmere');
  await go(page, 'far-bank', 552, 344, 'Wade into the apothecary', 'apothecary');
  await go(page, 'apothecary', 184, 124, 'Speak to the viper');
  await talk(page, 'It ends here');
  await expect(page.getByRole('heading', { name: 'The viper' })).toBeVisible();
  await expect(page.locator('.member-card h3')).toHaveText(['Chameleon', 'Vulture', 'Frog']);
  await expect(page.locator('.member-card[data-member="frog"] .member-status')).toContainText('Poisoned');
  await expect(page.getByRole('log')).toContainText('Everyone is poisoned already');
  // Her dart poisons the viper.
  await page.getByRole('button', { name: 'Frog attack', exact: true }).click();
  await expect(page.locator('#enemy-mana')).toContainText('poisoned');
  await win(page);
  const world = await saved(page);
  expect(world.flags).toContain('viper-slain');
  // The brand offered the way back; win() said not yet.
  expect(world.found).toContain('viper-fang');
  // She lies where she fell, and still talks.
  await go(page, 'apothecary', 184, 124, 'Speak to the viper');
  await expect(page.locator('#dialogue-text')).toContainText('too tired to hold her head up');
});

test('after a region\'s lieutenant falls, the brand offers the way back to the priest', async ({ page }) => {
  await start(page, { flags: [...HIGHLANDS_DONE, 'frog-free', 'viper-challenged'] }, 'apothecary', 'spawn');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const scene = game.scene.getScene('apothecary');
    scene.player.setPosition(184, 130);
  });
  await page.keyboard.down('w');
  await expect(page.getByRole('heading', { name: 'The viper' })).toBeVisible();
  await page.keyboard.up('w');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, stage: 2, enemy: { ...view.state.enemy, health: 1 } };
    view.render();
  });
  await page.getByRole('button', { name: 'Chameleon attack', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('#speaker')).toHaveText('THE BRAND');
  await talk(page, 'Go back to the priest');
  await expect.poll(() => at(page, 'church')).not.toBeNull();
});
