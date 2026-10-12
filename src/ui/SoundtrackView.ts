import { music } from '../audio/music';
import { THEMES, THEME_IDS, loopBeats } from '../audio/themes';
import type { ThemeId } from '../audio/themes';

const group = (id: ThemeId) => id.startsWith('boss-') || id === 'kraken' || id === 'boss' ? 'Bosses' : id === 'battle' || id === 'arena' ? 'Battle' : 'Places & memories';
const tracks = [...THEME_IDS].sort((a, b) => group(a).localeCompare(group(b)) || THEMES[a].name.localeCompare(THEMES[b].name));

export class SoundtrackView {
  private root = document.createElement('section');
  private cleanup = new AbortController();
  private previous = music.current;
  private wasMuted = music.muted;
  private selected: ThemeId = music.current ?? 'kraken';
  private active = false;

  constructor(close: () => void, parent = document.querySelector<HTMLElement>('.game-frame')!) {
    this.root.className = 'battle soundtrack-player';
    if (parent === document.body) this.root.classList.add('soundtrack-title');
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'soundtrack-title');
    this.root.innerHTML = `
      <div class="soundtrack-heading"><div><p class="eyebrow">WHAT THE TIDE KEEPS · ${tracks.length} TRACKS</p><h2 id="soundtrack-title">Soundtracks</h2></div><button data-action="close" aria-label="Close soundtracks">Close ×</button></div>
      <p class="soundtrack-note">Every place, memory, and boss theme. Select a track to listen. Tracks repeat.</p>
      <label class="soundtrack-search">Find a track <input type="search" placeholder="Search names or bosses…" aria-label="Search soundtracks" /></label>
      <div class="soundtrack-list" aria-label="All soundtracks">${tracks.map(id => {
        const theme = THEMES[id];
        const seconds = Math.round(loopBeats(theme) * 60 / theme.bpm);
        const detail = `${group(id)}${id.startsWith('boss-') ? ` · ${id.slice(5)}` : ''}`;
        return `<button class="soundtrack-track" data-track="${id}" aria-pressed="false"><span><strong>${theme.name}</strong><small>${detail}</small></span><span class="soundtrack-duration">${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} ↻</span></button>`;
      }).join('')}<p class="soundtrack-empty" hidden>No tracks match your search.</p></div>
      <div class="soundtrack-controls"><p class="soundtrack-status" aria-live="polite">Choose a track</p><div class="soundtrack-transport"><button data-action="previous" aria-label="Previous track">←</button><button data-action="toggle">Play</button><button data-action="next" aria-label="Next track">→</button><label>Volume <input type="range" min="0" max="100" value="${Math.round(music.volume * 100)}" aria-label="Soundtrack volume" /></label></div></div>`;
    parent.append(this.root);
    music.pause();
    const signal = this.cleanup.signal;
    this.root.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button) return;
      if (button.dataset.track) this.play(button.dataset.track as ThemeId);
      else if (button.dataset.action === 'close') close();
      else if (button.dataset.action === 'toggle') {
        if (this.active) { music.pause(); this.active = false; this.render(); }
        else this.play(this.selected);
      } else {
        const offset = button.dataset.action === 'previous' ? -1 : 1;
        this.play(tracks[(tracks.indexOf(this.selected) + offset + tracks.length) % tracks.length]);
      }
    }, { signal });
    this.root.querySelector<HTMLInputElement>('input[type="search"]')!.addEventListener('input', event => {
      const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
      let matches = 0;
      for (const button of Array.from(this.root.querySelectorAll<HTMLButtonElement>('[data-track]'))) {
        button.hidden = !button.textContent!.toLowerCase().includes(query);
        if (!button.hidden) matches++;
      }
      this.root.querySelector<HTMLElement>('.soundtrack-empty')!.hidden = matches > 0;
    }, { signal });
    this.root.querySelector<HTMLInputElement>('input[type="range"]')!.addEventListener('input', event => music.setVolume(Number((event.target as HTMLInputElement).value) / 100), { signal });
    this.root.addEventListener('keydown', event => {
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('button:not([hidden]), input'));
      const index = controls.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.root.querySelector<HTMLInputElement>('input[type="search"]')!.focus();
  }

  private play(id: ThemeId) {
    this.selected = id;
    if (music.muted) music.toggleMute();
    music.unlock();
    music.play(id);
    this.active = true;
    this.render();
  }

  private render() {
    this.root.querySelector('.soundtrack-status')!.textContent = `${this.active ? 'Playing' : 'Stopped'} · ${THEMES[this.selected].name}`;
    this.root.querySelector('[data-action="toggle"]')!.textContent = this.active ? 'Stop' : 'Play';
    for (const button of Array.from(this.root.querySelectorAll<HTMLElement>('[data-track]'))) button.setAttribute('aria-pressed', String(this.active && button.dataset.track === this.selected));
  }

  destroy() {
    this.cleanup.abort();
    this.root.remove();
    music.pause();
    if (music.muted !== this.wasMuted) music.toggleMute();
    if (this.previous) music.play(this.previous);
  }
}
