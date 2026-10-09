import { memories } from '../content/memories';
import { ANCHOR_SLOTS, held } from '../rules/memory';
import type { Memory, MemoryId } from '../rules/memory';

// At a fire, before sleeping, the hero can write one memory down. It survives the next death, then has to be written again.
export class AnchorView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(memory: Memory, onDone: (id: MemoryId | null) => void) {
    const written = memory.anchors ?? [];
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection anchor';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'anchor-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BY THE FIRE</p><h2 id="anchor-title">Write something down.</h2>
      <p class="resurrection-intro">Before you sleep, write down the thing you can't lose. It will still be yours after the next time you die. Then it has to be written again. You have room for ${ANCHOR_SLOTS === 1 ? 'one' : ANCHOR_SLOTS}.</p></div>
      <fieldset class="memory-choices"><legend>Memories you still hold</legend>${held(memory).map(id => `
        <label class="memory-choice"><input type="radio" name="anchor" value="${id}" ${written.includes(id) ? 'checked' : ''} />
          <span><strong>${memories[id].name}</strong>${written.includes(id) ? '<small class="perk">Already written down</small>' : `<small>Losing it: ${memories[id].cost}</small>`}</span></label>`).join('')}
      </fieldset>
      <div class="anchor-actions"><button id="write" type="button">Write it down</button><button id="skip" type="button">Not tonight</button></div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const write = this.root.querySelector<HTMLButtonElement>('#write')!;
    const chosen = () => this.root.querySelector<HTMLInputElement>('input[name="anchor"]:checked');
    write.disabled = !chosen();
    this.root.addEventListener('change', () => { write.disabled = !chosen(); }, { signal });
    write.addEventListener('click', () => { const pick = chosen(); if (pick) onDone(pick.value as MemoryId); }, { signal });
    this.root.querySelector('#skip')!.addEventListener('click', () => onDone(null), { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); onDone(null); return; }
      if (event.key !== 'Tab') return;
      const radio = chosen() ?? this.root.querySelector<HTMLInputElement>('input[name="anchor"]');
      const controls = [radio, write, this.root.querySelector<HTMLButtonElement>('#skip')].filter((control): control is HTMLInputElement | HTMLButtonElement => Boolean(control) && !control!.disabled);
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLInputElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    (chosen() ?? this.root.querySelector<HTMLInputElement>('input[name="anchor"]') ?? this.root).focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
