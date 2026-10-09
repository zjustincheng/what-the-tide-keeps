import { BESTIARY } from '../content/bestiary';
import { ENEMIES, ENEMY_SPELLS } from '../rules/battle';
import type { Encounter } from '../rules/battle';
import type { Bestiary } from '../storage/bestiary';

// Everything the hero has fought: what it is, what he has seen it do, and how often he has beaten it.
export class BestiaryView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(bestiary: Bestiary, studied: readonly string[], onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle journal bestiary';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'bestiary-title');
    this.root.tabIndex = -1;
    const met = (Object.keys(ENEMIES) as Encounter[]).filter(id => bestiary[id]);
    const total = Object.keys(ENEMIES).length;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">WHAT YOU HAVE FOUGHT · ${met.length} OF ${total}</p><h2 id="bestiary-title">Bestiary</h2>
      <p class="resurrection-intro">${met.length ? 'Kept on paper, like the journal, so it survives every death.' : 'Nothing yet. Whatever you fight is written down here.'}</p></div>
      <div class="journal-entries">${met.map(id => {
        const entry = bestiary[id]!;
        const spell = ENEMY_SPELLS[id];
        return `<details><summary><img src="${import.meta.env.BASE_URL}assets/${id}.svg" alt="" /> ${ENEMIES[id].name} <small>${entry.defeated ? `beaten ${entry.defeated}×` : 'not yet beaten'}</small></summary>
          <p>${BESTIARY[id]}</p>
          <h3>SEEN TO</h3><p>${entry.moves.length ? entry.moves.join(' · ') : 'Nothing you could name yet.'}</p>
          ${spell ? `<h3>ITS SPELL</h3><p>${studied.includes(spell) ? `${spell}: studied. It can be dodged and barred.` : 'Not yet studied. Analyze it, or survive it once.'}</p>` : ''}</details>`;
      }).join('')}</div>
      <button id="bestiary-close" type="button">Close</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('#bestiary-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key === 'b' || event.key === 'B') { event.preventDefault(); onClose(); } }, { signal });
    (this.root.querySelector<HTMLElement>('summary') ?? this.root.querySelector<HTMLElement>('#bestiary-close')!).focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
