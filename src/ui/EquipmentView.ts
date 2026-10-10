import { createBattle, MEMBERS } from '../rules/battle';
import type { MemberId } from '../rules/battle';
import { canEquip, equip, KEEPSAKES, SLOTS } from '../rules/gear';
import type { Gear, KeepsakeId } from '../rules/gear';
import type { Hollow } from '../rules/memory';
import { BOOK_IDS, BOOKS, carry, SPELLS, STARTING_BOOKS } from '../rules/spells';
import type { BookId, Books } from '../rules/spells';
import type { Found } from '../rules/world';
import { music } from '../audio/music';

// Between fights: choose each hero's grimoire and put found keepsakes into their slots.
export class EquipmentView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  private owned: KeepsakeId[];
  private books: BookId[];

  constructor(private gear: Gear, private carried: Books, found: readonly Found[], private party: readonly MemberId[], private hollow: Hollow, heroImage: string, onChange: (gear: Gear, books: Books) => void, onClose: () => void, private tempered: readonly KeepsakeId[] = []) {
    this.owned = found.filter((id): id is KeepsakeId => id in KEEPSAKES);
    // Each hero's own grimoire is always theirs to carry; others must be found.
    // Only the grimoires of heroes who have joined, and those found along the way.
    this.books = BOOK_IDS.filter(id => party.some(member => STARTING_BOOKS[member] === id) || found.includes(id));
    this.root = document.createElement('section');
    this.root.className = 'battle equipment';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'equipment-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="equipment-title">Equipment</h2>
      <p class="equipment-intro">A grimoire sets a hero's spell. Each hero also holds ${SLOTS} keepsakes, kept through every death, most with a drawback.</p></div>
      <div class="party-roster" data-size="${party.length}">${party.map(id => `<section class="member-card" data-member="${id}" aria-label="${MEMBERS[id].name}">
        <div class="fighter"><img alt="" src="${id === 'chameleon' ? heroImage : `${import.meta.env.BASE_URL}assets/${id}.svg`}" /></div>
        <h3>${MEMBERS[id].name}</h3><p class="equipment-stats"></p>
        <label class="keepsake-slot">Grimoire<select data-book aria-label="${MEMBERS[id].name} grimoire"></select><small></small></label>
        ${Array.from({ length: SLOTS }, (_, slot) => `<label class="keepsake-slot">Keepsake ${slot + 1}
          <select data-slot="${slot}" aria-label="${MEMBERS[id].name} keepsake ${slot + 1}"></select><small></small></label>`).join('')}
      </section>`).join('')}</div>
      <p class="memories-lost found-keepsakes"></p>
      <button id="equipment-close" type="button">Done</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('change', event => {
      const select = event.target as HTMLSelectElement;
      const member = select.closest<HTMLElement>('[data-member]')!.dataset.member as MemberId;
      if (select.hasAttribute('data-book')) this.carried = carry(this.carried, this.books, member, (select.value || null) as BookId | null);
      else this.gear = equip(this.gear, this.owned, member, Number(select.dataset.slot), (select.value || null) as KeepsakeId | null);
      onChange(this.gear, this.carried); this.render();
      music.effect('select');
      this.root.querySelector<HTMLSelectElement>(`[data-member="${member}"] ${select.hasAttribute('data-book') ? '[data-book]' : `[data-slot="${select.dataset.slot}"]`}`)?.focus();
    }, { signal });
    this.root.querySelector('#equipment-close')!.addEventListener('click', onClose, { signal });

    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('select:not([disabled]),button'));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.render();
    (this.root.querySelector<HTMLElement>('select:not([disabled])') ?? this.root.querySelector<HTMLElement>('#equipment-close')!).focus({ preventScroll: true });
  }

  private render() {
    // Preview the party exactly as the next fight will build it.
    const party = createBattle('locust', [], { hollow: this.hollow, gear: this.gear, books: this.carried, roster: this.party, tempered: this.tempered }).party;
    for (const id of this.party) {
      const card = this.root.querySelector<HTMLElement>(`[data-member="${id}"]`)!;
      const member = party.find(member => member.id === id)!;
      card.querySelector('.equipment-stats')!.textContent = `Health ${member.maxHealth} · Mana ${member.maxMana} · Damage ${MEMBERS[id].damage + member.gear.damage}`;
      const book = card.querySelector<HTMLSelectElement>('[data-book]')!;
      const carrying = this.carried[id];
      const holder = (other: BookId) => this.party.find(member => member !== id && this.carried[member] === other);
      book.innerHTML = `<option value="">— none —</option>${this.books.map(other => `<option value="${other}" ${other === carrying ? 'selected' : ''}>${BOOKS[other].name}${holder(other) ? ` (from ${MEMBERS[holder(other)!].name})` : ''}</option>`).join('')}`;
      const spell = carrying && SPELLS[BOOKS[carrying].spell];
      book.nextElementSibling!.textContent = spell ? `${spell.name} · ${spell.cost} mana · ${spell.length} keys in ${spell.seconds}s · then ${spell.cooldown - 1} round${spell.cooldown === 2 ? '' : 's'} to settle. ${spell.text}` : 'No spell.';
      card.querySelectorAll<HTMLSelectElement>('[data-slot]').forEach(select => {
        const slot = Number(select.dataset.slot);
        const held = this.gear[id][slot];
        const fits = this.owned.filter(keepsake => canEquip(this.owned, id, keepsake));
        const elsewhere = (keepsake: KeepsakeId) => this.party.find(other => other !== id && this.gear[other].includes(keepsake));
        select.innerHTML = `<option value="">— empty —</option>${fits.map(keepsake => `<option value="${keepsake}" ${keepsake === held ? 'selected' : ''}>${KEEPSAKES[keepsake].name}${this.tempered.includes(keepsake) ? ' (tempered)' : ''}${elsewhere(keepsake) ? ` (from ${MEMBERS[elsewhere(keepsake)!].name})` : ''}</option>`).join('')}`;
        // A second slot opens once the first is filled.
        select.disabled = !fits.length || (slot > 0 && !this.gear[id][slot - 1]);
        select.nextElementSibling!.textContent = held ? `${this.tempered.includes(held) ? 'Tempered: its benefits are half again as strong. ' : ''}${KEEPSAKES[held].effect} ${KEEPSAKES[held].drawback}` : '';
      });
    }
    this.root.querySelector('.found-keepsakes')!.textContent = this.owned.length
      ? `Keepsakes found · ${this.owned.map(id => `${KEEPSAKES[id].name}${KEEPSAKES[id].holder ? ` (${MEMBERS[KEEPSAKES[id].holder!].name} only)` : ''}`).join(' · ')}`
      : 'Nothing found yet. Keepsakes are hidden off the roads.';
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
