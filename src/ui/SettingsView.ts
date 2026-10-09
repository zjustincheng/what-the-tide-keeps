import { canFullscreen, toggleFullscreen } from './fullscreen';
import { music } from '../audio/music';
import { eraseProgress } from '../storage/progress';

const CONTROLS: [string, string][] = [
  ['Move', 'W A S D or arrow keys'],
  ['Talk, examine, travel', 'E or Space'],
  ['Choose a reply', '1–4, or click it'],
  ['Equipment', 'Tab'],
  ['Journal', 'J'],
  ['Hide your mana (sneak)', 'Q'],
  ['Settings', 'Escape'],
  ['Full screen', 'F'],
  ['Mute music', 'M'],
  ['Hide or show party details', 'H'],
  ['Attack or support', 'Drag a hero onto an enemy or ally, or use the buttons on their card'],
  ['Dodge', 'Space or Enter as the ring closes'],
  ['Cast a spell', 'Type the shown keys 1–4 before the timer empties'],
  ['Reel in a fish', 'Space as the marker crosses the gold'],
];

// Controls, plus the actions that used to sit under the map.
export class SettingsView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(actions: { equipment: () => void; journal: () => void; restart: () => void; close: () => void }) {
    this.root = document.createElement('section');
    this.root.className = 'battle settings';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'settings-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="settings-title">Settings</h2></div>
      <table class="controls"><caption>Controls</caption><tbody>${CONTROLS.map(([action, keys]) => `<tr><th scope="row">${action}</th><td>${keys}</td></tr>`).join('')}</tbody></table>
      <div class="settings-audio">
        <label>Music <input type="range" min="0" max="100" step="5" value="${Math.round(music.volume * 100)}" aria-label="Music volume" /></label>
        <label>Effects <input type="range" min="0" max="100" step="5" value="${Math.round(music.effectsVolume * 100)}" aria-label="Sound effects volume" /></label>
        <label><input type="checkbox" ${music.muted ? 'checked' : ''} aria-label="Mute music" /> Mute</label>
      </div>
      <p class="settings-touch">On a touch screen, use the arrows and Interact below the map, and tap buttons in battle.</p>
      <div class="settings-actions">
        <button type="button" data-action="fullscreen" ${canFullscreen() ? '' : 'hidden'}>${document.fullscreenElement ? 'Exit full screen' : 'Full screen'}</button>
        <button type="button" data-action="equipment">Equipment</button>
        <button type="button" data-action="journal">Journal</button>
        <button type="button" data-action="restart">Return to the cot ↺</button>
        <button type="button" data-action="start-over">Start over…</button>
        <button type="button" data-action="close">Close</button>
      </div>
      <div class="start-over" hidden>
        <p>Start a new game? This erases your memories, companions, keepsakes, grimoires, coins, and every choice you have made. Volume and display settings are kept. It cannot be undone.</p>
        <button type="button" data-action="erase">Erase and start over</button>
        <button type="button" data-action="keep">Keep playing</button>
      </div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('click', event => {
      const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
      if (action === 'fullscreen') { toggleFullscreen(); actions.close(); }
      // Starting over asks once more before anything is erased.
      else if (action === 'start-over' || action === 'keep') {
        const ask = action === 'start-over';
        this.root.querySelector<HTMLElement>('.start-over')!.hidden = !ask;
        this.root.querySelector<HTMLElement>(ask ? '[data-action="keep"]' : '[data-action="start-over"]')!.focus();
      }
      else if (action === 'erase') { if (eraseProgress()) location.reload(); }
      else if (action === 'equipment' || action === 'journal' || action === 'restart' || action === 'close') actions[action]();
    }, { signal });
    this.root.querySelector<HTMLInputElement>('[aria-label="Music volume"]')!.addEventListener('input', event => music.setVolume(Number((event.target as HTMLInputElement).value) / 100), { signal });
    this.root.querySelector<HTMLInputElement>('[aria-label="Sound effects volume"]')!.addEventListener('input', event => music.setEffectsVolume(Number((event.target as HTMLInputElement).value) / 100), { signal });
    this.root.querySelector<HTMLInputElement>('[aria-label="Mute music"]')!.addEventListener('change', event => {
      if ((event.target as HTMLInputElement).checked !== music.muted) music.toggleMute();
    }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); actions.close(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('input, button:not([hidden])')).filter(control => !control.closest('[hidden]'));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.root.querySelector<HTMLElement>('[data-action="close"]')!.focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
