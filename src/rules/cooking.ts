// Pure foraging and cooking rules: what grows wild, and what a campfire turns it into. No Phaser, DOM, or storage.
import type { World } from './world';
import type { SupplyId } from './economy';
import { feed, fishCount, NO_CATCH } from './fishing.ts';

export type IngredientId = 'herb' | 'mushroom' | 'berry';
export type Pantry = Readonly<Record<IngredientId, number>>;
export const NO_PANTRY: Pantry = { herb: 0, mushroom: 0, berry: 0 };
export const INGREDIENTS: Record<IngredientId, { name: string; plural: string }> = {
  herb: { name: 'Wild thyme', plural: 'wild thyme' },
  mushroom: { name: 'Field mushroom', plural: 'field mushrooms' },
  berry: { name: 'Hedge berries', plural: 'hedge berries' },
};
export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as IngredientId[];

// fish: how many fish of any kind the recipe uses, smallest first.
export type RecipeId = SupplyId & ('smoked-fish' | 'fish-stew' | 'herb-salve' | 'trail-cake');
export const RECIPES: Record<RecipeId, { fish: number; needs: Partial<Record<IngredientId, number>> }> = {
  'smoked-fish': { fish: 1, needs: {} },
  'fish-stew': { fish: 2, needs: { herb: 1 } },
  'herb-salve': { fish: 0, needs: { herb: 2, mushroom: 1 } },
  'trail-cake': { fish: 0, needs: { berry: 2 } },
};
export const RECIPE_IDS = Object.keys(RECIPES) as RecipeId[];

export function pantryOf(world: World): Pantry {
  return { ...NO_PANTRY, ...world.pantry };
}

export function canCook(world: World, recipe: RecipeId): boolean {
  const { fish, needs } = RECIPES[recipe];
  const pantry = pantryOf(world);
  return fishCount(world.fish ?? NO_CATCH) >= fish && INGREDIENT_IDS.every(id => pantry[id] >= (needs[id] ?? 0));
}

// Cooking spends the fish and ingredients and puts the dish in the pack, where it works like any supply.
export function cook(world: World, recipe: RecipeId): World {
  if (!canCook(world, recipe)) return world;
  const { fish, needs } = RECIPES[recipe];
  const pantry = pantryOf(world);
  return {
    ...world,
    fish: feed(world.fish, fish),
    pantry: Object.fromEntries(INGREDIENT_IDS.map(id => [id, pantry[id] - (needs[id] ?? 0)])) as Pantry,
    supplies: { ...world.supplies, [recipe]: (world.supplies[recipe] ?? 0) + 1 },
  };
}

export function forage(world: World, ingredient: IngredientId, count = 1): World {
  const pantry = pantryOf(world);
  return { ...world, pantry: { ...pantry, [ingredient]: pantry[ingredient] + count } };
}
