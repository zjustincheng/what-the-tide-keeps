import { KEEPSAKES } from '../rules/gear';
import type { KeepsakeId } from '../rules/gear';
import { MEMBERS } from '../rules/battle';

// What each companion's own keepsake looks like on its receipt, what is written of it, and what it does when worn.
const RECEIPTS: Partial<Record<KeepsakeId, { icon: string; inscription: string; worn: string; cost: string }>> = {
  'broken-link': {
    icon: '<path d="M10 3h12v3h4v4h3v12h-3v4h-4v3H10v-3H6v-4H3V10h3V6h4z" fill="#6e7568"/><path d="M11 7h10v3h4v12h-4v3H11v-3H7V10h4z" fill="#bcb79a"/><path d="M12 11h8v2h2v7h-2v2h-8v-2h-2v-7h2z" fill="#172321"/><path d="M21 3h11v8H21z" fill="#172321"/><path d="M19 4h3v3h-3zM25 10h4v3h-4z" fill="#dbcdaa"/>',
    inscription: 'Worn thin where it met the stone. Warm where he held it.',
    worn: 'Protect covers both allies and himself against physical attacks.', cost: 'Costs 3 mana and his action. Spells still require barriers.' },
  'tally-stone': {
    icon: '<path d="M7 9h18v3h3v10h-3v3H7v-3H4V12h3z" fill="#5f6660"/><path d="M8 11h16v2h2v8h-2v2H8v-2H6v-8h2z" fill="#a7aa9c"/><path d="M10 14h1v6h-1zM13 14h1v6h-1zM16 14h1v6h-1zM19 14h1v6h-1zM9 17h12v1H9z" fill="#2a302c"/><path d="M22 14h2v2h-2z" fill="#d8d4c0"/>',
    inscription: 'One scratch for each of them, and one at the end that is hers.',
    worn: 'When her blow fells an enemy, she takes back 3 mana and 3 health. Attacks hit 1 harder.', cost: 'Shows 1 more mana.' },
  'glass-dropper': {
    icon: '<path d="M13 2h6v6h-6z" fill="#5a3a3a"/><path d="M14 8h4v4h3v14h-2v3h-6v-3h-2V12h3z" fill="#6e8a86"/><path d="M15 13h2v11h1v3h-4v-3h1z" fill="#b8d0c8"/><path d="M14 20h4v4h-4z" fill="#c8503a"/><path d="M15 29h2v2h-2z" fill="#c8503a"/>',
    inscription: 'Marked in tenths of a drop. She knows the line for every size of patient.',
    worn: 'Her dose mends 6 more, twice what it did, and she has 3 more health.', cost: 'Her dart hits 1 softer.' },
  'net-knot': {
    icon: '<path d="M6 6h4v4h4v4h4v-4h4V6h4v4h-2v4h-2v4h2v4h2v4h-4v-4h-4v-4h-4v4h-4v4H6v-4h2v-4h2v-4H8v-4H6z" fill="#7a7258"/><path d="M13 13h6v6h-6z" fill="#c8b878"/><path d="M15 15h2v2h-2z" fill="#3a3424"/><path d="M4 4h3v3H4zM25 25h3v3h-3z" fill="#5a5444"/>',
    inscription: 'Cut from the kraken. Tied the way the octopus ties a line it means to keep.',
    worn: 'Mimic costs 2 less mana, and it has 4 more health.', cost: 'Shows 2 more mana.' },
};

// A receipt after the story moment, so the characters need not explain equipment rules.
export class KeepsakeView {
  private root = document.createElement('section');
  private cleanup = new AbortController();
  constructor(id: KeepsakeId, hasRoom: boolean, onEquip: () => void, onClose: () => void) {
    const keepsake = KEEPSAKES[id], receipt = RECEIPTS[id]!, who = MEMBERS[keepsake.keeps!].name.toLowerCase();
    this.root.className = 'battle keepsake-award';
    this.root.setAttribute('role', 'dialog'); this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'keepsake-award-title');
    this.root.innerHTML = `<div class="keepsake-receipt">
      <p class="eyebrow">A KEEPSAKE FROM THE ${who.toUpperCase()}</p>
      <svg class="keepsake-link" viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges">${receipt.icon}</svg>
      <h2 id="keepsake-award-title">${keepsake.name}</h2>
      <p class="keepsake-inscription">${receipt.inscription}</p>
      <dl><div><dt>A memory held</dt><dd>You will always remember the ${who}. This bond survives death and does not use an anchor or equipment slot.</dd></div>
      <div><dt>When worn by the ${who}</dt><dd>${receipt.worn}<br><span>${receipt.cost}</span></dd></div></dl>
      <div class="keepsake-receipt-actions"><button type="button" data-keep>${hasRoom ? `Equip on the ${who}` : 'Choose an equipment slot'}</button><button type="button" data-close>Keep in the pack</button></div>
    </div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.querySelector('[data-keep]')!.addEventListener('click', onEquip, { signal });
    this.root.querySelector('[data-close]')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (event.key === 'Tab') {
        event.preventDefault(); event.stopPropagation();
        const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button'));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    }, { signal });
    this.root.querySelector<HTMLButtonElement>('[data-keep]')!.focus({ preventScroll: true });
  }
  destroy() { this.cleanup.abort(); this.root.remove(); }
}
