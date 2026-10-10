import { createBattle, MATCHUPS, MEMBERS, VENOM } from '../rules/battle';
import type { BattleOptions, MemberId } from '../rules/battle';
import { FIGHTERS, lineup, roster, toggleWaiting } from '../rules/world';
import type { World } from '../rules/world';
import { music } from '../audio/music';

// Who goes into the next fight: any three who have joined. The hero always fights a region's lieutenant, whatever is chosen here.
// Each hero's blow is good against some kinds of enemy and poor against others.
const LEANINGS = (id: MemberId) => {
  const kinds = id === 'frog' ? VENOM : MATCHUPS[id];
  const strong = Object.entries(kinds).filter(([, by]) => by > 1).map(([trait]) => trait);
  const weak = Object.entries(kinds).filter(([, by]) => by < 1).map(([trait]) => trait);
  const what = id === 'frog' ? 'Her poison' : 'Strong';
  return id === 'frog' ? `Her poison: double in insects, nothing in the dead.` : [strong.length ? `${what} against ${strong.join(', ')}` : '', weak.length ? `weak against ${weak.join(', ')}` : ''].filter(Boolean).join('; ') + '.';
};
export class PartyView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(private world: World, private options: BattleOptions, heroImage: string, onChange: (world: World) => void, onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle party-screen';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'party-title');
    this.root.tabIndex = -1;
    const joined = roster(world);
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="party-title">Who fights</h2>
      <p class="equipment-intro">${joined.length > 1 ? `Any ${FIGHTERS} fight at a time. Choose for the enemy ahead: blows land harder on some kinds than others; spells don\'t care. Against a region\'s lieutenant the hero always fights. Whoever waits keeps their wounds.` : 'The hero fights alone, for now. Companions join as you find them.'}</p></div>
      <div class="party-roster" data-size="${joined.length}">${joined.map(id => `<section class="member-card" data-member="${id}" aria-label="${MEMBERS[id].name}">
        <div class="fighter"><img alt="" src="${id === 'chameleon' ? heroImage : `${import.meta.env.BASE_URL}assets/${id}.svg`}" /></div>
        <h3>${MEMBERS[id].name}</h3><p class="equipment-stats"></p>
        <p class="party-always">${LEANINGS(id)}</p>
        <button class="bench-toggle" type="button" data-toggle="${id}"></button>
      </section>`).join('')}</div>
      <p class="memories-lost party-note" aria-live="polite"></p>
      <button id="party-close" type="button">Done</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach(button => button.addEventListener('click', () => {
      const member = button.dataset.toggle as MemberId;
      const before = lineup(this.world);
      this.world = toggleWaiting(this.world, member);
      const bumped = before.find(other => !lineup(this.world).includes(other) && other !== member);
      const alone = before.length === 1 && before[0] === member && lineup(this.world).includes(member);
      this.root.querySelector('.party-note')!.textContent = bumped ? `Only ${FIGHTERS} fight at a time. ${MEMBERS[bumped].name} waits instead.` : alone ? 'Someone has to fight.' : '';
      onChange(this.world); music.effect('select'); this.render();
      button.focus();
    }, { signal }));
    this.root.querySelector('#party-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') { event.preventDefault(); onClose(); }
    }, { signal });
    this.render();
    (this.root.querySelector<HTMLElement>('[data-toggle]') ?? this.root.querySelector<HTMLElement>('#party-close')!).focus({ preventScroll: true });
  }

  private render() {
    const fighting = lineup(this.world);
    // Health and mana as the next fight would find them, wounds included.
    const party = createBattle('locust', [], { ...this.options, roster: roster(this.world) }).party;
    for (const member of party) {
      const card = this.root.querySelector<HTMLElement>(`[data-member="${member.id}"]`)!;
      const fights = fighting.includes(member.id);
      card.dataset.waiting = String(!fights);
      card.querySelector('.equipment-stats')!.textContent = `Health ${member.health} / ${member.maxHealth} · Mana ${member.mana} / ${member.maxMana}`;
      const toggle = card.querySelector<HTMLButtonElement>('[data-toggle]');
      if (!toggle) continue;
      toggle.textContent = fights ? 'Fights · send to wait' : 'Waits · bring to fight';
      toggle.setAttribute('aria-pressed', String(fights));
      toggle.setAttribute('aria-label', `${MEMBERS[member.id].name} ${fights ? 'fights' : 'waits'}`);
    }
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
