import { canCook, cook, INGREDIENT_IDS, INGREDIENTS, pantryOf, RECIPE_IDS, RECIPES } from '../rules/cooking';
import type { RecipeId } from '../rules/cooking';
import { SUPPLIES } from '../rules/economy';
import { FISH, FISH_IDS, fishCount } from '../rules/fishing';
import type { World } from '../rules/world';
import { music } from '../audio/music';

// At a campfire: turn fish and foraged things into food and medicine for the pack.
export class CookView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(private world: World, private onChange: (world: World) => void, onClose: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'battle cooking';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'cooking-title');
    this.root.tabIndex = -1;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    this.root.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button) return;
      if (button.dataset.recipe) {
        const recipe = button.dataset.recipe as RecipeId;
        if (!canCook(this.world, recipe)) return;
        this.world = cook(this.world, recipe);
        music.effect('heal');
        this.onChange(this.world); this.render();
        this.root.querySelector<HTMLButtonElement>(`[data-recipe="${recipe}"]`)?.focus();
      } else if (button.id === 'cooking-close') onClose();
    }, { signal });
    this.root.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }, { signal });
    this.render();
    this.root.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({ preventScroll: true });
  }

  private render() {
    const pantry = pantryOf(this.world);
    const fish = fishCount(this.world.fish);
    const have = [
      ...FISH_IDS.filter(id => (this.world.fish[id] ?? 0) > 0).map(id => `${this.world.fish[id]} ${FISH[id].name.toLowerCase()}`),
      ...INGREDIENT_IDS.filter(id => pantry[id] > 0).map(id => `${pantry[id]} ${INGREDIENTS[id].plural}`),
    ];
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BY THE FIRE</p><h2 id="cooking-title">Cook something.</h2>
      <p class="resurrection-intro">In the pack: ${have.length ? have.join(', ') : 'nothing to cook with. Fish, and pick what grows wild'}.</p></div>
      <ul class="recipes">${RECIPE_IDS.map(id => {
        const { fish: fishNeeded, needs } = RECIPES[id];
        const parts = [...(fishNeeded ? [`${fishNeeded} fish (${fish})`] : []), ...INGREDIENT_IDS.filter(ing => needs[ing]).map(ing => `${needs[ing]} ${INGREDIENTS[ing].plural} (${pantry[ing]})`)];
        return `<li><button type="button" data-recipe="${id}" ${canCook(this.world, id) ? '' : 'disabled'}><strong>${SUPPLIES[id].name}</strong><small>${parts.join(' + ')}</small><small>${SUPPLIES[id].text} You have ${this.world.supplies[id] ?? 0}.</small></button></li>`;
      }).join('')}</ul>
      <button id="cooking-close" type="button">Done</button>`;
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
