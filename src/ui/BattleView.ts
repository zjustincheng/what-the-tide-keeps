import { act, canAct, condition, COST, createBattle, enemyTarget, intent, MEMBERS, resolveEnemy } from '../rules/battle';
import type { Action, Battle, Fighter, MemberId } from '../rules/battle';

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
    this.root.className = 'battle party-battle';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'battle-title');
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="battle-title">Stand together.</h2><p id="battle-turn"></p></div>
      <div class="enemy-row">
        <div class="fighter enemy-fighter"><img src="${import.meta.env.BASE_URL}assets/locust.svg" alt="Crop locust" /></div>
        <div><h3>Crop locust</h3><div class="health-bar" role="meter" aria-label="Crop locust health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p id="enemy-condition"></p><p class="mana" id="enemy-mana"></p></div>
      </div>
      <p class="intent" id="enemy-intent"></p>
      <div class="party-roster">${this.state.party.map(member => {
        const info = MEMBERS[member.id];
        return `<section class="member-card" data-member="${member.id}" aria-label="${info.name}">
          <button class="fighter party-fighter" aria-label="${info.name}: tap for ${info.support.toLowerCase()}, drag to attack or support"><img alt="" /></button>
          <h3>${info.name}</h3><div class="health-bar" role="meter" aria-label="${info.name} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p class="member-condition"></p><p class="mana member-mana"></p><p class="member-status"></p>
          ${member.id === 'bear' ? `<label class="protect-label">Protect <select aria-label="Bear protection target">${this.state.party.map(target => `<option value="${target.id}" ${target.id === 'bear' ? 'selected' : ''}>${MEMBERS[target.id].name}</option>`).join('')}</select></label>` : '<div class="target-spacer" aria-hidden="true"></div>'}
          <div class="member-actions"><button data-action="attack" aria-label="${info.name} attack">${info.attack}<small>${COST.attack} mana</small></button><button data-action="support" aria-label="${info.name} support">${info.support}<small>No mana</small></button></div>
        </section>`;
      }).join('')}</div>
      <div class="battle-log" role="log" aria-live="polite" aria-label="Battle events"></div>
      <p class="battle-help">Each living companion acts once, in any order. Then the enemy moves.<br />Drag onto the locust to attack; tap yourself to support. Bear can drag onto an ally to protect them.</p>
      <button id="battle-finish" hidden></button>`;
    for (const member of this.state.party) {
      this.card(member.id).querySelector<HTMLImageElement>('img')!.src = member.id === 'chameleon' ? heroImage
        : `${import.meta.env.BASE_URL}assets/${member.id}.svg`;
    }
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    for (const member of this.state.party) {
      const card = this.card(member.id);
      for (const action of ['attack', 'support'] as const) {
        card.querySelector(`[data-action="${action}"]`)!.addEventListener('click', () => {
          const target = member.id === 'bear' && action === 'support' ? this.get<HTMLSelectElement>('select').value as MemberId : member.id;
          this.choose(member.id, action, target);
        }, { signal });
      }
      this.bindDrag(member.id);
    }
    this.get('#battle-finish').addEventListener('click', () => {
      if (this.state.phase !== 'victory' && this.state.phase !== 'defeat') return;
      const won = this.state.phase === 'victory';
      this.destroy(); this.onFinish(won);
    }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden]),select:not([disabled])'))
        .filter(control => !control.closest('[hidden]'));
      event.preventDefault();
      if (!controls.length) { this.root.focus(); return; }
      const index = controls.indexOf(document.activeElement as HTMLElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.root.tabIndex = -1;
    this.render(); this.focusNext();
  }

  private bindDrag(actor: MemberId) {
    const hero = this.card(actor).querySelector<HTMLButtonElement>('.party-fighter')!;
    const signal = this.cleanup.signal;
    let start: { x: number; y: number } | undefined;
    let dragged = false;
    hero.addEventListener('pointerdown', event => {
      start = { x: event.clientX, y: event.clientY }; dragged = false;
      hero.setPointerCapture(event.pointerId);
    }, { signal });
    hero.addEventListener('pointermove', event => {
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) dragged = true;
    }, { signal });
    hero.addEventListener('pointerup', event => {
      if (start && dragged) {
        const target = document.elementFromPoint(event.clientX, event.clientY);
        if (target?.closest('.enemy-fighter')) this.choose(actor, 'attack');
        else {
          const ally = target?.closest<HTMLElement>('[data-member]')?.dataset.member as MemberId | undefined;
          if (ally) this.choose(actor, 'support', ally);
        }
      }
      start = undefined;
    }, { signal });
    hero.addEventListener('pointercancel', () => { start = undefined; dragged = true; }, { signal });
    hero.addEventListener('click', event => {
      if (!dragged || event.detail === 0) this.choose(actor, 'support');
      dragged = false;
    }, { signal });
  }

  private get<T extends HTMLElement = HTMLElement>(selector: string): T { return this.root.querySelector<T>(selector)!; }
  private card(id: MemberId): HTMLElement { return this.get(`[data-member="${id}"]`); }

  private renderHealth(bar: HTMLElement, fighter: Fighter) {
    const fraction = Math.max(0, Math.min(1, fighter.health / fighter.maxHealth));
    bar.style.setProperty('--health', `${fraction * 100}%`);
    bar.dataset.level = fraction <= 0.25 ? 'low' : fraction <= 0.5 ? 'wounded' : 'healthy';
    bar.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
    bar.setAttribute('aria-valuetext', condition(fighter));
  }

  private focusNext() {
    const next = this.state.party.find(member => member.health > 0 && !member.acted);
    if (next) this.card(next.id).querySelector<HTMLButtonElement>('[data-action="support"]')!.focus({ preventScroll: true });
  }

  private choose(actor: MemberId, action: Action, target: MemberId = actor) {
    if (!canAct(this.state, actor, action, target)) return;
    this.state = act(this.state, actor, action, target);
    this.render();
    if (this.state.phase === 'enemy') {
      this.root.focus({ preventScroll: true });
      this.timer = setTimeout(() => {
        this.timer = undefined; this.state = resolveEnemy(this.state); this.render();
        if (this.state.phase === 'player') this.focusNext();
      }, 650);
    } else if (this.state.phase === 'player') this.focusNext();
  }

  private render() {
    const state = this.state;
    const done = state.phase === 'victory' || state.phase === 'defeat';
    const remaining = state.party.filter(member => member.health > 0 && !member.acted).length;
    this.root.dataset.phase = state.phase;
    this.get('#battle-turn').textContent = done ? (state.phase === 'victory' ? 'The room falls quiet.' : 'The party falls.')
      : `Round ${state.round} · ${state.phase === 'player' ? `${remaining} actions remaining` : 'The locust moves'}`;
    this.get('#enemy-condition').textContent = condition(state.enemy);
    this.renderHealth(this.get('.enemy-row .health-bar'), state.enemy);
    this.get('#enemy-mana').textContent = `Mana ${state.enemy.mana} / ${state.enemy.maxMana}`;
    const target = enemyTarget(state);
    this.get('#enemy-intent').textContent = done ? '' : `Physical · ${intent(state).tell} ${target ? `Watching ${MEMBERS[target.id].name}.` : ''}`;
    for (const member of state.party) {
      const card = this.card(member.id);
      card.dataset.acted = String(member.acted);
      card.dataset.downed = String(member.health === 0);
      card.querySelector('.member-condition')!.textContent = condition(member);
      this.renderHealth(card.querySelector<HTMLElement>('.health-bar')!, member);
      card.querySelector('.member-mana')!.textContent = `Mana ${member.mana} / ${member.maxMana}`;
      card.querySelector('.member-status')!.textContent = member.health === 0 ? 'Cannot act'
        : member.guardingFor ? `Guarding ${MEMBERS[member.guardingFor].name}` : member.focused ? 'Focused'
        : member.acted ? 'Acted' : done ? '' : 'Ready';
      for (const action of ['attack', 'support'] as const) card.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.disabled = !canAct(state, member.id, action);
      card.querySelector<HTMLButtonElement>('.party-fighter')!.disabled = !canAct(state, member.id, 'support');
      const select = card.querySelector('select');
      if (select) {
        for (const option of Array.from(select.options)) option.disabled = state.party.find(ally => ally.id === option.value)!.health === 0;
        if (select.selectedOptions[0]?.disabled) select.value = member.id;
        select.disabled = !canAct(state, member.id, 'support');
      }
    }
    const log = this.get('.battle-log');
    for (const line of state.log.slice(log.childElementCount)) {
      const p = document.createElement('p'); p.textContent = line; log.append(p);
    }
    log.scrollTop = log.scrollHeight;
    this.get('.battle-help').hidden = done;
    const finish = this.get<HTMLButtonElement>('#battle-finish');
    finish.hidden = !done;
    finish.textContent = state.phase === 'victory' ? 'Return to the church' : 'Wake at the cot';
    if (done) finish.focus({ preventScroll: true });
  }

  destroy() {
    clearTimeout(this.timer); this.cleanup.abort(); this.root.remove();
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
