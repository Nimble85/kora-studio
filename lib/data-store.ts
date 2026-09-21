import { getInitialLocalData, readLocalData, writeLocalData } from './local-data';
import { createSupabaseBrowserClient } from './supabase-browser';
import type { Expense, Material, Partner, PaymentMethod, Product, ProductCategory, ProductionBatch, Purchase, Recipe, RecipeItem, Sale, SalesChannel } from './types';

export type AppData = {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  materials: Material[];
  partners: Partner[];
  purchases: Purchase[];
  recipes: Recipe[];
  batches: ProductionBatch[];
};

export type DataSource = 'local' | 'supabase';

type ProductRow = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number | string;
  active: boolean;
  wax_min_grams: number | string | null;
  wax_max_grams: number | string | null;
};

type SaleRow = {
  id: string;
  sold_at: string;
  product_id: string | null;
  product_name: string;
  amount: number | string;
  quantity: number | string;
  channel: SalesChannel;
  payment_method: PaymentMethod;
  note: string | null;
  workshop_at: string | null;
  deposit: number | string | null;
  candle_choices: Sale['candleChoices'] | null;
  instagram_url: string | null;
};

type ExpenseRow = {
  id: string;
  spent_at: string;
  category: string;
  amount: number | string;
  note: string | null;
};

type MaterialRow = { id: string; name: string; unit: string; stock: number | string; min_stock: number | string; average_cost: number | string };
type PartnerRow = { id: string; name: string; website: string | null; instagram: string | null; phone: string | null; note: string | null };
type PurchaseRow = { id: string; purchased_at: string; partner_id: string | null; supplier_name: string | null; material_id: string | null; quantity: number | string; unit: string | null; unit_price: number | string; total: number | string; payment_method: PaymentMethod; note: string | null };
type RecipeRow = { id: string; name: string; product_id: string | null; version: string; yield_quantity: number | string; instructions: string | null };
type RecipeItemRow = { recipe_id: string; material_id: string; quantity: number | string };
type BatchRow = { id: string; recipe_id: string | null; produced_at: string; quantity: number | string; unit_cost: number | string; note: string | null };

const productFromRow = (row: ProductRow): Product => ({ id: row.id, name: row.name, category: row.category, price: Number(row.price), active: row.active, waxMinGrams: row.wax_min_grams == null ? undefined : Number(row.wax_min_grams), waxMaxGrams: row.wax_max_grams == null ? undefined : Number(row.wax_max_grams) });
const saleFromRow = (row: SaleRow): Sale => ({
  id: row.id,
  soldAt: row.sold_at,
  productId: row.product_id ?? '',
  productName: row.product_name,
  amount: Number(row.amount),
  quantity: Number(row.quantity),
  channel: row.channel,
  payment: row.payment_method,
  note: row.note ?? undefined,
  workshopAt: row.workshop_at ?? undefined,
  deposit: row.deposit == null ? undefined : Number(row.deposit),
  candleChoices: row.candle_choices ?? undefined,
  instagramUrl: row.instagram_url ?? undefined,
});
const expenseFromRow = (row: ExpenseRow): Expense => ({
  id: row.id,
  spentAt: row.spent_at,
  category: row.category,
  amount: Number(row.amount),
  note: row.note ?? undefined,
});
const materialFromRow = (row: MaterialRow): Material => ({ id: row.id, name: row.name, unit: row.unit, stock: Number(row.stock), minStock: Number(row.min_stock), averageCost: Number(row.average_cost) });
const partnerFromRow = (row: PartnerRow): Partner => ({ id: row.id, name: row.name, website: row.website ?? undefined, instagram: row.instagram ?? undefined, phone: row.phone ?? undefined, note: row.note ?? undefined });
const purchaseFromRow = (row: PurchaseRow): Purchase => ({ id: row.id, purchasedAt: row.purchased_at, partnerId: row.partner_id ?? undefined, supplierName: row.supplier_name ?? undefined, materialId: row.material_id ?? '', quantity: Number(row.quantity), unit: row.unit ?? undefined, unitPrice: Number(row.unit_price), total: Number(row.total), payment: row.payment_method, note: row.note ?? undefined });

export function configuredDataSource(): DataSource {
  return createSupabaseBrowserClient() ? 'supabase' : 'local';
}

