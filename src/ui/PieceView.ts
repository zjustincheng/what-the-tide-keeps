import { memories } from '../content/memories';
import { FRAGMENTS, READING, TELLING } from '../content/piecing';
import type { Remindable } from '../content/piecing';
import { scramble, settle } from '../rules/piecing';
import type { Companion } from '../rules/memory';
import { MEMBERS } from '../rules/battle';
import { music } from '../audio/music';

// A friend tells the hero something he lost, in pieces and out of order, and he puts it back in the order it happened.
// Nothing is lost by getting it wrong: they correct him, and the pieces he had right stay where he put them.
export class PieceView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private placed: (number | undefined)[] = [undefined, undefined, undefined, undefined];
  private right = [false, false, false, false];

  // by: the friend telling it, or 'page' for his own page, read back, with the two lines he wrote already in place.
  constructor(by: Companion | 'page', id: Remindable, onDone: () => void, written: readonly number[] = []) {
    const pieces = FRAGMENTS[id], told = scramble(id).filter(piece => !written.includes(piece));
    const voice = by === 'page' ? READING : TELLING[by];
    for (const line of written) { this.placed[line] = line; this.right[line] = true; }
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection piecing';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'piecing-title');
    this.root.tabIndex = -1;
    this.root.dataset.memory = id;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BY THE FIRE</p><h2 id="piecing-title">${by === 'page' ? `You read what you wrote about ${memories[id].name.toLowerCase()}.` : `The ${MEMBERS[by].name.toLowerCase()} tells you about ${memories[id].name.toLowerCase()}.`}</h2></div>
      <div class="piecing-voice"><img src="${import.meta.env.BASE_URL}assets/${by === 'page' ? 'hero' : by}.svg" alt="" /><p class="piecing-says" role="status">${by === 'page' ? voice.open : `“${voice.open}”`}</p></div>
      <ol class="piecing-places" aria-label="The order it happened">${pieces.map((_, place) => `<li><button type="button" class="piecing-place" data-place="${place}" aria-label="Place ${place + 1}, empty">${place + 1}</button></li>`).join('')}</ol>
      <div class="piecing-pool" role="group" aria-label="What they tell you">${told.map(piece => `<button type="button" class="piecing-piece" data-piece="${piece}">${pieces[piece]}</button>`).join('')}</div>
      <div class="piecing-whole" hidden><p>${pieces.join(' ')}</p><p class="memories-lost">Yours again, until the next time you die. Write it down, and it stays.</p></div>
      <div class="anchor-actions"><button id="piecing-keep" type="button" hidden>Keep it</button><button id="piecing-tell" type="button">${by === 'page' ? 'Read it through' : 'Just tell me'}</button></div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const says = this.root.querySelector<HTMLElement>('.piecing-says')!;
    const keep = this.root.querySelector<HTMLButtonElement>('#piecing-keep')!;
    const tell = this.root.querySelector<HTMLButtonElement>('#piecing-tell')!;
    const places = Array.from(this.root.querySelectorAll<HTMLButtonElement>('.piecing-place'));
    const pool = Array.from(this.root.querySelectorAll<HTMLButtonElement>('.piecing-piece'));

    const render = () => {
      places.forEach((button, place) => {
        const piece = this.placed[place];
        button.textContent = piece === undefined ? String(place + 1) : pieces[piece];
        button.dataset.filled = String(piece !== undefined);
        button.dataset.right = String(this.right[place]);
        button.disabled = this.right[place] || piece === undefined;
        button.setAttribute('aria-label', piece === undefined ? `Place ${place + 1}, empty` : `Place ${place + 1}: ${pieces[piece]}${this.right[place] ? ' (right)' : ''}`);
      });
      for (const button of pool) button.hidden = this.placed.includes(Number(button.dataset.piece));
    };
    const whole = () => {
      this.placed = [0, 1, 2, 3]; this.right = [true, true, true, true]; render();
      says.textContent = by === 'page' ? voice.done : `“${voice.done}”`;
      this.root.querySelector<HTMLElement>('.piecing-whole')!.hidden = false;
      this.root.querySelector<HTMLElement>('.piecing-pool')!.hidden = true;
      // Whole, it reads as one memory rather than four pieces.
      this.root.querySelector<HTMLElement>('.piecing-places')!.hidden = true;
      tell.hidden = true; keep.hidden = false; keep.focus({ preventScroll: true });
      music.effect('memory');
    };
    // When the last place fills, the friend listens: right pieces stay, the rest come back to be placed again.
    const check = () => {
      if (this.placed.includes(undefined)) return;
      const { right, whole: done } = settle(this.placed as number[]);
      if (done) { whole(); return; }
      this.right = right;
      this.placed = this.placed.map((piece, place) => (right[place] ? piece : undefined));
      says.textContent = by === 'page' ? voice.wrong : `“${voice.wrong}”`;
      music.effect('select');
      render();
      pool.find(button => !button.hidden)?.focus({ preventScroll: true });
    };
    for (const button of pool) button.addEventListener('click', () => {
      const place = this.placed.indexOf(undefined);
      if (place < 0) return;
      this.placed[place] = Number(button.dataset.piece);
      music.effect('key', place * 2);
      render(); check();
      if (!this.placed.every(piece => piece !== undefined)) pool.find(other => !other.hidden)?.focus({ preventScroll: true });
    }, { signal });
    // A piece placed by mistake goes back, unless it has been found to be right.
    places.forEach((button, place) => button.addEventListener('click', () => {
      if (this.right[place] || this.placed[place] === undefined) return;
      this.placed[place] = undefined; render();
    }, { signal }));
    // Focus stays on the fire until he is done.
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button')).filter(button => !button.disabled && !button.hidden && !button.closest('[hidden]'));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLButtonElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    tell.addEventListener('click', whole, { signal });
    keep.addEventListener('click', onDone, { signal });
    render();
    pool[0]?.focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
