import { music } from '../audio/music';
import { tableau } from '../presentation/tableau';

// The end: a title, and what happened after, told a line at a time. Then the hero walks on; the world is still there.
export class EndingView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(title: string, lines: readonly string[], onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle ending';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'ending-title');
    this.root.tabIndex = -1;
    const good = title === 'The door stays open';
    this.root.innerHTML = `
      <div class="ending-art" aria-hidden="true">${tableau(good ? 'lighthouse' : 'feast')}</div>
      <div class="battle-heading"><p class="eyebrow">AFTERWARDS</p><h2 id="ending-title">${title}</h2></div>
      <div class="ending-lines">${lines.map((line, i) => `<p style="animation-delay:${400 + i * 700}ms">${line}</p>`).join('')}</div>
      <button id="ending-close" type="button" style="animation-delay:${900 + lines.length * 900}ms">Walk on</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('#ending-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }, { signal });
    // Clicking anywhere shows the rest at once, for anyone who reads faster.
    this.root.addEventListener('click', event => { if (!(event.target as Element).closest('button')) this.root.classList.add('shown'); }, { signal });
    music.play('wake');
    music.effect(good ? 'memory' : 'toll');
    this.root.focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
