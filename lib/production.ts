import type { Material, Recipe } from './types';

export function recipeCost(recipe: Recipe, materials: Material[]) {
  return recipe.items.reduce((total, item) => {
    const material = materials.find((candidate) => candidate.id === item.materialId);
    return total + (material ? material.averageCost * item.quantity : 0);
  }, 0);
}

export function recipeUnitCost(recipe: Recipe, materials: Material[]) {
  return recipe.yieldQuantity > 0 ? recipeCost(recipe, materials) / recipe.yieldQuantity : 0;
}
