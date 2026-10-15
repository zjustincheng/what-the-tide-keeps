import { memories } from '../content/memories';
import { FRAGMENTS } from '../content/piecing';
import type { Remindable } from '../content/piecing';
import { music } from '../audio/music';

// Writing a memory down at a fire: the page has room for two of its lines, and he chooses which.
// What he writes outlasts him; if the tide takes the memory, the page can bring it back.
export class WriteView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(id: Remindable, written: readonly number[] | undefined, onDone: (lines: readonly number[]) => void) {
    const lines = FRAGMENTS[id];
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection piecing writing';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'writing-title');
    this.root.tabIndex = -1;
    this.root.dataset.memory = id;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BY THE FIRE</p><h2 id="writing-title">You write down ${memories[id].name.toLowerCase()}.</h2>
      <p class="resurrection-intro">The page has room for two lines. Choose the two you most want to keep. If the tide ever takes this, the page is how you find it again.</p></div>
      <fieldset class="memory-choices writing-lines"><legend>What you remember</legend>${lines.map((line, index) => `
        <label class="memory-choice"><input type="checkbox" name="line" value="${index}" ${written?.includes(index) ? 'checked' : ''} /><span>${line}</span></label>`).join('')}
      </fieldset>
      <p class="anchor-summary" role="status"></p>
      <div class="anchor-actions"><button id="writing-done" type="button">Write it</button></div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const done = this.root.querySelector<HTMLButtonElement>('#writing-done')!;
    const boxes = Array.from(this.root.querySelectorAll<HTMLInputElement>('input[name="line"]'));
    const chosen = () => boxes.filter(box => box.checked).map(box => Number(box.value));
    const update = () => {
      const count = chosen().length;
      // Two lines fill the page: the others can't be ticked until one is taken off.
      for (const box of boxes) box.disabled = !box.checked && count >= 2;
      done.disabled = count !== 2;
      this.root.querySelector('.anchor-summary')!.textContent = count === 2 ? 'The page is full.' : `Room for ${2 - count} more ${count === 1 ? 'line' : 'lines'}.`;
    };
    this.root.addEventListener('change', () => { music.effect('key', chosen().length * 3); update(); }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...boxes, done].filter(control => !control.disabled);
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLInputElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    done.addEventListener('click', () => { if (chosen().length === 2) onDone(chosen()); }, { signal });
    update();
    boxes[0].focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
