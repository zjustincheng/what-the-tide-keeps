import { memories, perks } from '../content/memories';
import { PERKS } from '../rules/memory';
import type { Memory, MemoryId } from '../rules/memory';

// After a wipe the tide takes one memory: not the hero's choice. Only what he wrote down at a fire is safe.
export class ResurrectionView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(memory: Memory, taken: readonly MemoryId[], onStand: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'resurrection-title');
    this.root.tabIndex = -1;
    const written = memory.anchors ?? [];
    const reminded = memory.reminded ?? [];
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CHURCH OF THE COVENANT</p><h2 id="resurrection-title">The tide takes something.</h2>
      <p class="resurrection-intro">Salt water, a cold stone floor, the priest's voice. You reach for something, and it isn't there.</p></div>
      ${taken.length > 1 ? '<p class="resurrection-intro">You died at sea. The church\'s reach is thin out there, and the tide took twice.</p>' : ''}
      ${taken.map(id => `<section class="memory-taken" aria-label="What the tide took">
        <p class="eyebrow">GONE</p><h3>${memories[id].name}</h3>
        <p>${memories[id].cost}</p><p class="perk">${perks[PERKS[id]]}</p>
      </section>`).join('')}
      ${written.length ? `<p class="memories-lost">Written down, so the tide left it · ${written.map(id => memories[id].name).join(' · ')}</p>` : '<p class="memories-lost">Nothing was written down. Write down what you can\'t lose, at a fire, before the next time.</p>'}
      ${reminded.length ? `<p class="memories-lost">Reminded, and gone again · ${reminded.filter(id => !written.includes(id)).map(id => memories[id].name).join(' · ') || 'nothing'}${reminded.some(id => written.includes(id)) ? ` · kept for good, because you wrote it down: ${reminded.filter(id => written.includes(id)).map(id => memories[id].name).join(' · ')}` : ''}</p>` : ''}
      ${memory.keepsakeMemories?.length?`<p class="memories-lost">Held permanently by a keepsake · ${memory.keepsakeMemories.map(id=>memories[id].name).join(' · ')}</p>`:''}
      <p class="memories-lost">Already gone · ${memory.lost.filter(id => !reminded.includes(id)).map(id => memories[id].name).join(' · ')}</p>
      <button id="stand" type="button">Stand up</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const stand = this.root.querySelector<HTMLButtonElement>('#stand')!;
    stand.addEventListener('click', onStand, { signal });
    this.root.addEventListener('keydown', event => { if (event.key === 'Tab') { event.preventDefault(); stand.focus(); } }, { signal });
    stand.focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
