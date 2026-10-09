import { act, canAct, canCast, canFlee, canUse, cast, flee, GATHER, STAGES, SURVIVE, useSupply, warded, condition, cost, DODGE, ENEMIES, createBattle, enemyTarget, grade, intent, MEMBERS, nextStrike, strike, visibleMana, enemyMana, SPELL } from '../rules/battle';
import type { Action, Battle, BattleOptions, Dodge, Fighter, Foe, MemberId, Encounter } from '../rules/battle';
import { checkSequence, SPELLS } from '../rules/spells';
import { BOUNTY, SUPPLIES, SUPPLY_IDS } from '../rules/economy';
import type { Supplies, SupplyId } from '../rules/economy';

import { loadGrimoire, saveGrimoire } from '../storage/grimoire';
import { music } from '../audio/music';
import type { Effect as Sound } from '../audio/effects';

// How long the dodge ring takes to close on its target, in milliseconds.
const LEAD = 900;

export class BattleView {
  private state: Battle;
  private saved = true;
  private root: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private cleanup = new AbortController();
  private previousFocus = document.activeElement as HTMLElement | null;
  private onFinish: (won: boolean, state: Battle) => void;
  // Set while a dodge prompt is open: when the blow lands, and how to answer it.
  private prompts = 0;
  private prompt?: { impact: number; answer: (dodge: Dodge, early?: boolean) => void };
  // Set while a spell is being typed.
  private casting?: (key: number) => void;

