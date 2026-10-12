import Phaser from 'phaser';
import { AreaScene } from './scenes/AreaScene';
import { AREAS } from './scenes/areas';
import { bindFullscreen } from './ui/fullscreen';
import { music } from './audio/music';
import './style.css';
import './presentation/presentation.css';

export let game: Phaser.Game | undefined;
const title = document.getElementById('title-screen')!;
const play = document.getElementById('title-play') as HTMLButtonElement;
let starting = false;
let startTimer: ReturnType<typeof setTimeout> | undefined;
function startGame() {
  if (starting) return;
  starting = true;
  play.disabled = true;
  music.unlock();
  title.classList.add('title-leaving');
  startTimer = setTimeout(() => {
    document.querySelector('main')!.hidden = false;
    title.remove();
    game = new Phaser.Game({
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
    document.getElementById('game')!.focus({ preventScroll: true });
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
}
play.addEventListener('click', startGame);
const titleKey = (event: KeyboardEvent) => {
  if (!starting && event.key === 'Enter' && !event.repeat) {
    event.preventDefault();
    startGame();
  }
};
document.addEventListener('keydown', titleKey);

bindFullscreen();
// Sound starts with the player's first key or click, as browsers require. M mutes the music.
for (const type of ['pointerdown', 'keydown'] as const) document.addEventListener(type, () => music.unlock());
document.addEventListener('keydown', event => {
  if ((event.key === 'm' || event.key === 'M') && !event.repeat && !(event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement)) music.toggleMute();
});
// The music button in the top bar shows whether the music is muted, and toggles it.
const sound = document.getElementById('sound') as HTMLButtonElement;
const showSound = () => {
  sound.classList.toggle('muted', music.muted);
  sound.setAttribute('aria-pressed', String(music.muted));
  sound.setAttribute('aria-label', music.muted ? 'Unmute music' : 'Mute music');
  sound.title = music.muted ? 'Music is muted. Unmute (M)' : 'Mute music (M)';
};
sound.addEventListener('click', () => { music.unlock(); music.toggleMute(); });
music.onChange(showSound);
showSound();

if (import.meta.hot) import.meta.hot.dispose(() => {
  clearTimeout(startTimer);
  document.removeEventListener('keydown', titleKey);
  game?.destroy(true);
  music.stop();
});
