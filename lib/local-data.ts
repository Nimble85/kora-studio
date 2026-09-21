import { demoBatches, demoExpenses, demoMaterials, demoPartners, demoPurchases, demoRecipes, demoSales, products as demoProducts } from './demo-data';
import type { Expense, Material, Partner, Product, ProductionBatch, Purchase, Recipe, Sale } from './types';

type LocalData = {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  materials: Material[];
  partners: Partner[];
  purchases: Purchase[];
  recipes: Recipe[];
  batches: ProductionBatch[];
};

const STORAGE_KEY = 'kora-studio:v2';

const initialData: LocalData = {
  products: demoProducts,
  sales: demoSales,
  expenses: demoExpenses,
  materials: demoMaterials,
  partners: demoPartners,
  purchases: demoPurchases,
  recipes: demoRecipes,
  batches: demoBatches,
};

export function getInitialLocalData(): LocalData {
  return initialData;
}

export function readLocalData(): LocalData {
  if (typeof window === 'undefined') return initialData;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialData;
    const parsed = JSON.parse(stored) as Partial<LocalData>;
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.sales) || !Array.isArray(parsed.expenses)) {
      return initialData;
    }
    const missingProducts = initialData.products.filter((product) => !parsed.products!.some((stored) => stored.id === product.id));
    const storedMaterials = Array.isArray(parsed.materials) ? parsed.materials : [];
    const missingMaterials = initialData.materials.filter((material) => !storedMaterials.some((stored) => stored.id === material.id));
    return { ...initialData, ...parsed, products: [...parsed.products, ...missingProducts], materials: [...storedMaterials, ...missingMaterials], partners: Array.isArray(parsed.partners) ? parsed.partners : initialData.partners, purchases: Array.isArray(parsed.purchases) ? parsed.purchases : initialData.purchases, recipes: Array.isArray(parsed.recipes) ? parsed.recipes : initialData.recipes, batches: Array.isArray(parsed.batches) ? parsed.batches : initialData.batches };
  } catch {
    return initialData;
  }
}

export function writeLocalData(data: LocalData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
