export type ProductCategory =
  | 'wood'
  | 'plaster'
  | 'coconut'
  | 'glass'
  | 'stone'
  | 'molded'
  | 'box'
  | 'education'
  | 'workshop';

export type SalesChannel = 'instagram' | 'website' | 'friends' | 'event' | 'partner' | 'other';
export type PaymentMethod = 'cash' | 'cashless' | 'iban' | 'other';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  active: boolean;
  waxMinGrams?: number;
  waxMaxGrams?: number;
};

export type Sale = {
  id: string;
  soldAt: string;
  productId: string;
  productName: string;
  amount: number;
  quantity: number;
  channel: SalesChannel;
  payment: PaymentMethod;
  note?: string;
};

export type Expense = {
  id: string;
  spentAt: string;
  category: string;
  amount: number;
  note?: string;
};

export type Material = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  averageCost: number;
};

export type Partner = {
  id: string;
  name: string;
  website?: string;
  instagram?: string;
  phone?: string;
  note?: string;
};

export type Purchase = {
  id: string;
  purchasedAt: string;
  partnerId?: string;
  supplierName?: string;
  materialId: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  total: number;
  payment: PaymentMethod;
  note?: string;
};

export type RecipeItem = { materialId: string; quantity: number };
export type Recipe = {
  id: string;
  name: string;
  productId?: string;
  version: string;
  yieldQuantity: number;
  instructions?: string;
  items: RecipeItem[];
};

export type ProductionBatch = {
  id: string;
  recipeId: string;
  producedAt: string;
  quantity: number;
  unitCost: number;
  note?: string;
};
