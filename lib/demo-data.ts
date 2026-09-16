import type { Expense, Material, Partner, Product, ProductionBatch, Purchase, Recipe, Sale } from './types';

export const products: Product[] = [
  { id: 'wood-bark-small', name: 'СРУБ у корі · мала', category: 'wood', price: 1150, active: true, waxMinGrams: 80, waxMaxGrams: 130 },
  { id: 'wood-bark-medium', name: 'СРУБ у корі · середня', category: 'wood', price: 1400, active: true, waxMinGrams: 140, waxMaxGrams: 190 },
  { id: 'wood-bark-large', name: 'СРУБ у корі · велика', category: 'wood', price: 1650, active: true, waxMinGrams: 200, waxMaxGrams: 250 },
  { id: 'wood-bark-xl', name: 'СРУБ у корі · супер-велика', category: 'wood', price: 1900, active: true, waxMinGrams: 260, waxMaxGrams: 350 },
  { id: 'wood-clean-small', name: 'СРУБ без кори · мала', category: 'wood', price: 1050, active: true, waxMinGrams: 80, waxMaxGrams: 130 },
  { id: 'wood-clean-medium', name: 'СРУБ без кори · середня', category: 'wood', price: 1300, active: true, waxMinGrams: 140, waxMaxGrams: 190 },
  { id: 'wood-clean-large', name: 'СРУБ без кори · велика', category: 'wood', price: 1550, active: true, waxMinGrams: 200, waxMaxGrams: 250 },
  { id: 'wood-clean-xl', name: 'СРУБ без кори · супер-велика', category: 'wood', price: 1800, active: true, waxMinGrams: 260, waxMaxGrams: 350 },
  { id: 'heart-small', name: 'СЕРДЕНЬКО · мале', category: 'wood', price: 1250, active: true, waxMinGrams: 100, waxMaxGrams: 140 },
  { id: 'heart-medium', name: 'СЕРДЕНЬКО · середнє', category: 'wood', price: 1650, active: true, waxMinGrams: 150, waxMaxGrams: 190 },
  { id: 'heart-large', name: 'СЕРДЕНЬКО · велике', category: 'wood', price: 1950, active: true, waxMinGrams: 200, waxMaxGrams: 260 },
  { id: 'wood-sea', name: 'СРУБ МОРЕ', category: 'wood', price: 1700, active: true, waxMinGrams: 150, waxMaxGrams: 210 },
  { id: 'wood-double', name: 'Свічка велика подвійна', category: 'wood', price: 2500, active: true, waxMinGrams: 300, waxMaxGrams: 400 },
  { id: 'molded-oval', name: 'Овал з кришкою', category: 'molded', price: 1350, active: true, waxMinGrams: 230, waxMaxGrams: 240 },
  { id: 'molded-rectangle', name: 'Прямокутник з кришкою', category: 'molded', price: 1250, active: true, waxMinGrams: 220, waxMaxGrams: 230 },
  { id: 'molded-triangle', name: 'Трикутник', category: 'molded', price: 950, active: true, waxMinGrams: 130, waxMaxGrams: 140 },
  { id: 'coconut-medium', name: 'Балійський кокос · середня', category: 'coconut', price: 1400, active: true, waxMinGrams: 150, waxMaxGrams: 250 },
  { id: 'coconut-large', name: 'Балійський кокос · велика', category: 'coconut', price: 1650, active: true, waxMinGrams: 260, waxMaxGrams: 350 },
  { id: 'plaster-bark', name: 'Гіпс КОРА', category: 'plaster', price: 950, active: true, waxMinGrams: 100, waxMaxGrams: 100 },
  { id: 'plaster-buddha', name: 'Гіпс БУДА', category: 'plaster', price: 950, active: true, waxMinGrams: 250, waxMaxGrams: 250 },
  { id: 'plaster-pumpkin', name: 'Гіпс ГАРБУЗ з кришкою', category: 'plaster', price: 850, active: true, waxMinGrams: 200, waxMaxGrams: 200 },
  { id: 'plaster-star', name: 'Гіпс ЗІРКА', category: 'plaster', price: 850, active: true, waxMinGrams: 250, waxMaxGrams: 250 },
  { id: 'plaster-shell', name: 'Гіпс МУШЛЯ', category: 'plaster', price: 850, active: true, waxMinGrams: 200, waxMaxGrams: 200 },
  { id: 'plaster-breasts', name: 'Гіпс ГРУДИ', category: 'plaster', price: 750, active: true, waxMinGrams: 200, waxMaxGrams: 200 },
  { id: 'plaster-barrel', name: 'Гіпс ДІЖКА з кришкою', category: 'plaster', price: 650, active: true, waxMinGrams: 130, waxMaxGrams: 130 },
  { id: 'plaster-cylinder', name: 'Гіпс ЦИЛІНДР', category: 'plaster', price: 650, active: true, waxMinGrams: 150, waxMaxGrams: 150 },
  { id: 'plaster-ball', name: 'Гіпс КУЛЯ мала', category: 'plaster', price: 0, active: true },
  { id: 'plaster-rose', name: 'Гіпс ТРОЯНДА', category: 'plaster', price: 0, active: true },
  { id: 'plaster-carousel', name: 'Гіпс КАРУСЕЛЬ', category: 'plaster', price: 0, active: true },
  { id: 'plaster-heart', name: 'Гіпс СЕРЦЕ', category: 'plaster', price: 0, active: true },
  { id: 'glass-amber-small', name: 'БУРШТИН у склі · мала', category: 'glass', price: 550, active: true, waxMinGrams: 100, waxMaxGrams: 100 },
  { id: 'glass-amber-large', name: 'БУРШТИН у склі · велика', category: 'glass', price: 750, active: true, waxMinGrams: 250, waxMaxGrams: 250 },
  { id: 'box-custom', name: 'Бокс для самостійного створення свічок', category: 'box', price: 0, active: true },
  { id: 'education-wood', name: 'Навчання · БАЗА + свічки в дереві', category: 'education', price: 0, active: true },
  { id: 'education-plaster', name: 'Навчання · БАЗА + свічки в гіпсі та з посланням', category: 'education', price: 0, active: true },
  { id: 'education-coconut-glass', name: 'Навчання · БАЗА + свічки в кокосі та склі', category: 'education', price: 0, active: true },
  { id: 'education-suppliers', name: 'Навчання · БАЗА постачальників', category: 'education', price: 0, active: true },
  { id: 'education-full', name: 'Навчання · ПОВНА БАЗА з майстер-класами (без бізнесу)', category: 'education', price: 0, active: true },
  { id: 'education-business', name: 'Навчання · СВІЧКОВИЙ БІЗНЕС ПІД КЛЮЧ (без підтримки)', category: 'education', price: 0, active: true },
  { id: 'education-business-support', name: 'Навчання · СВІЧКОВИЙ БІЗНЕС ПІД КЛЮЧ з підтримкою', category: 'education', price: 0, active: true },
];

