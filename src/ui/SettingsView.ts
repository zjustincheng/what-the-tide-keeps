import { canFullscreen, toggleFullscreen } from './fullscreen';

const CONTROLS: [string, string][] = [
  ['Move', 'W A S D or arrow keys'],
  ['Talk, examine, travel', 'E or Space'],
  ['Equipment', 'Tab'],
  ['Settings', 'Escape'],
  ['Full screen', 'F'],
  ['Attack or support', 'Drag a hero onto an enemy or ally, or use the buttons on their card'],
  ['Dodge', 'Space or Enter as the ring closes'],
  ['Cast a spell', 'Type the shown keys 1–4 before the timer empties'],
  ['Reel in a fish', 'Space as the marker crosses the gold'],
];

// Controls, plus the actions that used to sit under the map.
export class SettingsView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(actions: { equipment: () => void; restart: () => void; close: () => void }) {
    this.root = document.createElement('section');
    this.root.className = 'battle settings';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'settings-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="settings-title">Settings</h2></div>
      <table class="controls"><caption>Controls</caption><tbody>${CONTROLS.map(([action, keys]) => `<tr><th scope="row">${action}</th><td>${keys}</td></tr>`).join('')}</tbody></table>
      <p class="settings-touch">On a touch screen, use the arrows and Interact below the map, and tap buttons in battle.</p>
      <div class="settings-actions">
        <button type="button" data-action="fullscreen" ${canFullscreen() ? '' : 'hidden'}>${document.fullscreenElement ? 'Exit full screen' : 'Full screen'}</button>
        <button type="button" data-action="equipment">Equipment</button>
        <button type="button" data-action="restart">Return to the cot ↺</button>
        <button type="button" data-action="close">Close</button>
      </div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('click', event => {
      const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
      if (action === 'fullscreen') { toggleFullscreen(); actions.close(); }
      else if (action === 'equipment' || action === 'restart' || action === 'close') actions[action]();
    }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); actions.close(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('button:not([hidden])'));
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
