import { test, expect, type Page } from './fixtures';
import { attackUntilWiped, doom, win } from './helpers';

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
const panel = (page: Page, field: string) => page.evaluate(async field => {
  const { game } = await import('/src/main.ts');
  return game.scene.getScenes(true)[0].overlay[field];
}, field);
const LATE = ['bear-free', 'boar-defeated', 'vulture-free', 'hyena-slain', 'frog-free', 'viper-slain'];

test('the Talon Ring: pay to go in, then the bouts come one straight after another, and nobody dies', async ({ page }) => {
  await start(page, { flags: LATE, coins: 5 }, 'hold', 'from-climb');
  await go(page, 'hold', 680, 368, 'Go into the Talon Ring', 'ring');
  // Too poor to go in.
  await go(page, 'ring', 200, 264, 'Speak to the shrike');
  await talk(page, 'Go in');
  await expect(page.getByRole('heading', { name: 'Cliff hornet' })).toHaveCount(0);
  await start(page, { flags: LATE, coins: 25 }, 'ring', 'from-hold');
  await go(page, 'ring', 200, 264, 'Speak to the shrike');
  await talk(page, 'Go in');
  // Two hornets at once.
  await expect(page.getByRole('heading', { name: 'Cliff hornet' })).toBeVisible();
  await expect(page.locator('.follower')).toHaveCount(1);
  await expect(page.locator('#flee')).toHaveText('Yield');
  await win(page);
  // Straight into the next bout: no ringmaster, no rest.
  await expect(page.getByRole('heading', { name: 'Crag spider' })).toBeVisible();
  await expect(page.getByRole('log')).toContainText('No water, no rest');
  let world = await saved(page);
  expect(world.flags).toContain('ring-1');
  expect(world.coins).toBe(25 - 20 + 15);
  // Lost: walked out hurt, with what was won before.
  await doom(page);
  await attackUntilWiped(page).catch(() => undefined);
  await page.getByRole('button', { name: 'Leave the ring' }).click();
  await expect(page.locator('#dialogue-text')).toContainText('15 coins in prize money');
  await talk(page);
  world = await saved(page);
  expect(world.deaths ?? 0).toBe(0);
  expect(world.flags).not.toContain('ring-2');
  expect(world.coins).toBe(20);
  expect(await at(page, 'ring')).not.toBeNull();
});

test('the shell game on Wickmere\'s decks: follow the pebble', async ({ page }) => {
  await start(page, { flags: LATE, coins: 10 }, 'wickmere', 'from-causeway');
  await go(page, 'wickmere', 232, 248, 'Speak to the mink');
  await talk(page, 'Play for 5 coins');
  await expect(page.getByRole('heading', { name: 'Follow the pebble.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Shell 1' })).toBeEnabled({ timeout: 8000 });
  const pebble = await panel(page, 'pebble');
  await page.getByRole('button', { name: `Shell ${pebble + 1}` }).click();
  await expect(page.locator('.dice-result')).toContainText('You win 5 coins');
  await page.getByRole('button', { name: 'Done' }).click();
  expect((await saved(page)).coins).toBe(15);
});

test('arm-wrestling in the barracks: push him down before he pushes you', async ({ page }) => {
  await start(page, { flags: ['bear-free', 'boar-defeated'], coins: 10 }, 'barracks', 'spawn');
  await go(page, 'barracks', 280, 184, 'Speak to the wolf');
  await talk(page, 'Wrestle him');
  await expect(page.getByRole('heading', { name: 'Elbows on the table.' })).toBeVisible();
  await expect(page.locator('#arm-push')).toBeEnabled({ timeout: 4000 });
  // Nearly there; one more push.
  // Nearly there, and one more push in the same breath, so a busy machine can't let him push back in between.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.at = 98;
    document.querySelector<HTMLElement>('.arm')!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  });
  await expect(page.locator('.dice-result')).toContainText('You win 10 coins');
  await page.getByRole('button', { name: 'Done' }).click();
  expect((await saved(page)).coins).toBe(20);
});

test('hide and seek in Millbrook: find all three, Pip too', async ({ page }) => {
  await start(page, { flags: ['bear-free'], coins: 0 }, 'town', 'spawn');
  await go(page, 'town', 280, 216, 'Speak to the kid');
  await talk(page, 'I.ll be it');
  await go(page, 'town', 344, 56, 'Look behind the woodpile');
  await talk(page);
  await go(page, 'town', 488, 104, 'Look under the cart');
  await talk(page);
  await go(page, 'town', 24, 344, 'Look in the rain barrel');
  await talk(page);
  await go(page, 'town', 280, 216, 'Speak to the kid');
  await talk(page);
  const world = await saved(page);
  expect(world.flags).toContain('hide-found');
  expect(world.coins).toBe(5);
});
