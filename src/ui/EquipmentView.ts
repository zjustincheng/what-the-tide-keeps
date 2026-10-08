import { createBattle, MEMBERS } from '../rules/battle';
import type { MemberId } from '../rules/battle';
import { canEquip, equip, KEEPSAKES, MEMBER_IDS, SLOTS } from '../rules/gear';
import type { Gear, KeepsakeId } from '../rules/gear';
import type { Hollow } from '../rules/memory';

// Between fights: put found keepsakes into each hero's slots.
export class EquipmentView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(private gear: Gear, private owned: readonly KeepsakeId[], private hollow: Hollow, heroImage: string, onChange: (gear: Gear) => void, onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle equipment';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'equipment-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">THE CONDEMNED</p><h2 id="equipment-title">Equipment</h2>
      <p class="equipment-intro">Each hero holds ${SLOTS} keepsakes. Keepsakes are kept through every death. Most come with a drawback.</p></div>
      <div class="party-roster">${MEMBER_IDS.map(id => `<section class="member-card" data-member="${id}" aria-label="${MEMBERS[id].name}">
        <div class="fighter"><img alt="" src="${id === 'chameleon' ? heroImage : `${import.meta.env.BASE_URL}assets/${id}.svg`}" /></div>
        <h3>${MEMBERS[id].name}</h3><p class="equipment-stats"></p>
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
      this.gear = equip(this.gear, this.owned, member, Number(select.dataset.slot), (select.value || null) as KeepsakeId | null);
      onChange(this.gear); this.render();
      this.root.querySelector<HTMLSelectElement>(`[data-member="${member}"] [data-slot="${select.dataset.slot}"]`)?.focus();
    }, { signal });
    this.root.querySelector('#equipment-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape' || event.key === 'i' || event.key === 'I') { event.preventDefault(); onClose(); return; }
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
    const party = createBattle('locust', [], this.hollow, this.gear).party;
    for (const id of MEMBER_IDS) {
      const card = this.root.querySelector<HTMLElement>(`[data-member="${id}"]`)!;
      const member = party.find(member => member.id === id)!;
      card.querySelector('.equipment-stats')!.textContent = `Health ${member.maxHealth} · Mana ${member.maxMana} · Damage ${MEMBERS[id].damage + member.gear.damage}`;
      card.querySelectorAll<HTMLSelectElement>('select').forEach(select => {
        const slot = Number(select.dataset.slot);
        const held = this.gear[id][slot];
        const fits = this.owned.filter(keepsake => canEquip(this.owned, id, keepsake));
        const elsewhere = (keepsake: KeepsakeId) => MEMBER_IDS.find(other => other !== id && this.gear[other].includes(keepsake));
        select.innerHTML = `<option value="">— empty —</option>${fits.map(keepsake => `<option value="${keepsake}" ${keepsake === held ? 'selected' : ''}>${KEEPSAKES[keepsake].name}${elsewhere(keepsake) ? ` (from ${MEMBERS[elsewhere(keepsake)!].name})` : ''}</option>`).join('')}`;
        // A second slot opens once the first is filled.
        select.disabled = !fits.length || (slot > 0 && !this.gear[id][slot - 1]);
        select.nextElementSibling!.textContent = held ? `${KEEPSAKES[held].effect} ${KEEPSAKES[held].drawback}` : '';
      });
    }
    this.root.querySelector('.found-keepsakes')!.textContent = this.owned.length
      ? `Found · ${this.owned.map(id => `${KEEPSAKES[id].name}${KEEPSAKES[id].holder ? ` (${MEMBERS[KEEPSAKES[id].holder!].name} only)` : ''}`).join(' · ')}`
      : 'Nothing found yet. Keepsakes are hidden off the roads.';
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
