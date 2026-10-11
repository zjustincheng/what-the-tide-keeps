import { music } from '../audio/music';
import { tableau } from '../presentation/tableau';
import type { Story } from '../presentation/stories';

export class CinematicView {
  private root = document.createElement('section');
  private cleanup = new AbortController();
  private typing?: ReturnType<typeof setInterval>;
  private index = 0;
  private complete = false;
  private finished = false;
  private previousTheme = music.current;

  constructor(private story: Story, private onFinish: () => void) {
    this.root.className = 'cinematic';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', story.title);
    this.root.innerHTML = `<div class="cinema-letterbox"><span class="cinema-kicker"></span><button type="button" class="cinema-skip">Skip scene <span>Esc</span></button></div>
      <div class="cinema-picture"><div class="cinema-set"></div><div class="cinema-actors"></div><div class="cinema-dust" aria-hidden="true"></div></div>
      <div class="cinema-copy"><p class="eyebrow cinema-caption"></p><h2></h2><p class="cinema-line"></p>
      <div class="cinema-bottom"><span class="cinema-count"></span><button type="button" class="cinema-next">Continue <span>↵</span></button></div></div>`;
    this.root.querySelector('h2')!.textContent = story.title;
    this.root.querySelector('.cinema-kicker')!.textContent = story.subtitle;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('.cinema-next')!.addEventListener('click', () => this.next(), { signal });
    this.root.querySelector('.cinema-skip')!.addEventListener('click', () => this.finish(), { signal });
    this.root.addEventListener('keydown', event => {
      event.stopPropagation();
      if (event.repeat) { event.preventDefault(); return; }
      if (event.key === 'Escape') { event.preventDefault(); this.finish(); }
      else if ([' ', 'Enter'].includes(event.key) && !(event.target as Element).closest('.cinema-skip')) { event.preventDefault(); this.next(); }
      else if (event.key === 'Tab') {
        event.preventDefault();
        const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button'));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    }, { signal });
    music.play('wake');
    this.show();
    this.root.querySelector<HTMLButtonElement>('.cinema-next')!.focus({ preventScroll: true });
  }

  private show() {
    clearInterval(this.typing);
    const shot = this.story.shots[this.index];
    this.root.dataset.art = shot.art;
    this.root.querySelector('.cinema-set')!.innerHTML = tableau(shot.art);
    const actors = this.root.querySelector('.cinema-actors')!;
    actors.replaceChildren(...(shot.actors ?? []).map(actor => {
      const img = document.createElement('img'); img.src = `${import.meta.env.BASE_URL}assets/${actor}.svg`; img.alt = ''; return img;
    }));
    this.root.querySelector('.cinema-caption')!.textContent = shot.caption;
    this.root.querySelector('.cinema-count')!.textContent = `${String(this.index + 1).padStart(2, '0')} / ${String(this.story.shots.length).padStart(2, '0')}`;
    const line = this.root.querySelector<HTMLElement>('.cinema-line')!;
    // A stable accessible sentence while the visible letters appear.
    line.setAttribute('aria-label', shot.text);
    line.innerHTML = '<span aria-hidden="true"></span>';
    const visible = line.firstElementChild!;
    this.complete = matchMedia('(prefers-reduced-motion: reduce)').matches;
    visible.textContent = this.complete ? shot.text : '';
    let length = 0;
    if (!this.complete) this.typing = setInterval(() => {
      length += 2; visible.textContent = shot.text.slice(0, length);
      if (length >= shot.text.length) { clearInterval(this.typing); this.complete = true; }
    }, 24);
    if (shot.sound) music.effect(shot.sound);
    this.root.querySelector('.cinema-next')!.innerHTML = `${this.index === this.story.shots.length - 1 ? 'Return' : 'Continue'} <span>↵</span>`;
  }

  private next() {
    music.unlock();
    if (!this.complete) {
      clearInterval(this.typing); this.complete = true;
      this.root.querySelector('.cinema-line span')!.textContent = this.story.shots[this.index].text;
      return;
    }
    if (++this.index === this.story.shots.length) { this.finish(); return; }
    music.effect('page'); this.show();
  }

  private finish() {
    if (this.finished) return;
    this.finished = true; this.onFinish();
  }

  destroy() {
    clearInterval(this.typing); this.cleanup.abort(); this.root.remove();
    if (this.previousTheme) music.play(this.previousTheme);
  }
}