export const demoSales: Sale[] = [];

export const demoExpenses: Expense[] = [];

export const demoMaterials: Material[] = [
  { id: 'wood-pot', name: 'Кашпо · деревʼяне', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'plaster-pot', name: 'Кашпо · гіпсове', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'glass-pot', name: 'Кашпо · скло', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'coconut-pot', name: 'Кашпо · кокос', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'soy-wax', name: 'Віск · соєвий', unit: 'кг', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'beeswax', name: 'Віск · бджолиний', unit: 'кг', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'palm-wax', name: 'Віск · пальмовий', unit: 'кг', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'wood-wick', name: 'Гніт · деревʼяний', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'cotton-wick', name: 'Гніт · бавовняний', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'wick-holder', name: 'Тримач для гнота', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'fragrance', name: 'Аромат', unit: 'г', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'decor', name: 'Декор', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'box', name: 'Коробки', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'packing-paper', name: 'Пакування · папір', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'packing-ribbon', name: 'Пакування · стрічка', unit: 'м', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'packing-confetti', name: 'Пакування · конфеті', unit: 'г', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'postcards', name: 'Листівки', unit: 'шт.', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'oil-wax', name: 'Масло-віск', unit: 'г', stock: 0, minStock: 0, averageCost: 0 },
  { id: 'epoxy-resin', name: 'Епоксидна смола', unit: 'г', stock: 0, minStock: 0, averageCost: 0 },
];

export const demoPartners: Partner[] = [];

export const demoPurchases: Purchase[] = [];

export const demoRecipes: Recipe[] = [
  { id: 'r1', name: 'Середня свічка в корі', productId: 'wood-medium', version: '1.0', yieldQuantity: 1, instructions: 'Підготувати форму, залити віск і дати стабілізуватись.', items: [{ materialId: 'soy-wax', quantity: 0.9 }, { materialId: 'wick', quantity: 1 }, { materialId: 'box', quantity: 1 }] },
];
export const demoBatches: ProductionBatch[] = [];