export async function loadAppData(): Promise<AppData> {
  const client = createSupabaseBrowserClient();
  if (!client) return readLocalData();

  const [products, sales, expenses, materials, partners, purchases, recipes, recipeItems, batches] = await Promise.all([
    client.from('products').select('id, name, category, price, active, wax_min_grams, wax_max_grams').order('created_at', { ascending: false }),
    client.from('sales').select('id, sold_at, product_id, product_name, amount, quantity, channel, payment_method, note, workshop_at, deposit, candle_choices, instagram_url').order('sold_at', { ascending: false }),
    client.from('expenses').select('id, spent_at, category, amount, note').order('spent_at', { ascending: false }),
    client.from('materials').select('id, name, unit, stock, min_stock, average_cost').order('name'),
    client.from('partners').select('id, name, website, instagram, phone, note').order('name'),
    client.from('purchases').select('id, purchased_at, partner_id, supplier_name, material_id, quantity, unit, unit_price, total, payment_method, note').order('purchased_at', { ascending: false }),
    client.from('recipes').select('id, name, product_id, version, yield_quantity, instructions').order('created_at', { ascending: false }),
    client.from('recipe_items').select('recipe_id, material_id, quantity'),
    client.from('production_batches').select('id, recipe_id, produced_at, quantity, unit_cost, note').order('produced_at', { ascending: false }),
  ]);
  if (products.error) throw products.error;
  if (sales.error) throw sales.error;
  if (expenses.error) throw expenses.error;
  if (materials.error) throw materials.error;
  if (partners.error) throw partners.error;
  if (purchases.error) throw purchases.error;
  if (recipes.error) throw recipes.error;
  if (recipeItems.error) throw recipeItems.error;
  if (batches.error) throw batches.error;

  return {
    products: (products.data as ProductRow[]).map(productFromRow),
    sales: (sales.data as SaleRow[]).map(saleFromRow),
    expenses: (expenses.data as ExpenseRow[]).map(expenseFromRow),
    materials: (materials.data as MaterialRow[]).map(materialFromRow),
    partners: (partners.data as PartnerRow[]).map(partnerFromRow),
    purchases: (purchases.data as PurchaseRow[]).map(purchaseFromRow),
    recipes: (recipes.data as RecipeRow[]).map((recipe) => ({ id: recipe.id, name: recipe.name, productId: recipe.product_id ?? undefined, version: recipe.version, yieldQuantity: Number(recipe.yield_quantity), instructions: recipe.instructions ?? undefined, items: (recipeItems.data as RecipeItemRow[]).filter((item) => item.recipe_id === recipe.id).map((item) => ({ materialId: item.material_id, quantity: Number(item.quantity) })) })),
    batches: (batches.data as BatchRow[]).filter((batch) => batch.recipe_id).map((batch) => ({ id: batch.id, recipeId: batch.recipe_id!, producedAt: batch.produced_at, quantity: Number(batch.quantity), unitCost: Number(batch.unit_cost), note: batch.note ?? undefined })),
  };
}

export async function saveProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const data = readLocalData();
    const created = { ...product, id: crypto.randomUUID() };
    writeLocalData({ ...data, products: [created, ...data.products] });
    return created;
  }

  const { data, error } = await client.from('products').insert({ name: product.name, category: product.category, price: product.price, active: product.active, wax_min_grams: product.waxMinGrams ?? null, wax_max_grams: product.waxMaxGrams ?? null }).select('id, name, category, price, active, wax_min_grams, wax_max_grams').single();
  if (error) throw error;
  return productFromRow(data as ProductRow);
}

export async function updateProduct(product: Product): Promise<Product> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData();
    writeLocalData({ ...current, products: current.products.map((item) => item.id === product.id ? product : item) });
    return product;
  }
  const { data, error } = await client.from('products').update({ name: product.name, price: product.price, category: product.category, active: product.active, wax_min_grams: product.waxMinGrams ?? null, wax_max_grams: product.waxMaxGrams ?? null }).eq('id', product.id).select('id, name, category, price, active, wax_min_grams, wax_max_grams').single();
  if (error) throw error;
  return productFromRow(data as ProductRow);
}

export async function removeProduct(id: string): Promise<void> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); writeLocalData({ ...current, products: current.products.filter((item) => item.id !== id) }); return; }
  const { error } = await client.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function saveSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const data = readLocalData();
    const created = { ...sale, id: crypto.randomUUID() };
    writeLocalData({ ...data, sales: [created, ...data.sales] });
    return created;
  }

  const { data, error } = await client.from('sales').insert({
    sold_at: sale.soldAt,
    product_id: sale.productId,
    product_name: sale.productName,
    amount: sale.amount,
    quantity: sale.quantity,
    channel: sale.channel,
    payment_method: sale.payment,
    note: sale.note || null,
    workshop_at: sale.workshopAt || null, deposit: sale.deposit ?? null, candle_choices: sale.candleChoices ?? null, instagram_url: sale.instagramUrl || null,
  }).select('id, sold_at, product_id, product_name, amount, quantity, channel, payment_method, note, workshop_at, deposit, candle_choices, instagram_url').single();
  if (error) throw error;
  return saleFromRow(data as SaleRow);
}

