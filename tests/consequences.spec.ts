import { test, expect, type Page } from '@playwright/test';

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
async function start(page: Page, world: object) {
  await page.goto('/');
  await page.evaluate(world => localStorage.setItem('tide-keeps.world.v1', JSON.stringify(world)), world);
  await page.reload();
  await expect.poll(() => at(page, 'church')).not.toBeNull();
}
async function visit(page: Page, key: string) {
  await page.evaluate(async key => {
    const { game } = await import('/src/main.ts');
    game.scene.getScenes(true)[0].scene.start(key, { spawn: 'spawn' });
  }, key);
  await expect.poll(() => at(page, key)).not.toBeNull();
  await page.locator('#game').focus();
}
// Talk until the replies appear, then choose one and read the answer through.
async function reply(page: Page, key: string, x: number, y: number, prompt: string, text: string) {
  await place(page, key, x, y);
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
  while (!(await page.locator('#choices').isVisible())) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('group', { name: 'Replies' }).getByRole('button', { name: text }).click();
}
// Read to the end, walking away from any questions on offer.
async function finish(page: Page) {
  while (await page.locator('#dialogue').isVisible()) {
    if (await page.locator('#choices').isVisible()) await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Continue' }).click();
  }
}

test("sparing the boar's followers sends them away and leaves the hero his tusk", async ({ page }) => {
  await start(page, { flags: ['bear-free', 'vulture-free', 'boar-defeated'], carried: [], found: [], coins: 0 });
  await visit(page, 'boar-farm');
  await reply(page, 'boar-farm', 216, 216, 'Speak to the badger', "Go. Before the reeve's watch comes.");
  await expect(page.locator('#dialogue-text')).toContainText('The badger looks at you');
  await finish(page);
  await place(page, 'boar-farm', 216, 216);
  await expect(page.locator('#prompt')).not.toContainText('Speak to the badger');
  await place(page, 'boar-farm', 56, 238);
  await expect(page.locator('#prompt')).toContainText('Dig under the fence post');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText("a boar's tusk");
});

test('reporting them puts the badger in the gibbet and pays at the reeve', async ({ page }) => {
  await start(page, { flags: ['bear-free', 'vulture-free', 'boar-defeated'], carried: [], found: [], coins: 0 });
  await visit(page, 'boar-farm');
  await reply(page, 'boar-farm', 216, 216, 'Speak to the badger', "I'm taking you to the reeve.");
  await finish(page);
  await visit(page, 'farmland');
  await place(page, 'farmland', 466, 344);
  await expect(page.locator('#prompt')).toContainText('Examine the gibbet');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText('A badger. He doesn\'t look up.');
  await page.keyboard.press('Escape');
  await visit(page, 'town');
  await place(page, 'town', 88, 124);
  await expect(page.locator('#prompt')).toContainText('Speak to the reeve');
  await page.keyboard.press('e');
  await finish(page);
  await expect(page.locator('#purse')).toHaveText('20 coins');
});

test('coin gets the hero past the innkeeper to a bed that heals the party', async ({ page }) => {
  await start(page, { flags: [], carried: [], found: [], coins: 15, wounds: { chameleon: 9 }, drained: { chameleon: 6 } });
  await visit(page, 'town');
  // The innkeeper stands in the doorway until she is paid.
  await place(page, 'town', 104, 316);
  await expect(page.locator('#prompt')).toContainText('Enter the inn');
  await page.keyboard.press('e');
  await expect(page.locator('#dialogue-text')).toContainText("she doesn't move");
  await page.keyboard.press('Escape');
  await reply(page, 'town', 120, 344, 'Speak to the innkeeper', 'Twelve coins for a bed. Back stairs.');
  await finish(page);
  await expect(page.locator('#purse')).toHaveText('3 coins');
  await place(page, 'town', 104, 316);
  await expect(page.locator('#prompt')).toContainText('Enter the inn');
  await page.keyboard.press('e');
  await expect.poll(() => at(page, 'inn')).not.toBeNull();
  await place(page, 'inn', 152, 232);
  await expect(page.locator('#prompt')).toContainText('Sleep in the bed');
  await page.keyboard.press('e');
  await finish(page);
  await expect(page.getByRole('group', { name: 'Party' }).getByRole('meter', { name: 'Chameleon health', exact: true })).toHaveAttribute('aria-valuetext', '20 of 20');
});
