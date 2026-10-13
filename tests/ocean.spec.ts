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
const HOLDS_DONE = ['bear-free', 'boar-defeated', 'vulture-free', 'hyena-slain', 'frog-free', 'viper-slain', 'cuckoo-slain'];
const AT_SEA = [...HOLDS_DONE, 'deserted', 'octopus-met', 'shark-slain', 'octopus-free'];

test('out to sea by night on the seal\'s boat; in Wrecktown, a stranger knows your name', async ({ page }) => {
  // By day she won't go.
  await start(page, { flags: HOLDS_DONE, clock: 0.3 }, 'creek', 'from-causeway');
  await go(page, 'creek', 200, 104, 'Speak to the seal');
  await talk(page, 'Take me out to sea');
  expect(await at(page, 'creek')).not.toBeNull();
  await start(page, { flags: HOLDS_DONE, clock: 0.8 }, 'creek', 'from-causeway');
  await go(page, 'creek', 200, 104, 'Speak to the seal');
  await talk(page, 'Take me out to sea');
  await expect.poll(() => at(page, 'outlaw-port')).not.toBeNull();
  expect((await saved(page)).flags).toContain('deserted');
  // The currents need someone who knows the sea.
  await go(page, 'outlaw-port', 624, 312, 'Ride the currents out to sea');
  await expect(page.locator('#dialogue-text')).toContainText('Nobody from the land could ride them');
  await talk(page);
  // The hooded sailor, the shark at the next rail, and then the hood comes off.
  await go(page, 'outlaw-port', 456, 312, 'Speak to the sailor');
  await expect(page.locator('#dialogue-text')).toContainText('Too many arms');
  await talk(page, 'Who are you');
  await touch(page, 'outlaw-port', 392, 296, 'Shark enforcer');
  await win(page);
  await go(page, 'outlaw-port', 456, 312, 'Speak to the sailor');
  await talk(page, 'Come with us');
  expect((await saved(page)).flags).toContain('octopus-free');
  await go(page, 'outlaw-port', 624, 312, 'Ride the currents out to sea', 'open-water');
});

test('a death at sea costs two memories', async ({ page }) => {
  await start(page, { flags: AT_SEA }, 'open-water', 'from-port');
  await touch(page, 'open-water', 680, 104, 'Mirror eel');
  await doom(page);
  await attackUntilWiped(page);
  await page.getByRole('button', { name: 'Wake at the cot' }).click();
  await expect(page.getByRole('region', { name: 'What the tide took' })).toHaveCount(2);
  await expect(page.getByRole('dialog')).toContainText('the tide took twice');
});

test('the pens, the kraken\'s grave, and the cuttlefish, who throws your spells back', async ({ page }) => {
  await start(page, { flags: [...AT_SEA, 'squid-freed', 'crab-freed', 'pens-freed'] }, 'open-water', 'from-port');
  await go(page, 'open-water', 72, 590, 'Swim in to the fleet', 'sea-pens');
  await go(page, 'sea-pens', 152, 184, 'Look at the nets');
  await talk(page, 'Cut the nets');
  await go(page, 'sea-pens', 88, 40, 'Speak to the old seal');
  await talk(page);
  expect((await saved(page)).found).toContain('elder-pearl');
  // The reef waits until you have seen what the kraken was.
  // Take the octopus in: the vulture and the frog wait.
  await start(page, { flags: [...AT_SEA, 'elder-thanked'], found: ['elder-pearl'], waiting: ['vulture', 'frog'] }, 'open-water', 'from-port');
  await go(page, 'open-water', 392, 40, 'Dive down to the cuttlefish');
  await expect(page.locator('#dialogue-text')).toContainText('Go and see the kraken first');
  await talk(page);
  await go(page, 'open-water', 712, 590, 'Wade onto the sandbar', 'kraken-grave');
  await go(page, 'kraken-grave', 120, 264, 'Dig at the sand');
  await talk(page);
  await go(page, 'kraken-grave', 20, 184, 'Wade back into the open water', 'open-water');
  await go(page, 'open-water', 392, 40, 'Dive down to the cuttlefish', 'reef');
  await go(page, 'reef', 200, 136, 'Speak to the cuttlefish');
  await talk(page, 'Then it ends here');
  await expect(page.getByRole('heading', { name: 'The cuttlefish' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Octopus support', exact: true })).toBeVisible();
  await win(page);
  expect((await saved(page)).flags).toContain('cuttlefish-slain');
});
