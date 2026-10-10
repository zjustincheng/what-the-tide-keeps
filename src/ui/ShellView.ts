import { music } from '../audio/music';

// The shell game on Wickmere's decks: watch the pebble go under a shell, follow the shuffle, and pick. Higher stakes, faster hands.
export class ShellView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private timers: ReturnType<typeof setTimeout>[] = [];
  // Which slot each shell sits in, and which shell has the pebble.
  private slots = [0, 1, 2];
  private pebble = Math.floor(Math.random() * 3);
  private picked?: number;

  constructor(private stake: number, private onSettle: (coins: number) => void, onClose: () => void) {
    const fast = stake >= 15;
    this.root = document.createElement('section');
    this.root.className = 'battle shells';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'shells-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE SHELLS · ${stake} COINS</p><h2 id="shells-title">Follow the pebble.</h2>
      <p class="resurrection-intro" id="shells-note">Watch where it goes.</p></div>
      <div class="shell-table">${[0, 1, 2].map(shell => `<button type="button" class="shell" data-shell="${shell}" aria-label="Shell ${shell + 1}" disabled><span class="shell-cup"></span></button>`).join('')}<span class="pebble" aria-hidden="true"></span></div>
      <p class="dice-result" aria-live="polite"></p>
      <button id="shells-close" type="button" hidden>Done</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelectorAll<HTMLButtonElement>('[data-shell]').forEach(button => button.addEventListener('click', () => this.pick(Number(button.dataset.shell)), { signal }));
    this.root.querySelector('#shells-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.picked !== undefined) { event.preventDefault(); onClose(); }
      if (['1', '2', '3'].includes(event.key) && this.picked === undefined) {
        const shell = this.slots.indexOf(Number(event.key) - 1);
        this.pick(shell);
      }
    }, { signal });
    music.effect('coins');
    this.place(true);
    this.root.focus({ preventScroll: true });
    // Show the pebble under its shell, cover it, then shuffle.
    const swaps = fast ? 11 : 6, pace = fast ? 300 : 460;
    this.timers.push(setTimeout(() => { this.place(false); this.note('Here they go.'); }, 1300));
    for (let i = 0; i < swaps; i++) this.timers.push(setTimeout(() => this.swap(), 1800 + i * pace));
    this.timers.push(setTimeout(() => {
      this.note('Which one? Click it, or press 1, 2, or 3 for left to right.');
      this.root.querySelectorAll<HTMLButtonElement>('[data-shell]').forEach(button => { button.disabled = false; });
      this.root.querySelector<HTMLElement>('[data-shell]')?.focus();
    }, 1800 + swaps * pace + 200));
    this.root.style.setProperty('--pace', `${pace - 60}ms`);
  }

  private note(text: string) { this.root.querySelector('#shells-note')!.textContent = text; }

  // Put each shell at its slot; lifted, the pebble shows under its shell.
  private place(lifted: boolean) {
    this.root.querySelectorAll<HTMLElement>('[data-shell]').forEach(button => {
      const shell = Number(button.dataset.shell);
      button.style.left = `${this.slots[shell] * 33.3}%`;
      button.classList.toggle('lifted', lifted && shell === this.pebble);
    });
    const pebble = this.root.querySelector<HTMLElement>('.pebble')!;
    pebble.style.left = `calc(${this.slots[this.pebble] * 33.3}% + 16.6% - 6px)`;
    pebble.style.opacity = lifted ? '1' : '0';
  }

  private swap() {
    const a = Math.floor(Math.random() * 3);
    const b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
    const first = this.slots.indexOf(a), second = this.slots.indexOf(b);
    this.slots[first] = b; this.slots[second] = a;
    music.effect('step-wood');
    this.place(false);
  }

  private pick(shell: number) {
    if (this.picked !== undefined || shell < 0) return;
    this.picked = shell;
    const won = shell === this.pebble;
    this.root.querySelectorAll<HTMLButtonElement>('[data-shell]').forEach(button => { button.disabled = true; });
    this.place(true);
    this.root.querySelector<HTMLElement>(`[data-shell="${shell}"]`)!.classList.add('lifted');
    this.onSettle(won ? this.stake : -this.stake);
    music.effect(won ? 'coins' : 'graze');
    this.root.querySelector('.dice-result')!.textContent = won ? `There it is. You win ${this.stake} coins.` : `Empty. The mink sweeps up your ${this.stake} coins.`;
    const close = this.root.querySelector<HTMLButtonElement>('#shells-close')!;
    close.hidden = false; close.focus();
  }

  destroy() {
    this.timers.forEach(clearTimeout);
    this.cleanup.abort(); this.root.remove();
  }
}
