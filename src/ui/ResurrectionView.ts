import { memories, perks } from '../content/memories';
import { PERKS } from '../rules/memory';
import type { Memory, MemoryId } from '../rules/memory';
import { KEEPSAKES } from '../rules/gear';
import type { KeepsakeId } from '../rules/gear';

// After a wipe the tide takes one memory: not the hero's choice. Only what he wrote down at a fire is safe.
export class ResurrectionView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(memory: Memory, taken: readonly MemoryId[], onStand: () => void, broken: readonly KeepsakeId[] = []) {
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'resurrection-title');
    this.root.tabIndex = -1;
    const written = memory.anchors ?? [];
    const reminded = memory.reminded ?? [];
    const faded = reminded.filter(id => !written.includes(id));
    const restored = reminded.filter(id => written.includes(id));
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CHURCH OF THE COVENANT</p><h2 id="resurrection-title">The tide takes something.</h2>
      <p class="resurrection-intro">Salt water, a cold stone floor, the priest's voice. You reach for something, and it isn't there.</p></div>
      ${taken.length > 1 ? '<p class="resurrection-intro">You died at sea. The church\'s reach is thin out there, and the tide took twice.</p>' : ''}
      ${taken.map(id => `<section class="memory-taken" aria-label="What the tide took">
        <p class="eyebrow">GONE</p><h3>${memories[id].name}</h3>
        <p>${memories[id].cost}</p><p class="perk">${perks[PERKS[id]]}</p>
      </section>`).join('')}
      ${broken.length ? `<section class="memory-taken keepsake-broken" aria-label="What broke"><p class="eyebrow">BROKEN</p><h3>${broken.map(id => KEEPSAKES[id].name).join(', ')}</h3><p>It didn't survive the fall. The shop that sold it will sell you another.</p></section>` : ''}
      ${written.length ? `<p class="memories-lost">Written down, so the tide left it · ${written.map(id => memories[id].name).join(' · ')}. The page is used up; write it again before the next death.</p>` : '<p class="memories-lost">Nothing was written down. Write down what you can\'t lose, at a fire, before the next time.</p>'}
      ${faded.length ? `<p class="memories-lost">Reminders that faded · ${faded.map(id => memories[id].name).join(' · ')}</p>` : ''}
      ${restored.length ? `<p class="memories-lost">Restored through the written page · ${restored.map(id => memories[id].name).join(' · ')}</p>` : ''}
      ${memory.keepsakeMemories?.length ? `<p class="memories-lost">Held permanently by a keepsake · ${memory.keepsakeMemories.map(id => memories[id].name).join(' · ')}</p>` : ''}
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
