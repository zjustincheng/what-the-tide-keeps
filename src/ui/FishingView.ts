import { bite, FISH, landed, marker, SPOTS } from '../rules/fishing';
import type { FishId, SpotId } from '../rules/fishing';

// How long the fish fights on the line before it slips the hook, in milliseconds.
const STRUGGLE = 4000;

// Each fish, drawn small enough to leap out of the water.
const FISH_ART: Record<FishId, string> = {
  minnow: '<svg viewBox="0 0 16 8" width="32" height="16" shape-rendering="crispEdges"><path fill="#9aa6a8" d="M3 2h8v4H3z"/><path fill="#c8d0d0" d="M4 2h6v2H4z"/><path fill="#7a8688" d="M0 1h3v6H0z"/><path fill="#141414" d="M9 3h1v1H9z"/></svg>',
  perch: '<svg viewBox="0 0 20 10" width="40" height="20" shape-rendering="crispEdges"><path fill="#8a8a4a" d="M4 2h12v6H4z"/><path fill="#b8a85a" d="M5 6h10v2H5z"/><path fill="#4a4a2a" d="M7 2h1v4H7zM10 2h1v4h-1zM13 2h1v4h-1z"/><path fill="#a85a3a" d="M0 1h4v8H0zM7 0h5v2H7z"/><path fill="#141414" d="M14 4h1v1h-1z"/></svg>',
  eel: '<svg viewBox="0 0 28 8" width="56" height="16" shape-rendering="crispEdges"><path fill="#2a3428" d="M2 3h22v3H2z"/><path fill="#3e4a38" d="M4 3h18v1H4z"/><path fill="#2a3428" d="M22 2h5v4h-5zM0 4h3v1H0z"/><path fill="#c8b870" d="M25 3h1v1h-1z"/></svg>',
};

// Cast, wait for a bite, then reel as the sweeping marker crosses the gold. Reeling early scares the fish off.
export class FishingView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private timer?: ReturnType<typeof setTimeout>;
  private frame = 0;
  private hooked?: { fish: FishId; zone: number; since: number };

  constructor(private spot: SpotId, private onCatch: (fish: FishId) => void, onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle fishing';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'fishing-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">FISHING</p><h2 id="fishing-title">${SPOTS[spot].name}</h2></div>
      <div class="fishing-pond" aria-hidden="true"><span class="fishing-line"></span><span class="fishing-bobber"></span><span class="fishing-leaper"></span><span class="fishing-splash"></span></div>
      <p class="fishing-status" aria-live="assertive"></p>
      <div class="fishing-bar"><span class="fishing-zone"></span><span class="fishing-marker"></span></div>
      <div class="fishing-actions"><button id="reel" type="button">Reel <small>Space or tap</small></button><button id="recast" type="button">Cast again</button><button id="fishing-close" type="button">Done</button></div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('#reel')!.addEventListener('pointerdown', event => { event.preventDefault(); this.reel(); }, { signal });
    this.root.querySelector('#recast')!.addEventListener('click', () => this.cast(), { signal });
    this.root.querySelector('#fishing-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      // Reeling answers on press, so the timing is the player's, not the key's release.
      if ([' ', 'Enter'].includes(event.key) && this.root.dataset.state !== 'done' && !event.repeat) { event.preventDefault(); this.reel(); }
    }, { signal });
    this.cast();
  }

  private status(text: string) { this.root.querySelector('.fishing-status')!.textContent = text; }
  private buttons(fishing: boolean) {
    this.root.querySelector<HTMLButtonElement>('#reel')!.hidden = !fishing;
    this.root.querySelector<HTMLButtonElement>('#recast')!.hidden = fishing;
    this.root.querySelector<HTMLButtonElement>(fishing ? '#reel' : '#recast')!.focus({ preventScroll: true });
  }

  private cast() {
    this.stop();
    delete this.root.querySelector<HTMLElement>('.fishing-pond')!.dataset.result;
    this.root.dataset.state = 'waiting';
    this.status('The line settles. Wait for a bite…');
    this.root.querySelector<HTMLElement>('.fishing-bar')!.hidden = true;
    this.buttons(true);
    this.timer = setTimeout(() => this.hook(), 1000 + Math.random() * 1500);
  }

  private hook() {
    const fish = bite(this.spot, Math.random());
    const zone = Math.random() * (1 - FISH[fish].zone);
    this.hooked = { fish, zone, since: performance.now() };
    this.root.dataset.state = 'bite';
    this.status('A bite! Reel as the marker crosses the gold.');
    const bar = this.root.querySelector<HTMLElement>('.fishing-bar')!;
    bar.hidden = false;
    bar.dataset.zone = String(zone); bar.dataset.width = String(FISH[fish].zone);
    const gold = this.root.querySelector<HTMLElement>('.fishing-zone')!;
    gold.style.left = `${zone * 100}%`; gold.style.width = `${FISH[fish].zone * 100}%`;
    const tick = () => {
      if (!this.hooked) return;
      const position = marker((performance.now() - this.hooked.since) / 1000, this.hooked.fish);
      this.root.querySelector<HTMLElement>('.fishing-marker')!.style.left = `${position * 100}%`;
      bar.dataset.marker = String(position);
      this.frame = requestAnimationFrame(tick);
    };
    tick();
    this.timer = setTimeout(() => this.finish('It thrashes, and slips the hook.'), STRUGGLE);
  }

  private reel() {
    if (this.root.dataset.state === 'waiting') { this.finish('Too soon. Whatever was down there is gone.'); return; }
    if (!this.hooked) return;
    const { fish, zone, since } = this.hooked;
    if (landed(marker((performance.now() - since) / 1000, fish), zone, fish)) {
      this.onCatch(fish);
      this.finish(`You land a ${FISH[fish].name.toLowerCase()}. It goes in your pack.`, fish);
    } else this.finish('The line goes slack. It got away.');
  }

  // A landed fish leaps clear of the water; anything else just splashes.
  private finish(text: string, caught?: FishId) {
    this.stop();
    const pond = this.root.querySelector<HTMLElement>('.fishing-pond')!;
    const leaper = pond.querySelector<HTMLElement>('.fishing-leaper')!;
    leaper.innerHTML = caught ? FISH_ART[caught] : '';
    pond.dataset.result = caught ? 'caught' : 'lost';
    if (caught) pond.dataset.fish = caught; else delete pond.dataset.fish;
    this.root.dataset.state = 'done';
    this.status(text);
    this.buttons(false);
  }

  private stop() {
    clearTimeout(this.timer); cancelAnimationFrame(this.frame); this.hooked = undefined;
  }

  destroy() {
    this.stop(); this.cleanup.abort(); this.root.remove();
  }
}
