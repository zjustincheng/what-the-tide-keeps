import type { Entry } from '../storage/journal';

// Everything people have told the hero, grouped by who said it.
export class JournalView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(entries: readonly Entry[], onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle journal';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'journal-title');
    this.root.tabIndex = -1;
    const speakers = [...new Set(entries.map(entry => entry.speaker))];
    const escape = (text: string) => text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">WRITTEN DOWN</p><h2 id="journal-title">Journal</h2>
      <p class="resurrection-intro">${entries.length ? 'What people have told you, in their own words. Paper keeps it when you can\'t.' : 'Nothing yet. Ask people things, and what they tell you is written down here.'}</p></div>
      <div class="journal-entries">${speakers.map(speaker => {
        const said = entries.filter(entry => entry.speaker === speaker);
        return `<details><summary>${escape(speaker)} <small>${escape(said[0].place)} · ${said.length}</small></summary>${said.map(entry => `<h3>${escape(entry.topic)}</h3>${entry.lines.map(line => `<p>${escape(line)}</p>`).join('')}`).join('')}</details>`;
      }).join('')}</div>
      <button id="journal-close" type="button">Close</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('#journal-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key === 'j' || event.key === 'J') { event.preventDefault(); onClose(); } }, { signal });
    (this.root.querySelector<HTMLElement>('summary') ?? this.root.querySelector<HTMLElement>('#journal-close')!).focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
