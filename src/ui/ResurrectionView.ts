import { memories, perks } from '../content/memories';
import { forgettable, PERKS } from '../rules/memory';
import type { Memory, MemoryId } from '../rules/memory';

// After a wipe the hero must give up one memory before he can stand.
export class ResurrectionView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(memory: Memory, onChoose: (id: MemoryId) => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'resurrection-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CHURCH OF THE COVENANT</p><h2 id="resurrection-title">The tide takes something.</h2>
      <p class="resurrection-intro">Salt water, a cold stone floor, the priest's voice. Before you can stand, choose what to let go. Something Hollow fills the space it leaves.</p></div>
      ${(memory.anchors ?? []).length ? `<p class="memories-lost">Written down · ${(memory.anchors ?? []).map(id => memories[id].name).join(' · ')} · kept this time</p>` : ''}
      <fieldset class="memory-choices"><legend>Memories you still hold</legend>${forgettable(memory).map(id => `
        <label class="memory-choice"><input type="radio" name="memory" value="${id}" />
          <span><strong>${memories[id].name}</strong><small>Forgetting: ${memories[id].cost}</small><small class="perk">${perks[PERKS[id]]}</small></span></label>`).join('')}
      </fieldset>
      <p class="memories-lost">Already gone · ${memory.lost.map(id => memories[id].name).join(' · ')}</p>
      <button id="forget" type="button" disabled>Let it go</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const confirm = this.root.querySelector<HTMLButtonElement>('#forget')!;
    this.root.addEventListener('change', () => { confirm.disabled = false; }, { signal });
    confirm.addEventListener('click', () => {
      const chosen = this.root.querySelector<HTMLInputElement>('input[name="memory"]:checked');
      if (chosen) onChoose(chosen.value as MemoryId);
    }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      // Radios are one tab stop; keep focus inside the dialog.
      const radio = this.root.querySelector<HTMLInputElement>('input[name="memory"]:checked') ?? this.root.querySelector<HTMLInputElement>('input[name="memory"]');
      const controls = [radio, confirm].filter((control): control is HTMLInputElement | HTMLButtonElement => Boolean(control) && !control!.disabled);
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLInputElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    (this.root.querySelector<HTMLInputElement>('input[name="memory"]') ?? this.root).focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
