'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, ChevronRight, Home, Moon, Pencil, Plus, Receipt, Sparkles, Sun, Trash2, Wallet, X } from 'lucide-react';
import { configuredDataSource, demoData, loadAppData, removeExpense, removeMaterial, removePartner, removeProduct, removeSale, saveExpense, saveMaterial, savePartner, saveProduct, saveProductionBatch, savePurchase, saveRecipe, saveSale, updateExpense, updateMaterial, updatePartner, updateProduct, updateSale, type DataSource } from '@/lib/data-store';
import { money, shortDate } from '@/lib/format';
import { recipeUnitCost } from '@/lib/production';
import type { Expense, Material, Partner, PaymentMethod, Product, ProductCategory, Recipe, Sale, SalesChannel } from '@/lib/types';

const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(new Date());
const monthKey = today.slice(0, 7);
const monthLabel = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric', timeZone: 'Europe/Kyiv' }).format(new Date());
const seasonalReminder = (() => {
  const month = Number(today.slice(5, 7));
  if (month >= 9 && month <= 10) return { icon: '🎃', title: 'Осінній сезон і Хелловін', note: 'Час планувати атмосферну осінню колекцію.', ideas: ['Теплі аромати: кориця, гарбуз, дерево', 'Перевірити запас воску й подарункового пакування', 'Підготувати фото до холодної погоди'] };
  if (month === 11 || month === 12) return { icon: '🎄', title: 'Новорічний сезон', note: 'Найкращий час для подарунків, боксів і передзамовлень.', ideas: ['Святкові бокси та листівки', 'Запас коробок, стрічок і конфеті', 'Зібрати замовлення до дедлайнів доставки'] };
  if (month <= 2) return { icon: '💌', title: 'Зима, 14 лютого та 8 березня', note: 'Плануйте романтичні та весняні подарункові формати.', ideas: ['Міні-бокси й свічки з посланням', 'Квіткові аромати й ніжне пакування', 'Підготувати контент до весняних свят'] };
  if (month >= 3 && month <= 5) return { icon: '🌷', title: 'Весняна колекція', note: 'Час оновити палітру, аромати та формати подарунків.', ideas: ['Легкі квіткові аромати', 'Подарунки до весняних подій', 'Підготувати студію до майстер-класів'] };
  return { icon: '☀️', title: 'Літній сезон', note: 'Сезон легких ароматів, маркетів та виїзних подій.', ideas: ['Кокос і скло для літньої колекції', 'План маркетів та виїзних майстер-класів', 'Перевірити пакування для транспортування'] };
})();

const channelLabels: Record<SalesChannel, string> = {
  instagram: 'Instagram', website: 'Сайт', friends: 'Знайомі', event: 'Захід', partner: 'Партнер', other: 'Інше',
};
const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Готівка', cashless: 'Безготівкова', iban: 'IBAN', other: 'Інше',
};
const categoryLabels: Record<ProductCategory, string> = {
  wood: 'Свічки в дереві', plaster: 'Свічки в гіпсі', coconut: 'Балійський кокос', glass: 'БУРШТИН у склі', stone: 'Свічки в камені', molded: 'Формові свічки', box: 'Бокси', workshop: 'Майстер-класи', education: 'Навчання',
};

const financialMetricHelp = {
  revenue: { title: '🕯 Продажі (виручка)', text: 'Усі кошти, отримані за продажі у вибраному періоді.', formula: 'Сума всіх оформлених продажів.' },
  cogs: { title: '🧪 Собівартість проданих товарів', text: 'Скільки коштували матеріали для виробництва саме тих товарів, які вже продали.', formula: 'Сума собівартості з рецептів × кількість проданих товарів.' },
  gross: { title: '✨ Валовий прибуток', text: 'Гроші, що залишилися після покриття матеріалів для проданих товарів.', formula: 'Продажі − собівартість.' },
  operating: { title: '🏠 Операційні витрати', text: 'Поточні витрати на роботу майстерні: оренда, маркетинг, господарські товари, транспорт та інше.', formula: 'Усі витрати, окрім податків і комісій.' },
  taxes: { title: '🧾 Податки й комісії', text: 'Податки, комісії банків, маркетплейсів та платіжних сервісів.', formula: 'Сума витрат у категоріях «Податки» та «Комісії».' },
  net: { title: '😊 Чистий прибуток', text: 'Скільки бізнес реально заробив після собівартості, операційних витрат, податків і комісій.', formula: 'Продажі − собівартість − операційні витрати − податки й комісії.' },
  margin: { title: '📈 Рентабельність', text: 'Показує, яку частку кожної гривні виручки бізнес залишив собі як чистий прибуток.', formula: 'Чистий прибуток ÷ продажі × 100%.' },
} as const;

function sum(items: { amount: number }[]) { return items.reduce((total, item) => total + item.amount, 0); }

