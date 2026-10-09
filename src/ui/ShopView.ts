import { SHOPS } from '../content/shops';
import { buy, canBuy, gearName, gearText, price, SUPPLIES } from '../rules/economy';
import type { Ware } from '../rules/economy';
import { FISH, FISH_IDS } from '../rules/fishing';
import type { ShopId, World } from '../rules/world';
import { music } from '../audio/music';

const name = (ware: Ware) => 'sellCatch' in ware ? 'Your catch' : 'deed' in ware ? ware.name : 'gear' in ware ? gearName(ware.gear) : SUPPLIES[ware.supply].name;
const text = (ware: Ware) => 'sellCatch' in ware ? 'Every fish in your pack.' : 'deed' in ware ? ware.text : 'gear' in ware ? gearText(ware.gear) : SUPPLIES[ware.supply].text;

// A shopkeeper's wares. Coins and supplies bought here are lost on a wipe.
export class ShopView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(private shop: ShopId, private world: World, onBuy: (world: World) => void, onClose: () => void) {
    const { title, note } = SHOPS[shop];
    this.root = document.createElement('section');
    this.root.className = 'battle shop';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'shop-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">MILLBROOK</p><h2 id="shop-title">${title}</h2><p class="equipment-intro">${note}</p><p class="purse" aria-live="polite"></p></div>
      <ul class="wares">${SHOPS[shop].wares.map((ware, index) => `<li data-ware="${index}"><div><strong>${name(ware)}</strong><small>${text(ware)}</small><small class="owned"></small></div>
        <button type="button" data-buy="${index}" aria-label="Buy ${name(ware)}"></button></li>`).join('')}</ul>
      <button id="shop-close" type="button">Leave</button>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('click', event => {
      const index = (event.target as HTMLElement).closest<HTMLElement>('[data-buy]')?.dataset.buy;
      if (index === undefined) return;
      const before = this.world;
      this.world = buy(this.world, SHOPS[shop].wares[Number(index)]);
      if (this.world !== before) music.effect('coins');
      onBuy(this.world); this.render();
    }, { signal });
    this.root.querySelector('#shop-close')!.addEventListener('click', onClose, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(this.root.querySelectorAll<HTMLElement>('button:not([disabled])'));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }, { signal });
    this.render();
    (this.root.querySelector<HTMLElement>('[data-buy]:not([disabled])') ?? this.root.querySelector<HTMLElement>('#shop-close')!).focus({ preventScroll: true });
  }

  private render() {
    this.root.querySelector('.purse')!.textContent = `You carry ${this.world.coins} coins.`;
    SHOPS[this.shop].wares.forEach((ware, index) => {
      const row = this.root.querySelector<HTMLElement>(`[data-ware="${index}"]`)!;
      const done = ('deed' in ware && this.world.flags.includes(ware.deed)) || ('gear' in ware && this.world.found.includes(ware.gear));
      const button = row.querySelector<HTMLButtonElement>('button')!;
      button.textContent = 'sellCatch' in ware ? `Sell for ${price(this.world, ware)}` : done ? 'Bought' : `${price(this.world, ware)} coins`;
      if ('sellCatch' in ware) button.setAttribute('aria-label', 'Sell your catch');
      button.disabled = !canBuy(this.world, ware);
      row.querySelector('.owned')!.textContent = 'supply' in ware ? `In your pack: ${this.world.supplies[ware.supply]}`
        : 'sellCatch' in ware ? FISH_IDS.filter(fish => this.world.fish[fish]).map(fish => `${FISH[fish].name} ×${this.world.fish[fish]}`).join(' · ') || 'You have caught nothing.' : '';
    });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
