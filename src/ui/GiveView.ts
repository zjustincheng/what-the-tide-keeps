import { ASKING, HEARING } from '../content/piecing';
import { companionMemory } from '../content/companionMemories';
import { answerOrder } from '../rules/piecing';
import type { Companion } from '../rules/memory';
import type { CompanionMemoryId } from '../rules/companionMemory';
import { MEMBERS } from '../rules/battle';
import { music } from '../audio/music';

// The hero gives a friend back something they lost: they ask him two things only someone who was there would know.
// A wrong answer costs nothing but the look on their face; he answers again.
export class GiveView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(to: Companion, id: Exclude<CompanionMemoryId, 'craft'>, onDone: () => void) {
    const questions = id === 'hero' ? ASKING.hero[to] : ASKING[id];
    const name = MEMBERS[to].name.toLowerCase();
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection piecing giving';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'giving-title');
    this.root.tabIndex = -1;
    this.root.dataset.memory = `${to}:${id}`;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BY THE FIRE</p><h2 id="giving-title">${id === 'hero' ? `You tell the ${name} who you are.` : `You tell the ${name} about ${companionMemory(to, id).name.toLowerCase()}.`}</h2></div>
      <div class="piecing-voice"><img src="${import.meta.env.BASE_URL}assets/${to}.svg" alt="" /><p class="piecing-says giving-ask"></p></div>
      <p class="giving-heard" role="status"></p>
      <div class="piecing-pool giving-answers" role="group" aria-label="Your answer"></div>
      <div class="piecing-whole" hidden><p class="memories-lost">Theirs again, until the next time the party falls.</p></div>
      <div class="anchor-actions"><button id="giving-keep" type="button" hidden>Sit with them</button><button id="giving-tell" type="button">Just tell them</button></div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const says = this.root.querySelector<HTMLElement>('.piecing-says')!, heard = this.root.querySelector<HTMLElement>('.giving-heard')!;
    const pool = this.root.querySelector<HTMLElement>('.giving-answers')!;
    const keep = this.root.querySelector<HTMLButtonElement>('#giving-keep')!;
    const tell = this.root.querySelector<HTMLButtonElement>('#giving-tell')!;
    const done = () => {
      heard.textContent = HEARING[to].right;
      pool.hidden = true; tell.hidden = true;
      this.root.querySelector<HTMLElement>('.piecing-whole')!.hidden = false;
      keep.hidden = false; keep.focus({ preventScroll: true });
      music.effect('memory');
    };
    const ask = (index: number) => {
      const question = questions[index];
      says.textContent = `“${question.ask}”`; heard.textContent = '';
      pool.replaceChildren(...answerOrder(index).map(answer => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'piecing-piece'; button.dataset.answer = String(answer);
        button.textContent = question.answers[answer];
        button.addEventListener('click', () => {
          if (answer !== 0) { button.disabled = true; button.dataset.wrong = 'true'; heard.textContent = HEARING[to].wrong; music.effect('select'); pool.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true }); return; }
          music.effect('key', 6 + index * 2);
          if (index + 1 < questions.length) ask(index + 1); else done();
        }, { signal });
        return button;
      }));
      pool.querySelector('button')?.focus({ preventScroll: true });
    };
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button')).filter(button => !button.disabled && !button.hidden && !button.closest('[hidden]'));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLButtonElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    tell.addEventListener('click', done, { signal });
    keep.addEventListener('click', onDone, { signal });
    ask(0);
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
