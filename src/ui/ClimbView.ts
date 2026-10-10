import { music } from '../audio/music';
import { COLUMNS, HITS, makeWall, move, startClimb, strike } from '../rules/climb';
import type { Climb, Way } from '../rules/climb';

// A climb, seen side on: a wall of holds, climbed hold to hold with the arrows (or WASD, or the buttons), while stones
// or icicles fall down it. A column glows just before something comes down it: get out of the way.
// Reaching the top finishes the climb; a third hit knocks you off. Escape lets go and climbs back down.
export type Hazard = 'stones' | 'icicles';
const COL = 48, ROW = 46, VISIBLE = 8;
// How long a column glows before something falls down it, and how long the fall takes.
const WARN = 650, FALL = 420;
const KEYS: Record<string, Way> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

// The hero from behind, climbing: a chameleon, crest up, eyes bulging out to either side, tail curled under. One hand reaches up
// to the hold he's on while the opposite foot pushes up under him, the way climbers move. Drawn reaching with the right hand;
// mirrored, he reaches with the left. On a 20 by 24 grid.
const px = (x: number, y: number, w: number, h: number, c: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const G = '#6e9a58', D = '#46723a', L = '#a2c882', T = '#8a7458', B = '#5a4a38', E = '#d8c868', P = '#1e2418';
const CLIMBER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" shape-rendering="crispEdges">${[
  // Tail, curled under him.
  px(9, 16, 2, 3, D), px(10, 19, 2, 2, D), px(12, 20, 3, 1, D), px(14, 18, 1, 2, D), px(12, 17, 2, 1, D), px(12, 18, 1, 1, G),
  // The right leg straight down, toes on the wall; the left leg drawn up under him.
  px(11, 15, 2, 4, G), px(11, 19, 3, 2, L), px(12, 21, 1, 1, L), px(14, 20, 1, 1, L),
  px(5, 14, 3, 2, G), px(4, 12, 2, 3, G), px(3, 11, 3, 2, L), px(3, 10, 1, 1, L), px(5, 10, 1, 1, L),
  // The body, in his tunic, with the ridge of his spine showing above it.
  px(7, 7, 6, 8, G), px(9, 7, 2, 2, D), px(7, 9, 6, 5, T), px(7, 13, 6, 1, B), px(9, 9, 2, 4, '#7a6650'),
  // The left arm bent down and out, hand flat on the rock.
  px(5, 8, 2, 2, G), px(4, 9, 2, 3, G), px(3, 12, 3, 2, L),
  // The right arm reaching up to the hold, fingers curled over it.
  px(13, 6, 2, 3, G), px(14, 3, 2, 4, G), px(14, 1, 3, 2, L), px(14, 0, 1, 1, L), px(16, 0, 1, 1, L),
  // The head: the casque rising to a crest, and the eyes bulging out to either side.
  px(8, 2, 4, 5, G), px(9, 1, 2, 1, D), px(9, 0, 1, 1, D), px(8, 5, 4, 1, D),
  px(6, 3, 2, 2, E), px(6, 3, 1, 1, P), px(12, 3, 2, 2, E), px(13, 3, 1, 1, P),
].join('')}</svg>`;
// Where his reaching hand is on the grid, so it can be put on the hold.
const HAND = { x: 15.5, y: 1 };
const SCALE = 2;

export class ClimbView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private state: Climb;
  private next = 0;
  private closing = false;
  private lead = false;

  // every: how often, in milliseconds, something falls. seed: a new one each climb, so no two climbs are the same.
  constructor(_heroImage: string, private title: string, height: number, seed: number, private hazard: Hazard, private every: number,
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
    const y = (row: number) => (wall.height - 1 - row) * ROW;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">CLIMBING</p><h2 id="climb-title">${title}</h2>
      <p class="resurrection-intro" id="climb-note">Arrows or WASD, to the hold next to you. When a column glows, something is coming down it: move.</p></div>
      <div class="climb-wall" style="width:${COLUMNS * COL}px;height:${VISIBLE * ROW}px" data-hazard="${hazard}">
        <div class="climb-track" style="height:${wall.height * ROW}px">
          ${this.scenery(wall.height, seed)}
          <span class="climb-top" style="top:0;height:${ROW}px"></span>
          ${wall.holds.map(hold => `<span class="climb-hold" data-hold="${hold.col},${hold.row}" style="left:${hold.col * COL + COL / 2 - 9}px;top:${y(hold.row) + ROW / 2 - 6}px"></span>`).join('')}
          <span class="climber"><span class="climber-body">${CLIMBER}</span></span>
        </div>
        ${Array.from({ length: COLUMNS }, (_, col) => `<span class="climb-warn" data-col="${col}" style="left:${col * COL}px;width:${COL}px"><i></i></span><span class="climb-stone" data-col="${col}" style="left:${col * COL + COL / 2 - 9}px"></span>`).join('')}
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
    this.render(false);
    this.root.focus({ preventScroll: true });
    this.timers.push(setTimeout(() => this.drop(), 900));
  }

  // The wall itself: cracks, and moss and ivy on stone, or frost and meltwater streaks on ice. Seeded, so it is the same wall each try.
  private scenery(height: number, seed: number): string {
    let s = seed;
    const roll = () => { s = (Math.imul(s + 0x6d2b79f5, 1597334677) >>> 0) || 1; return (s % 10000) / 10000; };
    const marks: string[] = [];
    for (let i = 0; i < height * 3; i++) {
      const x = Math.floor(roll() * COLUMNS * COL), top = Math.floor(roll() * height * ROW);
      const kind = roll();
      if (kind < 0.4) marks.push(`<span class="climb-crack" style="left:${x}px;top:${top}px;height:${10 + Math.floor(roll() * 26)}px;transform:rotate(${Math.floor(roll() * 50) - 25}deg)"></span>`);
      else if (kind < 0.75) marks.push(`<span class="climb-${this.hazard === 'icicles' ? 'frost' : 'moss'}" style="left:${x}px;top:${top}px;width:${8 + Math.floor(roll() * 18)}px"></span>`);
      else marks.push(`<span class="climb-${this.hazard === 'icicles' ? 'streak' : 'leaf'}" style="left:${x}px;top:${top}px"></span>`);
    }
    return marks.join('');
  }

  // A seeded roll: the climb's own randomness, new each time.
  private roll(): number {
    this.next = (Math.imul(this.next + 0x9e3779b9, 2654435761) >>> 0) || 1;
    return (this.next % 10000) / 10000;
  }

  private go(way: Way) {
    if (this.state.done) return;
    const before = this.state.at;
    this.state = move(this.state, way);
    if (this.state.at === before) {
      // Nothing to reach that way: a short grab at bare rock.
      this.climber().animate([{ transform: 'translate(0,0)' }, { transform: `translate(${way === 'left' ? -5 : way === 'right' ? 5 : 0}px,${way === 'up' ? -5 : way === 'down' ? 5 : 0}px)` }, { transform: 'translate(0,0)' }], { duration: 160, easing: 'ease-out' });
      return;
    }
    this.lead = !this.lead;
    music.effect(this.hazard === 'icicles' ? 'step-snow' : 'step-stone');
    this.grit(this.state.at.col, this.state.at.row);
    this.render(true);
    if (this.state.done === 'top') this.finish(true, false);
  }

  // A little grit knocked loose from the hold just grabbed.
  private grit(col: number, row: number) {
    const track = this.root.querySelector('.climb-track')!;
    const hold = this.root.querySelector<HTMLElement>(`[data-hold="${col},${row}"]`);
    hold?.animate([{ filter: 'brightness(1.6)' }, { filter: 'brightness(1)' }], { duration: 260 });
    for (let i = 0; i < 3; i++) {
      const bit = document.createElement('span');
      bit.className = 'climb-grit';
      bit.style.left = `${col * COL + COL / 2 - 6 + i * 5}px`;
      bit.style.top = `${(this.state.wall.height - 1 - row) * ROW + ROW / 2 + 4}px`;
      track.append(bit);
      bit.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${(i - 1) * 4}px,${22 + i * 6}px)`, opacity: 0 }], { duration: 420 + i * 60, easing: 'ease-in' }).onfinish = () => bit.remove();
    }
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
      const wallHeight = VISIBLE * ROW;
      stone.animate(this.hazard === 'icicles'
        ? [{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${wallHeight + 30}px)`, opacity: 1 }]
        : [{ transform: 'translateY(0) rotate(0deg)', opacity: 1 }, { transform: `translateY(${wallHeight + 30}px) rotate(${col % 2 ? 540 : -540}deg)`, opacity: 1 }],
      { duration: FALL, easing: 'cubic-bezier(.5,0,1,1)' }).onfinish = () => this.burst(col);
      // It passes the climber partway through its fall.
      this.timers.push(setTimeout(() => this.hit(col), FALL * 0.5));
    }, WARN));
    this.timers.push(setTimeout(() => this.drop(), this.every * (0.75 + this.roll() * 0.5)));
  }

  // Where it lands, out of sight below: a puff of dust or a spray of ice at the foot of the view.
  private burst(col: number) {
    const wall = this.root.querySelector('.climb-wall');
    if (!wall) return;
    for (let i = 0; i < 5; i++) {
      const bit = document.createElement('span');
      bit.className = `climb-burst${this.hazard === 'icicles' ? ' ice' : ''}`;
      bit.style.left = `${col * COL + COL / 2}px`;
      wall.append(bit);
      bit.animate([{ transform: 'translate(-50%,0) scale(1)', opacity: 0.9 }, { transform: `translate(calc(-50% + ${(i - 2) * 9}px),${-14 - (i % 3) * 8}px) scale(0.4)`, opacity: 0 }], { duration: 380, easing: 'ease-out' }).onfinish = () => bit.remove();
    }
  }

  // The test hook and the stone both come here: if the climber is in that column, he is knocked down, or off.
  private hit(col: number) {
    const before = this.state;
    this.state = strike(this.state, col);
    if (this.state === before) return;
    music.effect('hit');
    this.root.querySelector('.climb-wall')!.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 260 });
    this.climber().animate([{ filter: 'brightness(2) sepia(1) hue-rotate(-40deg) saturate(4)' }, { filter: 'none' }], { duration: 420 });
    this.note(this.state.done === 'fell' ? 'It catches you full on, and you come off the wall.' : `${this.hazard === 'icicles' ? 'An icicle' : 'A stone'} catches you. You slide down the wall.`);
    if (this.state.done === 'fell') {
      this.climber().classList.add('falling-off');
      this.renderHits();
      this.finish(false, false);
    } else this.render(true, true);
  }

  private climber(): HTMLElement { return this.root.querySelector<HTMLElement>('.climber')!; }
  private note(text: string) { this.root.querySelector('#climb-note')!.textContent = text; }

  private finish(reached: boolean, gaveUp: boolean) {
    if (this.closing) return;
    this.closing = true;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
    this.state = { ...this.state, done: this.state.done ?? 'fell' };
    if (reached) { music.effect('find'); this.note('You pull yourself over the top.'); this.climber().classList.add('summit'); }
    else if (gaveUp) this.note('You let go, and climb back down.');
    this.timers.push(setTimeout(() => this.onDone(reached, gaveUp), reached ? 800 : gaveUp ? 200 : 1100));
  }

  // Where the climber is, and the view scrolled to keep him a little below the middle with the wall above him to read.
  // slid: knocked down, which takes longer than a reach.
  private render(moved: boolean, slid = false) {
    const { wall, at } = this.state;
    const climber = this.climber();
    climber.style.transition = moved ? (slid ? 'left 320ms ease-in, top 320ms ease-in' : 'left 150ms cubic-bezier(.3,1.5,.6,1), top 150ms cubic-bezier(.3,1.5,.6,1)') : 'none';
    // Hanging from the hold by his reaching hand: mirrored, that hand is on the other side.
    const handX = (this.lead ? 20 - HAND.x : HAND.x) * SCALE, handY = HAND.y * SCALE;
    climber.style.left = `${at.col * COL + COL / 2 - handX}px`;
    climber.style.top = `${(wall.height - 1 - at.row) * ROW + ROW / 2 - handY - 2}px`;
    const body = climber.querySelector<HTMLElement>('.climber-body')!;
    body.style.transform = this.lead ? 'scaleX(-1)' : '';
    // A reach: he stretches toward the hold, then settles onto it.
    if (moved && !slid) body.animate([{ transform: `${this.lead ? 'scaleX(-1) ' : ''}scale(0.94, 1.1)` }, { transform: this.lead ? 'scaleX(-1)' : 'none' }], { duration: 200, easing: 'cubic-bezier(.3,1.6,.6,1)' });
    const top = Math.max(0, Math.min((wall.height - VISIBLE) * ROW, (wall.height - 1 - at.row) * ROW - (VISIBLE - 3) * ROW));
    this.root.querySelector<HTMLElement>('.climb-track')!.style.transform = `translateY(${-top}px)`;
    this.renderHits();
  }

  private renderHits() {
    const { wall, at, hits } = this.state;
    this.root.querySelector('.climb-hits')!.textContent = `Row ${at.row + 1} of ${wall.height} · ${'●'.repeat(HITS - hits)}${'○'.repeat(hits)} grip`;
  }

  destroy() {
    for (const timer of this.timers) clearTimeout(timer);
    this.cleanup.abort(); this.root.remove();
  }
}
