import Phaser from 'phaser';
import type { Area } from '../scenes/areas';

export function atmosphere(scene: Phaser.Scene, area: Area) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sea = area.region === 'THE OCEAN' || area.region === 'THE ISLAND';
  const cold = /HIGHLAND|HOLD|MOUNTAIN/.test(area.region);
  const color = sea ? 0x9cd8d5 : cold ? 0xd1dfed : 0xead3a0;
  if (!reduced) {
    // Small screen-space motes; bounded count, owned and cleaned up by the scene.
    for (let i = 0; i < 16; i++) {
      const x = (i * 137 + 23) % 512, y = (i * 79 + 17) % 384;
      const mote = scene.add.circle(x, y, i % 3 ? 0.65 : 1.1, color, 0.08 + (i % 4) * 0.025)
        .setScrollFactor(0).setDepth(500).setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({ targets: mote, x: x + (sea ? 65 : 18), y: y - 45, alpha: 0, duration: 6500 + i * 290, delay: i * 120, repeat: -1, yoyo: true, ease: 'Sine.easeInOut' });
    }
    if (sea || /MARSH/.test(area.region)) {
      for (let i = 0; i < 3; i++) {
        const mist = scene.add.ellipse(i * 220 - 50, 280 + i * 22, 340, 28, 0x91b8c0, 0.035).setScrollFactor(0).setDepth(490);
        scene.tweens.add({ targets: mist, x: mist.x + 200, alpha: 0.012, duration: 19000 + i * 2000, yoyo: true, repeat: -1 });
      }
    }
  }
}
