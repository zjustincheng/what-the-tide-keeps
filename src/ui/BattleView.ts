import { battlePacing } from '../presentation/battlePacing';
import { BOAR_PHASE_SHOTS } from '../presentation/bossScenes';
import { strikeFeedback } from '../presentation/battleFeedback';
import type { BattleFeedback } from '../presentation/battleFeedback';
import { actionPreview } from '../presentation/battleActions';
import { act, agility, canAct, canCast, canFlee, canUse, cast, condition, cost, createBattle, DODGE, dodgeKind, ENEMIES, enemyMana, enemyTarget, flee, GATHER, grade, hesitate, intent, matchup, MEMORY_NAMES, MEMBERS, nextStrike, PATIENCE, SPELL, STAGES, strike, SURVIVE, TRAITS, useSupply, venom, visibleMana, warded } from '../rules/battle';
import type { Action, Battle, BattleOptions, Dodge, DodgeKind, Fighter, Foe, MemberId, Encounter } from '../rules/battle';
import { checkSequence, SPELLS } from '../rules/spells';
import { BOUNTY, SUPPLIES, SUPPLY_IDS } from '../rules/economy';
import type { Supplies, SupplyId } from '../rules/economy';

import { loadGrimoire, saveGrimoire } from '../storage/grimoire';
import { music } from '../audio/music';
import { beaten, sighted } from '../storage/bestiary';
import type { Effect as Sound } from '../audio/effects';
import { combatEffect } from '../presentation/combat';
import { tableau } from '../presentation/tableau';
import type { Tableau } from '../presentation/stories';
import { reclaimedMemories } from '../content/reclaimedMemories';
import type { MemoryId } from '../rules/memory';

const PHASE_SETS: Partial<Record<Encounter, Tableau>> = {
  boar: 'farmhouse', hyena: 'ossuary', viper: 'apothecary', cuckoo: 'house-hall',
  cuttlefish: 'sea', human: 'laboratory', warden: 'church',
  leech: 'sea', drowned: 'church', swarm: 'farmhouse', pack: 'battlefield',
};

// How long the dodge ring takes to close on its target, in milliseconds.
const LEAD = 900;

// Who appears in a boss's scene when they speak, by the name the scene gives them.
const SPEAKER_ART: Record<string, string> = { 'THE BOAR': 'boar', 'THE BADGER': 'badger', 'THE RAT': 'rat', 'THE HYENA': 'hyena', 'THE VIPER': 'viper', 'THE CUCKOO': 'cuckoo', 'THE CUTTLEFISH': 'cuttlefish', 'THE HUMAN': 'human' };

// What each hero's support does. A guard stops physical blows; a barrier (under Spellcraft) stops studied spells.
const SUPPORT_SHORT: Record<MemberId, string> = { chameleon: 'Stops blows', bear: 'Guards an ally', vulture: 'Next hit harder', frog: 'Mends an ally', octopus: 'Throws a spell back' };
const SUPPORT_HELP: Record<MemberId, string> = {
  chameleon: 'Guard: stops physical blows aimed at him this turn. It does nothing against spells: a barrier does that.',
  bear: 'Protect: the bear guards the ally chosen on his card against physical blows this turn, himself included. Spells pass through: use a barrier.',
  vulture: 'Focus: her next attack hits 3 harder.',
  octopus: 'Mimic: throws back the last spell written into the grimoire, at the main enemy, for 4 mana. It needs something studied to copy.',
  frog: 'Dose: a small dose of her toxin mends the ally chosen on her card by 6 and draws out their poison. While the party is soured, it burns instead. Her dart, a large dose, poisons the enemy.',
};

export class BattleView {
  private state: Battle;
  private saved = true;
  private root: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private cleanup = new AbortController();
  private delays = new Set<ReturnType<typeof setTimeout>>();
  private sceneCleanup?: () => void;
  private previousFocus = document.activeElement as HTMLElement | null;
  private onFinish: (won: boolean, state: Battle) => void;
  // Set while a dodge prompt is open: when the blow lands, and how to answer it.
  private prompts = 0;
  private casts = 0;
  private promptCleanup?: () => void;
  private prompt?: { impact: number; kind: DodgeKind; answer: (dodge: Dodge, early?: boolean, reason?: string) => void; key?: (digit: number) => void; stop?: () => Dodge };
  // Set while a spell is being typed.
  private casting?: (key: number) => void;
  // The stage the screen last showed, so a boss's rising scene plays when it changes during the fight.
  private shownStage: 1 | 2 = 1;
  private originalMemories: readonly MemoryId[];
  private shownReclaimed = 0;
  private previewed?: { actor: MemberId; action: Action };
  private incomingTarget?: MemberId;

  // A bout in the Talon Ring: losing walks you out of the ring, not back to the cot.
  private arena: boolean;
  private tutorial: boolean;

