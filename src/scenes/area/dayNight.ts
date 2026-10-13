import Phaser from 'phaser';
import { advance, darkness, phase, timeName } from '../../rules/clock';
import { keepClock, loadWorld, saveWorld } from '../../storage/world';
import type { AreaScene } from '../AreaScene';
import { element, save } from './shared';

type Shading = { color?: Phaser.FX.ColorMatrix; vignette?: Phaser.FX.Vignette; wash: Phaser.GameObjects.Rectangle; glows: Phaser.GameObjects.Image[]; carried: Phaser.GameObjects.Image };

// The time of day, turning while the hero explores, and the light that goes with it.
export class DayNight {
  clock = loadWorld().clock ?? 0;
  private lastShown = 0;
  private shaded = -1;
  private shading: Shading;

  // The world is drained and cold: a desaturating, darkening grade with a heavy vignette.
  // Without WebGL, a dark wash over the view stands in for it.
  constructor(private scene: AreaScene) {
    const camera = scene.cameras.main;
    const webgl = scene.renderer.type === Phaser.WEBGL && Boolean(camera.postFX);
    // Night is a cold blue over everything; without WebGL a plain dark wash stands in for the whole grade.
    const wash = webgl
      ? scene.add.rectangle(0, 0, camera.width, camera.height, 0x0a1a3a, 0).setOrigin(0).setScrollFactor(0).setDepth(49).setBlendMode(Phaser.BlendModes.MULTIPLY)
      : scene.add.rectangle(0, 0, camera.width, camera.height, 0x05090a, 0.38).setOrigin(0).setScrollFactor(0).setDepth(50);
    // Fires and lanterns are the only warm light after dark.
    const lanterns = scene.area.npcs.filter(npc => npc.lit).map(npc => scene.point(npc.point));
    const glows = [...scene.props.filter(({ sprite }) => sprite.texture.key === 'campfire').map(({ sprite }) => ({ x: sprite.x, y: sprite.y, scale: 1 })),
      ...lanterns.map(({ x, y }) => ({ x, y: y - 4, scale: 1.1 }))].map(({ x, y, scale }) => {
      const glow = scene.add.image(x, y, 'firelight').setDepth(50).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(scale);
      scene.tweens.add({ targets: glow, scale: scale * 0.94, duration: 900, yoyo: true, repeat: -1 });
      return glow;
    });
    // A little light of the hero's own, so the dark is never blind.
    const carried = scene.add.image(scene.player.x, scene.player.y, 'firelight').setDepth(50).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(1.5).setTint(0xd8d0c0);
    this.shading = webgl
      ? { color: camera.postFX.addColorMatrix(), vignette: camera.postFX.addVignette(0.5, 0.5, 0.82, 0.45), wash, glows, carried }
      : { wash, glows, carried };
    this.shade();
    this.show();
  }

  // Darker, colder, and closer as night comes on.
  private shade() {
    const dark = darkness(this.clock);
    // Only redo the grade when it has visibly changed.
    if (Math.abs(dark - this.shaded) < 0.01) return;
    this.shaded = dark;
    const base = this.scene.area.grade ?? {};
    const saturation = (base.saturation ?? -0.5) - 0.2 * dark;
    const brightness = (base.brightness ?? 0.72) * (1 - 0.3 * dark);
    const vignette = Math.min(0.85, (base.vignette ?? 0.45) + 0.18 * dark);
    const { color, vignette: edge, wash, glows, carried } = this.shading;
    if (color) {
      color.reset(); color.saturate(saturation); color.brightness(brightness, true);
      edge!.strength = vignette;
      wash.setAlpha(0.2 * dark);
    } else wash.setAlpha(0.38 + 0.25 * dark);
    for (const glow of glows) glow.setAlpha(0.9 * dark);
    carried.setAlpha(0.6 * dark);
  }

  private show() {
    const name = timeName(this.clock);
    element('location-time').textContent = name;
    element('clock').setAttribute('aria-label', `Time of day: ${name}`);
    element('clock').querySelector<HTMLElement>('.clock-hand')!.style.transform = `rotate(${this.clock * 360}deg)`;
  }

  // The hero's own light goes where he goes.
  follow(x: number, y: number) { this.shading.carried.setPosition(x, y); }

  // Time passes while exploring. Says whether night has just fallen or lifted.
  pass(delta: number, time: number): 'night' | 'dawn' | undefined {
    const before = phase(this.clock);
    this.clock = advance(this.clock, delta);
    const night = phase(this.clock) === 'night';
    keepClock(this.clock);
    this.shade();
    if (time - this.lastShown > 1000) { this.lastShown = time; this.show(); }
    if ((before === 'night') === night) return undefined;
    save.ok = saveWorld({ ...loadWorld(), night });
    this.show();
    return night ? 'night' : 'dawn';
  }
}
