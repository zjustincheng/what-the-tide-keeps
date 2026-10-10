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
const MARSH_DONE = ['bear-free', 'boar-defeated', 'vulture-free', 'hyena-slain', 'frog-free', 'viper-slain'];

test('the holds\' gate opens after the marsh; on the climb, big signatures can be nothing and small ones something', async ({ page }) => {
  await start(page, { flags: ['bear-free', 'boar-defeated', 'vulture-free', 'hyena-slain'] }, 'rookery-road', 'from-keep');
  await go(page, 'rookery-road', 424, 60, 'Go through the holds\' gate');
  await expect(page.locator('#dialogue-text')).toContainText('BY ORDER OF THE HOUSE');
  await talk(page);
  await start(page, { flags: MARSH_DONE }, 'rookery-road', 'from-keep');
  await go(page, 'rookery-road', 424, 60, 'Go through the holds\' gate', 'climb');
  // The crack in the rock shows almost nothing.
  expect(await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    return game.scene.getScene('climb').foes.find((foe: { point: string }) => foe.point === 'spider').signature.list[1].text;
  })).toBe('◇ 1');
  // A big signature on the ledge comes apart when touched.
  await place(page, 'climb', 296, 412);
  await page.keyboard.down('w');
  await expect(page.locator('#sneaking')).toHaveText('A DECOY');
  await page.keyboard.up('w');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('the duellist\'s mana never moves; past him the hero climbs alone, hiding from the falcons, to the lever and the archive', async ({ page }) => {
  await start(page, { flags: MARSH_DONE }, 'hold', 'from-climb');
  await go(page, 'hold', 24, 312, 'Climb the cliff alone');
  await expect(page.locator('#dialogue-text')).toContainText('Nobody climbs past him');
  await talk(page);
  await touch(page, 'hold', 72, 328, 'House duellist');
  await expect(page.locator('#enemy-mana')).toHaveText('Mana 2');
  await win(page);
  let world = await saved(page);
  expect(world.flags).toContain('duellist-beaten');
  expect(world.found).toContain('liars-charm');
  await go(page, 'hold', 24, 312, 'Climb the cliff alone', 'upper');
  // Up here the hero is alone.
  await expect(page.locator('.hud-member')).toHaveCount(1);
  // Seen by a falcon with his mana showing, he is thrown back down.
  await place(page, 'upper', 200, 300);
  await expect.poll(() => at(page, 'hold')).not.toBeNull();
  await expect(page.locator('#speaker')).toHaveText('THROWN OUT');
  await talk(page);
  // Hiding his mana, he walks right past.
  await go(page, 'hold', 24, 312, 'Climb the cliff alone', 'upper');
  await page.keyboard.press('q');
  await expect(page.locator('#sneaking')).toBeVisible();
  await place(page, 'upper', 200, 300);
  await page.waitForTimeout(400);
  expect(await at(page, 'upper')).not.toBeNull();
  // Clear of the falcons, he lets his mana show again.
  await place(page, 'upper', 536, 216);
  await page.keyboard.press('q');
  await go(page, 'upper', 536, 216, 'Pull the stair lever');
  await talk(page);
  await go(page, 'upper', 104, 152, 'Slip into the archive', 'archive');
  await go(page, 'archive', 88, 152, 'Read the order');
  await talk(page);
  await expect(page.locator('#memory-status')).toContainText('one found: the laboratory');
  await go(page, 'archive', 232, 216, 'Speak to the ram');
  await talk(page);
  world = await saved(page);
  expect(world.flags).toEqual(expect.arrayContaining(['stair-open', 'lab-remembered', 'inquisitor-spoke']));
});

test('the cuckoo wears the lord\'s face, then a friend\'s; strike the one whose mana never moves', async ({ page }) => {
  await start(page, { flags: [...MARSH_DONE, 'duellist-beaten', 'stair-open', 'lab-remembered'] }, 'hold', 'from-climb');
  await go(page, 'hold', 344, 248, 'Climb the great stair', 'hall-of-house');
  await go(page, 'hall-of-house', 200, 104, 'Speak to the lord');
  await talk(page, 'You.re not the lord');
  await expect(page.getByRole('heading', { name: 'The lord of the house' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bear strike ally' })).toBeVisible();
  // He slips into the party as the bear: strike at the bear.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    const view = game.scene.getScenes(true)[0].overlay;
    view.state = { ...view.state, impostor: { as: 'bear', shown: 12 } };
    view.render();
  });
  await expect(page.locator('#enemy-condition')).toHaveText('Gone from his chair. He is among you.');
  await page.locator('.member-card[data-member="vulture"] select').selectOption('bear');
  await page.getByRole('button', { name: 'Vulture strike ally' }).click();
  await expect(page.getByRole('log')).toContainText('The cuckoo tumbles out of the shape');
  await win(page);
  expect((await saved(page)).flags).toContain('cuckoo-slain');
  // The rookery opens, and there is a letter for you.
  await start(page, { flags: [...MARSH_DONE, 'cuckoo-slain'] }, 'hold', 'from-climb');
  await go(page, 'hold', 624, 344, 'Search the undelivered letters');
  await talk(page);
  expect((await saved(page)).flags).toContain('octopus-letter');
});