  constructor(heroImage: string, onFinish: (won: boolean, state: Battle) => void, encounter: Encounter = 'locust', options: BattleOptions = {}, tutorial = false) {
    this.onFinish = onFinish;
    this.arena = Boolean(options.arena);
    this.tutorial = tutorial;
    this.state = createBattle(encounter, loadGrimoire(), options);
    this.originalMemories = [...this.state.lostMemories];
    const enemyName = ENEMIES[encounter].name;
    this.root = document.createElement('section');
    this.root.className = 'battle party-battle';
    this.root.dataset.encounter = encounter;
    if (tutorial) this.root.dataset.tutorial = 'true';
    const glow = ['human', 'cuttlefish', 'shark', 'eel', 'barracuda', 'jelly', 'kraken'].includes(encounter) ? '#39758a88'
      : ['viper', 'apprentice', 'mosquito', 'scorpion', 'brood'].includes(encounter) ? '#73794477'
      : ['hyena', 'ghoul', 'wisp', 'drowned'].includes(encounter) ? '#65557b88'
      : ['boar', 'hound', 'locust', 'weevil'].includes(encounter) ? '#93734f66' : '#577e8070';
    this.root.style.setProperty('--battle-glow', glow);
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'battle-title');
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">${tutorial ? 'THE FIVE · BEFORE THE FEAST' : 'THE CONDEMNED'}</p><h2 id="battle-title">${tutorial ? 'The Kraken' : 'Stand together.'}</h2><p id="battle-turn"></p><button id="battle-finish" type="button" hidden></button><button id="flee" class="flee" type="button" title="Drop half your coins and take a parting blow">Run</button></div>
      ${tutorial ? '<p class="battle-tutorial" id="battle-tutorial" aria-live="polite"></p>' : ''}
      <div class="enemy-row">
        <div class="arena-backdrop" aria-hidden="true">${tableau(encounter === 'human' ? 'lighthouse' : encounter === 'kraken' ? 'kraken' : ['cuttlefish', 'shark', 'eel', 'barracuda', 'jelly'].includes(encounter) ? 'sea' : ['hyena', 'ghoul', 'raider'].includes(encounter) ? 'battlefield' : encounter === 'cuckoo' ? 'house-hall' : ['viper', 'apprentice'].includes(encounter) ? 'cell' : 'mill')}</div>
        <div class="fighter enemy-fighter" data-foe="0"><img src="${import.meta.env.BASE_URL}assets/${encounter}.${encounter === 'kraken' ? 'png' : 'svg'}" alt="${enemyName}" /></div>
        <div><h3>${enemyName}</h3>${TRAITS[encounter].length ? `<p class="enemy-traits" title="The bear's maul breaks armour and can't reach flyers; the vulture's talons take flyers and skid off armour; the chameleon strikes casters hardest; the frog's poison is double in insects and nothing in the dead. Spells ignore all of it.">${TRAITS[encounter].map(trait => trait[0].toUpperCase() + trait.slice(1)).join(' · ')}</p>` : ''}<div class="health-bar" role="meter" aria-label="${enemyName} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p id="enemy-condition"></p><p class="mana" id="enemy-mana"></p></div>
        ${this.state.followers.map((follower, index) => `<div class="follower" data-foe="${index + 1}">
          <div class="fighter enemy-fighter"><img src="${import.meta.env.BASE_URL}assets/${follower.art ?? follower.name.toLowerCase()}.svg" alt="${follower.name}" /></div>
          <h4>${follower.name}</h4><div class="health-bar" role="meter" aria-label="${follower.name} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p class="follower-condition"></p><p class="mana">Mana veiled</p>
        </div>`).join('')}
      </div>
      ${this.state.followers.length ? `<label class="strike-label">Strike at <select id="strike-target" aria-label="Attack target"><option value="0">${enemyName}</option>${this.state.followers.map((follower, index) => `<option value="${index + 1}">${follower.name}</option>`).join('')}</select></label>` : ''}
      <p class="intent" id="enemy-intent"></p><p class="combat-feedback" role="status" hidden></p><div class="patience" aria-hidden="true"><span></span></div><p class="grimoire-status" aria-live="polite"></p>
      ${encounter === 'human' ? '<section class="memory-reclamation" aria-label="Memories held by the human"><details><summary class="reclamation-count"></summary><div class="reclamation-memories"></div></details><p class="reclamation-note" role="status"></p></section>' : ''}
      <p class="action-preview" id="action-preview" role="status"></p>
      <div class="party-roster" data-size="${this.state.party.length}">${this.state.party.map(member => {
        const info = MEMBERS[member.id];
        return `<section class="member-card" data-member="${member.id}" aria-label="${info.name}">
          <button class="fighter party-fighter" aria-label="${info.name}: tap for ${info.support.toLowerCase()}, drag to attack or support"><img alt="" /></button>
          <h3>${info.name}</h3><div class="health-bar" role="meter" aria-label="${info.name} health" aria-valuemin="0" aria-valuemax="100"><span></span></div><p class="member-condition"></p><p class="mana member-mana"></p><p class="member-status"></p>
          <label class="protect-label">Ally <select aria-label="${member.id === 'bear' ? 'Bear protection target' : member.id === 'frog' ? 'Frog dose target' : info.name + ' barrier target'}">${this.state.party.map(target => `<option value="${target.id}" ${target.id === member.id ? 'selected' : ''}>${MEMBERS[target.id].name}</option>`).join('')}</select></label>
          <div class="member-actions"><button data-action="attack" aria-label="${info.name} attack">${info.attack}<small>${member.id === 'frog' ? (venom(encounter) > 1 ? 'Poison · strong' : venom(encounter) === 0 ? 'Poison · useless' : 'Physical') : matchup(member.id, encounter) > 1 ? 'Physical · strong' : matchup(member.id, encounter) < 1 ? 'Physical · weak' : 'Physical'}</small></button><button data-action="support" aria-label="${info.name} support" title="${member.id === 'bear' && member.gear.guardAll > 0 ? 'Protect: guards both allies and the bear against physical blows for 3 mana. Uses his action. Spells still require barriers.' : SUPPORT_HELP[member.id]}">${info.support}<small>${member.id === 'bear' && member.gear.guardAll > 0 ? 'Both allies · 3 mana' : SUPPORT_SHORT[member.id]}</small></button><button data-action="gather" aria-label="${info.name} gather">Gather<small>+${GATHER} mana</small></button></div>
          ${encounter === 'cuckoo' ? `<button class="unmask-button" type="button" data-unmask="${member.id}" aria-label="Strike ${info.name}" title="Strike ${info.name}, in case it is the cuckoo wearing their shape. His mana never moves. The first ready hero does it. Strike the wrong one, and you hurt a friend.">Strike<small>In case it's him</small></button>` : ''}
          ${member.spell ? `<button class="cast-button" data-cast aria-label="${info.name} cast ${SPELLS[member.spell].name}">${SPELLS[member.spell].name}<small>${SPELLS[member.spell].cost} mana · ${SPELLS[member.spell].length} keys</small></button>` : ''}
          <details class="spellcraft"><summary>Spellcraft</summary><button data-action="suppress" aria-label="${info.name} suppress">Suppress · ${cost(member, 'suppress')} mana<small>Hide</small></button><button data-action="barrier" aria-label="${info.name} barrier" title="A barrier stops spells, but only ones you have studied, for the ally chosen on this card. It does nothing against physical blows: guard against those.">Barrier · 5 mana<small>Stops studied spells</small></button><button data-action="analyze" aria-label="${info.name} analyze">Analyze · 2 mana<small>Study</small></button></details>
          ${SUPPLY_IDS.some(id => this.state.supplies[id] > 0) ? `<details class="spellcraft supplies-menu"><summary>Supplies</summary>${SUPPLY_IDS.map(id => `<button data-supply="${id}" aria-label="${info.name} use ${SUPPLIES[id].name}"></button>`).join('')}</details>` : ''}
        </section>`;
      }).join('')}</div>
      <div class="battle-log" role="log" aria-live="polite" aria-label="Battle events"></div>
      <div class="spell-bar" hidden><p class="spell-name"></p><div class="spell-keys" aria-live="polite"></div><div class="spell-timer"><span></span></div>
        <div class="spell-pad">${[1, 2, 3, 4].map(key => `<button type="button" data-key="${key}">${key}</button>`).join('')}</div></div>
      <div class="dodge-bar" hidden><p class="dodge-call" aria-live="assertive"></p><button id="dodge" type="button">Dodge <small>Space or tap · as the ring closes</small></button></div>
      <details class="battle-help"><summary>Battle controls</summary><p>Each living companion acts once. Spellcraft uses that action too.<br />Guard physical blows. Analyze spells before blocking them. Attack while hidden to reveal.<br />Mana returns slowly: 1 a round, or Gather to draw back more. Spent mana stays spent until you rest.<br />A spell needs time to settle before it can be cast again, and casting floods the caster's mana into view.<br />When a blow comes, press Space as the ring closes to dodge. Unknown spells cannot be dodged.</p></details>
      `;
    const details = document.createElement('details'); details.className = 'battle-details';
    const summary = document.createElement('summary'); summary.textContent = 'Battle details'; details.append(summary);
    for (const selector of ['.action-preview', '.grimoire-status', '.battle-help']) details.append(this.get(selector));
    const feedbackDetail = document.createElement('p'); feedbackDetail.className = 'feedback-detail'; feedbackDetail.hidden = true; details.insertBefore(feedbackDetail, this.get('.grimoire-status'));
    this.root.append(details);
    // The log of what happened sits above the party, where it can be read without opening anything.
    this.get('.party-roster').before(this.get('.battle-log'));
    for (const member of this.state.party) {
      this.card(member.id).querySelector<HTMLImageElement>('img')!.src = member.id === 'chameleon' ? heroImage
        : `${import.meta.env.BASE_URL}assets/${member.id}.svg`;
    }
    // In the ring, running is yielding, and costs nothing but the bout.
    if (this.arena) { const yieldButton = this.get<HTMLButtonElement>('#flee'); yieldButton.textContent = 'Yield'; yieldButton.title = 'Walk out of the ring. The bout is lost; nothing else is.'; }
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    for (const member of this.state.party) {
      const card = this.card(member.id);
      card.querySelector<HTMLButtonElement>('[data-unmask]')?.addEventListener('click', () => { const striker = this.striker(member.id); if (striker) this.choose(striker, 'unmask', member.id); }, { signal });
      for (const action of ['attack', 'support', 'gather', 'suppress', 'barrier', 'analyze'] as const) {
        const button = card.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!;
        const preview = () => { this.previewed = { actor: member.id, action }; this.renderPreview(); };
        button.addEventListener('pointermove', preview, { signal });
        button.addEventListener('focus', preview, { signal });
        card.querySelector(`[data-action="${action}"]`)?.addEventListener('click', () => {
          const target = (action === 'barrier' || ((member.id === 'bear' || member.id === 'frog') && action === 'support')) ? card.querySelector<HTMLSelectElement>('select')!.value as MemberId : member.id;
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
    // They are heard wherever the keyboard focus happens to be, so a dodge is never lost to a stray click.
    // Keys answer a spell's dodge.
    document.addEventListener('keydown', event => {
      if (this.prompt?.kind !== 'keys' || !['1', '2', '3', '4'].includes(event.key) || event.repeat) return;
      event.preventDefault(); this.prompt.key!(Number(event.key));
    }, { signal });
    document.addEventListener('keydown', event => {
      if (!this.prompt || this.prompt.kind === 'keys' || ![' ', 'Enter'].includes(event.key) || event.repeat) return;
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
      if (won) beaten(this.state.encounter);
      if (this.tutorial) {
        this.onFinish(won, this.state);
        this.destroy(false);
      } else {
        this.destroy(); this.onFinish(won, this.state);
      }
    }, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden]),select:not([disabled]),summary'))
        .filter(control => {
          if (control.closest('[hidden]')) return false;
          const closed = control.closest('details:not([open])');
          return !closed || control.tagName === 'SUMMARY' && closed === control.parentElement && !closed.parentElement?.closest('details:not([open])');
        });
      event.preventDefault();
      if (!controls.length) { this.root.focus(); return; }
      const index = controls.indexOf(document.activeElement as HTMLElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.root.tabIndex = -1;
    this.render();
    if (this.tutorial) this.card('chameleon').querySelector<HTMLButtonElement>('[data-action="attack"]')!.focus({ preventScroll: true });
    else this.focusNext();
    // An ambush opens on the enemy's turn.
    if (this.state.phase === 'enemy') { this.root.focus({ preventScroll: true }); this.timer = this.later(() => this.enemyTurn(), battlePacing(this.state.encounter).turnLead); }
  }

  private later(run: () => void, ms: number) {
    const id = setTimeout(() => { this.delays.delete(id); if (!this.cleanup.signal.aborted) run(); }, ms);
    this.delays.add(id); return id;
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
    bar.title = condition(fighter);
  }

  private focusNext() {
    const next = this.state.party.find(member => member.health > 0 && !member.acted);
    if (next) {
      const action = this.tutorial && this.state.round >= 2 && ['bear', 'frog'].includes(next.id) ? 'support' : this.tutorial ? 'attack' : 'support';
      this.card(next.id).querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.focus({ preventScroll: true });
    }
    this.armPatience();
  }

  private renderTutorial(state: Battle, done: boolean) {
    if (!this.tutorial) return;
    const hint = this.get<HTMLElement>('#battle-tutorial');
    this.root.querySelectorAll('.tutorial-pulse').forEach(element => element.classList.remove('tutorial-pulse'));
    if (done) {
      hint.textContent = state.phase === 'victory'
        ? 'VICTORY · The five have driven the kraken back. Continue to the feast.'
        : 'THE TIDE TAKES YOU · The five pull one another back to the surface. Try the fight again.';
      return;
    }
    if (state.phase === 'enemy') {
      hint.textContent = 'DODGE · Watch the warning. Press Space or tap Dodge as the ring closes.';
      this.get<HTMLButtonElement>('#dodge').classList.add('tutorial-pulse');
      return;
    }
    if (state.round === 1) {
      hint.textContent = 'STEP 1 · Attack once with each hero.';
      for (const member of state.party.filter(hero => hero.health > 0 && !hero.acted)) this.card(member.id).querySelector('[data-action="attack"]')!.classList.add('tutorial-pulse');
    } else if (state.round === 2) {
      hint.textContent = 'STEP 2 · Protect with Bear. Heal with Frog.';
      for (const id of ['bear', 'frog'] as const) if (state.party.some(member => member.id === id && member.health > 0 && !member.acted)) this.card(id).querySelector('[data-action="support"]')!.classList.add('tutorial-pulse');
    } else {
      hint.textContent = 'STEP 3 · Fight together. Watch for the dodge warning.';
      for (const member of state.party.filter(hero => hero.health > 0 && !hero.acted)) this.card(member.id).querySelector('[data-action="attack"]')!.classList.add('tutorial-pulse');
    }
  }

  // The enemy will not wait forever: when the bar runs out, it takes a free swing, and the bar starts again.
  private patience?: ReturnType<typeof setTimeout>;
  private armPatience() {
    clearTimeout(this.patience);
    const bar = this.root.querySelector<HTMLElement>('.patience span');
    if (this.state.phase !== 'player' || !bar) return;
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = `patience ${PATIENCE}ms linear forwards`;
    this.patience = this.later(() => {
      if (this.state.phase !== 'player' || this.casting) { this.armPatience(); return; }
      this.state = hesitate(this.state);
      music.effect('hit');
      this.persist(); this.render(); this.ended();
      if (this.state.phase === 'player') this.focusNext();
    }, PATIENCE);
  }

  private foe(): Foe {
    return Number(this.root.querySelector<HTMLSelectElement>('#strike-target')?.value ?? 0);
  }

  private actionTarget(actor: MemberId, action: Action): MemberId {
    return action === 'barrier' || action === 'support' && (actor === 'bear' || actor === 'frog')
      ? this.card(actor).querySelector<HTMLSelectElement>('select')!.value as MemberId : actor;
  }

  private renderPreview() {
    const preview = this.get<HTMLElement>('#action-preview');
    preview.hidden = this.state.phase === 'victory' || this.state.phase === 'defeat' || this.state.phase === 'fled';
    preview.textContent = this.previewed
      ? actionPreview(this.state, this.previewed.actor, this.previewed.action, this.actionTarget(this.previewed.actor, this.previewed.action), this.previewed.action === 'attack' ? this.foe() : 0)
      : 'Each hero acts once. Choose an enemy for attacks and an ally for support or barriers.';
  }

  private showFeedback(feedback: BattleFeedback, target?: MemberId) {
    const status = this.get<HTMLElement>('.combat-feedback');
    status.hidden = false; status.dataset.effect = feedback.kind;
    status.title = feedback.message;
    const detail = this.get<HTMLElement>('.feedback-detail'); detail.hidden = false; detail.textContent = feedback.message;
    const label = document.createElement('span'); label.className = 'feedback-label';
    label.textContent = `${target ? MEMBERS[target].name + ' · ' : ''}${feedback.label}`;
    const explanation = document.createElement('span'); explanation.className = 'battle-sr'; explanation.textContent = feedback.message;
    status.replaceChildren(label, explanation);
    if (target) combatEffect(this.card(target).querySelector('.party-fighter'), feedback.kind, feedback.label);
  }

  private choose(actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0) {
    if (this.casting || !canAct(this.state, actor, action, target, foe)) return;
    this.strikeKind = action === 'attack' ? 'slash' : undefined;
    this.state = act(this.state, actor, action, target, foe);
    if (action === 'analyze') this.showFeedback({ kind: 'mana', label: 'STUDIED', message: `${this.state.studied.at(-1)} is recorded in the shared grimoire and survives death.` }, actor);
    // Each hero strikes with their own sound; spellcraft has its own.
    const sounds: Record<Action, Sound> = { attack: ({ chameleon: 'lash', bear: 'maul', vulture: 'talons', frog: 'lash', octopus: 'maul' } as const)[actor], support: actor === 'vulture' || actor === 'frog' ? 'gather' : actor === 'octopus' ? 'barrier' : 'block', suppress: 'open', barrier: 'barrier', analyze: 'key', gather: 'gather', unmask: 'hit' };
    music.effect(sounds[action]);
    this.afterAction();
  }

  // Who strikes a suspected friend: the first ready hero who isn't them, the hero first, since the cuckoo never wears his shape.
  private striker(target: MemberId): MemberId | undefined {
    return this.state.party.find(member => member.id !== target && canAct(this.state, member.id, 'unmask', target))?.id;
  }

  // Food and salts go to the ally chosen on the card; salts find the fallen if that ally is standing. Firepots go where attacks go.
  private supply(actor: MemberId, supply: SupplyId) {
    if (this.casting) return;
    const chosen = this.card(actor).querySelector<HTMLSelectElement>('select')?.value as MemberId | undefined ?? actor;
    const fallen = this.state.party.find(member => member.id === chosen && member.health === 0) ?? this.state.party.find(member => member.health === 0);
    const target = SUPPLIES[supply].target === 'fallen' ? fallen?.id ?? chosen : chosen;
    if (!canUse(this.state, actor, supply, target, this.foe())) return;
    this.strikeKind = supply === 'firepot' ? 'fire' : undefined;
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
    const shown = ++this.casts;
    const bar = this.get('.spell-bar'), keys = this.get('.spell-keys');
    delete bar.dataset.result;
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
      this.later(() => { if (this.casts === shown) { bar.hidden = true; delete bar.dataset.result; } }, 350);
      this.strikeKind = success ? 'burst' : undefined;
      this.state = cast(this.state, actor, success, foe);
      if (!success) this.showFeedback({ kind: 'fizzle', label: 'FIZZLED', message: `${MEMBERS[actor].name}'s spell failed. The action and mana were spent.` }, actor);
      music.effect(!success ? 'fizzle' : spell.kind === 'heal' ? 'heal' : spell.kind === 'ward' ? 'barrier' : 'spell');
      this.afterAction();
    };
    this.casting = key => {
      typed.push(key); show();
      music.effect('key', key * 2);
      const result = checkSequence(sequence, typed);
      if (result !== 'typing') finish(result === 'cast');
    };
    this.timer = this.later(() => finish(false), spell.seconds * 1000);
    this.render(); this.root.focus({ preventScroll: true });
  }

  private afterAction() {
    clearTimeout(this.patience);
    const before = this.shownStage;
    this.persist(); this.render();
    // A boss brought down for the first time gets back up: play its scene before anything else moves.
    if (before === 1 && this.state.stage === 2 && STAGES[this.state.encounter]) { this.playScene(() => this.afterAction()); return; }
    this.ended();
    if (this.state.phase === 'enemy') {
      this.root.focus({ preventScroll: true });
      this.timer = this.later(() => this.enemyTurn(), battlePacing(this.state.encounter).turnLead);
    } else if (this.state.phase === 'player') this.focusNext();
  }

  // Play the enemy turn one blow at a time, offering a dodge whenever one is possible.
  private enemyTurn() {
    this.timer = undefined;
    const next = nextStrike(this.state);
    const follower = next ? this.state.followers.findIndex(follower => next.move.name.startsWith(`${follower.name.toLowerCase()}'s `)) : -1;
    const source = follower + 1;
    const pacing = battlePacing(this.state.encounter, source === 0);
    const fighter = this.root.querySelector(`[data-foe="${source}"] .fighter, .fighter[data-foe="${source}"]`);
    if (next && !next.move.revive && !next.move.feed) {
      this.card(next.target.id).dataset.targeted = 'true';
      fighter?.classList.add('is-winding');
      if (pacing.heavy && next.damage > 0 && !next.move.revive) music.effect('boss-windup');
    }
    const land = (dodge: Dodge, reason?: string) => {
      // How the blow lands decides its sound: stopped, dodged, grazed, or taken.
      const before = next;
      // The enemy lunges as its blow lands.
      fighter?.classList.remove('is-winding');
      if (before) this.card(before.target.id).dataset.targeted = 'false';
      if (before && !before.move.revive) this.play(fighter, 'is-striking');
      this.strikeKind = undefined;
      const previousStage = this.state.stage;
      this.incomingTarget = before?.target.id;
      this.state = strike(this.state, dodge); this.persist(); this.render();
      this.incomingTarget = undefined;
      const feedback = strikeFeedback(before, dodge);
      if (feedback) {
        if (feedback.label === 'UNSTUDIED' && this.state.studied.includes(before!.move.spell ?? '')) feedback.message = `${MEMBERS[before!.target.id].name} survives the unknown spell. Its structure is now recorded for barriers and dodges.`;
        if (reason && dodge !== 'perfect') feedback.message = `${reason.replace(' · hit.', '.')} ${feedback.message}`;
        if (this.state.party.find(member => member.id === before!.target.id)!.health === 0) feedback.message += ' They fall.';
        this.showFeedback(feedback, before!.target.id);
      }
      if (before && before.damage === 0 && !before.move.revive) music.effect('block');
      else if (before?.dodgeable && dodge === 'perfect') music.effect('dodge');
      else if (before?.dodgeable && dodge === 'graze') music.effect('graze');
      else if (before && before.damage > 0) {
        music.effect(pacing.heavy ? 'boss-impact' : 'hit');
        if (pacing.heavy && !matchMedia('(prefers-reduced-motion: reduce)').matches) this.play(this.root, 'boss-impact');
      }
      if (previousStage === 1 && this.state.stage === 2 && STAGES[this.state.encounter]) { this.playScene(() => this.afterAction()); return; }
      this.ended();
      if (this.state.phase === 'enemy') this.timer = this.later(() => this.enemyTurn(), pacing.recovery);
      else if (this.state.phase === 'player') this.focusNext();
    };
    if (!next?.dodgeable) {
      // A blow that cannot be dodged is announced, so the player sees why no ring came.
      if (next && next.damage > 0 && (next.move.undodgeable || next.move.type === 'spell' && !this.state.studied.includes(next.move.spell ?? ''))) {
        const bar = this.get('.dodge-bar');
        const shown = ++this.prompts;
        bar.dataset.kind = 'unavailable';
        this.get('.dodge-call').textContent = `${next.move.name} → ${MEMBERS[next.target.id].name} · ${next.move.type === 'spell' && !this.state.studied.includes(next.move.spell ?? '') ? 'Unstudied' : 'Cannot dodge'}`;
        this.get<HTMLButtonElement>('#dodge').hidden = true;
        bar.hidden = false;
        this.later(() => { if (this.prompts === shown) bar.hidden = true; }, 900);
        this.timer = this.later(() => land('miss'), pacing.warning);
        return;
      }
      this.timer = this.later(() => land('miss'), next ? pacing.windup : 0);
      return;
    }
    // Each blow asks for its own kind of dodge: a closing ring, keys to type, or a bar to stop.
    const kind = dodgeKind(next.move);
    const quick = agility(next.target);
    const card = this.card(next.target.id);
    card.dataset.targeted = 'true';
    const ring = document.createElement('div');
    ring.className = 'dodge-ring'; ring.style.setProperty('--lead', `${LEAD}ms`);
    const impact = performance.now() + LEAD;
    const bar = this.get('.dodge-bar'), button = this.get<HTMLButtonElement>('#dodge');
    const shown = ++this.prompts;
    bar.dataset.kind = kind;
    const call = `${next.move.name} → ${MEMBERS[next.target.id].name}.`;
    const pieces: HTMLElement[] = [ring];
    let hint = 'Space or tap · as the ring closes';
    if (kind === 'ring') { bar.insertBefore(ring, button); this.root.dataset.impact = String(impact); }
    let keys: number[] = [];
    let sequence: HTMLElement | undefined;
    if (kind === 'keys') {
      // Trace the spell's sigil back at it: three keys, quickly.
      keys = Array.from({ length: 3 }, () => 1 + Math.floor(Math.random() * 4));
      hint = 'Match all three numbers quickly · slower matches graze';
      sequence = document.createElement('div'); sequence.className = 'dodge-sequence';
      sequence.setAttribute('aria-label', 'Spell dodge sequence');
      sequence.innerHTML = keys.map((key, index) => `<span data-state="${index === 0 ? 'next' : 'todo'}">${key}</span>`).join('');
      const pad = document.createElement('div'); pad.className = 'spell-pad dodge-pad';
      for (const digit of [1, 2, 3, 4]) {
        const key = document.createElement('button'); key.type = 'button'; key.textContent = String(digit); key.setAttribute('aria-label', `Dodge key ${digit}`);
        key.addEventListener('pointerdown', event => { event.preventDefault(); this.prompt?.key?.(digit); }, { signal: this.cleanup.signal });
        key.addEventListener('click', event => { if (event.detail === 0) this.prompt?.key?.(digit); }, { signal: this.cleanup.signal }); pad.append(key);
      }
      const instruction = document.createElement('p'); instruction.className = 'dodge-instruction'; instruction.textContent = 'Quick match: dodge. Slower match: graze.';
      bar.append(sequence, instruction, pad); pieces.push(sequence, instruction, pad);
    }
    let sweep = 0;
    const zone = { start: 0.2 + Math.random() * 0.5, width: Math.min(0.4, 0.2 * quick) };
    const started = performance.now();
    if (kind === 'bar') {
      // A marker sweeps a bar; stop it inside the gold.
      const meter = document.createElement('div');
      meter.className = 'dodge-meter';
      meter.innerHTML = `<span class="dodge-zone" style="left:${zone.start * 100}%;width:${zone.width * 100}%"></span><span class="dodge-marker"></span>`;
      bar.prepend(meter); pieces.push(meter);
      const marker = meter.querySelector<HTMLElement>('.dodge-marker')!;
      const move = () => { const t = ((performance.now() - started) / 700) % 2; marker.style.left = `${(t < 1 ? t : 2 - t) * 100}%`; sweep = requestAnimationFrame(move); };
      move();
      hint = 'Space or tap · inside the gold';
    }
    this.get('.dodge-call').textContent = `${call} ${kind === 'keys' ? `Type ${keys.join(' ')}!` : 'Dodge!'}`;
    button.querySelector('small')!.textContent = hint;
    bar.hidden = false; button.hidden = kind === 'keys'; button.disabled = false;
    if (kind === 'keys') this.root.focus({ preventScroll: true }); else button.focus({ preventScroll: true });
    let typed = 0;
    const allowed = LEAD * 1.6 * quick;
    this.promptCleanup = () => { cancelAnimationFrame(sweep); pieces.forEach(piece => piece.remove()); };
    this.prompt = {
      impact, kind,
      answer: (dodge, early = false, reason) => {
        clearTimeout(this.timer); cancelAnimationFrame(sweep); this.prompt = undefined;
        card.dataset.targeted = 'false';
        delete this.root.dataset.impact;
        pieces.forEach(piece => piece.querySelectorAll<HTMLButtonElement>('button').forEach(key => key.disabled = true));
        button.disabled = true; this.root.focus({ preventScroll: true });
        // Leave the result up briefly, unless the next blow has already opened a new prompt.
        this.later(() => { if (this.prompts === shown) bar.hidden = true; }, 700);
        ring.dataset.result = dodge;
        this.get('.dodge-call').textContent = reason ?? (dodge === 'perfect' ? 'Dodged!' : dodge === 'graze' ? 'Grazed · partial dodge.' : early ? 'Too soon · hit.' : 'Too slow · hit.');
        this.promptCleanup?.(); this.promptCleanup = undefined;
        land(dodge, reason);
      },
      key: digit => {
        if (digit !== keys[typed]) { sequence!.children[typed].setAttribute('data-state', 'wrong'); this.prompt?.answer('miss', false, 'Wrong key · hit.'); return; }
        music.effect('key', digit * 2);
        typed++;
        Array.from(sequence!.children).forEach((key, index) => key.setAttribute('data-state', index < typed ? 'done' : index === typed ? 'next' : 'todo'));
        this.get('.dodge-call').textContent = `${call} Type ${keys.map((key, i) => i < typed ? '·' : key).join(' ')}!`;
        if (typed === keys.length) {
          const quick = performance.now() - started <= allowed * .6;
          this.prompt?.answer(quick ? 'perfect' : 'graze', false, quick ? 'Dodged!' : 'Matched late · grazed.');
        }
      },
      stop: () => {
        const t = ((performance.now() - started) / 700) % 2, at = t < 1 ? t : 2 - t;
        const inner = { start: zone.start + zone.width / 4, end: zone.start + zone.width * 3 / 4 };
        return at >= inner.start && at <= inner.end ? 'perfect' : at >= zone.start && at <= zone.start + zone.width ? 'graze' : 'miss';
      },
    };
    // No answer at all means the blow lands in full.
    const wait = kind === 'keys' ? allowed : kind === 'bar' ? 2400 : LEAD + DODGE.graze + 1;
    this.timer = this.later(() => this.prompt?.answer('miss', false, 'Time ran out · hit.'), wait);
  }

  private press() {
    if (!this.prompt) return;
    if (this.prompt.kind === 'keys') return;
    if (this.prompt.kind === 'bar') { this.prompt.answer(this.prompt.stop!()); return; }
    const error = performance.now() - this.prompt.impact;
    // Pressing far too early commits the dodge too soon; it cannot be retried.
    const next = nextStrike(this.state)!;
    this.prompt.answer(grade(error, next.move, agility(next.target)), error < 0);
  }

  // A short cue when the fight ends, once.
  private cued = false;
  private ended() {
    if (this.cued || (this.state.phase !== 'victory' && this.state.phase !== 'defeat')) return;
    this.cued = true;
    music.effect(this.state.phase === 'victory' ? 'victory' : 'defeat');
    if (this.tutorial && this.state.phase === 'victory') {
      this.root.classList.add('kraken-slain');
      music.effect('roar');
    }
  }

  private renderReclamation() {
    if (this.state.encounter !== 'human') return;
    const recovered = this.state.recoveredMemories;
    this.get('.reclamation-count').textContent = this.originalMemories.length ? `Memories reclaimed · ${recovered.length} / ${this.originalMemories.length}` : 'No stolen memories remain. His hands are empty.';
    const list = this.get('.reclamation-memories');
    list.replaceChildren(...this.originalMemories.map(id => {
      const token = document.createElement('span'); token.dataset.memory = id;
      token.dataset.returned = String(recovered.includes(id)); token.textContent = MEMORY_NAMES[id];
      token.title = recovered.includes(id) ? 'Returned to you. He cannot cast it again.' : 'Still held by the human.';
      return token;
    }));
    const latest = recovered.at(-1);
    this.get('.reclamation-note').textContent = latest ? reclaimedMemories[latest] : 'Wear him down. Every memory you take back removes one of his spells and the Hollow perk it left behind.';
    if (recovered.length > this.shownReclaimed) { music.effect('memory'); combatEffect(this.root.querySelector('[data-member="chameleon"] .party-fighter'), 'mana'); }
    this.shownReclaimed = recovered.length;
  }

  private persist() {
    if (this.tutorial) return;
    this.saved = saveGrimoire(this.state.studied);
  }

  // What each fighter looked like at the last render, so changes can be shown: a flinch when hurt, a lunge when acting,
  // and over a struck enemy, the mark of what hit it.
  private seen = new Map<string, number>();
  private strikeKind?: 'slash' | 'burst' | 'fire';
  private play(target: Element | null, name: string) {
    if (!target) return;
    target.classList.remove(name); void (target as HTMLElement).offsetWidth; target.classList.add(name);
    this.later(() => target.classList.remove(name), 500);
  }
  private mark(target: Element | null, kind: 'slash' | 'burst' | 'fire') {
    if (!target) return;
    const fx = document.createElement('span');
    fx.className = `fx fx-${kind}`;
    target.append(fx);
    this.later(() => fx.remove(), 520);
  }
  private animateChanges() {
    const state = this.state;
    // Keep fallen enemies visible enough to target their bodies. Revivals clear the pose.
    const leader = this.root.querySelector<HTMLElement>('.enemy-fighter[data-foe="0"]');
    if (leader) leader.dataset.defeated = String(state.enemy.health === 0);
    state.followers.forEach((follower, index) => {
      const fighter = this.root.querySelector<HTMLElement>(`[data-foe="${index + 1}"] .enemy-fighter`);
      if (fighter) fighter.dataset.defeated = String(follower.health === 0);
    });
    const now = new Map<string, number>([
      ...state.party.flatMap(member => [[`hp:${member.id}`, member.health], [`act:${member.id}`, Number(member.acted)], [`mp:${member.id}`, member.mana], [`ward:${member.id}`, Number(member.barrier)], [`poison:${member.id}`, member.poison]] as [string, number][]),
      ['hp:0', state.enemy.health], ['poison:0', state.enemyPoison], ...state.followers.map((follower, index) => [`hp:${index + 1}`, follower.health] as [string, number]),
      ['stage', state.stage],
    ]);
    const play = (target: Element | null, name: string) => {
      if (!target) return;
      target.classList.remove(name); void (target as HTMLElement).offsetWidth; target.classList.add(name);
      this.later(() => target.classList.remove(name), 500);
    };
    for (const [key, value] of now) {
      const before = this.seen.get(key);
      if (before === undefined) continue;
      const [kind, who] = key.split(':');
      const fighter = /^\d+$/.test(who) ? this.root.querySelector(`[data-foe="${who}"] .fighter, .fighter[data-foe="${who}"]`) : this.root.querySelector(`.member-card[data-member="${who}"] .party-fighter`);
      if (kind === 'hp' && value < before) {
        play(fighter, 'is-hit');
        const poisoned = this.seen.get(`poison:${who}`)! > 0 && state.phase === 'player' && (now.get(`poison:${who}`) ?? 0) < this.seen.get(`poison:${who}`)!;
        if (who !== this.incomingTarget) combatEffect(fighter, poisoned ? 'poison' : this.strikeKind === 'burst' ? 'spell' : 'hit', value === 0 ? 'FALLEN' : poisoned ? 'POISON' : undefined);
        // An enemy struck by the party shows what struck it.
        if (/^\d+$/.test(who) && this.strikeKind) this.mark(fighter, this.strikeKind);
      }
      if (kind === 'poison' && value > before) combatEffect(fighter, 'poison', 'POISONED');
      if (kind === 'hp' && value > before) combatEffect(fighter, 'heal', 'MENDED');
      if (kind === 'mp' && value > before && state.phase === 'player') combatEffect(fighter, 'mana');
      if (kind === 'ward' && value > before) combatEffect(fighter, 'ward', 'WARDED');
      if (kind === 'act' && value > before) play(fighter, this.strikeKind === 'slash' ? 'is-lunging' : this.strikeKind === 'burst' ? 'is-casting' : 'is-acting');
      // A boss turning to its second stage roars.
    }
    this.seen = now;
  }

  // A short scene, line by line, while the fight holds still. Nothing else can be pressed until it ends.
  private playScene(then: () => void) {
    const original = STAGES[this.state.encounter]!;
    const returned = this.state.recoveredMemories[0];
    const stage = this.state.encounter === 'human' && returned ? { ...original, scene: [...original.scene, { who: '', line: `${MEMORY_NAMES[returned]} returns: ${reclaimedMemories[returned]}` }] } : original;
    const previousScroll = this.root.scrollTop;
    const scene = document.createElement('div');
    scene.className = 'cutscene';
    scene.dataset.encounter = this.state.encounter;
    scene.setAttribute('role', 'dialog');
    scene.setAttribute('aria-label', stage.title);
    scene.setAttribute('aria-modal', 'true');
    scene.innerHTML = `<div class="phase-header"><p class="eyebrow">THE TIDE TURNS</p><button type="button" class="cutscene-skip">Skip scene</button></div><div class="phase-picture"><div class="phase-backdrop">${tableau(PHASE_SETS[this.state.encounter] ?? 'battlefield')}</div><div class="phase-footing"></div><div class="phase-cast" hidden></div><img class="phase-portrait" src="${import.meta.env.BASE_URL}assets/${this.state.encounter}.${this.state.encounter === 'kraken' ? 'png' : 'svg'}" alt="" /></div><div class="phase-copy"><h2></h2><p class="cutscene-speaker"></p><p class="cutscene-line" aria-live="polite"></p><div class="phase-footer"><span class="phase-count"></span><button type="button" class="cutscene-next">Continue <span>↵</span></button></div></div>`;
    scene.querySelector('h2')!.textContent = stage.title;
    this.root.append(scene);
    const backdrop = Array.from(this.root.children).filter(child => child !== scene) as HTMLElement[];
    backdrop.forEach(element => { element.inert = true; });
    this.root.classList.add('in-cutscene');
    this.root.scrollTop = 0;
    const block = this.casting;
    this.casting = () => {};
    let index = 0;
    // Lines type out; Continue finishes a line that is still typing before it moves on.
    let typing: ReturnType<typeof setInterval> | undefined;
    this.sceneCleanup = () => clearInterval(typing);
    const text = scene.querySelector<HTMLElement>('.cutscene-line')!;
    const portrait = scene.querySelector<HTMLImageElement>('.phase-portrait')!;
    const show = () => {
      const { who, line } = stage.scene[index];
      const shot = this.state.encounter === 'boar' ? BOAR_PHASE_SHOTS[index] : undefined;
      scene.dataset.shot = String(index);
      const cast = scene.querySelector<HTMLElement>('.phase-cast')!;
      cast.hidden = !shot; portrait.hidden = Boolean(shot);
      (scene.querySelector('.phase-footing') as HTMLElement).hidden = Boolean(shot);
      if (shot) {
        scene.dataset.pose = shot.pose;
        scene.querySelector('.phase-header .eyebrow')!.textContent = shot.caption;
        scene.querySelector('.phase-backdrop')!.innerHTML = tableau(shot.art);
        cast.replaceChildren(...shot.actors.map(actor => {
          const place = document.createElement('div'); place.className = 'phase-actor'; place.dataset.actor = actor;
          place.dataset.speaking = String(SPEAKER_ART[who] === actor);
          const shadow = document.createElement('span'); shadow.className = 'phase-actor-shadow';
          const image = document.createElement('img'); image.src = `${import.meta.env.BASE_URL}assets/${actor}.svg`; image.alt = '';
          place.append(shadow, image); return place;
        }));
        if (shot.sound) music.effect(shot.sound);
      }
      scene.querySelector('.cutscene-speaker')!.textContent = who;
      scene.classList.toggle('narration', !who);
      scene.classList.toggle('phase-awakening', index === stage.scene.length - 1);
      scene.querySelector('.phase-count')!.textContent = `${String(index + 1).padStart(2, '0')} / ${String(stage.scene.length).padStart(2, '0')}`;
      scene.querySelector('.cutscene-next')!.innerHTML = `${index === stage.scene.length - 1 ? 'Return to battle' : 'Continue'} <span>↵</span>`;
      // A speaker shows as themselves; narration shows the boss.
      const art = SPEAKER_ART[who] ?? this.state.encounter;
      portrait.src = `${import.meta.env.BASE_URL}assets/${art}.${art === 'kraken' ? 'png' : 'svg'}`;
      text.dataset.full = line;
      text.setAttribute('aria-label', line);
      const visible = document.createElement('span'); visible.setAttribute('aria-hidden', 'true'); text.replaceChildren(visible);
      let shown = 0;
      clearInterval(typing);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { visible.textContent = line; typing = undefined; return; }
      typing = setInterval(() => {
        shown++; visible.textContent = line.slice(0, shown);
        if (shown % 3 === 0 && who) music.effect('blip', -6);
        if (shown >= line.length) { clearInterval(typing); typing = undefined; }
      }, 24);
    };
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true; clearInterval(typing); this.sceneCleanup = undefined;
      scene.remove(); backdrop.forEach(element => { element.inert = false; });
      this.root.classList.remove('in-cutscene'); this.root.scrollTop = previousScroll;
      this.root.classList.add('phase-returning'); this.root.inert = true;
      // The boss settles into its new stance before controls or the next tell return.
      this.render();
      music.effect(this.state.encounter === 'human' ? 'memory' : 'roar');
      const fighter = this.root.querySelector('.fighter[data-foe="0"]');
      fighter?.classList.add('is-turning');
      this.later(() => fighter?.classList.remove('is-turning'), 600);
      this.timer = this.later(() => { this.root.classList.remove('phase-returning'); this.root.inert = false; this.casting = block; then(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : battlePacing(this.state.encounter).phaseReturn);
    };
    const next = () => {
      if (typing) { clearInterval(typing); typing = undefined; text.querySelector('span')!.textContent = text.dataset.full ?? ''; return; }
      if (++index < stage.scene.length) show(); else finish();
    };
    scene.querySelector('.cutscene-skip')!.addEventListener('click', finish, { signal: this.cleanup.signal });
    scene.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish(); }
      if (event.key === 'Tab') {
        event.preventDefault(); event.stopPropagation();
        const controls = Array.from(scene.querySelectorAll<HTMLButtonElement>('button'));
        const index = controls.indexOf(document.activeElement as HTMLButtonElement);
        controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
      }
    }, { signal: this.cleanup.signal });
    const button = scene.querySelector<HTMLButtonElement>('.cutscene-next')!;
    button.addEventListener('click', next, { signal: this.cleanup.signal });
    show();
    button.focus({ preventScroll: true });
  }

  private render() {
    this.animateChanges();
    if (!this.tutorial && this.state.enemy.health > 0 && this.state.phase === 'player') sighted(this.state.encounter, intent(this.state).name);
    this.shownStage = this.state.stage;
    const state = this.state;
    const done = state.phase === 'victory' || state.phase === 'defeat' || state.phase === 'fled';
    const remaining = state.party.filter(member => member.health > 0 && !member.acted).length;
    this.root.dataset.phase = state.phase;
    // In its second stage a boss gets a new name, and the screen says so.
    const stage = state.stage === 2 ? STAGES[state.encounter] : undefined;
    this.root.dataset.stage = String(state.stage);
    this.get('#battle-title').textContent = this.tutorial ? state.phase === 'victory' ? 'The Kraken Falls.' : 'The Kraken' : stage ? `${stage.title}.` : 'Stand together.';
    this.get('.battle-heading .eyebrow').textContent = this.tutorial ? done ? 'THE FIVE · THE END OF THE FIGHT' : `THE FIVE · ROUND ${state.round}` : stage ? 'SECOND STAGE' : 'THE CONDEMNED';
    this.get('#battle-turn').textContent = this.tutorial && done
      ? state.phase === 'victory' ? 'The sea falls quiet. The feast is waiting in the capital.' : 'The tide breaks over the harbour. You get another chance.'
      : done ? (this.arena && state.phase !== 'victory' ? 'The ringmaster calls it. The crowd boos, and then forgets you.' : state.phase === 'fled' ? 'You run. Half your coins scatter behind you.' : state.phase === 'victory' ? `${SURVIVE[state.encounter] ? 'You lived through it.' : this.arena ? 'The crowd roars. The ringmaster has your prize.' : `It falls quiet. You find ${BOUNTY[state.encounter]} coins.`}${state.party.some(member => member.health < member.maxHealth) ? ' Your wounds will linger until you rest at a fire.' : ''}` : 'The party falls.')
      : `Round ${state.round} · ${state.phase === 'player' ? `${remaining} actions remaining` : 'The enemy moves'}${state.soured ? ' · Soured: healing burns' : ''}`;
    if (state.encounter === 'human' && state.phase === 'victory') this.get('#battle-turn').textContent = 'His borrowed spells are silent. He is still breathing. What happens next is your choice.';
    this.renderTutorial(state, done);
    this.renderReclamation();
    this.get('#enemy-condition').textContent = state.impostor ? 'Gone from his chair. He is among you.' : condition(state.enemy);
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
    this.get('#enemy-mana').textContent = `Mana ${enemyMana(state)}${ENEMIES[state.encounter].veiled && !state.enemyRevealed ? ' · veiled' : ''}${state.fury ? ` · ${state.encounter === 'hyena' ? 'Fed' : 'Fury'} ${state.fury}` : ''}${warded(state) ? ' · warded by its votives' : ''}${state.enemyPoison ? ` · poisoned ${state.enemyPoison}` : ''}`;
    const target = enemyTarget(state);
    this.get('#enemy-intent').textContent = done ? '' : state.enemy.health === 0 ? `The ${ENEMIES[state.encounter].short} is down. What stood with it fights on.`
      : state.snared ? 'Snared · thorns hold it. It cannot move this turn.'
      : `${intent(state).type === 'spell' ? 'Spell' : 'Physical'} · ${intent(state).tell} ${target ? `Watching ${MEMBERS[target.id].name}.` : ''}`;
    this.get('.grimoire-status').textContent = `Grimoire · ${state.studied.length ? `${state.studied.join(', ')}: can be dodged and barred` : 'No spells studied'}${this.saved ? '' : ' · kept for this visit; browser save unavailable'}`;
    for (const member of state.party) {
      const card = this.card(member.id);
      card.dataset.acted = String(member.acted);
      card.dataset.barrier = String(member.barrier);
      card.dataset.suppressed = String(member.suppressed);
      card.dataset.downed = String(member.health === 0);
      card.querySelector('.member-condition')!.textContent = condition(member);
      this.renderHealth(card.querySelector<HTMLElement>('.health-bar')!, member);
      card.querySelector('.member-mana')!.textContent = `Mana ${member.mana} / ${member.maxMana}${visibleMana(member) !== member.mana ? ` · showing ${visibleMana(member)}` : ''}`;
      card.dataset.poisoned = String(member.poison > 0 && member.health > 0);
      card.querySelector('.member-status')!.textContent = member.health === 0 ? 'Cannot act'
        : member.poison ? `Poisoned · ${member.poison} round${member.poison === 1 ? '' : 's'}${member.acted ? ' · acted' : ''}`
        : member.flaring ? 'Flaring' : member.barrier ? 'Barrier raised' : member.suppressed ? 'Hidden'
        : member.guardingFor ? `Guarding ${MEMBERS[member.guardingFor].name}` : member.focused ? 'Focused'
        : member.acted ? 'Acted' : '';
      for (const action of ['attack', 'support', 'gather', 'suppress', 'barrier', 'analyze'] as const) {
        const button = card.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!;
        const ally = this.actionTarget(member.id, action), foe = action === 'attack' ? this.foe() : 0;
        button.disabled = Boolean(this.casting) || !canAct(state, member.id, action, ally, foe);
        button.title = actionPreview(state, member.id, action, ally, foe);
        if (action === 'attack') {
          const strength = member.id === 'frog' ? venom(state.encounter) : matchup(member.id, state.encounter);
          const hint = button.querySelector('small')!;
          hint.textContent = strength > 1 ? 'Strong' : strength === 0 ? 'Immune' : 'Weak';
          if (strength !== 1) { button.dataset.matchup = 'true'; button.title += ` ${hint.textContent} against this enemy.`; } else delete button.dataset.matchup;
        }
        button.setAttribute('aria-description', button.title);
        if (action === 'barrier') button.querySelector('small')!.textContent = `Protect ${MEMBERS[ally].name}`;
        if (action === 'support') button.querySelector('small')!.textContent = member.id === 'bear' && member.gear.guardAll > 0 ? 'Whole party · 3 mana' : member.id === 'bear' || member.id === 'frog' ? MEMBERS[ally].name : SUPPORT_SHORT[member.id];
      }
      const strike = card.querySelector<HTMLButtonElement>('[data-unmask]');
      if (strike) strike.disabled = Boolean(this.casting) || !this.striker(member.id);
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
        for (const option of Array.from(select.options)) {
          const ally = state.party.find(ally => ally.id === option.value)!;
          option.textContent = `${MEMBERS[ally.id].name}${ally.health === 0 ? ' · downed' : ''}`;
        }
        select.disabled = state.phase !== 'player' || member.acted || member.health === 0;
      }
    }
    this.renderPreview();
    const log = this.get('.battle-log');
    for (const line of state.log.slice(log.childElementCount)) {
      const p = document.createElement('p'); p.textContent = line; log.append(p);
    }
    log.scrollTop = log.scrollHeight;
    this.get('.battle-help').hidden = done;
    const finish = this.get<HTMLButtonElement>('#battle-finish');
    finish.hidden = !done;
    finish.textContent = state.encounter === 'human' && state.phase === 'victory' ? 'Hear him out' : this.tutorial ? state.phase === 'victory' ? 'The final blow' : 'Try again' : state.phase === 'victory' ? 'Continue' : this.arena ? 'Leave the ring' : state.phase === 'fled' ? 'Get away' : 'Wake at the cot';
    const run = this.get<HTMLButtonElement>('#flee');
    run.hidden = done || this.tutorial;
    run.disabled = Boolean(this.casting) || !canFlee(state);
    run.title = state.encounter === 'boar' ? 'The boar stands between you and the road.' : '';
    // A finished fight shows its way out at the top of the panel, next to the round.
    if (done) { this.root.scrollTop = 0; finish.focus({ preventScroll: true }); }
  }

  destroy(restoreFocus = true) {
    this.sceneCleanup?.(); this.promptCleanup?.(); this.prompt = undefined; this.casting = undefined;
    for (const delay of this.delays) clearTimeout(delay); this.delays.clear();
    clearTimeout(this.timer); clearTimeout(this.patience); this.cleanup.abort(); this.root.remove();
    if (restoreFocus && this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
