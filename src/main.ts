import Phaser from 'phaser';
import { AreaScene } from './scenes/AreaScene';
import { AREAS } from './scenes/areas';
import { bindFullscreen } from './ui/fullscreen';
import { music } from './audio/music';
import './style.css';

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 512,
  height: 384,
  backgroundColor: '#142322',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: AREAS.map(area => new AreaScene(area)),
});

bindFullscreen();
// Sound starts with the player's first key or click, as browsers require. M mutes the music.
for (const type of ['pointerdown', 'keydown'] as const) document.addEventListener(type, () => music.unlock());
document.addEventListener('keydown', event => {
  if ((event.key === 'm' || event.key === 'M') && !event.repeat && !(event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement)) music.toggleMute();
});

if (import.meta.hot) import.meta.hot.dispose(() => { game.destroy(true); music.stop(); });
