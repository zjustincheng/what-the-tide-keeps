import Phaser from 'phaser';
import { Scenery } from './scenery';
import { Townsperson } from './townsfolk';
import { fortState } from '../rules/highlandLife';
import type { Context } from '../rules/world';

export class FortAtmosphere {
  private ground: Phaser.GameObjects.Graphics;
  private queue: Townsperson[] = [];
  private bubble?: Phaser.GameObjects.Text;
  private structures: Scenery;
  private key = '';
  private state!: ReturnType<typeof fortState>;
  private elapsed = 0;
  private nextBark = 7000;
  private bark = 0;

  constructor(private scene: Phaser.Scene, context: Context, hero: Phaser.Physics.Arcade.Sprite) {
    this.structures = new Scenery(scene, hero);
    this.ground = scene.add.graphics().setDepth(3);
    for (const [index, [x, y]] of [[616, 216], [636, 236], [656, 216], [680, 236]].entries()) {
      this.queue.push(new Townsperson(scene, hero, x, y, index % 2 ? 'lynx' : 'veteran'));
    }
    this.refresh(context);
  }

  refresh(context: Context) {
    this.state = fortState(context);
    const frame = document.querySelector<HTMLElement>('.game-frame');
    if (frame) { frame.dataset.fortGraves = this.state.quiet ? 'quiet' : 'disturbed'; frame.dataset.fortFish = this.state.fish; }
    const key = `${this.state.quiet}:${this.state.grain}:${this.state.fish}:${Boolean(context.world.night)}`;
    if (key === this.key) return;
    this.key = key; this.bubble?.destroy(); this.bubble = undefined;
    this.structures.clear();
    const g = this.ground.clear();
    { const g = this.structures.add('ration-counter', 543, 165, 74, 8);
      // The counter is part of the fort's existing market wall, not a new obstacle.
      g.fillStyle(0x594a39).fillRect(543, 164, 74, 8);
      g.fillStyle(0xaa9b7f).fillRect(543, 162, 74, 3);
      // Keep the scale beside the quartermaster, clear of his silhouette.
      g.fillStyle(0x383d3c).fillRect(596, 147, 2, 14).fillRect(588, 148, 19, 2);
      g.fillStyle(0xb6ac89).fillRect(585, 152, 9, 2).fillRect(602, 152, 9, 2);
      if (this.state.fish !== 'stopped') {
        g.fillStyle(0x9cac9e).fillRect(546, 160, 6, 2).fillRect(579, 160, 4, 2);
        const barrel = this.structures.add('ration-barrel', 592, 183, 13, 10);
        barrel.fillStyle(0x725d43).fillRect(592, 177, 13, 16);
        barrel.fillStyle(this.state.fish === 'spoiled' ? 0x866255 : 0x939985).fillRect(592, 177, 13, 3);
        barrel.fillStyle(0x393d38).fillRect(592, 183, 13, 2).fillRect(592, 189, 13, 2);
      } else {
        g.fillStyle(0x443e35).fillRect(548, 159, 34, 2);
      }
    }
    { const g = this.structures.add('grain-wagon', 403, 193, 42, 14);
      // A wagon waits by the north road; the farmland victory fills it with grain.
      g.fillStyle(0x121d21, .5).fillEllipse(424, 203, 43, 8);
      g.fillStyle(0x292b2a).fillRect(403, 195, 5, 12).fillRect(440, 195, 5, 12);
      g.fillStyle(0x73634d).fillRect(406, 187, 34, 13);
      g.fillStyle(0x41392e).fillRect(408, 190, 30, 6);
      for (const x of [413, 423, 433]) g.fillStyle(0x8a795c).fillRect(x, 187, 1, 12);
      if (this.state.grain) g.fillStyle(0xb4a17c).fillRect(410, 180, 11, 12).fillRect(423, 178, 12, 14);
    }
    { const g = this.structures.add('memorial', 284, 247, 56, 12);
      // Names and candles are the memorial. There are no bodies on the street.
      g.fillStyle(0x19242a, .5).fillEllipse(312, 259, 60, 8);
      g.fillStyle(0x67717a).fillRect(284, 235, 56, 22);
      g.fillStyle(0x343e44).fillRect(286, 237, 52, 17);
      for (let row = 0; row < 3; row++) g.fillStyle(0x979d99).fillRect(292, 240 + row * 4, 32 - row * 5, 1);
      if (!this.state.quiet) {
        g.fillStyle(0x252829).fillRect(303, 239, 2, 13).fillRect(311, 242, 2, 10).fillRect(320, 238, 2, 14);
      }
      for (const x of [295, 309, 326]) {
        g.fillStyle(0xbcb28e).fillRect(x, 254, 3, 5);
        if (this.state.quiet) {
          g.fillStyle(0xdcba70).fillRect(x, 251, 3, 3);
          g.fillStyle(0xfae4a0).fillRect(x + 1, 250, 1, 3);
        }
      }
    }
    // The inner watch lowers its weapon when the burial patrol can return safely.
    const tense = !this.state.quiet || this.state.fish === 'stopped';
    g.fillStyle(0x776953).fillRect(252, tense ? 373 : 392, tense ? 2 : 18, tense ? 25 : 2);
    g.fillStyle(0xa9b1ab).fillRect(tense ? 251 : 268, tense ? 369 : 391, 4, 5);
    { const sign = this.structures.add('fort-sign', 398, 65, 6, 8);
      sign.fillStyle(0x645642).fillRect(400, 48, 2, 24).fillRect(389, 46, 25, 9);
      sign.fillStyle(0xb6b494).fillRect(391, 49, 20, 1);
    }
    this.queue.forEach((person, index) => {
      person.setVisible(index < (this.state.fish === 'stopped' ? 4 : 3));
      const x = this.state.quiet && this.state.fish !== 'stopped' ? 616 + index * 23 : [616, 636, 656, 680][index];
      const y = this.state.quiet && this.state.fish !== 'stopped' ? 216 : [216, 236, 216, 236][index];
      person.setPosition(x, y);
    });
  }

