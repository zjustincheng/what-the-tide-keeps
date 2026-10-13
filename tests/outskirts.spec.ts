import { test, expect, type Page } from './fixtures';
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

// Every new place off the roads can be reached from its road and left again.
const WAYS: [from: string, spawn: string, x: number, y: number, prompt: string, to: string, back: string, bx: number, by: number][] = [
  ['downs', 'from-fields', 112, 612, 'Go down the sunken lane to the orchard', 'orchard', 'Climb back up to the downs', 320, 28],
  ['border-road', 'from-farm', 28, 336, 'Follow the white track to the quarry', 'quarry', 'Go back to the border road', 612, 240],
  ['drove', 'from-downs', 868, 176, 'Follow the sheep track up to the huts', 'shieling', 'Go back down to the drove road', 28, 208],
  ['harbour', 'from-square', 740, 128, 'Go into the lanes behind the warehouses', 'lanes', 'Go back out to the harbour', 28, 240],
  ['far-bank', 'from-wickmere', 240, 452, 'Take the cutters\' track south to the peat', 'peat', 'Go back up to the far bank', 288, 28],
  ['open-water', 'from-port', 740, 240, 'Ride the current east, to the sunken boats', 'fleet', 'Ride the current back west', 28, 224],
];
for (const [from, spawn, x, y, prompt, to, back, bx, by] of WAYS) test(`off the road: ${from} to ${to} and back`, async ({ page }) => {
  await start(page, { flags: ['hyena-slain', 'octopus-free', 'deserted', 'boar-defeated', 'channel-firm'] }, from, spawn);
  await go(page, from, x, y, prompt, to);
  await go(page, to, bx, by, back, from);
});

test('the orchard: once the heap in the old tree is dead, the hare gives up the knife', async ({ page }) => {
  await start(page, { flags: ['orchard-cleared'] }, 'orchard', 'from-downs');
  await go(page, 'orchard', 520, 132, 'Speak to the hare');
  await expect(page.locator('#dialogue-text')).toContainText('weevil husks');
  await talk(page);
  expect((await saved(page)).found).toContain('grafting-knife');
});

test('the quarry: the chain stays on until the overseer is dead', async ({ page }) => {
  await start(page, { flags: ['overseer-slain'] }, 'quarry', 'from-border');
  await go(page, 'quarry', 216, 296, 'Speak to the mole');
  await talk(page, 'Break the chain');
  const world = await saved(page);
  expect(world.flags).toContain('quarrymen-freed');
  expect(world.found).toContain('cutters-wedge');
});

test('the lanes: the rat\'s son comes up out of the cistern', async ({ page }) => {
  await start(page, { flags: [] }, 'lanes', 'from-harbour');
  await go(page, 'lanes', 328, 420, 'Lift the grate and climb down');
  await expect(page.locator('#dialogue-text')).toContainText('bars as thick as a wrist');
  await talk(page);
  await go(page, 'lanes', 152, 392, 'Speak to the rat');
  await talk(page, 'I\'ll go down');
  await go(page, 'lanes', 328, 420, 'Lift the grate and climb down', 'cistern');
  // Whatever stands in the water has been put down.
  await start(page, { flags: ['cistern-asked', 'cistern-cleared'] }, 'cistern', 'spawn');
  await go(page, 'cistern', 440, 56, 'Speak to the boy');
  await talk(page);
  expect((await saved(page)).flags).toContain('ratling-home');
  await go(page, 'cistern', 256, 360, 'Climb back up to the yard', 'lanes');
  await go(page, 'lanes', 152, 392, 'Speak to the rat');
  await talk(page);
  expect((await saved(page)).found).toContain('tin-cup');
});

test('the peat: the oldest body has your brand, and its iron in its hand', async ({ page }) => {
  await start(page, { flags: ['hyena-slain'] }, 'peat', 'from-far-bank');
  await go(page, 'peat', 504, 380, 'Look at the oldest body');
  await expect(page.locator('#dialogue-text')).toContainText('lizard');
  await talk(page, 'Open his hand');
  expect((await saved(page)).found).toContain('brand-iron');
});
