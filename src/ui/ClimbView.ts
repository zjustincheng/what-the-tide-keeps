import { music } from '../audio/music';
import { COLUMNS, HITS, makeWall, move, startClimb, strike } from '../rules/climb';
import type { Climb, Way } from '../rules/climb';

// A climb, seen side on: a wall of holds, climbed hold to hold with the arrows (or WASD, or the buttons), while stones
// or icicles fall down it. A column lights up just before something comes down it: get out of the way.
// Reaching the top finishes the climb; a third hit knocks you off. Escape lets go and climbs back down.
export type Hazard = 'stones' | 'icicles';
const COL = 48, ROW = 44, VISIBLE = 8;
// How long a column glows before something falls down it, and how long the fall takes.
const WARN = 650, FALL = 380;
const KEYS: Record<string, Way> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

export class ClimbView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private state: Climb;
  private next = 0;
  private closing = false;

  // every: how often, in milliseconds, something falls. Seeded by the wall, so the same wall falls the same way each try.
  constructor(heroImage: string, private title: string, height: number, seed: number, private hazard: Hazard, private every: number,
    private onDone: (reached: boolean, gaveUp: boolean) => void) {
    this.state = startClimb(makeWall(seed, height));
    this.next = seed;
    this.root = document.createElement('section');
    this.root.className = 'battle climb';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'climb-title');
    this.root.tabIndex = -1;
    const wall = this.state.wall;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">CLIMBING</p><h2 id="climb-title">${title}</h2>
      <p class="resurrection-intro" id="climb-note">Arrows or WASD, hold to hold. When a column glows, something is coming down it: move.</p></div>
      <div class="climb-wall" style="width:${COLUMNS * COL}px;height:${VISIBLE * ROW}px" data-hazard="${hazard}">
        <div class="climb-track" style="height:${wall.height * ROW}px">
          ${wall.holds.map(hold => `<span class="climb-hold" style="left:${hold.col * COL + COL / 2 - 7}px;top:${(wall.height - 1 - hold.row) * ROW + ROW / 2 - 5}px"></span>`).join('')}
          <span class="climb-top" style="top:0;height:${ROW}px"></span>
          <img class="climb-hero" alt="You" src="${heroImage}" />
        </div>
        ${Array.from({ length: COLUMNS }, (_, col) => `<span class="climb-warn" data-col="${col}" style="left:${col * COL}px;width:${COL}px"></span><span class="climb-stone" data-col="${col}" style="left:${col * COL + COL / 2 - 8}px"></span>`).join('')}
      </div>
      <p class="climb-hits" aria-live="polite"></p>
      <div class="climb-pad"><button data-way="up" aria-label="Climb up">↑</button><button data-way="left" aria-label="Reach left">←</button><button data-way="down" aria-label="Climb down">↓</button><button data-way="right" aria-label="Reach right">→</button></div>
      <button id="climb-quit" type="button">Let go and climb down</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('keydown', event => {
      const way = KEYS[event.key];
      if (way) { event.preventDefault(); this.go(way); }
      if (event.key === 'Escape') { event.preventDefault(); this.finish(false, true); }
    }, { signal });
    this.root.querySelectorAll<HTMLButtonElement>('[data-way]').forEach(button => button.addEventListener('pointerdown', event => {
      event.preventDefault(); this.go(button.dataset.way as Way);
    }, { signal }));
    this.root.querySelector('#climb-quit')!.addEventListener('click', () => this.finish(false, true), { signal });
    this.render();
    this.root.focus({ preventScroll: true });
    this.timers.push(setTimeout(() => this.drop(), 900));
  }

  // A seeded roll, so the same wall drops the same way each try.
  private roll(): number {
    this.next = (Math.imul(this.next + 0x9e3779b9, 2654435761) >>> 0) || 1;
    return (this.next % 10000) / 10000;
  }

  private go(way: Way) {
    if (this.state.done) return;
    const before = this.state.at;
    this.state = move(this.state, way);
    if (this.state.at !== before) music.effect('step-stone');
    this.render();
    if (this.state.done === 'top') this.finish(true, false);
  }

  // Something falls: more often down the climber's column than any other, after a glow to warn of it.
  private drop() {
    if (this.state.done) return;
    const col = this.roll() < 0.5 ? this.state.at.col : Math.floor(this.roll() * COLUMNS);
    const warn = this.root.querySelector<HTMLElement>(`.climb-warn[data-col="${col}"]`)!;
    warn.classList.add('on');
    this.timers.push(setTimeout(() => {
      warn.classList.remove('on');
      const stone = this.root.querySelector<HTMLElement>(`.climb-stone[data-col="${col}"]`)!;
      stone.classList.remove('falling'); void stone.offsetWidth; stone.classList.add('falling');
      // It passes the climber partway through its fall.
      this.timers.push(setTimeout(() => this.hit(col), FALL * 0.45));
    }, WARN));
    this.timers.push(setTimeout(() => this.drop(), this.every * (0.75 + this.roll() * 0.5)));
  }

  private hit(col: number) {
    const before = this.state;
    this.state = strike(this.state, col);
    if (this.state === before) return;
    music.effect('hit');
    this.root.querySelector('.climb-wall')!.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 220 });
    this.note(this.state.done === 'fell' ? 'It catches you full on, and you come off the wall.' : `${this.hazard === 'icicles' ? 'An icicle' : 'A stone'} catches you. You slide down the wall.`);
    this.render();
    if (this.state.done === 'fell') this.finish(false, false);
  }

  private note(text: string) { this.root.querySelector('#climb-note')!.textContent = text; }

  private finish(reached: boolean, gaveUp: boolean) {
    if (this.closing) return;
    this.closing = true;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
    this.state = { ...this.state, done: this.state.done ?? 'fell' };
    if (reached) { music.effect('find'); this.note('You pull yourself over the top.'); }
    else if (gaveUp) this.note('You let go, and climb back down.');
    this.timers.push(setTimeout(() => this.onDone(reached, gaveUp), reached ? 700 : gaveUp ? 200 : 1100));
  }

  private render() {
    const { wall, at, hits } = this.state;
    const hero = this.root.querySelector<HTMLElement>('.climb-hero')!;
    hero.style.left = `${at.col * COL + COL / 2 - 10}px`;
    hero.style.top = `${(wall.height - 1 - at.row) * ROW + ROW / 2 - 18}px`;
    // Keep the climber a little below the middle of the view, with the wall above him to read.
    const top = Math.max(0, Math.min((wall.height - VISIBLE) * ROW, (wall.height - 1 - at.row) * ROW - (VISIBLE - 3) * ROW));
    this.root.querySelector<HTMLElement>('.climb-track')!.style.transform = `translateY(${-top}px)`;
    this.root.querySelector('.climb-hits')!.textContent = `Row ${at.row + 1} of ${wall.height} · ${'●'.repeat(HITS - hits)}${'○'.repeat(hits)} grip`;
  }

  destroy() {
    for (const timer of this.timers) clearTimeout(timer);
    this.cleanup.abort(); this.root.remove();
  }
}