  update(delta: number, speaking: boolean, hero: { x: number; y: number }) {
    this.queue.forEach(person => person.update(hero, speaking));
    if (speaking) { if (this.bubble?.active) this.bubble.setVisible(false); return; }
    if (this.bubble?.active) this.bubble.setVisible(true);
    this.elapsed += Math.min(delta, 100);
    if (this.elapsed < this.nextBark) return;
    this.nextBark = this.elapsed + 16000;
    const east = hero.x > 510, west = hero.x < 280 && hero.y > 340;
    const [x, y] = east ? [600, 188] : west ? [248, 370] : [312, 224];
    if (Phaser.Math.Distance.Between(hero.x, hero.y, x, y) > 155) return;
    const words = east ? this.state.fish === 'stopped' ? ['No boats. No ration.', 'We are still in line.'] : this.state.fish === 'spoiled' ? ['Do not issue that barrel.', 'That leaves one good barrel.'] : ['Cubs first.', 'Same weight as yesterday.'] :
      west ? this.state.quiet ? ['The burial patrol is home.', 'Let us close our own doors.'] : ['Keep away from the wall.', 'Nobody walks alone tonight.'] :
      this.state.quiet ? ['They stayed buried.', 'Someone lit the candles.'] : ['Another name marked missing.', 'Leave the candles unlit.'];
    this.bubble?.destroy();
    this.bubble = this.scene.add.text(x, y, words[this.bark++ % words.length], { fontFamily: 'monospace', fontSize: '8px', color: '#dbe3d9', backgroundColor: '#17232bee', padding: { x: 5, y: 4 } }).setOrigin(.5, 1).setDepth(8);
    const bubble = this.bubble;
    this.scene.time.delayedCall(5200, () => { if (bubble.active) bubble.destroy(); });
  }

  destroy() { this.structures.destroy(); this.ground.destroy(); this.queue.forEach(person => person.destroy()); this.bubble?.destroy(); }
}
