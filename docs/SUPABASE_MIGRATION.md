# Оновлення Supabase для майстер-класів

Деплой коду та оновлення бази даних — окремі дії. Git commit, push і деплой не виконують SQL автоматично. У застосунку з налаштованим Supabase каталог і продажі читаються з віддаленої бази, тому нова версія інтерфейсу може показувати старі 40 позицій.

## Для наявної бази

1. Відкрийте **Supabase → потрібний проєкт → SQL Editor**. Переконайтеся, що це проєкт, до якого підключений задеплоєний застосунок.
2. Виконайте **весь** файл [`supabase/migrations/20260921_workshops.sql`](../supabase/migrations/20260921_workshops.sql). Він додає чотири поля до `public.sales` і 20 позицій каталогу: три звичайні кокоси та 17 МК. Операції можна повторювати; наявні записи та змінені ціни не перезаписуються.
3. Перевірте результат у SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sales'
  AND column_name IN ('workshop_at', 'deposit', 'candle_choices', 'instagram_url')
ORDER BY column_name;

SELECT category, count(*) AS products
FROM public.products
GROUP BY category
ORDER BY category;

SELECT count(*) AS migration_products
FROM public.products
WHERE id IN (
  SELECT ('11111111-1111-1111-1111-' || lpad(n::text, 12, '0'))::uuid
  FROM generate_series(41, 60) AS n
);
```

Перший запит має повернути **4 рядки**, останній — **20**, якщо жодну з нових позицій не видаляли. Якщо до міграції в каталозі було рівно 40 позицій і не було інших змін, після неї буде 60. Загальна кількість може відрізнятися через додані, видалені або архівовані вручну товари; звіряйте насамперед ідентифікатори міграції.

4. Оновіть сторінку застосунку та перевірте каталог, форму продажу МК і календар.

## Якщо запускали тільки SQL для полів продажу

Цей запит усуває помилку `42703: column sales.workshop_at does not exist`, але **не додає товари**:

```sql
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS workshop_at date,
  ADD COLUMN IF NOT EXISTS deposit numeric(12,2),
  ADD COLUMN IF NOT EXISTS candle_choices jsonb,
  ADD COLUMN IF NOT EXISTS instagram_url text;
```

Якщо після нього каталог показує 40 позицій, виконайте **весь файл міграції** з першого розділу. Повторне додавання вже наявних колонок безпечне.

## Для нової бази

Виконайте [`supabase/schema.sql`](../supabase/schema.sql), а потім [`supabase/seed-products.sql`](../supabase/seed-products.sql). Ця послідовність створює таблиці, початкові матеріали й повний каталог.

## Якщо перевірка не збігається

- Помилка `42703` означає, що потрібних полів немає саме в базі, яку читає застосунок. Перевірте вибір Supabase проєкту та всі чотири рядки першого перевірочного запиту.
- 40 позицій після успішного додавання полів означають, що частину `INSERT INTO public.products` не виконано в цій базі. Запустіть повну міграцію.
- У каталозі МК показуються в категорії «Майстер-класи». У меню плюсика залишено чотири дії; запис МК створюється через **Продаж → вибір продукту → Майстер-класи**.
