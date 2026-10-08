import Phaser from 'phaser';
import { ChurchScene } from './scenes/ChurchScene';
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
  scene: [ChurchScene],
});

if (import.meta.hot) import.meta.hot.dispose(() => game.destroy(true));
