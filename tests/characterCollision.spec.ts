import { test, expect } from '@playwright/test';
import type Phaser from 'phaser';
import type { AreaScene } from '../src/scenes/AreaScene';
import type { Townsperson } from '../src/presentation/townsfolk';

declare global { interface Window { collisionRun: typeof import('../src/main'); } }
test.use({ storageState: { cookies: [], origins: [] } });

async function start(page: import('@playwright/test').Page, key: string) {
  await page.addInitScript(() => {
    localStorage.setItem('tide-keeps.world.v1', JSON.stringify({ flags: ['bear-free', 'cuckoo-slain'], carried: [], found: [], coins: 20 }));
    localStorage.setItem('tide-keeps.memory.v1', JSON.stringify({ lost: ['home', 'name'], pending: false }));
  });
  await page.goto('/');
  await page.evaluate(async () => { window.collisionRun = await import(document.querySelector<HTMLScriptElement>('script[src*="/src/main.ts"]')!.src); });
  await page.locator('#title-play').click();
  await page.waitForFunction(() => Boolean((window.collisionRun.game?.scene.getScene('church') as AreaScene | undefined)?.player?.active));
  await page.evaluate(key => window.collisionRun.game!.scene.getScene('church').scene.start(key, { spawn: ({ town: 'spawn', fort: 'from-pass', wickmere: 'from-causeway', hold: 'from-climb' } as Record<string, string>)[key] }), key);
  await page.waitForFunction(key => Boolean((window.collisionRun.game?.scene.getScene(key) as AreaScene | undefined)?.player?.active), key);
}

for (const [key, atmosphere, group] of [
  ['town', 'millbrook', 'queue'], ['fort', 'fortLife', 'queue'], ['wickmere', 'marshLife', 'queue'], ['hold', 'holdsLife', 'workers'],
]) {
  test(`${key} crowd blocks walking and leaves no invisible obstacle`, async ({ page }) => {
    await start(page, key);
    const target = await page.evaluate(([key, atmosphere, group]) => {
      const scene = window.collisionRun.game!.scene.getScene(key) as AreaScene & Record<string, Record<string, Townsperson[]>>;
      const person = scene[atmosphere][group][0];
      expectVisible(person);
      scene.player.setPosition(person.sprite.x + .5, person.sprite.y + (key === 'hold' ? 12 : 30));
      (scene.player.body as Phaser.Physics.Arcade.Body).reset(scene.player.x, scene.player.y);
      return { x: person.sprite.x, y: person.sprite.y };
      function expectVisible(person: Townsperson) { if (!person.sprite.visible || !person.sprite.body!.enable) throw Error('Crowd member must be visible and solid'); }
    }, [key, atmosphere, group]);
    await page.locator('#game').focus();
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(650); await page.keyboard.up('ArrowUp');
    const stopped = await page.evaluate(key => (window.collisionRun.game!.scene.getScene(key) as AreaScene).player.y, key);
    expect(stopped).toBeGreaterThan(target.y + 4);
    expect(stopped).toBeLessThan(target.y + 15);
    await page.evaluate(([key, atmosphere, group]) => {
      const scene = window.collisionRun.game!.scene.getScene(key) as AreaScene & Record<string, Record<string, Townsperson[]>>;
      scene[atmosphere][group][0].setVisible(false);
    }, [key, atmosphere, group]);
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(250); await page.keyboard.up('ArrowUp');
    expect(await page.evaluate(key => (window.collisionRun.game!.scene.getScene(key) as AreaScene).player.y, key)).toBeLessThan(target.y);
    // A reflow must move the foot body as well as the sprite; scene revisits must recreate it.
    const moved = await page.evaluate(([key, atmosphere, group]) => {
      const scene = window.collisionRun.game!.scene.getScene(key) as AreaScene & Record<string, Record<string, Townsperson[]>>;
      const person = scene[atmosphere][group][0];
      person.setPosition(person.sprite.x + 24, person.sprite.y + 16); person.setVisible(true);
      const body = person.sprite.body as Phaser.Physics.Arcade.StaticBody;
      return { x: body.center.x - person.sprite.x, y: body.bottom - person.sprite.y };
    }, [key, atmosphere, group]);
    expect(moved.x).toBeCloseTo(0); expect(moved.y).toBeCloseTo(11);
    await page.evaluate(key => window.collisionRun.game!.scene.getScene(key).scene.restart({ spawn: ({ town: 'spawn', fort: 'from-pass', wickmere: 'from-causeway', hold: 'from-climb' } as Record<string, string>)[key] }), key);
    await page.waitForFunction(([key, atmosphere, group]) => {
      const scene = window.collisionRun.game!.scene.getScene(key) as AreaScene & Record<string, Record<string, Townsperson[]>>;
      return Boolean(scene.player?.active && scene[atmosphere]?.[group][0].sprite.body?.enable);
    }, [key, atmosphere, group]);
  });
}

