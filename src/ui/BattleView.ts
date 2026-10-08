import { act, canAct, condition, COST, createBattle, intent, resolveEnemy } from '../rules/battle';
import type { Action, Battle } from '../rules/battle';

export class BattleView {
  private state: Battle = createBattle();
  private root: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private cleanup = new AbortController();
  private previousFocus = document.activeElement as HTMLElement | null;
  private onFinish: (won: boolean) => void;

  constructor(heroImage: string, onFinish: (won: boolean) => void) {
    this.onFinish = onFinish;
    this.root = document.createElement('section');
    this.root.className = 'battle';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'battle-title');
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">A SMALL, HUNGRY THING</p><h2 id="battle-title">A stir in the silence.</h2><p id="battle-turn"></p></div>
      <div class="combatants">
        <div class="combatant"><p class="eyebrow">THE CONDEMNED</p>
          <button class="fighter hero-fighter" aria-label="Chameleon: tap to guard, or drag onto the locust to attack"><img alt="" /></button>
          <h3>Chameleon</h3><p id="hero-condition"></p><p class="mana" id="hero-mana"></p>
        </div>
        <span class="battle-divider" aria-hidden="true">◇</span>
        <div class="combatant"><p class="eyebrow">CROP PEST</p>
          <div class="fighter enemy-fighter"><img src="${import.meta.env.BASE_URL}assets/locust.svg" alt="Crop locust" /></div>
          <h3>Crop locust</h3><p id="enemy-condition"></p><p class="mana" id="enemy-mana"></p>
        </div>
      </div>
      <p class="intent" id="enemy-intent"></p>
      <div class="battle-log" role="log" aria-live="polite" aria-label="Battle events"></div>
      <div class="battle-actions">
        <button data-action="attack">Attack <small>Thorn · ${COST.attack} mana</small></button>
        <button data-action="guard">Support <small>Guard · ${COST.guard} mana</small></button>
      </div>
      <p class="battle-help">Drag yourself onto the enemy to attack. Tap yourself to guard.<br />Mana returns after the enemy acts.</p>
      <button id="battle-finish" hidden></button>`;
    this.get<HTMLImageElement>('.hero-fighter img').src = heroImage;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    for (const action of ['attack', 'guard'] as const) {
      this.get(`[data-action="${action}"]`).addEventListener('click', () => this.choose(action), { signal });
    }
    this.get('#battle-finish').addEventListener('click', () => {
      if (this.state.phase !== 'victory' && this.state.phase !== 'defeat') return;
      const won = this.state.phase === 'victory';
      this.destroy();
      this.onFinish(won);
    }, { signal });
    const hero = this.get<HTMLButtonElement>('.hero-fighter');
    let start: { x: number; y: number } | undefined;
    let dragged = false;
    hero.addEventListener('pointerdown', event => {
      start = { x: event.clientX, y: event.clientY };
      dragged = false;
      hero.setPointerCapture(event.pointerId);
    }, { signal });
    hero.addEventListener('pointermove', event => {
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) dragged = true;
    }, { signal });
    hero.addEventListener('pointerup', event => {
      if (start && dragged) {
        const target = document.elementFromPoint(event.clientX, event.clientY);
        if (target?.closest('.enemy-fighter')) this.choose('attack');
        else if (target?.closest('.hero-fighter')) this.choose('guard');
      }
      start = undefined;
    }, { signal });
    hero.addEventListener('pointercancel', () => { start = undefined; dragged = true; }, { signal });
    hero.addEventListener('click', event => {
      if (!dragged || event.detail === 0) this.choose('guard');
      dragged = false;
    }, { signal });
    this.root.addEventListener('keydown', event => {
      // Keep keyboard focus inside the fight until its outcome is acknowledged.
      if (event.key !== 'Tab') return;
      const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button:not([disabled]):not([hidden])'));
      if (!buttons.length) { event.preventDefault(); return; }
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      event.preventDefault();
      buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    }, { signal });
    this.root.tabIndex = -1;
    this.render();
    this.get('[data-action="attack"]').focus({ preventScroll: true });
  }

  private get<T extends HTMLElement = HTMLElement>(selector: string): T {
    return this.root.querySelector<T>(selector)!;
  }

  private choose(action: Action) {
    if (!canAct(this.state, action)) return;
    this.state = act(this.state, action);
    this.render();
    if (this.state.phase === 'enemy') {
      this.root.focus({ preventScroll: true });
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.state = resolveEnemy(this.state);
        this.render();
        if (this.state.phase === 'player') this.get('[data-action="attack"]').focus({ preventScroll: true });
      }, 650);
    }
  }

  private render() {
    const state = this.state;
    const done = state.phase === 'victory' || state.phase === 'defeat';
    this.root.dataset.phase = state.phase;
    this.get('#battle-turn').textContent = done ? (state.phase === 'victory' ? 'The room falls quiet.' : 'You fall.')
      : `Round ${state.round} · ${state.phase === 'player' ? 'Your turn' : 'The locust moves'}`;
    this.get('#hero-condition').textContent = condition(state.hero);
    this.get('#enemy-condition').textContent = condition(state.enemy);
    this.get('#hero-mana').textContent = `Mana ${state.hero.mana} / ${state.hero.maxMana}`;
    this.get('#enemy-mana').textContent = `Mana ${state.enemy.mana} / ${state.enemy.maxMana}`;
    this.get('#enemy-intent').textContent = done ? '' : `Physical · ${intent(state).tell}`;
    const log = this.get('.battle-log');
    const oldLines = log.childElementCount;
    for (const line of state.log.slice(oldLines)) {
      const p = document.createElement('p'); p.textContent = line; log.append(p);
    }
    log.scrollTop = log.scrollHeight;
    for (const action of ['attack', 'guard'] as const) {
      this.get<HTMLButtonElement>(`[data-action="${action}"]`).disabled = !canAct(state, action);
    }
    this.get<HTMLButtonElement>('.hero-fighter').disabled = state.phase !== 'player';
    this.get('.battle-actions').hidden = done;
    this.get('.battle-help').hidden = done;
    const finish = this.get<HTMLButtonElement>('#battle-finish');
    finish.hidden = !done;
    finish.textContent = state.phase === 'victory' ? 'Return to the church' : 'Wake at the cot';
    if (done) finish.focus({ preventScroll: true });
  }

  destroy() {
    clearTimeout(this.timer);
    this.cleanup.abort();
    this.root.remove();
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
