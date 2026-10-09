import { hand, houseKeeps, outcome, reroll } from '../rules/dice';
import type { Dice } from '../rules/dice';
import { music } from '../audio/music';

const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const roll = () => 1 + Math.floor(Math.random() * 6);
const three = (): Dice => [roll(), roll(), roll()];

// Bones: throw three dice, keep what you like and throw the rest once, then the house does the same.
export class DiceView {
  private root: HTMLElement;
  private cleanup = new AbortController();
  private mine: Dice = three();
  private keep = [true, true, true];
  private house?: Dice;

  constructor(private opponent: string, private stake: number, private onSettle: (coins: number) => void, onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle dice';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'dice-title');
    this.root.tabIndex = -1;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button) return;
      if (button.dataset.die !== undefined && !this.house) { const i = Number(button.dataset.die); this.keep[i] = !this.keep[i]; music.effect('key', i * 2); this.render(); this.root.querySelector<HTMLElement>(`[data-die="${i}"]`)?.focus(); }
      else if (button.id === 'dice-throw' && !this.house) this.settle();
      else if (button.id === 'dice-close') onClose();
    }, { signal });
    this.root.addEventListener('keydown', event => { if (event.key === 'Escape' && this.house) { event.preventDefault(); onClose(); } }, { signal });
    music.effect('coins');
    this.render();
    this.root.querySelector<HTMLElement>('[data-die="0"]')?.focus({ preventScroll: true });
  }

  // Your second throw, then the house's, then the coins change hands.
  private settle() {
    this.mine = reroll(this.mine, this.keep, [roll(), roll(), roll()]);
    const first = three();
    this.house = reroll(first, houseKeeps(first), [roll(), roll(), roll()]);
    const result = outcome(this.mine, this.house);
    this.onSettle(result === 'win' ? this.stake : result === 'lose' ? -this.stake : 0);
    music.effect(result === 'win' ? 'coins' : result === 'lose' ? 'graze' : 'select');
    this.render();
    this.root.querySelector<HTMLElement>('#dice-close')?.focus();
  }

  private render() {
    const show = (dice: Dice, label: string) => `<div class="dice-row" aria-label="${label}">${dice.map((face, i) => `<span class="die" aria-label="${face}">${FACES[face]}</span>`).join('')}</div>`;
    const result = this.house ? outcome(this.mine, this.house) : undefined;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BONES · ${this.stake} COINS</p><h2 id="dice-title">Against ${this.opponent}.</h2>
      <p class="resurrection-intro">${this.house ? '' : 'Three of a kind beats a pair beats a plain total. Choose which dice to throw again, once.'}</p></div>
      ${this.house ? `${show(this.mine, 'Your dice')}<p class="dice-hand">You: ${hand(this.mine)}</p>${show(this.house, `${this.opponent}'s dice`)}<p class="dice-hand">${this.opponent}: ${hand(this.house)}</p>
        <p class="dice-result" aria-live="polite">${result === 'win' ? `You win ${this.stake} coins.` : result === 'lose' ? `You lose ${this.stake} coins.` : 'A draw. Nobody pays.'}</p>
        <button id="dice-close" type="button">Done</button>`
      : `<div class="dice-row">${this.mine.map((face, i) => `<button type="button" class="die" data-die="${i}" aria-pressed="${!this.keep[i]}" aria-label="Die showing ${face}, ${this.keep[i] ? 'kept' : 'to throw again'}">${FACES[face]}<small>${this.keep[i] ? 'keep' : 'throw'}</small></button>`).join('')}</div>
        <p class="dice-hand">You hold ${hand(this.mine)}.</p>
        <button id="dice-throw" type="button">${this.keep.every(Boolean) ? 'Stand' : 'Throw again'}</button>`}`;
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
