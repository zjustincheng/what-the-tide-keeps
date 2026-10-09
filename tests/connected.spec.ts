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
async function start(page: Page, flags: string[], key: string, spawn: string) {
  await page.goto('/');
  await page.evaluate(flags => localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags, carried: [], found: [], coins: 0 })), flags);
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

test('from the fen to the weir, up the otters\' stair to the tarn, and the ladder to the pass', async ({ page }) => {
  await start(page, ['bear-free', 'boar-defeated'], 'fen', 'from-fields');
  await go(page, 'fen', 608, 24, 'Follow the path up to the weir', 'weir');
  // The stair is hidden until the otters show it.
  await go(page, 'weir', 128, 24, "Climb the smugglers' stair");
  await expect(page.locator('#dialogue-text')).toContainText('only the otters know it');
  await talk(page);
  await go(page, 'weir', 456, 236, 'Speak to the goose');
  await talk(page, 'The bear would like the key');
  await go(page, 'weir', 312, 246, 'Speak to the caged otter');
  await talk(page, 'Open the cage');
  await go(page, 'weir', 128, 24, "Climb the smugglers' stair", 'tarn');
  // The ladder up is tied off above until someone lets it down from the pass.
  await go(page, 'tarn', 680, 240, 'Climb the rope ladder to the pass');
  await expect(page.locator('#dialogue-text')).toContainText('out of reach');
  await talk(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('tarn').scene.start('pass', { spawn: 'from-border' });
  });
  await expect.poll(() => at(page, 'pass')).not.toBeNull();
  await go(page, 'pass', 56, 632, 'Examine the rope ladder');
  await talk(page, 'Untie it and let it down');
  await go(page, 'pass', 24, 640, 'Climb down the rope ladder to the tarn', 'tarn');
});

test('the drove road runs from the downs to a gate that opens from the battlefield side', async ({ page }) => {
  await start(page, ['bear-free', 'boar-defeated'], 'downs', 'from-fields');
  await go(page, 'downs', 936, 160, 'Take the drove road', 'drove');
  await go(page, 'drove', 712, 30, 'Go through the gate to the battlefield');
  await expect(page.locator('#dialogue-text')).toContainText('barred from the far side');
  await talk(page);
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts');
    game.scene.getScene('drove').scene.start('battlefield', { spawn: 'from-fort' });
  });
  await expect.poll(() => at(page, 'battlefield')).not.toBeNull();
  await go(page, 'battlefield', 336, 600, 'Examine the gate');
  await talk(page, 'Lift the bar');
  await go(page, 'battlefield', 336, 624, 'Take the drove road down', 'drove');
});
