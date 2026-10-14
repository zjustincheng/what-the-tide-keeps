import { test, expect, type Page } from '@playwright/test';
import type { AreaScene } from '../src/scenes/AreaScene';
declare global { interface Window { questRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' });

async function ready(page: Page, key: string) {
  await page.waitForFunction(key => Boolean((window.questRun.game?.scene.getScene(key) as unknown as AreaScene | undefined)?.player?.active), key);
}
async function start(page: Page, flags: string[], lost: string) {
  await page.addInitScript(([flags, lost]) => {
    if (localStorage.getItem('tide-keeps.world.v1')) return;
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags, carried: [], found: [], coins: 50 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name', lost], pending: false }));
  }, [flags, lost] as const);
  await page.goto('/');
  await page.evaluate(async () => { window.questRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click(); await ready(page, 'church');
}
async function travel(page: Page, from: string, to: string, spawn: string) {
  await page.evaluate(([from, to, spawn]) => window.questRun.game!.scene.getScene(from).scene.start(to, { spawn }), [from, to, spawn]); await ready(page, to);
}
// Stand just off a named point, so it is the nearest thing to talk to, and speak.
async function talk(page: Page, key: string, point: string, prompt: RegExp, dx = 0, dy = -18) {
  await page.evaluate(([key, point, dx, dy]) => {
    const s = (window.questRun.game!.scene.getScene(key) as unknown as AreaScene);
    const at = s.point(point); const body = s.player.body as import('phaser').Physics.Arcade.Body;
    s.player.setPosition(at.x + dx, at.y + dy); body.reset(at.x + dx, at.y + dy); body.updateFromGameObject();
  }, [key, point, dx, dy] as const);
  await page.locator('#game').focus(); await expect(page.locator('#prompt')).toContainText(prompt); await page.keyboard.press('e');
  await expect(page.locator('#dialogue')).toBeVisible();
}
async function choose(page: Page, choice: RegExp) {
  for (let i = 0; i < 10 && !await page.getByRole('button', { name: choice }).isVisible(); i++) await page.locator('#continue').click();
  await page.getByRole('button', { name: choice }).click();
}
async function close(page: Page) { await page.keyboard.press('Escape'); await expect(page.locator('#dialogue')).toBeHidden(); }
async function receipt(page: Page, who: string, name: string, equip: boolean) {
  const award = page.locator('.keepsake-award');
  await expect(award).toContainText(`A KEEPSAKE FROM THE ${who.toUpperCase()}`);
  await expect(award).toContainText(name); await expect(award).toContainText(`You will always remember the ${who}`);
  await page.getByRole('button', { name: equip ? `Equip on the ${who}` : 'Keep in the pack', exact: true }).click();
  await expect(award).toHaveCount(0);
  return page.evaluate(() => ({ world: JSON.parse(localStorage.getItem('tide-keeps.world.v1')!), memory: JSON.parse(localStorage.getItem('tide-keeps.memory.v1')!), gear: JSON.parse(localStorage.getItem('tide-keeps.gear.v1') ?? '{}') }));
}

test('the vulture reads her line in the chaplain\'s roll, takes her page, and gives the hero her tally stone', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await start(page, ['bear-free', 'vulture-free', 'hyena-slain'], 'vulture');
  await travel(page, 'church', 'battlefield', 'from-fort');
  await talk(page, 'battlefield', 'vulture-return', /vulture/); await expect(page.locator('#dialogue-text')).toContainText('mound'); await close(page);
  await travel(page, 'battlefield', 'fort', 'from-battlefield');
  await talk(page, 'fort', 'chaplain', /chaplain/, 0, 18); await choose(page, /Show the vulture her line/);
  await choose(page, /Take the page/); await close(page);
  await travel(page, 'fort', 'battlefield', 'from-fort');
  await talk(page, 'battlefield', 'vulture-return', /vulture/); await choose(page, /Take the stone/);
  await expect(page.locator('#dialogue-text')).toContainText('warm from her'); await close(page);
  const saved = await receipt(page, 'vulture', 'The tally stone', true);
  expect(saved.world.found).toContain('tally-stone'); expect(saved.gear.vulture).toContain('tally-stone');
  expect(saved.memory.keepsakeMemories).toContain('vulture'); expect(saved.memory.lost).not.toContain('vulture');
  // She is gone from the graves now; she travels with the party.
  await expect.poll(() => page.evaluate(() => (window.questRun.game!.scene.getScene('battlefield') as unknown as { people: { texture: { key: string }; visible: boolean }[] }).people.some(person => person.texture.key === 'vulture' && person.visible))).toBe(false);
  expect(errors).toEqual([]);
});

test('the frog takes the ward book to the magistrate, who reads it to her, and she gives the hero her dropper', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await start(page, ['bear-free', 'vulture-free', 'frog-free', 'viper-slain'], 'frog');
  await travel(page, 'church', 'hospice', 'spawn');
  await talk(page, 'hospice', 'frog-return', /frog/, 0, 18); await expect(page.locator('#dialogue-text')).toContainText('grate'); await close(page);
  await talk(page, 'hospice', 'ward-book', /ward book/, 8, 16); await choose(page, /Take it to the magistrate/); await close(page);
  await travel(page, 'hospice', 'wickmere', 'from-hospice');
  await talk(page, 'wickmere', 'magistrate', /heron/, 0, 18); await choose(page, /Show him the ward book/);
  for (let i = 0; i < 4; i++) await page.locator('#continue').click();
  await expect(page.locator('#dialogue-text')).toContainText('Come back with me'); await close(page);
  await travel(page, 'wickmere', 'hospice', 'spawn');
  await talk(page, 'hospice', 'frog-return', /frog/, 0, 18); await choose(page, /Keep the dropper/); await close(page);
  const saved = await receipt(page, 'frog', 'The glass dropper', false);
  expect(saved.world.flags).toContain('frog-magistrate-accountable'); expect(saved.world.found).toContain('glass-dropper');
  expect(saved.memory.keepsakeMemories).toContain('frog');
  expect(errors).toEqual([]);
});

test('the octopus ties the church\'s net into the elder\'s count, and gives the hero a knot of it', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await start(page, ['bear-free', 'vulture-free', 'frog-free', 'octopus-free', 'cuttlefish-slain'], 'octopus');
  await travel(page, 'church', 'kraken-grave', 'from-sea');
  await talk(page, 'kraken-grave', 'octopus-return', /octopus/); await expect(page.locator('#dialogue-text')).toContainText('under the ribs'); await close(page);
  await travel(page, 'kraken-grave', 'sea-pens', 'from-sea');
  await talk(page, 'sea-pens', 'elder', /old seal/, 0, 18); await choose(page, /The octopus wants to see its knot/);
  await choose(page, /Tie the nets onto the count/); await close(page);
  await travel(page, 'sea-pens', 'kraken-grave', 'from-sea');
  await talk(page, 'kraken-grave', 'octopus-return', /octopus/); await choose(page, /Keep the knot/); await close(page);
  const saved = await receipt(page, 'octopus', 'A knot of church net', true);
  expect(saved.world.found).toContain('net-knot'); expect(saved.gear.octopus).toContain('net-knot');
  expect(saved.memory.keepsakeMemories).toContain('octopus');
  expect(errors).toEqual([]);
});