test('characters layer by their feet and idle motion keeps collision anchored', async ({ page }) => {
  await start(page, 'town');
  for (const [offset, front] of [[-8, false], [12, true]] as const) {
    await page.evaluate(offset => {
      const scene = window.collisionRun.game!.scene.getScene('town') as AreaScene & { millbrook: { queue: Townsperson[] } };
      const citizen = scene.millbrook.queue[0].sprite;
      (scene.player.body as Phaser.Physics.Arcade.Body).reset(citizen.x + 9, citizen.y + offset);
    }, offset);
    await page.waitForTimeout(150);
    const layers = await page.evaluate(() => {
      const scene = window.collisionRun.game!.scene.getScene('town') as AreaScene & { millbrook: { queue: Townsperson[] } };
      return { hero: scene.player.depth, citizen: scene.millbrook.queue[0].sprite.depth };
    });
    if (front) expect(layers.hero).toBeGreaterThan(layers.citizen);
    else expect(layers.hero).toBeLessThan(layers.citizen);
  }
  const anchored = await page.evaluate(() => {
    const scene = window.collisionRun.game!.scene.getScene('town') as AreaScene & { millbrook: { queue: Townsperson[] } };
    const person = scene.millbrook.queue[0];
    person.sprite.setScale(1, 1.025);
    person.setPosition(person.sprite.x, person.sprite.y);
    const body = person.sprite.body as Phaser.Physics.Arcade.StaticBody;
    return { bottom: body.bottom - person.sprite.y, scale: person.sprite.scaleY };
  });
  expect(anchored.bottom).toBeCloseTo(11); expect(anchored.scale).toBeCloseTo(1.025);
});

test('a returning object cancels its old disappearance instead of shrinking or vanishing', async ({ page }) => {
  await start(page, 'town');
  await page.evaluate(() => window.collisionRun.game!.scene.getScene('town').scene.start('farmland', { spawn: 'camp-fields' }));
  await page.waitForFunction(() => Boolean((window.collisionRun.game?.scene.getScene('farmland') as AreaScene | undefined)?.player?.active));
  await page.evaluate(() => {
    const scene = window.collisionRun.game!.scene.getScene('farmland') as unknown as { effect: (effect: unknown) => void };
    scene.effect({ give: 'bell' });
  });
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const scene = window.collisionRun.game!.scene.getScene('farmland') as unknown as { effect: (effect: unknown) => void };
    scene.effect({ take: 'bell' });
  });
  await page.waitForTimeout(650);
  const returned = await page.evaluate(() => {
    const scene = window.collisionRun.game!.scene.getScene('farmland') as unknown as { props: { sprite: Phaser.Physics.Arcade.Sprite }[] };
    const bell = scene.props.find(({ sprite }) => sprite.texture.key === 'bell')!.sprite;
    return { visible: bell.visible, active: bell.active, alpha: bell.alpha, scale: bell.scaleX };
  });
  expect(returned.visible).toBe(true); expect(returned.active).toBe(true);
  expect(returned.alpha).toBeGreaterThan(.45); expect(returned.scale).toBeCloseTo(1);
});