  constructor(heroImage: string, onFinish: (won: boolean, state: Battle) => void, encounter: Encounter = 'locust', options: BattleOptions = {}) {
    this.onFinish = onFinish;
    this.state = createBattle(encounter, loadGrimoire(), options);
    const enemyName = ENEMIES[encounter].name;
    this.root = document.createElement('section');
    this.root.className = 'battle party-battle';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'battle-title');
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="battle-title">Stand together.</h2><p id="battle-turn"></p><button id="flee" class="flee" type="button" title="Drop half your coins and take a parting blow">Run</button></div>
      <div class="enemy-row">
        <div class="fighter enemy-fighter" data-foe="0"><img src="${import.meta.env.BASE_URL}assets/${encounter}.svg" alt="${enemyName}" /></div>
        <div><h3>${enemyName}</h3><div class="health-bar" role="meter" aria-label="${enemyName} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p id="enemy-condition"></p><p class="mana" id="enemy-mana"></p></div>
        ${this.state.followers.map((follower, index) => `<div class="follower" data-foe="${index + 1}">
          <div class="fighter enemy-fighter"><img src="${import.meta.env.BASE_URL}assets/${follower.name.toLowerCase()}.svg" alt="${follower.name}" /></div>
          <h4>${follower.name}</h4><div class="health-bar" role="meter" aria-label="${follower.name} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p class="follower-condition"></p><p class="mana">Mana veiled</p>
        </div>`).join('')}
      </div>
      ${this.state.followers.length ? `<label class="strike-label">Strike at <select id="strike-target" aria-label="Attack target"><option value="0">${enemyName}</option>${this.state.followers.map((follower, index) => `<option value="${index + 1}">${follower.name}</option>`).join('')}</select></label>` : ''}
      <p class="intent" id="enemy-intent"></p><p class="grimoire-status" aria-live="polite"></p>
      <div class="party-roster" data-size="${this.state.party.length}">${this.state.party.map(member => {
        const info = MEMBERS[member.id];
        return `<section class="member-card" data-member="${member.id}" aria-label="${info.name}">
          <button class="fighter party-fighter" aria-label="${info.name}: tap for ${info.support.toLowerCase()}, drag to attack or support"><img alt="" /></button>
          <h3>${info.name}</h3><div class="health-bar" role="meter" aria-label="${info.name} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p class="member-condition"></p><p class="mana member-mana"></p><p class="member-status"></p>
          <label class="protect-label">Ally <select aria-label="${member.id === 'bear' ? 'Bear protection target' : info.name + ' barrier target'}">${this.state.party.map(target => `<option value="${target.id}" ${target.id === member.id ? 'selected' : ''}>${MEMBERS[target.id].name}</option>`).join('')}</select></label>
          <div class="member-actions"><button data-action="attack" aria-label="${info.name} attack">${info.attack}<small>Physical</small></button><button data-action="support" aria-label="${info.name} support">${info.support}<small>No mana</small></button><button data-action="gather" aria-label="${info.name} gather">Gather<small>+${GATHER} mana</small></button></div>
          ${member.spell ? `<button class="cast-button" data-cast aria-label="${info.name} cast ${SPELLS[member.spell].name}">${SPELLS[member.spell].name}<small>${SPELLS[member.spell].cost} mana · ${SPELLS[member.spell].length} keys</small></button>` : ''}
          <details class="spellcraft"><summary>Spellcraft</summary><button data-action="suppress" aria-label="${info.name} suppress">Suppress · ${cost(member, 'suppress')} mana</button><button data-action="barrier" aria-label="${info.name} barrier">Barrier · 5 mana</button><button data-action="analyze" aria-label="${info.name} analyze">Analyze · 2 mana</button></details>
          ${SUPPLY_IDS.some(id => this.state.supplies[id] > 0) ? `<details class="spellcraft supplies-menu"><summary>Supplies</summary>${SUPPLY_IDS.map(id => `<button data-supply="${id}" aria-label="${info.name} use ${SUPPLIES[id].name}"></button>`).join('')}</details>` : ''}
        </section>`;
      }).join('')}</div>
      <div class="battle-log" role="log" aria-live="polite" aria-label="Battle events"></div>
      <div class="spell-bar" hidden><p class="spell-name"></p><div class="spell-keys" aria-live="polite"></div><div class="spell-timer"><span></span></div>
        <div class="spell-pad">${[1, 2, 3, 4].map(key => `<button type="button" data-key="${key}">${key}</button>`).join('')}</div></div>
      <div class="dodge-bar" hidden><p class="dodge-call" aria-live="assertive"></p><button id="dodge" type="button">Dodge <small>Space or tap · as the ring closes</small></button></div>
      <p class="battle-help">Each living companion acts once. Spellcraft uses that action too.<br />Guard physical blows. Analyze spells before blocking them. Attack while hidden to reveal.<br />Mana returns slowly: 1 a round, or Gather to draw back more. Spent mana stays spent until you rest.<br />A spell needs time to settle before it can be cast again, and casting floods the caster's mana into view.<br />When a blow comes, press Space as the ring closes to dodge. Unknown spells cannot be dodged.</p>
      <button id="battle-finish" hidden></button>`;
    for (const member of this.state.party) {
      this.card(member.id).querySelector<HTMLImageElement>('img')!.src = member.id === 'chameleon' ? heroImage
        : `${import.meta.env.BASE_URL}assets/${member.id}.svg`;
    }
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    for (const member of this.state.party) {
      const card = this.card(member.id);
      for (const action of ['attack', 'support', 'gather', 'suppress', 'barrier', 'analyze'] as const) {
        card.querySelector(`[data-action="${action}"]`)!.addEventListener('click', () => {
          const target = (action === 'barrier' || (member.id === 'bear' && action === 'support')) ? card.querySelector<HTMLSelectElement>('select')!.value as MemberId : member.id;
          this.choose(member.id, action, target, action === 'attack' ? this.foe() : 0);
        }, { signal });
      }
      this.bindDrag(member.id);
    }
    this.root.querySelectorAll('#strike-target, .protect-label select').forEach(select => select.addEventListener('change', () => this.render(), { signal }));
    for (const member of this.state.party) {
      this.card(member.id).querySelector('[data-cast]')?.addEventListener('click', () => this.beginCast(member.id), { signal });
      this.card(member.id).querySelectorAll<HTMLButtonElement>('[data-supply]').forEach(button => button.addEventListener('click', () => this.supply(member.id, button.dataset.supply as SupplyId), { signal }));
    }
    this.root.addEventListener('keydown', event => {
      if (!this.casting || !['1', '2', '3', '4'].includes(event.key) || event.repeat) return;
      event.preventDefault(); this.casting(Number(event.key));
    }, { signal });
    this.root.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => button.addEventListener('pointerdown', event => {
      event.preventDefault(); this.casting?.(Number(button.dataset.key));
    }, { signal }));
    // Dodges answer on press, not release: keydown and pointerdown keep the timing honest.
    this.root.addEventListener('keydown', event => {
      if (!this.prompt || ![' ', 'Enter'].includes(event.key) || event.repeat) return;
      event.preventDefault(); this.press();
    }, { signal });
    this.get('#dodge').addEventListener('pointerdown', event => { event.preventDefault(); this.press(); }, { signal });
    // Running ends the fight on the spot, at a cost.
    this.get('#flee').addEventListener('click', () => {
      if (this.casting || !canFlee(this.state)) return;
      clearTimeout(this.timer);
      this.state = flee(this.state);
      music.effect('hit');
      this.persist(); this.render();
    }, { signal });
    this.get('#battle-finish').addEventListener('click', () => {
      if (this.state.phase !== 'victory' && this.state.phase !== 'defeat' && this.state.phase !== 'fled') return;
      const won = this.state.phase === 'victory';
      this.destroy(); this.onFinish(won, this.state);
    }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden]),select:not([disabled]),summary'))
        .filter(control => !control.closest('[hidden]') && (control.tagName === 'SUMMARY' || !control.closest('details:not([open])')));
      event.preventDefault();
      if (!controls.length) { this.root.focus(); return; }
      const index = controls.indexOf(document.activeElement as HTMLElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.root.tabIndex = -1;
    this.render(); this.focusNext();
    // An ambush opens on the enemy's turn.
    if (this.state.phase === 'enemy') { this.root.focus({ preventScroll: true }); this.timer = setTimeout(() => this.enemyTurn(), 900); }
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
        const foe = target?.closest<HTMLElement>('[data-foe]');
        if (foe) this.choose(actor, 'attack', actor, Number(foe.dataset.foe));
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

  private foe(): Foe {
    return Number(this.root.querySelector<HTMLSelectElement>('#strike-target')?.value ?? 0);
  }

  private choose(actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0) {
    if (this.casting || !canAct(this.state, actor, action, target, foe)) return;
    this.state = act(this.state, actor, action, target, foe);
    // Each hero strikes with their own sound; spellcraft has its own.
    const sounds: Record<Action, Sound> = { attack: ({ chameleon: 'lash', bear: 'maul', vulture: 'talons' } as const)[actor], support: actor === 'vulture' ? 'gather' : 'block', suppress: 'open', barrier: 'barrier', analyze: 'key', gather: 'gather' };
    music.effect(sounds[action]);
    this.afterAction();
  }

  // Food and salts go to the ally chosen on the card; salts find the fallen if that ally is standing. Firepots go where attacks go.
  private supply(actor: MemberId, supply: SupplyId) {
    if (this.casting) return;
    const chosen = this.card(actor).querySelector<HTMLSelectElement>('select')?.value as MemberId | undefined ?? actor;
    const fallen = this.state.party.find(member => member.id === chosen && member.health === 0) ?? this.state.party.find(member => member.health === 0);
    const target = SUPPLIES[supply].target === 'fallen' ? fallen?.id ?? chosen : chosen;
    if (!canUse(this.state, actor, supply, target, this.foe())) return;
    this.state = useSupply(this.state, actor, supply, target, this.foe());
    music.effect(supply === 'firepot' ? 'hit' : 'heal');
    this.afterAction();
  }

  // Type the shown sequence of 1–4 before time runs out. One wrong key and the spell fizzles.
  private beginCast(actor: MemberId) {
    const foe = this.foe();
    if (this.casting || !canCast(this.state, actor, foe)) return;
    const spell = SPELLS[this.state.party.find(member => member.id === actor)!.spell!];
    const sequence = Array.from({ length: spell.length }, () => 1 + Math.floor(Math.random() * 4));
    const typed: number[] = [];
    const bar = this.get('.spell-bar'), keys = this.get('.spell-keys');
    bar.hidden = false; bar.dataset.sequence = sequence.join('');
    this.get('.spell-name').textContent = `${MEMBERS[actor].name} · ${spell.name} — type the keys`;
    const show = () => { keys.innerHTML = sequence.map((key, index) => `<span data-state="${index < typed.length ? 'done' : index === typed.length ? 'next' : 'todo'}">${key}</span>`).join(''); };
    show();
    const timer = this.get('.spell-timer span');
    timer.style.animation = 'none'; void timer.offsetWidth; timer.style.animation = `spell-time ${spell.seconds}s linear forwards`;
    const finish = (success: boolean) => {
      clearTimeout(this.timer); this.casting = undefined;
      bar.dataset.result = success ? 'cast' : 'fizzle';
      this.get('.spell-name').textContent = success ? `${spell.name}!` : `${spell.name} fizzles.`;
      setTimeout(() => { bar.hidden = true; delete bar.dataset.result; }, 600);
      this.state = cast(this.state, actor, success, foe);
      music.effect(!success ? 'fizzle' : spell.kind === 'heal' ? 'heal' : spell.kind === 'ward' ? 'barrier' : 'spell');
      this.afterAction();
    };
    this.casting = key => {
      typed.push(key); show();
      music.effect('key', key * 2);
      const result = checkSequence(sequence, typed);
      if (result !== 'typing') finish(result === 'cast');
    };
    this.timer = setTimeout(() => finish(false), spell.seconds * 1000);
    this.render(); this.root.focus({ preventScroll: true });
  }

  private afterAction() {
    this.persist(); this.render();
    this.ended();
    if (this.state.phase === 'enemy') {
      this.root.focus({ preventScroll: true });
      this.timer = setTimeout(() => this.enemyTurn(), 650);
    } else if (this.state.phase === 'player') this.focusNext();
  }

  // Play the enemy turn one blow at a time, offering a dodge whenever one is possible.
  private enemyTurn() {
    this.timer = undefined;
    const next = nextStrike(this.state);
    const land = (dodge: Dodge) => {
      // How the blow lands decides its sound: stopped, dodged, grazed, or taken.
      const before = next;
      this.state = strike(this.state, dodge); this.persist(); this.render();
      if (before && before.damage === 0 && !before.move.revive) music.effect('block');
      else if (before?.dodgeable && dodge === 'perfect') music.effect('dodge');
      else if (before?.dodgeable && dodge === 'graze') music.effect('graze');
      else if (before && before.damage > 0) music.effect('hit');
      this.ended();
      if (this.state.phase === 'enemy') this.timer = setTimeout(() => this.enemyTurn(), 450);
      else if (this.state.phase === 'player') this.focusNext();
    };
    if (!next?.dodgeable) {
      // A blow that cannot be dodged is announced, so the player sees why no ring came.
      if (next && next.damage > 0 && next.move.undodgeable) {
        const bar = this.get('.dodge-bar');
        const shown = ++this.prompts;
        this.get('.dodge-call').textContent = `${next.move.name} → ${MEMBERS[next.target.id].name}. It cannot be dodged.`;
        this.get<HTMLButtonElement>('#dodge').hidden = true;
        bar.hidden = false;
        setTimeout(() => { if (this.prompts === shown) bar.hidden = true; }, 900);
        this.timer = setTimeout(() => land('miss'), 800);
        return;
      }
      this.timer = setTimeout(() => land('miss'), next ? 400 : 0);
      return;
    }
    const card = this.card(next.target.id);
    const ring = document.createElement('div');
    ring.className = 'dodge-ring'; ring.style.setProperty('--lead', `${LEAD}ms`);
    card.append(ring);
    const impact = performance.now() + LEAD;
    this.root.dataset.impact = String(impact);
    this.get('.dodge-call').textContent = `${next.move.name} → ${MEMBERS[next.target.id].name}. Dodge!`;
    const bar = this.get('.dodge-bar'), button = this.get<HTMLButtonElement>('#dodge');
    const shown = ++this.prompts;
    bar.hidden = false; button.hidden = false; button.disabled = false; button.focus({ preventScroll: true });
    this.prompt = {
      impact,
      answer: (dodge, early = false) => {
        clearTimeout(this.timer); this.prompt = undefined;
        delete this.root.dataset.impact;
        button.disabled = true; this.root.focus({ preventScroll: true });
        // Leave the result up briefly, unless the next blow has already opened a new prompt.
        setTimeout(() => { if (this.prompts === shown) bar.hidden = true; }, 700);
        ring.dataset.result = dodge;
        this.get('.dodge-call').textContent = dodge === 'perfect' ? 'Dodged!' : dodge === 'graze' ? 'Grazed.' : early ? 'Too soon.' : 'Too slow.';
        setTimeout(() => ring.remove(), 350);
        land(dodge);
      },
    };
    // No press at all means the blow lands in full.
    this.timer = setTimeout(() => this.prompt?.answer('miss'), LEAD + DODGE.graze + 1);
  }

  private press() {
    if (!this.prompt) return;
    const error = performance.now() - this.prompt.impact;
    // Pressing far too early commits the dodge too soon; it cannot be retried.
    this.prompt.answer(grade(error, nextStrike(this.state)!.move), error < 0);
  }

  // A short cue when the fight ends, once.
  private cued = false;
  private ended() {
    if (this.cued || (this.state.phase !== 'victory' && this.state.phase !== 'defeat')) return;
    this.cued = true;
    music.effect(this.state.phase === 'victory' ? 'victory' : 'defeat');
  }

  private persist() {
    this.saved = saveGrimoire(this.state.studied);
  }

  // What each fighter looked like at the last render, so changes can be shown: a flinch when hurt, a hop when acting.
  private seen = new Map<string, number>();
  private animateChanges() {
    const state = this.state;
    const now = new Map<string, number>([
      ...state.party.flatMap(member => [[`hp:${member.id}`, member.health], [`act:${member.id}`, Number(member.acted)]] as [string, number][]),
      ['hp:0', state.enemy.health], ...state.followers.map((follower, index) => [`hp:${index + 1}`, follower.health] as [string, number]),
      ['stage', state.stage],
    ]);
    const play = (target: Element | null, name: string) => {
      if (!target) return;
      target.classList.remove(name); void (target as HTMLElement).offsetWidth; target.classList.add(name);
      setTimeout(() => target.classList.remove(name), 500);
    };
    for (const [key, value] of now) {
      const before = this.seen.get(key);
      if (before === undefined) continue;
      const [kind, who] = key.split(':');
      const fighter = kind === 'hp' && /^\d+$/.test(who) ? this.root.querySelector(`[data-foe="${who}"] .fighter, .fighter[data-foe="${who}"]`) : this.root.querySelector(`.member-card[data-member="${who}"] .party-fighter`);
      if (kind === 'hp' && value < before) play(fighter, 'is-hit');
      if (kind === 'act' && value > before) play(fighter, 'is-acting');
      // A boss turning to its second stage roars.
      if (key === 'stage' && value > before) { music.effect('roar'); play(this.root.querySelector('.fighter[data-foe="0"]'), 'is-turning'); }
    }
    this.seen = now;
  }

  private render() {
    this.animateChanges();
    const state = this.state;
    const done = state.phase === 'victory' || state.phase === 'defeat' || state.phase === 'fled';
    const remaining = state.party.filter(member => member.health > 0 && !member.acted).length;
    this.root.dataset.phase = state.phase;
    // In its second stage a boss gets a new name, and the screen says so.
    const stage = state.stage === 2 ? STAGES[state.encounter] : undefined;
    this.root.dataset.stage = String(state.stage);
    this.get('#battle-title').textContent = stage ? `${stage.title}.` : 'Stand together.';
    this.get('.battle-heading .eyebrow').textContent = stage ? 'SECOND STAGE' : 'THE CONDEMNED';
    this.get('#battle-turn').textContent = done ? (state.phase === 'fled' ? 'You run. Half your coins scatter behind you.' : state.phase === 'victory' ? `${SURVIVE[state.encounter] ? 'You lived through it.' : `It falls quiet. You find ${BOUNTY[state.encounter]} coins.`}${state.party.some(member => member.health < member.maxHealth) ? ' Your wounds will linger until you rest at a fire.' : ''}` : 'The party falls.')
      : `Round ${state.round} · ${state.phase === 'player' ? `${remaining} actions remaining` : 'The enemy moves'}`;
    this.get('#enemy-condition').textContent = condition(state.enemy);
    this.renderHealth(this.get('.enemy-row .health-bar'), state.enemy);
    state.followers.forEach((follower, index) => {
      const card = this.get(`.follower[data-foe="${index + 1}"]`);
      this.renderHealth(card.querySelector<HTMLElement>('.health-bar')!, follower);
      card.querySelector('.follower-condition')!.textContent = condition(follower);
    });
    const strike = this.root.querySelector<HTMLSelectElement>('#strike-target');
    if (strike) {
      for (const option of Array.from(strike.options)) option.disabled = Number(option.value) > 0 ? state.followers[Number(option.value) - 1].health === 0 : state.enemy.health === 0;
      // Aim at whoever is still standing.
      if (strike.selectedOptions[0]?.disabled) strike.value = Array.from(strike.options).find(option => !option.disabled)?.value ?? '0';
      strike.disabled = state.phase !== 'player';
    }
    this.get('#enemy-mana').textContent = `Mana ${enemyMana(state)}${ENEMIES[state.encounter].veiled && !state.enemyRevealed ? ' · veiled' : ''}${state.fury ? ` · ${state.encounter === 'hyena' ? 'Fed' : 'Fury'} ${state.fury}` : ''}${warded(state) ? ' · warded by its votives' : ''}`;
    const target = enemyTarget(state);
    this.get('#enemy-intent').textContent = done ? '' : state.enemy.health === 0 ? `The ${ENEMIES[state.encounter].short} is down. What stood with it fights on.`
      : state.snared ? 'Snared · thorns hold it. It cannot move this turn.'
      : `${intent(state).type === 'spell' ? 'Spell' : 'Physical'} · ${intent(state).tell} ${target ? `Watching ${MEMBERS[target.id].name}.` : ''}`;
    this.get('.grimoire-status').textContent = `Grimoire · ${state.studied.includes(SPELL) ? SPELL + ' — can be blocked' : 'No spells studied'}${this.saved ? '' : ' · kept for this visit; browser save unavailable'}`;
    for (const member of state.party) {
      const card = this.card(member.id);
      card.dataset.acted = String(member.acted);
      card.dataset.downed = String(member.health === 0);
      card.querySelector('.member-condition')!.textContent = condition(member);
      this.renderHealth(card.querySelector<HTMLElement>('.health-bar')!, member);
      card.querySelector('.member-mana')!.textContent = `Mana ${member.mana} / ${member.maxMana} · showing ${visibleMana(member)}`;
      card.querySelector('.member-status')!.textContent = member.health === 0 ? 'Cannot act'
        : member.flaring ? 'Flaring · the enemy sees them' : member.barrier ? 'Barrier raised' : member.suppressed ? 'Hidden · attack to reveal'
        : member.guardingFor ? `Guarding ${MEMBERS[member.guardingFor].name}` : member.focused ? 'Focused'
        : member.acted ? 'Acted' : done ? '' : 'Ready';
      for (const action of ['attack', 'support', 'gather', 'suppress', 'barrier', 'analyze'] as const) card.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.disabled = Boolean(this.casting) || !canAct(state, member.id, action, member.id, action === 'attack' ? this.foe() : 0);
      card.querySelectorAll<HTMLButtonElement>('[data-supply]').forEach(button => {
        const supply = button.dataset.supply as SupplyId;
        button.textContent = `${SUPPLIES[supply].name} · ${state.supplies[supply]} left`;
        const fallen = state.party.find(ally => ally.health === 0)?.id;
        const target = SUPPLIES[supply].target === 'fallen' ? fallen ?? member.id : card.querySelector<HTMLSelectElement>('select')?.value as MemberId ?? member.id;
        button.disabled = Boolean(this.casting) || !canUse(state, member.id, supply, target, this.foe());
      });
      const castButton = card.querySelector<HTMLButtonElement>('[data-cast]');
      if (castButton && member.spell) {
        const spell = SPELLS[member.spell];
        castButton.disabled = Boolean(this.casting) || !canCast(state, member.id, this.foe());
        castButton.querySelector('small')!.textContent = member.cooldown > 0
          ? `Settling · ready in ${member.cooldown} round${member.cooldown === 1 ? '' : 's'}` : `${spell.cost} mana · ${spell.length} keys`;
      }
      card.querySelector<HTMLButtonElement>('.party-fighter')!.disabled = !canAct(state, member.id, 'support');
      const select = card.querySelector('select');
      if (select) {
        for (const option of Array.from(select.options)) option.disabled = state.party.find(ally => ally.id === option.value)!.health === 0;
        if (select.selectedOptions[0]?.disabled) select.value = member.id;
        select.disabled = state.phase !== 'player' || member.acted || member.health === 0;
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
    finish.textContent = state.phase === 'victory' ? 'Continue' : state.phase === 'fled' ? 'Get away' : 'Wake at the cot';
    const run = this.get<HTMLButtonElement>('#flee');
    run.hidden = done;
    run.disabled = Boolean(this.casting) || !canFlee(state);
    run.title = state.encounter === 'boar' ? 'The boar stands between you and the road.' : '';
    if (done) finish.focus({ preventScroll: true });
  }

  destroy() {
    clearTimeout(this.timer); this.cleanup.abort(); this.root.remove();
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