export async function updateSale(sale: Sale): Promise<Sale> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData();
    writeLocalData({ ...current, sales: current.sales.map((item) => item.id === sale.id ? sale : item) });
    return sale;
  }
  const { data, error } = await client.from('sales').update({ sold_at: sale.soldAt, product_id: sale.productId, product_name: sale.productName, amount: sale.amount, quantity: sale.quantity, channel: sale.channel, payment_method: sale.payment, note: sale.note || null, workshop_at: sale.workshopAt || null, deposit: sale.deposit ?? null, candle_choices: sale.candleChoices ?? null, instagram_url: sale.instagramUrl || null }).eq('id', sale.id).select('id, sold_at, product_id, product_name, amount, quantity, channel, payment_method, note, workshop_at, deposit, candle_choices, instagram_url').single();
  if (error) throw error;
  return saleFromRow(data as SaleRow);
}

export async function removeSale(id: string): Promise<void> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData();
    writeLocalData({ ...current, sales: current.sales.filter((item) => item.id !== id) });
    return;
  }
  const { error } = await client.from('sales').delete().eq('id', id);
  if (error) throw error;
}

export async function saveExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData();
    const created = { ...expense, id: crypto.randomUUID() };
    writeLocalData({ ...current, expenses: [created, ...current.expenses] });
    return created;
  }
  const { data, error } = await client.from('expenses').insert({ spent_at: expense.spentAt, category: expense.category, amount: expense.amount, note: expense.note || null }).select('id, spent_at, category, amount, note').single();
  if (error) throw error;
  return expenseFromRow(data as ExpenseRow);
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData();
    writeLocalData({ ...current, expenses: current.expenses.map((item) => item.id === expense.id ? expense : item) });
    return expense;
  }
  const { data, error } = await client.from('expenses').update({ spent_at: expense.spentAt, category: expense.category, amount: expense.amount, note: expense.note || null }).eq('id', expense.id).select('id, spent_at, category, amount, note').single();
  if (error) throw error;
  return expenseFromRow(data as ExpenseRow);
}

export async function removeExpense(id: string): Promise<void> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData();
    writeLocalData({ ...current, expenses: current.expenses.filter((item) => item.id !== id) });
    return;
  }
  const { error } = await client.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function saveMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData(); const created = { ...material, id: crypto.randomUUID() };
    writeLocalData({ ...current, materials: [...current.materials, created] }); return created;
  }
  const { data, error } = await client.from('materials').insert({ name: material.name, unit: material.unit, stock: material.stock, min_stock: material.minStock, average_cost: material.averageCost }).select('id, name, unit, stock, min_stock, average_cost').single();
  if (error) throw error; return materialFromRow(data as MaterialRow);
}

export async function updateMaterial(material: Material): Promise<Material> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); writeLocalData({ ...current, materials: current.materials.map((item) => item.id === material.id ? material : item) }); return material; }
  const { data, error } = await client.from('materials').update({ name: material.name, unit: material.unit, stock: material.stock, min_stock: material.minStock, average_cost: material.averageCost }).eq('id', material.id).select('id, name, unit, stock, min_stock, average_cost').single();
  if (error) throw error; return materialFromRow(data as MaterialRow);
}

export async function removeMaterial(id: string): Promise<void> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); writeLocalData({ ...current, materials: current.materials.filter((item) => item.id !== id) }); return; }
  const { error } = await client.from('materials').delete().eq('id', id);
  if (error) throw error;
}

export async function savePartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); const created = { ...partner, id: crypto.randomUUID() }; writeLocalData({ ...current, partners: [...current.partners, created] }); return created; }
  const { data, error } = await client.from('partners').insert({ name: partner.name, website: partner.website || null, instagram: partner.instagram || null, phone: partner.phone || null, note: partner.note || null }).select('id, name, website, instagram, phone, note').single();
  if (error) throw error; return partnerFromRow(data as PartnerRow);
}

export async function updatePartner(partner: Partner): Promise<Partner> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); writeLocalData({ ...current, partners: current.partners.map((item) => item.id === partner.id ? partner : item) }); return partner; }
  const { data, error } = await client.from('partners').update({ name: partner.name, website: partner.website || null, instagram: partner.instagram || null, phone: partner.phone || null, note: partner.note || null }).eq('id', partner.id).select('id, name, website, instagram, phone, note').single();
  if (error) throw error; return partnerFromRow(data as PartnerRow);
}

