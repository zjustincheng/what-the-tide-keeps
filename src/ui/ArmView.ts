import { music } from '../audio/music';

// Arm-wrestling in the barracks: push (Space, or tap) to drive the marker to your side before he drives it to his.
// He pushes steadily, and now and then he surges.
export class ArmView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private timer?: ReturnType<typeof setInterval>;
  private start?: ReturnType<typeof setTimeout>;
  private at = 50;
  private surge = 0;
  private over = false;
  private started = 0;

  constructor(private stake: number, private onSettle: (coins: number) => void, onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle arm';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'arm-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">ARM-WRESTLING · ${stake} COINS</p><h2 id="arm-title">Elbows on the table.</h2>
      <p class="resurrection-intro" id="arm-note">Press Space, or tap Push, as fast as you can. Drive the marker to your side. Watch for his surges.</p></div>
      <div class="arm-bar" role="meter" aria-label="Who is winning" aria-valuemin="0" aria-valuemax="100"><span class="arm-mine">You</span><span class="arm-marker"></span><span class="arm-his">The wolf</span></div>
      <button id="arm-push" type="button" disabled>Push</button>
      <p class="dice-result" aria-live="polite"></p>
      <button id="arm-close" type="button" hidden>Done</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const push = this.root.querySelector<HTMLButtonElement>('#arm-push')!;
    push.addEventListener('pointerdown', event => { event.preventDefault(); this.push(); }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); if (!event.repeat) this.push(); }
      if (event.key === 'Escape' && this.over) { event.preventDefault(); onClose(); }
    }, { signal });
    this.root.querySelector('#arm-close')!.addEventListener('click', onClose, { signal });
    this.render();
    this.root.focus({ preventScroll: true });
    // Three, two, one.
    this.start = setTimeout(() => {
      this.note('Push!');
      push.disabled = false; push.focus();
      this.started = performance.now();
      this.timer = setInterval(() => this.tick(), 100);
    }, 1200);
  }

  private note(text: string) { this.root.querySelector('#arm-note')!.textContent = text; }

  private push() {
    if (this.over || !this.timer) return;
    this.at = Math.min(100, this.at + 4.5);
    music.effect('step-wood');
    this.check();
  }

  // He pushes back a little every tenth of a second, and every so often throws his weight for a moment.
  private tick() {
    if (this.over) return;
    if (this.surge <= 0 && Math.random() < 0.04) { this.surge = 6; this.note('He surges!'); }
    this.at = Math.max(0, this.at - (this.surge > 0 ? 3.6 : 1.7));
    if (this.surge > 0 && --this.surge === 0) this.note('Push!');
    // After twenty seconds, whoever is ahead wins.
    if (performance.now() - this.started > 20000) { this.end(this.at >= 50); return; }
    this.check();
  }

  private check() {
    this.render();
    if (this.at >= 100) this.end(true);
    else if (this.at <= 0) this.end(false);
  }

  private end(won: boolean) {
    this.over = true;
    clearInterval(this.timer);
    this.at = won ? 100 : 0;
    this.render();
    this.onSettle(won ? this.stake : -this.stake);
    music.effect(won ? 'coins' : 'graze');
    this.root.querySelector('.dice-result')!.textContent = won ? `His knuckles hit the table. You win ${this.stake} coins.` : `Your knuckles hit the table. He takes your ${this.stake} coins.`;
    this.root.querySelector<HTMLButtonElement>('#arm-push')!.disabled = true;
    const close = this.root.querySelector<HTMLButtonElement>('#arm-close')!;
    close.hidden = false; close.focus();
  }

  private render() {
    const bar = this.root.querySelector<HTMLElement>('.arm-bar')!;
    bar.setAttribute('aria-valuenow', String(Math.round(this.at)));
    // Your side is on the left: the further left the marker, the closer you are.
    bar.querySelector<HTMLElement>('.arm-marker')!.style.left = `calc(${100 - this.at}% - 4px)`;
  }

  destroy() {
    clearInterval(this.timer); clearTimeout(this.start);
    this.cleanup.abort(); this.root.remove();
  }
}