export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<'home' | 'sales' | 'expenses' | 'analysis' | 'more'>('home');
  const [showAdd, setShowAdd] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showPartner, setShowPartner] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [productionOpen, setProductionOpen] = useState(false);
  const [spendMixOpen, setSpendMixOpen] = useState(true);
  const [expensesListOpen, setExpensesListOpen] = useState(false);
  const [purchasesListOpen, setPurchasesListOpen] = useState(false);
  const [salesStatsOpen, setSalesStatsOpen] = useState(true);
  const [salesListOpen, setSalesListOpen] = useState(false);
  const [todaySalesOpen, setTodaySalesOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [monthlyGoals, setMonthlyGoals] = useState<Record<string, number>>({});
  const [goalDraft, setGoalDraft] = useState('100000');
  const [analysisPeriod, setAnalysisPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customFrom, setCustomFrom] = useState(`${monthKey}-01`);
  const [customTo, setCustomTo] = useState(today);
  const [activeMetricHelp, setActiveMetricHelp] = useState<keyof typeof financialMetricHelp | null>(null);
  const [products, setProducts] = useState(() => demoData().products);
  const [sales, setSales] = useState<Sale[]>(() => demoData().sales);
  const [expenses, setExpenses] = useState(() => demoData().expenses);
  const [materials, setMaterials] = useState(() => demoData().materials);
  const [partners, setPartners] = useState(() => demoData().partners);
  const [purchases, setPurchases] = useState(() => demoData().purchases);
  const [recipes, setRecipes] = useState<Recipe[]>(() => demoData().recipes);
  const [batches, setBatches] = useState(() => demoData().batches);
  const [dataSource, setDataSource] = useState<DataSource>('local');
  const [syncError, setSyncError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState({ productId: 'wood-bark-medium', unitPrice: '1400', amount: '1400', quantity: '1', soldAt: today, channel: 'instagram' as SalesChannel, payment: 'cashless' as PaymentMethod, note: '' });
  const [expenseForm, setExpenseForm] = useState({ amount: '', spentAt: today, category: 'Матеріали', note: '' });
  const [purchaseForm, setPurchaseForm] = useState({ materialId: '', supplierName: '', quantity: '', unit: 'шт.', unitPrice: '', purchasedAt: today, payment: 'cashless' as PaymentMethod, note: '' });
  const [materialForm, setMaterialForm] = useState({ name: '', unit: 'шт.', stock: '', minStock: '', averageCost: '' });
  const [partnerForm, setPartnerForm] = useState({ name: '', website: '', instagram: '', phone: '', note: '' });
  const [recipeForm, setRecipeForm] = useState({ name: '', productId: '', version: '1.0', yieldQuantity: '1', instructions: '', items: [{ materialId: '', quantity: '' }] });
  const [batchForm, setBatchForm] = useState({ recipeId: '', quantity: '1', producedAt: today, note: '' });
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'wood' as ProductCategory, waxMin: '', waxMax: '' });

  useEffect(() => {
    setDataSource(configuredDataSource());
    loadAppData().then((data) => {
      setProducts(data.products);
      setSales(data.sales);
      setExpenses(data.expenses);
      setMaterials(data.materials);
      setPartners(data.partners);
      setPurchases(data.purchases);
      setRecipes(data.recipes);
      setBatches(data.batches);
    }).catch(() => setSyncError('Не вдалося завантажити дані Supabase. Перевірте підключення й політики доступу.'));
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('kora-studio:monthly-goals');
      if (saved) setMonthlyGoals(JSON.parse(saved) as Record<string, number>);
    } catch { /* The default goal remains available if local storage is unavailable. */ }
  }, []);

  const monthSales = useMemo(() => sales.filter((sale) => sale.soldAt.startsWith(monthKey)), [sales]);
  const monthRevenue = sum(monthSales);
  const monthExpenses = sum(expenses.filter((expense) => expense.spentAt.startsWith(monthKey)));
  const monthPurchases = useMemo(() => purchases.filter((purchase) => purchase.purchasedAt.startsWith(monthKey)), [purchases]);
  const monthPurchasesTotal = monthPurchases.reduce((total, purchase) => total + purchase.total, 0);
  const monthSpendTotal = monthExpenses + monthPurchasesTotal;
  const todaySales = sales.filter((sale) => sale.soldAt.startsWith(today));
  const todayRevenue = sum(todaySales);
  const todayExpenses = sum(expenses.filter((expense) => expense.spentAt === today));
  const net = monthRevenue - monthSpendTotal;
  const monthlyGoal = monthlyGoals[monthKey] ?? 100000;
  const monthlyProgress = Math.min(Math.round((monthRevenue / monthlyGoal) * 100), 100);

  const productMix = useMemo(() => {
    const grouped = monthSales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.productName] = (acc[sale.productName] || 0) + sale.amount;
      return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [monthSales]);
  const selectableProducts = products.filter((product) => product.active || product.id === form.productId);
  const averageCheck = Math.round(monthRevenue / Math.max(monthSales.length, 1));
  const bestProduct = productMix[0];
  const unsoldProducts = products.filter((product) => product.active && !monthSales.some((sale) => sale.productId === product.id)).length;
  const bestChannel = useMemo(() => Object.entries(monthSales.reduce<Record<string, number>>((result, sale) => ({ ...result, [sale.channel]: (result[sale.channel] || 0) + sale.amount }), {})).sort(([, a], [, b]) => b - a)[0], [monthSales]);
  const monthlySalesTrend = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(`${monthKey}-01T12:00:00`); date.setMonth(date.getMonth() - (5 - index));
    const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(date).slice(0, 7);
    const monthItems = sales.filter((sale) => sale.soldAt.startsWith(key));
    return { label: new Intl.DateTimeFormat('uk-UA', { month: 'short', timeZone: 'Europe/Kyiv' }).format(date).replace('.', ''), value: sum(monthItems), count: monthItems.length };
  }), [sales]);

  const weekRevenue = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T12:00:00`); date.setDate(date.getDate() - (6 - index));
    const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(date);
    return { label: new Intl.DateTimeFormat('uk-UA', { weekday: 'short', timeZone: 'Europe/Kyiv' }).format(date).slice(0, 2), value: sum(sales.filter((sale) => sale.soldAt.startsWith(key))) };
  }), [sales]);

  const expenseMix = useMemo(() => Object.entries(expenses.filter((expense) => expense.spentAt.startsWith(monthKey)).reduce<Record<string, number>>((result, expense) => ({ ...result, [expense.category]: (result[expense.category] || 0) + expense.amount }), {})).sort(([, a], [, b]) => b - a).slice(0, 4), [expenses]);
  const spendBreakdown = useMemo<Array<[string, number]>>(() => {
    const grouped: Record<string, number> = {};
    expenses.filter((expense) => expense.spentAt.startsWith(monthKey)).forEach((expense) => { grouped[expense.category] = (grouped[expense.category] || 0) + expense.amount; });
    monthPurchases.forEach((purchase) => { const material = materials.find((item) => item.id === purchase.materialId); const name = `Закупка · ${material?.name ?? 'матеріал'}`; grouped[name] = (grouped[name] || 0) + purchase.total; });
    const entries = Object.entries(grouped).sort(([, a], [, b]) => b - a);
    if (entries.length <= 5) return entries;
    const visible = entries.slice(0, 4);
    return [...visible, ['Інше', entries.slice(4).reduce((total, [, amount]) => total + amount, 0)] as [string, number]];
  }, [expenses, monthPurchases, materials]);
  const spendDonut = useMemo(() => {
    const colors = ['#c9824b', '#536b59', '#8a684d', '#d6a75a', '#8b9f82'];
    let from = 0;
    const slices = spendBreakdown.map(([, amount], index) => { const to = from + (amount / Math.max(monthSpendTotal, 1)) * 100; const slice = `${colors[index]} ${from}% ${to}%`; from = to; return slice; });
    return slices.length ? `conic-gradient(${slices.join(',')})` : 'conic-gradient(var(--soft) 0 100%)';
  }, [spendBreakdown, monthSpendTotal]);

  function statementFor(period: string) {
    const periodSales = sales.filter((sale) => sale.soldAt.startsWith(period));
    const revenue = sum(periodSales);
    const cogs = periodSales.reduce((total, sale) => {
      const recipe = recipes.find((item) => item.productId === sale.productId);
      return total + (recipe ? recipeUnitCost(recipe, materials) * sale.quantity : 0);
    }, 0);
    const periodExpenses = expenses.filter((expense) => expense.spentAt.startsWith(period));
    const taxesAndCommissions = sum(periodExpenses.filter((expense) => /подат|комісі/i.test(expense.category)));
    const operating = sum(periodExpenses) - taxesAndCommissions;
    const gross = revenue - cogs;
    const netProfit = gross - operating - taxesAndCommissions;
    return { revenue, cogs, gross, operating, taxesAndCommissions, netProfit, margin: revenue ? (netProfit / revenue) * 100 : 0 };
  }

  const financialStatement = useMemo(() => statementFor(monthKey), [sales, recipes, materials, expenses]);
  const previousMonthKey = useMemo(() => { const date = new Date(`${monthKey}-01T12:00:00`); date.setMonth(date.getMonth() - 1); return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(date).slice(0, 7); }, []);
  const previousStatement = useMemo(() => statementFor(previousMonthKey), [sales, recipes, materials, expenses, previousMonthKey]);
  const financialTrend = useMemo(() => Array.from({ length: 6 }, (_, index) => { const date = new Date(`${monthKey}-01T12:00:00`); date.setMonth(date.getMonth() - (5 - index)); const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(date).slice(0, 7); return { label: new Intl.DateTimeFormat('uk-UA', { month: 'short', timeZone: 'Europe/Kyiv' }).format(date).replace('.', ''), ...statementFor(key) }; }), [sales, recipes, materials, expenses]);
  const changeFromPrevious = (value: number, previous: number) => previous ? Math.round(((value - previous) / Math.abs(previous)) * 100) : null;
  const analysisBounds = useMemo(() => {
    const end = today;
    if (analysisPeriod === 'custom') return { from: customFrom, to: customTo };
    if (analysisPeriod === 'day') return { from: today, to: end };
    if (analysisPeriod === 'month') return { from: `${monthKey}-01`, to: end };
    if (analysisPeriod === 'year') return { from: `${today.slice(0, 4)}-01-01`, to: end };
    const start = new Date(`${today}T12:00:00`); start.setDate(start.getDate() - 6);
    return { from: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(start), to: end };
  }, [analysisPeriod, customFrom, customTo]);
  const statementBetween = (from: string, to: string) => {
    const inRange = (date: string) => date.slice(0, 10) >= from && date.slice(0, 10) <= to;
    const periodSales = sales.filter((sale) => inRange(sale.soldAt));
    const revenue = sum(periodSales);
    const cogs = periodSales.reduce((total, sale) => { const recipe = recipes.find((item) => item.productId === sale.productId); return total + (recipe ? recipeUnitCost(recipe, materials) * sale.quantity : 0); }, 0);
    const periodExpenses = expenses.filter((expense) => inRange(expense.spentAt));
    const taxesAndCommissions = sum(periodExpenses.filter((expense) => /подат|комісі/i.test(expense.category)));
    const operating = sum(periodExpenses) - taxesAndCommissions;
    const gross = revenue - cogs; const netProfit = gross - operating - taxesAndCommissions;
    return { revenue, cogs, gross, operating, taxesAndCommissions, netProfit, margin: revenue ? (netProfit / revenue) * 100 : 0 };
  };
  const analysisStatement = useMemo(() => statementBetween(analysisBounds.from, analysisBounds.to), [sales, recipes, materials, expenses, analysisBounds]);
  const previousAnalysisBounds = useMemo(() => {
    const start = new Date(`${analysisBounds.from}T12:00:00`); const end = new Date(`${analysisBounds.to}T12:00:00`);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    const previousEnd = new Date(start); previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd); previousStart.setDate(previousStart.getDate() - (days - 1));
    const format = (date: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(date);
    return { from: format(previousStart), to: format(previousEnd) };
  }, [analysisBounds]);
  const previousAnalysisStatement = useMemo(() => statementBetween(previousAnalysisBounds.from, previousAnalysisBounds.to), [sales, recipes, materials, expenses, previousAnalysisBounds]);
  const analysisChange = (value: number, previous: number) => { const change = changeFromPrevious(value, previous); return change == null ? '—' : `${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}%`; };

  function openNewSale() {
    setEditingSale(null);
    setForm((current) => ({ ...current, soldAt: today, quantity: '1', amount: current.unitPrice, note: '' }));
    setShowAdd(true);
  }

  function selectProduct(product: Product) {
    setForm((current) => ({ ...current, productId: product.id, unitPrice: String(product.price), amount: String(product.price * Math.max(Number(current.quantity) || 1, 1)) }));
    setShowCatalog(false);
  }

  function setSaleUnitPrice(unitPrice: string) {
    setForm((current) => ({ ...current, unitPrice, amount: String((Number(unitPrice) || 0) * Math.max(Number(current.quantity) || 1, 1)) }));
  }

  function setSaleQuantity(quantity: string) {
    setForm((current) => ({ ...current, quantity, amount: String((Number(current.unitPrice) || 0) * Math.max(Number(quantity) || 0, 0)) }));
  }

  function openSaleEditor(sale: Sale) {
    setEditingSale(sale);
    setForm({ productId: sale.productId, unitPrice: String(sale.amount / Math.max(sale.quantity, 1)), amount: String(sale.amount), quantity: String(sale.quantity), soldAt: sale.soldAt.slice(0, 10), channel: sale.channel, payment: sale.payment, note: sale.note ?? '' });
    setShowAdd(true);
  }

  async function addSale() {
    const product = products.find((item) => item.id === form.productId);
    if (!product) return;
    const amount = Number(form.amount);
    const quantity = Number(form.quantity);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(quantity) || quantity <= 0 || !form.soldAt) return;
    setSaving(true);
    setSyncError('');
    try {
      const payload = { soldAt: new Date(`${form.soldAt}T12:00:00`).toISOString(), productId: product.id, productName: product.name, amount, quantity, channel: form.channel, payment: form.payment, note: form.note.trim() || undefined };
      const saved = editingSale ? await updateSale({ ...payload, id: editingSale.id }) : await saveSale(payload);
      setSales((current) => editingSale ? current.map((sale) => sale.id === saved.id ? saved : sale) : [saved, ...current]);
      setShowAdd(false);
      setEditingSale(null);
    } catch {
      setSyncError('Продаж не збережено. Спробуйте ще раз після перевірки підключення до Supabase.');
    } finally {
      setSaving(false);
    }
  }

  function openNewExpense() {
    setEditingExpense(null);
    setExpenseForm({ amount: '', spentAt: today, category: 'Господарські товари', note: '' });
    setShowExpense(true);
  }

  function openExpenseEditor(expense: Expense) {
    setEditingExpense(expense);
    setExpenseForm({ amount: String(expense.amount), spentAt: expense.spentAt, category: expense.category, note: expense.note ?? '' });
    setShowExpense(true);
  }

  async function addExpense() {
    const amount = Number(expenseForm.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !expenseForm.category.trim() || !expenseForm.spentAt) return;
    setSaving(true);
    setSyncError('');
    try {
      const payload = { spentAt: expenseForm.spentAt, category: expenseForm.category.trim(), amount, note: expenseForm.note.trim() || undefined };
      const saved = editingExpense ? await updateExpense({ ...payload, id: editingExpense.id }) : await saveExpense(payload);
      setExpenses((current) => editingExpense ? current.map((expense) => expense.id === saved.id ? saved : expense) : [saved, ...current]);
      setShowExpense(false);
      setEditingExpense(null);
    } catch {
      setSyncError('Витрату не збережено. Спробуйте ще раз після перевірки підключення до Supabase.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSale(sale: Sale) {
    if (!window.confirm(`Видалити продаж «${sale.productName}»?`)) return;
    try {
      await removeSale(sale.id);
      setSales((current) => current.filter((item) => item.id !== sale.id));
    } catch { setSyncError('Не вдалося видалити продаж.'); }
  }

  async function deleteExpense(expense: Expense) {
    if (!window.confirm(`Видалити витрату «${expense.category}»?`)) return;
    try {
      await removeExpense(expense.id);
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
    } catch { setSyncError('Не вдалося видалити витрату.'); }
  }

  async function addPurchase() {
    const material = materials.find((item) => item.id === purchaseForm.materialId);
    const quantity = Number(purchaseForm.quantity); const unitPrice = Number(purchaseForm.unitPrice);
    if (!material || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return;
    const stockQuantity = material.unit === purchaseForm.unit ? quantity : material.unit === 'г' && purchaseForm.unit === 'кг' ? quantity * 1000 : material.unit === 'кг' && purchaseForm.unit === 'г' ? quantity / 1000 : quantity;
    setSaving(true); setSyncError('');
    try {
      const saved = await savePurchase({ materialId: material.id, supplierName: purchaseForm.supplierName.trim() || undefined, quantity, unit: purchaseForm.unit, unitPrice, purchasedAt: purchaseForm.purchasedAt, payment: purchaseForm.payment, note: purchaseForm.note.trim() || undefined }, material, stockQuantity);
      setPurchases((current) => [saved.purchase, ...current]);
      setMaterials((current) => current.map((item) => item.id === saved.material.id ? saved.material : item));
      const supplierName = purchaseForm.supplierName.trim();
      if (supplierName && !partners.some((partner) => partner.name.trim().toLocaleLowerCase() === supplierName.toLocaleLowerCase())) {
        const partner = await savePartner({ name: supplierName });
        setPartners((current) => [...current, partner]);
      }
      setShowPurchase(false);
    } catch { setSyncError('Закупку не збережено.'); } finally { setSaving(false); }
  }

  async function addMaterial() {
    const stock = Number(materialForm.stock); const minStock = Number(materialForm.minStock); const averageCost = Number(materialForm.averageCost);
    if (!materialForm.name.trim() || !materialForm.unit.trim() || ![stock, minStock, averageCost].every(Number.isFinite) || stock < 0 || minStock < 0 || averageCost < 0) return;
    setSaving(true);
    try { const payload = { name: materialForm.name.trim(), unit: materialForm.unit.trim(), stock, minStock, averageCost }; const saved = editingMaterial ? await updateMaterial({ ...payload, id: editingMaterial.id }) : await saveMaterial(payload); setMaterials((current) => editingMaterial ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); setMaterialForm({ name: '', unit: 'шт.', stock: '', minStock: '', averageCost: '' }); setEditingMaterial(null); setShowMaterial(false); } catch { setSyncError('Матеріал не збережено.'); } finally { setSaving(false); }
  }

  function openMaterialEditor(material: Material) {
    setEditingMaterial(material);
    setMaterialForm({ name: material.name, unit: material.unit, stock: String(material.stock), minStock: String(material.minStock), averageCost: String(material.averageCost) });
    setShowMaterial(true);
  }

  async function deleteMaterial(material: Material) {
    if (!window.confirm(`Видалити матеріал «${material.name}»?`)) return;
    try { await removeMaterial(material.id); setMaterials((current) => current.filter((item) => item.id !== material.id)); } catch { setSyncError('Не вдалося видалити матеріал.'); }
  }

  async function addPartner() {
    if (!partnerForm.name.trim()) return;
    setSaving(true);
    try { const payload = { name: partnerForm.name.trim(), website: partnerForm.website.trim() || undefined, instagram: partnerForm.instagram.trim() || undefined, phone: partnerForm.phone.trim() || undefined, note: partnerForm.note.trim() || undefined }; const saved = editingPartner ? await updatePartner({ ...payload, id: editingPartner.id }) : await savePartner(payload); setPartners((current) => editingPartner ? current.map((partner) => partner.id === saved.id ? saved : partner) : [...current, saved]); setPartnerForm({ name: '', website: '', instagram: '', phone: '', note: '' }); setEditingPartner(null); setShowPartner(false); } catch { setSyncError('Партнера не збережено.'); } finally { setSaving(false); }
  }

  function openPartnerEditor(partner: Partner) {
    setEditingPartner(partner);
    setPartnerForm({ name: partner.name, website: partner.website ?? '', instagram: partner.instagram ?? '', phone: partner.phone ?? '', note: partner.note ?? '' });
    setShowPartner(true);
  }

  async function deletePartner(partner: Partner) {
    if (!window.confirm(`Видалити постачальника «${partner.name}»?`)) return;
    try { await removePartner(partner.id); setPartners((current) => current.filter((item) => item.id !== partner.id)); } catch { setSyncError('Не вдалося видалити постачальника.'); }
  }

  async function addRecipe() {
    const yieldQuantity = Number(recipeForm.yieldQuantity);
    const items = recipeForm.items.map((item) => ({ materialId: item.materialId, quantity: Number(item.quantity) })).filter((item) => item.materialId && Number.isFinite(item.quantity) && item.quantity > 0);
    if (!recipeForm.name.trim() || !Number.isFinite(yieldQuantity) || yieldQuantity <= 0 || !items.length) return;
    setSaving(true);
    try {
      const saved = await saveRecipe({ name: recipeForm.name.trim(), productId: recipeForm.productId || undefined, version: recipeForm.version.trim() || '1.0', yieldQuantity, instructions: recipeForm.instructions.trim() || undefined, items });
      setRecipes((current) => [saved, ...current]); setShowRecipe(false); setRecipeForm({ name: '', productId: '', version: '1.0', yieldQuantity: '1', instructions: '', items: [{ materialId: '', quantity: '' }] });
    } catch { setSyncError('Рецепт не збережено.'); } finally { setSaving(false); }
  }

  async function addBatch() {
    const recipe = recipes.find((item) => item.id === batchForm.recipeId); const quantity = Number(batchForm.quantity);
    if (!recipe || !Number.isFinite(quantity) || quantity <= 0) return;
    setSaving(true);
    try { const saved = await saveProductionBatch({ recipeId: recipe.id, quantity, producedAt: batchForm.producedAt, unitCost: recipeUnitCost(recipe, materials), note: batchForm.note.trim() || undefined }, recipe, materials); setBatches((current) => [saved.batch, ...current]); setMaterials(saved.materials); setShowBatch(false); } catch { setSyncError('Batch не збережено: перевірте, чи достатньо матеріалів.'); } finally { setSaving(false); }
  }

  async function addProduct() {
    const price = Number(productForm.price);
    if (!productForm.name.trim() || !Number.isFinite(price) || price < 0) return;
    setSaving(true);
    setSyncError('');
    try {
      const waxMin = productForm.waxMin ? Number(productForm.waxMin) : undefined; const waxMax = productForm.waxMax ? Number(productForm.waxMax) : undefined;
      const created = editingProduct ? await updateProduct({ id: editingProduct.id, name: productForm.name.trim(), price, category: productForm.category, active: editingProduct.active, waxMinGrams: waxMin, waxMaxGrams: waxMax }) : await saveProduct({ name: productForm.name.trim(), price, category: productForm.category, active: true, waxMinGrams: waxMin, waxMaxGrams: waxMax });
      setProducts((current) => editingProduct ? current.map((product) => product.id === created.id ? created : product) : [created, ...current]);
      setForm((current) => ({ ...current, productId: created.id, amount: String(created.price) }));
      setProductForm({ name: '', price: '', category: 'wood', waxMin: '', waxMax: '' });
      setShowProduct(false);
      setEditingProduct(null);
      if (!editingProduct) setShowAdd(true);
    } catch {
      setSyncError('Продукт не збережено. Спробуйте ще раз після перевірки підключення до Supabase.');
    } finally {
      setSaving(false);
    }
  }

  function openProductEditor(product: Product) {
    setEditingProduct(product);
    setProductForm({ name: product.name, price: String(product.price), category: product.category, waxMin: product.waxMinGrams == null ? '' : String(product.waxMinGrams), waxMax: product.waxMaxGrams == null ? '' : String(product.waxMaxGrams) });
    setShowProduct(true);
  }

  async function toggleProduct(product: Product) {
    try {
      const saved = await updateProduct({ ...product, active: !product.active });
      setProducts((current) => current.map((item) => item.id === saved.id ? saved : item));
    } catch { setSyncError('Не вдалося оновити статус продукту.'); }
  }

  async function deleteProduct(product: Product) {
    if (sales.some((sale) => sale.productId === product.id)) { setSyncError('Цей продукт уже є в продажах. Архівуйте його, щоб зберегти історію.'); return; }
    if (!window.confirm(`Видалити продукт «${product.name}»?`)) return;
    try { await removeProduct(product.id); setProducts((current) => current.filter((item) => item.id !== product.id)); } catch { setSyncError('Не вдалося видалити продукт.'); }
  }

  function openGoalSettings() {
    setGoalDraft(String(monthlyGoal));
    setShowGoalSettings(true);
  }

  function saveMonthlyGoal() {
    const value = Number(goalDraft);
    if (!Number.isFinite(value) || value <= 0) return;
    const nextGoals = { ...monthlyGoals, [monthKey]: value };
    setMonthlyGoals(nextGoals);
    window.localStorage.setItem('kora-studio:monthly-goals', JSON.stringify(nextGoals));
    setShowGoalSettings(false);
  }

  function handleTabSwipeEnd(touchX: number) {
    if (touchStartX == null) return;
    const distance = touchX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(distance) < 60) return;
    const tabs: Array<typeof tab> = ['home', 'sales', 'expenses', 'analysis', 'more'];
    const current = tabs.indexOf(tab);
    const next = distance < 0 ? current + 1 : current - 1;
    if (next >= 0 && next < tabs.length) setTab(tabs[next]);
  }

  return (
    <main className="app-shell" data-theme={dark ? 'dark' : 'light'}>
      <header className="topbar">
        <div><div className="eyebrow">Digital Atelier</div><div className="brand">KORA STUDIO</div></div>
        <button className="icon-btn" onClick={() => setDark((value) => !value)} aria-label="Змінити тему">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>

      <section className="content" onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => handleTabSwipeEnd(event.changedTouches[0]?.clientX ?? 0)}>
        <div className={'data-status ' + dataSource}>{dataSource === 'supabase' ? 'Синхронізація з Supabase' : 'Демо-дані · лише цей пристрій'}</div>
        {syncError && <div className="sync-error" role="alert">{syncError}</div>}
        {tab === 'home' && <>
          <div className="hero">
            <div className="hero-top"><div><div className="eyebrow">{monthLabel} · виручка</div><div className="hero-value">{money(monthRevenue)}</div></div><div className="atelier-orbit" style={{ background: `conic-gradient(var(--accent) ${monthlyProgress}%, rgba(255,255,255,.16) ${monthlyProgress}% 100%)` }}><div className="atelier-orbit-inner"><span className="orbit-flame">♨</span><b>{monthlyProgress}%</b></div></div></div>
            <div className="hero-note">{monthSales.length ? `${monthSales.length} продажів цього місяця` : 'Перша іскра: додайте перший продаж'}</div>
            <div className="hero-progress"><button className="goal-edit" onClick={openGoalSettings}>Ціль {money(monthlyGoal)} <Pencil size={11} /></button><span>{money(Math.max(monthlyGoal - monthRevenue, 0))} до цілі</span></div>
          </div>
          <div className={'profit-dashboard ' + (net >= 0 ? 'positive' : 'negative')}><div><div className="eyebrow">{net >= 0 ? '😊' : '😔'} Чистий результат · місяць</div><strong>{net >= 0 ? '+' : ''}{money(net)}</strong><span>{net >= 0 ? 'Після всіх витрат і закупок' : 'Витрати та закупки перевищили виручку'}</span></div><div className="profit-breakdown"><div><small>Виручка</small><b>{money(monthRevenue)}</b></div><div><small>Усі витрати</small><b>{money(monthSpendTotal)}</b></div></div></div>
          <div className="atelier-actions" aria-label="Швидкі дії">
            <button className="atelier-action sale" onClick={openNewSale}><span>🕯</span><b>Продаж</b><small>зафіксувати</small></button>
            <button className="atelier-action expense" onClick={openNewExpense}><span>🌿</span><b>Витрата</b><small>додати суму</small></button>
            <button className="atelier-action purchase" onClick={() => setShowPurchase(true)}><span>🛒</span><b>Закупка</b><small>поповнити склад</small></button>
          </div>
          <div className="section today-section"><div className="section-head"><div><div className="section-title">Сьогодні</div><div className="eyebrow">{todaySales.length} продажів · {money(todayRevenue)}</div></div><button className="text-action" onClick={() => setTodaySalesOpen((value) => !value)}>{todaySalesOpen ? 'Згорнути' : 'Розгорнути'}</button></div><div className="today-overview"><span>🕯</span><div><b>{todaySales.length} продажів</b><small>на суму {money(todayRevenue)}</small></div></div>{todaySalesOpen && <div className="card list today-sales-list">{todaySales.length ? todaySales.map((sale) => <div className="row" key={sale.id}><div><b>{sale.productName}</b><div className="eyebrow">× {sale.quantity} · {channelLabels[sale.channel]}</div></div><b>{money(sale.amount)}</b></div>) : <span className="eyebrow">Сьогодні продажів ще немає</span>}</div>}</div>
          <div className="section"><div className="section-title" style={{ marginBottom: 10 }}>Підготовка до сезону</div><div className="season-card"><div className="insight"><span className="season-icon">{seasonalReminder.icon}</span><div><b>{seasonalReminder.title}</b><span> {seasonalReminder.note}</span></div></div><div className="season-ideas">{seasonalReminder.ideas.map((idea) => <span key={idea}>✦ {idea}</span>)}</div></div></div>
        </>}

        {tab === 'sales' && <>
          <div className="page-heading"><div><div className="eyebrow">{monthLabel}</div><h1>Продажі</h1></div></div>
          <button className="sales-hero" onClick={openNewSale}><div><div className="eyebrow">Виручка · місяць</div><strong>{money(monthRevenue)}</strong><span>{monthSales.length ? `${monthSales.length} продажів · натисніть, щоб додати ще` : 'Натисніть, щоб додати перший продаж'}</span></div><div className="sales-orbit"><div><span>＋</span><small>продаж</small></div></div></button>
          <div className="sales-dashboard"><button className="sales-metric" onClick={openNewSale}><span>🕯 Продажі</span><b>{monthSales.length}</b><small>натисніть, щоб додати</small></button><div className="sales-metric"><span>🧾 Середній чек</span><b>{money(averageCheck)}</b><small>за {monthLabel}</small></div></div>
          <div className="section sales-section"><div className="section-head"><div><div className="section-title">Продажі за місяцями</div><div className="eyebrow">останні 6 місяців</div></div><span className="pill">динаміка</span></div><div className="card monthly-sales-chart">{monthlySalesTrend.map((month) => <div className="month-column" key={month.label}><div className="month-value">{money(month.value)}</div><div className="month-track"><span style={{ height: `${Math.max(7, (month.value / Math.max(...monthlySalesTrend.map((item) => item.value), 1)) * 100)}%` }} /></div><b>{month.label}</b><small>{month.count} продажів</small></div>)}</div></div>
          <div className="section sales-section"><div className="section-head"><div><div className="section-title">Що продається</div><div className="eyebrow">частка виручки</div></div><button className="text-action" onClick={() => setSalesStatsOpen((value) => !value)}>{salesStatsOpen ? 'Згорнути' : 'Розгорнути'}</button></div>{salesStatsOpen && <div className="card sales-performance">{productMix.length ? productMix.map(([name, amount], index) => { const percent = Math.round((amount / Math.max(monthRevenue, 1)) * 100); return <div className="sales-product" key={name}><span className={`sales-rank rank-${index}`}>{index + 1}</span><div><div className="row"><b>{name}</b><b>{percent}%</b></div><div className="mini-bar"><span style={{ width: `${percent}%` }} /></div><small>{money(amount)}</small></div></div>; }) : <span className="eyebrow">Після першого продажу тут з’явиться рейтинг продуктів.</span>}</div>}</div>
          <div className="section sales-section"><div className="section-title" style={{ marginBottom: 10 }}>На що дивитися</div><div className="sales-signals"><div className="card signal-card"><span>🌿</span><div><b>{bestProduct ? `${bestProduct[0]} — лідер` : 'Лідер продажів з’явиться тут'}</b><small>{bestProduct ? `${Math.round((bestProduct[1] / Math.max(monthRevenue, 1)) * 100)}% виручки цього місяця` : 'Додайте перший продаж для висновку.'}</small></div></div><div className="card signal-card"><span>📍</span><div><b>{bestChannel ? `${channelLabels[bestChannel[0] as SalesChannel]} — найкращий канал` : 'Канал продажів ще не визначився'}</b><small>{bestChannel ? `${money(bestChannel[1])} виручки за місяць` : 'Система порівняє канали після продажів.'}</small></div></div><div className="card signal-card"><span>🔎</span><div><b>{unsoldProducts ? `${Math.min(unsoldProducts, 10)} продуктів без продажів` : 'Усі активні продукти вже продалися'}</b><small>{unsoldProducts ? 'Перегляньте їхню ціну, фото або спосіб просування.' : 'Гарний знак — перевіряйте темп продажів далі.'}</small></div></div></div></div>
          <div className="section sales-section"><div className="section-head"><div><div className="section-title">Усі продажі</div><div className="eyebrow">{sales.length} записів</div></div><button className="text-action" onClick={() => setSalesListOpen((value) => !value)}>{salesListOpen ? 'Згорнути' : 'Розгорнути'}</button></div>{salesListOpen && <div className="list">{sales.length ? sales.map((sale) => <div className="card sale-card" key={sale.id}><div className="row"><div><b>{sale.productName}</b><div className="eyebrow">{shortDate(sale.soldAt)} · {paymentLabels[sale.payment]}</div></div><b>{money(sale.amount)}</b></div><div className="sale-meta"><span className="pill">{channelLabels[sale.channel]}</span><span className="eyebrow">× {sale.quantity}</span><div className="row-actions"><button onClick={() => openSaleEditor(sale)} aria-label="Редагувати продаж"><Pencil size={14}/></button><button onClick={() => deleteSale(sale)} aria-label="Видалити продаж"><Trash2 size={14}/></button></div></div>{sale.note && <div className="sale-note">{sale.note}</div>}</div>) : <div className="card"><span className="eyebrow">Ще немає продажів</span></div>}</div>}</div>
        </>}

        {tab === 'analysis' && <>
          <div className="page-heading"><div><div className="eyebrow">Фінанси KORA</div><h1>Аналіз</h1></div></div>
          <div className="period-picker" role="group" aria-label="Період аналізу">{([['day', 'День'], ['week', 'Тиждень'], ['month', 'Місяць'], ['year', 'Рік'], ['custom', 'Свій']] as const).map(([value, label]) => <button key={value} className={analysisPeriod === value ? 'active' : ''} onClick={() => setAnalysisPeriod(value)}>{label}</button>)}</div>
          {analysisPeriod === 'custom' && <div className="custom-period"><label>З <input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} /></label><label>По <input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} /></label></div>}
          <div className="analysis-summary"><div><span>Період</span><b>{analysisBounds.from === analysisBounds.to ? shortDate(analysisBounds.from) : `${shortDate(analysisBounds.from)} — ${shortDate(analysisBounds.to)}`}</b></div><div><span>Порівняння</span><b>з попереднім періодом</b></div></div>
          <div className="pl-grid">
            <button className="pl-card revenue" onClick={() => setActiveMetricHelp('revenue')}><span>🕯 Продажі <i>ⓘ</i></span><b>{money(analysisStatement.revenue)}</b><small>{analysisChange(analysisStatement.revenue, previousAnalysisStatement.revenue)}</small></button>
            <button className="pl-card cost" onClick={() => setActiveMetricHelp('cogs')}><span>🧪 Собівартість <i>ⓘ</i></span><b>{money(analysisStatement.cogs)}</b><small>{analysisChange(analysisStatement.cogs, previousAnalysisStatement.cogs)}</small></button>
            <button className="pl-card gross" onClick={() => setActiveMetricHelp('gross')}><span>✨ Валовий прибуток <i>ⓘ</i></span><b>{money(analysisStatement.gross)}</b><small>{analysisChange(analysisStatement.gross, previousAnalysisStatement.gross)}</small></button>
            <button className="pl-card operating" onClick={() => setActiveMetricHelp('operating')}><span>🏠 Операційні витрати <i>ⓘ</i></span><b>{money(analysisStatement.operating)}</b><small>{analysisChange(analysisStatement.operating, previousAnalysisStatement.operating)}</small></button>
            <button className="pl-card taxes" onClick={() => setActiveMetricHelp('taxes')}><span>🧾 Податки й комісії <i>ⓘ</i></span><b>{money(analysisStatement.taxesAndCommissions)}</b><small>{analysisChange(analysisStatement.taxesAndCommissions, previousAnalysisStatement.taxesAndCommissions)}</small></button>
            <button className="pl-card margin" onClick={() => setActiveMetricHelp('margin')}><span>📈 Рентабельність <i>ⓘ</i></span><b>{analysisStatement.margin.toFixed(1)}%</b><small>{analysisChange(analysisStatement.margin, previousAnalysisStatement.margin)}</small></button>
            <button className={'pl-card net ' + (analysisStatement.netProfit >= 0 ? 'positive' : 'negative')} onClick={() => setActiveMetricHelp('net')}><span>{analysisStatement.netProfit >= 0 ? '😊' : '😔'} Чистий прибуток <i>ⓘ</i></span><b>{analysisStatement.netProfit >= 0 ? '+' : ''}{money(analysisStatement.netProfit)}</b><small>{analysisChange(analysisStatement.netProfit, previousAnalysisStatement.netProfit)}</small></button>
          </div>
          <div className="analysis-note">Собівартість рахується за рецептом і цінами матеріалів для проданого товару. Додайте рецепт продукту, щоб врахувати його в собівартості.</div>
          <div className="section analysis-section"><div className="section-head"><div><div className="section-title">Динаміка по місяцях</div><div className="eyebrow">Продажі · витрати · чистий прибуток</div></div><span className="pill">6 місяців</span></div><div className="financial-chart">{financialTrend.map((month) => { const costs = month.cogs + month.operating + month.taxesAndCommissions; const max = Math.max(...financialTrend.map((item) => Math.max(item.revenue, item.cogs + item.operating + item.taxesAndCommissions, Math.abs(item.netProfit))), 1); return <div className="financial-month" key={month.label}><div className="financial-bars"><span className="bar-revenue" style={{ height: `${Math.max(5, month.revenue / max * 100)}%` }} /><span className="bar-costs" style={{ height: `${Math.max(5, costs / max * 100)}%` }} /><span className={month.netProfit >= 0 ? 'bar-profit' : 'bar-loss'} style={{ height: `${Math.max(5, Math.abs(month.netProfit) / max * 100)}%` }} /></div><b>{month.label}</b><small>{money(month.revenue)}</small></div>; })}</div><div className="chart-legend"><span><i className="bar-revenue" />Продажі</span><span><i className="bar-costs" />Витрати</span><span><i className="bar-profit" />Чистий прибуток</span></div></div>
          <div className="section analysis-section"><div className="section-title" style={{ marginBottom: 10 }}>Канали продажів</div><div className="card list">{(['instagram', 'website', 'friends', 'event', 'partner', 'other'] as SalesChannel[]).map((channel) => { const value = sales.filter((sale) => sale.soldAt.slice(0, 10) >= analysisBounds.from && sale.soldAt.slice(0, 10) <= analysisBounds.to && sale.channel === channel).reduce((total, sale) => total + sale.amount, 0); const pct = analysisStatement.revenue ? Math.round((value / analysisStatement.revenue) * 100) : 0; return <div key={channel}><div className="row"><span>{channelLabels[channel]}</span><b>{pct}%</b></div><div className="mini-bar"><span style={{ width: `${pct}%` }} /></div></div>; })}</div></div>
        </>}

        {tab === 'expenses' && <>
          <div className="page-heading"><div><div className="eyebrow">{monthLabel}</div><h1>Витрати</h1></div></div>
          <div className="spend-hero"><div><div className="eyebrow">Всього витрачено · місяць</div><strong>{money(monthSpendTotal)}</strong><span>{monthPurchases.length + expenses.filter((expense) => expense.spentAt.startsWith(monthKey)).length} операцій</span></div><div className="spend-orbit" style={{ background: spendDonut }}><div><b>{monthSpendTotal ? '100%' : '—'}</b><small>витрати</small></div></div></div>
          <div className="spend-dashboard"><button className="spend-metric expense" onClick={openNewExpense}><span>💸 Витрати</span><b>{money(monthExpenses)}</b><small>{monthSpendTotal ? `${Math.round((monthExpenses / monthSpendTotal) * 100)}% від усіх витрат` : 'Натисніть, щоб додати витрату'}</small></button><button className="spend-metric purchase" onClick={() => setShowPurchase(true)}><span>🛒 Закупки</span><b>{money(monthPurchasesTotal)}</b><small>{monthSpendTotal ? `${Math.round((monthPurchasesTotal / monthSpendTotal) * 100)}% від усіх витрат` : 'Натисніть, щоб додати закупку'}</small></button></div>
          <div className="section spend-section"><div className="section-head"><div><div className="section-title">Куди пішли кошти</div><div className="eyebrow">частка за місяць</div></div><button className="text-action" onClick={() => setSpendMixOpen((value) => !value)}>{spendMixOpen ? 'Згорнути' : 'Розгорнути'}</button></div>{spendMixOpen && <div className="card spend-mix">{spendBreakdown.length ? spendBreakdown.map(([name, amount], index) => { const percent = Math.round((amount / Math.max(monthSpendTotal, 1)) * 100); return <div className="spend-row" key={name}><span className={`spend-dot dot-${index}`} /><div className="spend-name"><div className="row"><b>{name}</b><b>{percent}%</b></div><div className="mini-bar"><span style={{ width: `${percent}%` }} /></div><small>{money(amount)}</small></div></div>; }) : <span className="eyebrow">Додайте першу витрату або закупку — тут з’явиться структура.</span>}</div>}</div>
          <div className="section spend-section"><div className="section-head"><div><div className="section-title">Всі витрати</div><div className="eyebrow">{expenses.length} записів</div></div><div><button className="text-action" onClick={() => setExpensesListOpen((value) => !value)}>{expensesListOpen ? 'Згорнути' : 'Розгорнути'}</button><button className="text-action" onClick={openNewExpense}>＋ Додати</button></div></div>{expensesListOpen && <div className="list">{expenses.length ? expenses.map((expense) => <div className="card sale-card" key={expense.id}><div className="row"><div><b>{expense.category}</b><div className="eyebrow">{shortDate(expense.spentAt)}{expense.note ? ` · ${expense.note}` : ''}</div></div><b>{money(expense.amount)}</b></div><div className="sale-meta"><span className="pill">Операційна витрата</span><div className="row-actions"><button onClick={() => openExpenseEditor(expense)} aria-label="Редагувати витрату"><Pencil size={14}/></button><button onClick={() => deleteExpense(expense)} aria-label="Видалити витрату"><Trash2 size={14}/></button></div></div></div>) : <div className="card"><span className="eyebrow">Ще немає витрат</span></div>}</div>}</div>
          <div className="section spend-section"><div className="section-head"><div><div className="section-title">Всі закупки</div><div className="eyebrow">{purchases.length} записів</div></div><div><button className="text-action" onClick={() => setPurchasesListOpen((value) => !value)}>{purchasesListOpen ? 'Згорнути' : 'Розгорнути'}</button><button className="text-action" onClick={() => setShowPurchase(true)}>＋ Закупка</button></div></div>{purchasesListOpen && <div className="list">{purchases.length ? purchases.map((purchase) => { const material = materials.find((item) => item.id === purchase.materialId); return <div className="card sale-card" key={purchase.id}><div className="row"><div><b>{material?.name ?? 'Матеріал'}</b><div className="eyebrow">{shortDate(purchase.purchasedAt)} · {purchase.supplierName || 'Постачальник не вказаний'} · {purchase.quantity} {purchase.unit || material?.unit || ''}</div></div><b>{money(purchase.total)}</b></div><div className="sale-meta"><span className="pill">Закупка для складу</span><span className="eyebrow">{money(purchase.unitPrice)} / {purchase.unit || material?.unit || 'од.'}</span></div></div>; }) : <div className="card"><span className="eyebrow">Ще немає закупок</span></div>}</div>}</div>
        </>}

        {tab === 'more' && <>
          <div className="page-heading"><div><div className="eyebrow">Бібліотека KORA</div><h1>Ще</h1></div><Boxes size={22} /></div>
          <div className="section directory-section"><div className="section-head"><div><div className="section-title">Каталог</div><div className="eyebrow">{products.length} продуктів</div></div><div><button className="text-action" onClick={() => setCatalogOpen((value) => !value)}>{catalogOpen ? 'Згорнути' : 'Розгорнути'}</button><button className="text-action" onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', category: 'wood', waxMin: '', waxMax: '' }); setShowProduct(true); }}>＋ Додати</button></div></div>{catalogOpen && <div className="directory-list">{products.map((product) => <div className="card sale-card" key={product.id}><div className="row"><div><b>{product.name}</b><div className="eyebrow">{product.waxMinGrams ? `${product.waxMinGrams}${product.waxMaxGrams && product.waxMaxGrams !== product.waxMinGrams ? `–${product.waxMaxGrams}` : ''} г воску · ` : ''}{product.active ? 'Активний' : 'Архівований'}</div></div><b>{money(product.price)}</b></div><div className="sale-meta"><button className="pill toggle-pill" onClick={() => toggleProduct(product)}>{product.active ? 'Архівувати' : 'Повернути'}</button><div className="row-actions"><button onClick={() => openProductEditor(product)} aria-label="Редагувати продукт"><Pencil size={14}/></button><button onClick={() => deleteProduct(product)} aria-label="Видалити продукт"><Trash2 size={14}/></button></div></div></div>)}</div>}</div>
          <div className="section directory-section"><div className="section-head"><div><div className="section-title">Склад</div><div className="eyebrow">Інвентаризація та залишки</div></div><div><button className="text-action" onClick={() => setInventoryOpen((value) => !value)}>{inventoryOpen ? 'Згорнути' : 'Розгорнути'}</button><button className="text-action" onClick={() => { setEditingMaterial(null); setMaterialForm({ name: '', unit: 'шт.', stock: '', minStock: '', averageCost: '' }); setShowMaterial(true); }}>＋ Матеріал</button></div></div>{inventoryOpen && <div className="directory-list">{materials.map((material) => <div className="card sale-card" key={material.id}><div className="row"><div><b>{material.name}</b><div className="eyebrow">середня ціна {money(material.averageCost)} / {material.unit}</div></div><b className={material.stock <= material.minStock ? 'warning' : ''}>{material.stock} {material.unit}</b></div><div className="sale-meta"><span className="pill">Фактичний залишок</span><div className="row-actions"><button onClick={() => openMaterialEditor(material)} aria-label="Інвентаризація матеріалу"><Pencil size={14}/></button><button onClick={() => deleteMaterial(material)} aria-label="Видалити матеріал"><Trash2 size={14}/></button></div></div></div>)}</div>}</div>
          <div className="section directory-section"><div className="section-head"><div><div className="section-title">Виробництво</div><div className="eyebrow">Незабаром</div></div><button className="text-action" onClick={() => setProductionOpen((value) => !value)}>{productionOpen ? 'Згорнути' : 'Розгорнути'}</button></div>{productionOpen && <div className="card"><b>Виробництво готується</b><div className="eyebrow" style={{ marginTop: 6 }}>Тут з’являться рецепти, партії та автоматичне списання матеріалів.</div></div>}</div>
          <div className="section directory-section"><div className="section-head"><div><div className="section-title">Партнери</div><div className="eyebrow">{partners.length} постачальників</div></div><div><button className="text-action" onClick={() => setPartnersOpen((value) => !value)}>{partnersOpen ? 'Згорнути' : 'Розгорнути'}</button><button className="text-action" onClick={() => { setEditingPartner(null); setPartnerForm({ name: '', website: '', instagram: '', phone: '', note: '' }); setShowPartner(true); }}>＋ Додати</button></div></div>{partnersOpen && <div className="directory-list">{partners.length ? partners.map((partner) => <div className="card sale-card" key={partner.id}><div className="row"><button className="directory-link" onClick={() => openPartnerEditor(partner)}><b>{partner.name}</b><div className="eyebrow">{partner.note || partner.instagram || partner.website || partner.phone || 'Відкрити та додати коментар'}</div></button><span className="pill">Постачальник</span></div><div className="sale-meta"><span className="eyebrow">Відкрити картку для коментаря</span><div className="row-actions"><button onClick={() => openPartnerEditor(partner)} aria-label="Редагувати партнера"><Pencil size={14}/></button><button onClick={() => deletePartner(partner)} aria-label="Видалити партнера"><Trash2 size={14}/></button></div></div></div>) : <div className="card"><span className="eyebrow">Постачальник з’явиться тут автоматично після першої закупки.</span></div>}</div>}</div>
          <div className="section"><div className="section-head"><div className="section-title">Останні закупки</div><button className="text-action" onClick={() => setShowPurchase(true)}>＋ Закупка</button></div><div className="card list">{purchases.length ? purchases.map((purchase) => { const material = materials.find((item) => item.id === purchase.materialId); const partner = partners.find((item) => item.id === purchase.partnerId); return <div className="row" key={purchase.id}><div><b>{material?.name ?? 'Матеріал'}</b><div className="eyebrow">{shortDate(purchase.purchasedAt)} · {purchase.supplierName || partner?.name || 'Без постачальника'} · {purchase.quantity} {purchase.unit || material?.unit || ''}</div></div><b>{money(purchase.total)}</b></div>; }) : <span className="eyebrow">Ще немає закупок</span>}</div></div>
        </>}
      </section>

      {activeMetricHelp && <div className="modal-backdrop" onClick={() => setActiveMetricHelp(null)}><div className="modal metric-help-modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Фінансовий показник</div><div className="section-title">{financialMetricHelp[activeMetricHelp].title}</div></div><button className="icon-btn" onClick={() => setActiveMetricHelp(null)} aria-label="Закрити"><X size={18} /></button></div><p>{financialMetricHelp[activeMetricHelp].text}</p><div className="metric-formula"><span>Як рахується</span><b>{financialMetricHelp[activeMetricHelp].formula}</b></div></div></div>}
      {showGoalSettings && <div className="modal-backdrop" onClick={() => setShowGoalSettings(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Головна · {monthLabel}</div><div className="section-title">🎯 Місячна ціль</div></div><button className="icon-btn" onClick={() => setShowGoalSettings(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form"><div className="field"><label>Ціль виручки, ₴</label><input value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} inputMode="decimal" placeholder="100000" /></div><div className="goal-help">Ціль використовується у зеленому дашборді та зберігається для цього місяця.</div><button className="primary" onClick={saveMonthlyGoal}>Зберегти ціль</button></div></div></div>}

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Швидкий запис</div><div className="section-title">{editingSale ? 'Редагувати продаж' : '＋ Новий продаж'}</div></div><button className="icon-btn" onClick={() => setShowAdd(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        {selectableProducts.length ? <div className="field"><label>Продукт</label><button className="catalog-picker" onClick={() => setShowCatalog(true)}>{products.find((product) => product.id === form.productId)?.name ?? 'Оберіть товар'}<ChevronRight size={16}/></button></div> : <div className="empty-form"><b>Спочатку додайте продукт</b><span>Він стане доступним для вибору в продажі.</span><button className="text-action" onClick={() => { setShowAdd(false); setShowProduct(true); }}>＋ Створити продукт</button></div>}
        <div className="field"><label>Дата продажу</label><input type="date" value={form.soldAt} onChange={(e) => setForm((value) => ({ ...value, soldAt: e.target.value }))} /></div>
        <div className="field"><label>Ціна за одиницю, ₴</label><input value={form.unitPrice} onChange={(e) => setSaleUnitPrice(e.target.value)} inputMode="decimal" /></div>
        <div className="field"><label>Кількість</label><input value={form.quantity} onChange={(e) => setSaleQuantity(e.target.value)} inputMode="decimal" /></div>
        <div className="field"><label>Сума продажу, ₴</label><input value={form.amount} readOnly inputMode="decimal" /></div>
        <div className="field"><label>Канал продажу</label><select value={form.channel} onChange={(e) => setForm((value) => ({ ...value, channel: e.target.value as SalesChannel }))}>{Object.entries(channelLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        <div className="field"><label>Оплата</label><select value={form.payment} onChange={(e) => setForm((value) => ({ ...value, payment: e.target.value as PaymentMethod }))}>{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        <div className="field"><label>{products.find((product) => product.id === form.productId)?.category === 'box' ? 'Наповнення боксу' : 'Нотатка'}</label><input value={form.note} onChange={(e) => setForm((value) => ({ ...value, note: e.target.value }))} placeholder={products.find((product) => product.id === form.productId)?.category === 'box' ? 'Наприклад: віск, аромат, гніт, форма, інструкція' : 'Необов’язково'} /></div>
        <button className="primary" onClick={addSale} disabled={saving || !selectableProducts.length}>{saving ? 'Зберігаємо…' : editingSale ? 'Зберегти зміни' : 'Зберегти продаж'}</button>
      </div></div></div>}

      {showExpense && <div className="modal-backdrop" onClick={() => setShowExpense(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Гроші</div><div className="section-title">{editingExpense ? 'Редагувати витрату' : '＋ Нова витрата'}</div></div><button className="icon-btn" onClick={() => setShowExpense(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        <div className="field"><label>Дата витрати</label><input type="date" value={expenseForm.spentAt} onChange={(e) => setExpenseForm((value) => ({ ...value, spentAt: e.target.value }))} /></div>
        <div className="field"><label>Категорія</label><select value={expenseForm.category} onChange={(e) => setExpenseForm((value) => ({ ...value, category: e.target.value }))}><option>Господарські товари</option><option>Оренда</option><option>Комуналка</option><option>Маркетинг</option><option>Комісії</option><option>Податки</option><option>Транспорт</option><option>Доставка</option><option>Партнери</option><option>Інше</option></select></div>
        <div className="field"><label>Сума, ₴</label><input value={expenseForm.amount} onChange={(e) => setExpenseForm((value) => ({ ...value, amount: e.target.value }))} inputMode="decimal" /></div>
        <div className="field"><label>Нотатка</label><input value={expenseForm.note} onChange={(e) => setExpenseForm((value) => ({ ...value, note: e.target.value }))} placeholder="Наприклад, реклама за вересень" /></div>
        <button className="primary" onClick={addExpense} disabled={saving}>{saving ? 'Зберігаємо…' : editingExpense ? 'Зберегти зміни' : 'Зберегти витрату'}</button>
      </div></div></div>}

      {showPurchase && <div className="modal-backdrop" onClick={() => setShowPurchase(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Матеріали</div><div className="section-title">🛒 Нова закупка</div></div><button className="icon-btn" onClick={() => setShowPurchase(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        <div className="field"><label>Матеріал</label><select value={purchaseForm.materialId} onChange={(e) => { const material = materials.find((item) => item.id === e.target.value); setPurchaseForm((value) => ({ ...value, materialId: e.target.value, unit: material?.unit ?? value.unit })); }}><option value="" disabled>Оберіть матеріал</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select></div>
        <div className="field"><label>Постачальник</label><input value={purchaseForm.supplierName} onChange={(e) => setPurchaseForm((value) => ({ ...value, supplierName: e.target.value }))} placeholder="Ім’я, телефон або посилання" /></div>
        <div className="field"><label>Дата закупки</label><input type="date" value={purchaseForm.purchasedAt} onChange={(e) => setPurchaseForm((value) => ({ ...value, purchasedAt: e.target.value }))} /></div>
        <div className="field"><label>Кількість</label><input value={purchaseForm.quantity} onChange={(e) => setPurchaseForm((value) => ({ ...value, quantity: e.target.value }))} inputMode="decimal" placeholder="0" /></div>
        <div className="field"><label>Одиниця виміру</label><select value={purchaseForm.unit} onChange={(e) => setPurchaseForm((value) => ({ ...value, unit: e.target.value }))}><option>шт.</option><option>кг</option><option>г</option></select></div>
        <div className="field"><label>Ціна за одиницю, ₴</label><input value={purchaseForm.unitPrice} onChange={(e) => setPurchaseForm((value) => ({ ...value, unitPrice: e.target.value }))} inputMode="decimal" placeholder="0" /></div>
        <div className="field"><label>Оплата</label><select value={purchaseForm.payment} onChange={(e) => setPurchaseForm((value) => ({ ...value, payment: e.target.value as PaymentMethod }))}>{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        <div className="field"><label>Нотатка</label><input value={purchaseForm.note} onChange={(e) => setPurchaseForm((value) => ({ ...value, note: e.target.value }))} placeholder="Номер накладної або коментар" /></div>
        <button className="primary" onClick={addPurchase} disabled={saving || !materials.length}>{saving ? 'Зберігаємо…' : 'Зберегти закупку'}</button>
      </div></div></div>}

      {showMaterial && <div className="modal-backdrop" onClick={() => setShowMaterial(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Склад · інвентаризація</div><div className="section-title">{editingMaterial ? 'Фактичний залишок' : '＋ Новий матеріал'}</div></div><button className="icon-btn" onClick={() => setShowMaterial(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        <div className="field"><label>Назва</label><input value={materialForm.name} onChange={(e) => setMaterialForm((value) => ({ ...value, name: e.target.value }))} placeholder="Наприклад, Віск Soy" /></div>
        <div className="field"><label>Одиниця</label><select value={materialForm.unit} onChange={(e) => setMaterialForm((value) => ({ ...value, unit: e.target.value }))}><option>шт.</option><option>кг</option><option>г</option><option>л</option><option>мл</option><option>м</option></select></div>
        <div className="field"><label>{editingMaterial ? 'Фактичний залишок зараз' : 'Початковий залишок'}</label><input value={materialForm.stock} onChange={(e) => setMaterialForm((value) => ({ ...value, stock: e.target.value }))} inputMode="decimal" placeholder="0" /></div>
        <div className="field"><label>Мінімальний залишок</label><input value={materialForm.minStock} onChange={(e) => setMaterialForm((value) => ({ ...value, minStock: e.target.value }))} inputMode="decimal" placeholder="0" /></div>
        <div className="field"><label>Середня ціна за одиницю, ₴</label><input value={materialForm.averageCost} onChange={(e) => setMaterialForm((value) => ({ ...value, averageCost: e.target.value }))} inputMode="decimal" placeholder="0" /></div>
        <button className="primary" onClick={addMaterial} disabled={saving}>{saving ? 'Зберігаємо…' : editingMaterial ? 'Зберегти інвентаризацію' : 'Зберегти матеріал'}</button>
      </div></div></div>}

      {showPartner && <div className="modal-backdrop" onClick={() => setShowPartner(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Постачальники</div><div className="section-title">{editingPartner ? 'Картка постачальника' : '＋ Новий партнер'}</div></div><button className="icon-btn" onClick={() => setShowPartner(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        <div className="field"><label>Назва</label><input value={partnerForm.name} onChange={(e) => setPartnerForm((value) => ({ ...value, name: e.target.value }))} placeholder="Назва магазину або постачальника" /></div>
        <div className="field"><label>Сайт</label><input value={partnerForm.website} onChange={(e) => setPartnerForm((value) => ({ ...value, website: e.target.value }))} placeholder="https://" /></div>
        <div className="field"><label>Instagram</label><input value={partnerForm.instagram} onChange={(e) => setPartnerForm((value) => ({ ...value, instagram: e.target.value }))} placeholder="@username" /></div>
        <div className="field"><label>Телефон</label><input value={partnerForm.phone} onChange={(e) => setPartnerForm((value) => ({ ...value, phone: e.target.value }))} inputMode="tel" /></div>
        <div className="field"><label>Коментар</label><input value={partnerForm.note} onChange={(e) => setPartnerForm((value) => ({ ...value, note: e.target.value }))} placeholder="Умови, ціни, контакти або важлива примітка" /></div>
        <button className="primary" onClick={addPartner} disabled={saving}>{saving ? 'Зберігаємо…' : editingPartner ? 'Зберегти зміни' : 'Зберегти партнера'}</button>
      </div></div></div>}

      {showRecipe && <div className="modal-backdrop" onClick={() => setShowRecipe(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Виробництво</div><div className="section-title">🧪 Новий рецепт</div></div><button className="icon-btn" onClick={() => setShowRecipe(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        <div className="field"><label>Назва рецепту</label><input value={recipeForm.name} onChange={(e) => setRecipeForm((value) => ({ ...value, name: e.target.value }))} placeholder="Наприклад, Свічка в корі" /></div>
        <div className="field"><label>Продукт</label><select value={recipeForm.productId} onChange={(e) => setRecipeForm((value) => ({ ...value, productId: e.target.value }))}><option value="">Не прив’язувати</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>
        <div className="field"><label>Версія</label><input value={recipeForm.version} onChange={(e) => setRecipeForm((value) => ({ ...value, version: e.target.value }))} /></div>
        <div className="field"><label>Вихід, одиниць</label><input value={recipeForm.yieldQuantity} onChange={(e) => setRecipeForm((value) => ({ ...value, yieldQuantity: e.target.value }))} inputMode="decimal" /></div>
        <div className="field"><label>Складові</label>{recipeForm.items.map((item, index) => <div className="recipe-item" key={index}><select value={item.materialId} onChange={(e) => setRecipeForm((value) => ({ ...value, items: value.items.map((current, itemIndex) => itemIndex === index ? { ...current, materialId: e.target.value } : current) }))}><option value="">Матеріал</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.name} · {material.unit}</option>)}</select><input value={item.quantity} onChange={(e) => setRecipeForm((value) => ({ ...value, items: value.items.map((current, itemIndex) => itemIndex === index ? { ...current, quantity: e.target.value } : current) }))} inputMode="decimal" placeholder="Кількість" />{recipeForm.items.length > 1 && <button className="icon-btn" onClick={() => setRecipeForm((value) => ({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }))} aria-label="Прибрати складову"><X size={15}/></button>}</div>)}<button className="text-action" onClick={() => setRecipeForm((value) => ({ ...value, items: [...value.items, { materialId: '', quantity: '' }] }))}>＋ Додати складову</button></div>
        <div className="field"><label>Інструкція</label><input value={recipeForm.instructions} onChange={(e) => setRecipeForm((value) => ({ ...value, instructions: e.target.value }))} placeholder="Коротка примітка до процесу" /></div>
        <button className="primary" onClick={addRecipe} disabled={saving || !materials.length}>{saving ? 'Зберігаємо…' : 'Зберегти рецепт'}</button>
      </div></div></div>}

      {showBatch && <div className="modal-backdrop" onClick={() => setShowBatch(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Виробництво</div><div className="section-title">🏭 Нова партія</div></div><button className="icon-btn" onClick={() => setShowBatch(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form"><div className="field"><label>Рецепт</label><select value={batchForm.recipeId} onChange={(e) => setBatchForm((value) => ({ ...value, recipeId: e.target.value }))}><option value="">Оберіть рецепт</option>{recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name} · v{recipe.version}</option>)}</select></div><div className="field"><label>Дата виробництва</label><input type="date" value={batchForm.producedAt} onChange={(e) => setBatchForm((value) => ({ ...value, producedAt: e.target.value }))} /></div><div className="field"><label>Кількість</label><input value={batchForm.quantity} onChange={(e) => setBatchForm((value) => ({ ...value, quantity: e.target.value }))} inputMode="decimal" /></div><div className="field"><label>Нотатка</label><input value={batchForm.note} onChange={(e) => setBatchForm((value) => ({ ...value, note: e.target.value }))} /></div><button className="primary" onClick={addBatch} disabled={saving}>{saving ? 'Зберігаємо…' : 'Запустити виробництво'}</button></div></div></div>}

      {showCatalog && <div className="modal-backdrop" onClick={() => setShowCatalog(false)}><div className="modal catalog-modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Продажі</div><div className="section-title">Каталог товарів</div></div><button className="icon-btn" onClick={() => setShowCatalog(false)} aria-label="Закрити"><X size={18} /></button></div>{Object.entries(categoryLabels).map(([category, label]) => { const items = products.filter((product) => product.category === category && product.active); if (!items.length) return null; return <section className="catalog-group" key={category}><div className="eyebrow">{label}</div><div className="catalog-list">{items.map((product) => <button className={'catalog-product ' + (product.id === form.productId ? 'selected' : '')} key={product.id} onClick={() => selectProduct(product)}><div><b>{product.name}</b><span>{product.waxMinGrams ? `${product.waxMinGrams}${product.waxMaxGrams && product.waxMaxGrams !== product.waxMinGrams ? `–${product.waxMaxGrams}` : ''} г воску` : 'Обсяг воску ще не задано'}</span></div><strong>{product.price ? money(product.price) : 'Ціну уточнюємо'}</strong></button>)}</div></section>; })}</div></div>}

      {showQuickMenu && <div className="modal-backdrop" onClick={() => setShowQuickMenu(false)}><div className="modal quick-menu" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Швидкий запис</div><div className="section-title">Що додаємо?</div></div><button className="icon-btn" onClick={() => setShowQuickMenu(false)} aria-label="Закрити"><X size={18} /></button></div><div className="quick-actions"><button onClick={() => { setShowQuickMenu(false); openNewSale(); }}>🕯<span>Продаж</span></button><button onClick={() => { setShowQuickMenu(false); setShowPurchase(true); }}>🛒<span>Закупку</span></button><button onClick={() => { setShowQuickMenu(false); openNewExpense(); }}>💸<span>Витрату</span></button><button onClick={() => { setShowQuickMenu(false); setTab('more'); }}>🏭<span>Виробництво</span></button><button onClick={() => { setShowQuickMenu(false); openNewSale(); }}>👩‍🎨<span>Майстер-клас</span></button></div></div></div>}

      {showProduct && <div className="modal-backdrop" onClick={() => setShowProduct(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="section-head"><div><div className="eyebrow">Довідник</div><div className="section-title">{editingProduct ? 'Редагувати продукт' : '＋ Новий продукт'}</div></div><button className="icon-btn" onClick={() => setShowProduct(false)} aria-label="Закрити"><X size={18} /></button></div><div className="form">
        <div className="field"><label>Назва</label><input value={productForm.name} onChange={(e) => setProductForm((value) => ({ ...value, name: e.target.value }))} placeholder="Наприклад, Свічка в склі" /></div>
        <div className="field"><label>Базова ціна, ₴</label><input value={productForm.price} onChange={(e) => setProductForm((value) => ({ ...value, price: e.target.value }))} inputMode="decimal" placeholder="0" /></div>
        <div className="field"><label>Віск, від г</label><input value={productForm.waxMin} onChange={(e) => setProductForm((value) => ({ ...value, waxMin: e.target.value }))} inputMode="decimal" placeholder="Необов’язково" /></div>
        <div className="field"><label>Віск, до г</label><input value={productForm.waxMax} onChange={(e) => setProductForm((value) => ({ ...value, waxMax: e.target.value }))} inputMode="decimal" placeholder="Необов’язково" /></div>
        <div className="field"><label>Категорія</label><select value={productForm.category} onChange={(e) => setProductForm((value) => ({ ...value, category: e.target.value as ProductCategory }))}><option value="wood">Свічки в дереві</option><option value="plaster">Свічки в гіпсі</option><option value="coconut">Свічки в кокосі</option><option value="glass">Свічки в склі</option><option value="stone">Свічки в камені</option><option value="molded">Формові свічки</option><option value="box">Бокси</option><option value="workshop">Майстер-класи</option><option value="education">Навчання</option></select></div>
        <button className="primary" onClick={addProduct} disabled={saving}>{saving ? 'Зберігаємо…' : editingProduct ? 'Зберегти зміни' : 'Зберегти продукт'}</button>
      </div></div></div>}

      <button className="floating-add" onClick={() => setShowQuickMenu(true)} aria-label="Що додаємо?"><Plus size={24} /></button>
      <nav className="bottomnav"><button className={'navitem ' + (tab === 'home' ? 'active' : '')} onClick={() => setTab('home')}><Home size={18} /><span>Головна</span></button><button className={'navitem ' + (tab === 'sales' ? 'active' : '')} onClick={() => setTab('sales')}><Receipt size={18} /><span>Продажі</span></button><button className={'navitem ' + (tab === 'expenses' ? 'active' : '')} onClick={() => setTab('expenses')}><Wallet size={18} /><span>Витрати</span></button><button className={'navitem ' + (tab === 'analysis' ? 'active' : '')} onClick={() => setTab('analysis')}><BarChart3 size={18} /><span>Аналіз</span></button><button className={'navitem ' + (tab === 'more' ? 'active' : '')} onClick={() => setTab('more')}><Boxes size={18} /><span>Ще</span></button></nav>
    </main>
  );
}