export async function removePartner(id: string): Promise<void> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); writeLocalData({ ...current, partners: current.partners.filter((item) => item.id !== id) }); return; }
  const { error } = await client.from('partners').delete().eq('id', id);
  if (error) throw error;
}

export async function savePurchase(purchase: Omit<Purchase, 'id' | 'total'>, material: Material, stockQuantity = purchase.quantity): Promise<{ purchase: Purchase; material: Material }> {
  const total = purchase.quantity * purchase.unitPrice;
  const nextStock = material.stock + stockQuantity;
  const nextAverage = nextStock === 0 ? purchase.unitPrice : ((material.stock * material.averageCost) + total) / nextStock;
  const nextMaterial = { ...material, stock: nextStock, averageCost: nextAverage };
  const client = createSupabaseBrowserClient();
  if (!client) {
    const current = readLocalData(); const created = { ...purchase, total, id: crypto.randomUUID() };
    writeLocalData({ ...current, purchases: [created, ...current.purchases], materials: current.materials.map((item) => item.id === material.id ? nextMaterial : item) });
    return { purchase: created, material: nextMaterial };
  }
  const { data, error } = await client.from('purchases').insert({ purchased_at: purchase.purchasedAt, partner_id: purchase.partnerId || null, supplier_name: purchase.supplierName || null, material_id: purchase.materialId, quantity: purchase.quantity, unit: purchase.unit || material.unit, unit_price: purchase.unitPrice, payment_method: purchase.payment, note: purchase.note || null }).select('id, purchased_at, partner_id, supplier_name, material_id, quantity, unit, unit_price, total, payment_method, note').single();
  if (error) throw error;
  const savedMaterial = await updateMaterial(nextMaterial);
  return { purchase: purchaseFromRow(data as PurchaseRow), material: savedMaterial };
}

export async function saveRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); const created = { ...recipe, id: crypto.randomUUID() }; writeLocalData({ ...current, recipes: [created, ...current.recipes] }); return created; }
  const { data, error } = await client.from('recipes').insert({ name: recipe.name, product_id: recipe.productId || null, version: recipe.version, yield_quantity: recipe.yieldQuantity, instructions: recipe.instructions || null }).select('id, name, product_id, version, yield_quantity, instructions').single();
  if (error) throw error;
  const created = data as RecipeRow;
  if (recipe.items.length) { const { error: itemError } = await client.from('recipe_items').insert(recipe.items.map((item) => ({ recipe_id: created.id, material_id: item.materialId, quantity: item.quantity }))); if (itemError) throw itemError; }
  return { id: created.id, name: created.name, productId: created.product_id ?? undefined, version: created.version, yieldQuantity: Number(created.yield_quantity), instructions: created.instructions ?? undefined, items: recipe.items };
}

export async function saveProductionBatch(batch: Omit<ProductionBatch, 'id'>, recipe: Recipe, materials: Material[]): Promise<{ batch: ProductionBatch; materials: Material[] }> {
  const required = recipe.items.map((item) => ({ id: item.materialId, quantity: item.quantity * batch.quantity / recipe.yieldQuantity }));
  const nextMaterials = materials.map((material) => { const used = required.find((item) => item.id === material.id)?.quantity ?? 0; return { ...material, stock: material.stock - used }; });
  if (nextMaterials.some((material) => material.stock < 0)) throw new Error('Недостатньо матеріалів');
  const client = createSupabaseBrowserClient();
  if (!client) { const current = readLocalData(); const created = { ...batch, id: crypto.randomUUID() }; writeLocalData({ ...current, batches: [created, ...current.batches], materials: nextMaterials }); return { batch: created, materials: nextMaterials }; }
  const { data, error } = await client.from('production_batches').insert({ recipe_id: batch.recipeId, produced_at: batch.producedAt, quantity: batch.quantity, unit_cost: batch.unitCost, note: batch.note || null }).select('id, recipe_id, produced_at, quantity, unit_cost, note').single();
  if (error) throw error;
  await Promise.all(nextMaterials.filter((material, index) => material.stock !== materials[index].stock).map(updateMaterial));
  const row = data as BatchRow;
  return { batch: { id: row.id, recipeId: row.recipe_id!, producedAt: row.produced_at, quantity: Number(row.quantity), unitCost: Number(row.unit_cost), note: row.note ?? undefined }, materials: nextMaterials };
}

export function demoData(): AppData {
  return getInitialLocalData();
}
