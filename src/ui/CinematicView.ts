import { music } from '../audio/music';
import { tableau } from '../presentation/tableau';
import type { Story } from '../presentation/stories';

export class CinematicView {
  private root = document.createElement('section');
  private cleanup = new AbortController();
  private typing?: ReturnType<typeof setInterval>;
  private finishTimer?: ReturnType<typeof setTimeout>;
  private impactTimer?: ReturnType<typeof setTimeout>;
  private index = 0;
  private complete = false;
  private finished = false;
  private previousTheme = music.current;

  constructor(private story: Story, private onFinish: () => void, private revealWorld = true) {
    this.root.className = 'cinematic';
    this.root.dataset.story = story.id;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', story.title);
    this.root.innerHTML = `<div class="cinema-letterbox"><span class="cinema-kicker"></span><button type="button" class="cinema-skip">Skip scene <span>Esc</span></button></div>
      <div class="cinema-picture"><div class="cinema-stage"><div class="cinema-set"></div><div class="cinema-actors"></div></div><div class="cinema-dust" aria-hidden="true"></div></div>
      <div class="cinema-copy"><p class="eyebrow cinema-caption"></p><h2></h2><p class="cinema-line"></p>
      <div class="cinema-bottom"><span class="cinema-count"></span><div class="cinema-navigation"><button type="button" class="cinema-back" aria-label="Previous scene">Back</button><button type="button" class="cinema-next">Continue <span>↵</span></button></div></div></div>`;
    this.root.querySelector('h2')!.textContent = story.title;
    this.root.querySelector('.cinema-kicker')!.textContent = story.subtitle;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('.cinema-next')!.addEventListener('click', () => this.next(), { signal });
    this.root.querySelector('.cinema-back')!.addEventListener('click', () => this.previous(), { signal });
    this.root.querySelector('.cinema-skip')!.addEventListener('click', () => this.finish(false), { signal });
    this.root.addEventListener('keydown', event => {
      event.stopPropagation();
      if (event.repeat) { event.preventDefault(); return; }
      if (event.key === 'Escape') { event.preventDefault(); this.finish(false); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); this.previous(); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); this.next(); }
      else if ([' ', 'Enter'].includes(event.key) && !(event.target as Element).closest('.cinema-skip, .cinema-back')) { event.preventDefault(); this.next(); }
      else if (event.key === 'Tab') {
        event.preventDefault();
        const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    }, { signal });
    music.play(story.music ?? 'wake');
    this.show();
    this.root.querySelector<HTMLButtonElement>('.cinema-next')!.focus({ preventScroll: true });
  }

  private show(read = false) {
    clearInterval(this.typing);
    clearTimeout(this.impactTimer);
    const shot = this.story.shots[this.index];
    this.root.dataset.shot = String(this.index);
    this.root.classList.toggle('cinema-blackout', this.story.id === 'waking' && shot.caption === 'THE LAST CLEAR THING');
    this.root.classList.toggle('cinema-trial', shot.art === 'trial');
    this.root.classList.toggle('cinema-sentence', this.story.id === 'waking' && shot.caption === 'THE SENTENCE');
    this.root.dataset.art = shot.art;
    this.root.classList.toggle('cinema-composed', Boolean(shot.staging));
    this.root.classList.toggle('cinema-past', !!shot.flashback);
    this.root.querySelector('.cinema-kicker')!.textContent = `${this.story.subtitle}${shot.flashback ? ' · Earlier' : ''}`;
    this.root.classList.toggle('cinema-grounded', shot.art === 'ossuary');
    this.root.querySelector('.cinema-set')!.innerHTML = tableau(shot.art);
    const actors = this.root.querySelector('.cinema-actors')!;
    actors.replaceChildren(...(shot.actors ?? []).filter(actor => shot.art !== 'trial' || actor !== 'church-official').map(actor => {
      const img = document.createElement('img'); img.src = `${import.meta.env.BASE_URL}assets/${actor}.${actor === 'kraken' ? 'png' : 'svg'}`; img.dataset.actor = actor; img.alt = '';
      const place = shot.staging?.[actor];
      if (place) { img.style.left = `${place.x / 9}%`; img.style.bottom = `${(450 - place.ground) / 4.5}%`; img.style.width = `${(place.size ?? 96) / 9}%`; }
      return img;
    }));
    this.root.querySelector('.cinema-caption')!.textContent = shot.caption;
    this.root.querySelector('.cinema-count')!.textContent = `${String(this.index + 1).padStart(2, '0')} / ${String(this.story.shots.length).padStart(2, '0')}`;
    const line = this.root.querySelector<HTMLElement>('.cinema-line')!;
    // A stable accessible sentence while the visible letters appear.
    line.setAttribute('aria-label', shot.text);
    line.dataset.full = shot.text;
    line.innerHTML = '<span aria-hidden="true"></span>';
    const visible = line.firstElementChild!;
    this.complete = read || matchMedia('(prefers-reduced-motion: reduce)').matches;
    visible.textContent = this.complete ? shot.text : '';
    let length = 0;
    if (!this.complete) this.typing = setInterval(() => {
      length += 3; visible.textContent = shot.text.slice(0, length);
      if (length >= shot.text.length) { clearInterval(this.typing); this.complete = true; this.renderNavigation(); }
    }, 16);
    if (shot.sound) music.effect(shot.sound);
    if (this.root.classList.contains('cinema-sentence')) {
      // The gavel reaches the bench at 75% of its 650ms animation.
      this.impactTimer = setTimeout(() => music.effect('hammer'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 488);
    }
    this.renderNavigation();
  }

  private renderNavigation() {
    const label = !this.complete ? 'Show text' : this.index === this.story.shots.length - 1 ? this.story.finalAction ?? 'Return' : 'Continue';
    this.root.querySelector('.cinema-next')!.innerHTML = `${label} <span>↵</span>`;
    this.root.querySelector<HTMLButtonElement>('.cinema-back')!.disabled = this.index === 0;
  }

  private previous() {
    if (this.finished || this.index === 0) return;
    this.index--; music.effect('page'); this.show(true);
    if (this.index === 0) this.root.querySelector<HTMLButtonElement>('.cinema-next')!.focus({ preventScroll: true });
  }

  private next() {
    if (this.finished) return;
    music.unlock();
    if (!this.complete) {
      clearInterval(this.typing); this.complete = true;
      this.root.querySelector('.cinema-line span')!.textContent = this.story.shots[this.index].text;
      this.renderNavigation();
      return;
    }
    if (++this.index === this.story.shots.length) { this.finish(); return; }
    music.effect('page'); this.show();
  }

  private finish(reveal = true) {
    if (this.finished) return;
    this.finished = true;
    clearInterval(this.typing);
    clearTimeout(this.impactTimer);
    if (!reveal) { this.onFinish(); return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.onFinish(); return; }
    this.root.classList.add(this.revealWorld ? 'cinematic-reveal' : 'cinematic-covered');
    this.root.inert = true;
    this.root.setAttribute('aria-hidden', 'true');
    this.finishTimer = setTimeout(() => this.onFinish(), 900);
  }

  destroy(restoreMusic = true) {
    clearInterval(this.typing); clearTimeout(this.finishTimer); clearTimeout(this.impactTimer); this.cleanup.abort(); this.root.remove();
    if (restoreMusic && this.previousTheme) music.play(this.previousTheme);
  }
}
