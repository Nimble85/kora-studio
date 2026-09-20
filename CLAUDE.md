# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server at localhost:3000
pnpm build            # Production build (required before handoff)
pnpm lint             # ESLint
```

No test suite exists yet.

## Architecture

KORA Studio is a mobile-first Ukrainian business workspace for a candle atelier. It runs as a Next.js 16 App Router PWA with optional Supabase persistence.

### Data flow

```
lib/types.ts          → Domain model (source of truth)
lib/data-store.ts     → Repository boundary; maps TS camelCase ↔ Supabase snake_case
lib/local-data.ts     → localStorage persistence (local-first mode)
lib/demo-data.ts      → Product/material seed catalog (no mock financial records)
supabase/schema.sql   → PostgreSQL schema when Supabase is connected
```

Without Supabase env vars, all data lives in browser localStorage on that device only.

### UI structure

`app/page.tsx` is currently a single ~87K client component containing all screens, forms, and state. Five bottom tabs: Головна | Продажі | Витрати | Аналіз | Ще.

### Schema changes

When modifying persisted data:
1. Update `lib/types.ts`
2. Update `lib/local-data.ts` defaults
3. Update `lib/data-store.ts` row mappings
4. Add additive migration to `supabase/schema.sql`
5. Update UI forms/validation
6. Update `docs/CHANGELOG.md`

## Domain rules

- UI language is Ukrainian; currency is UAH (₴)
- Keep the five-item bottom navigation exactly: `Головна`, `Продажі`, `Витрати`, `Аналіз`, `Ще`
- Sales revenue, purchases, operating expenses, COGS, and profit are distinct concepts
- A purchase increases material inventory with weighted-average cost; it is cash outflow but not COGS
- COGS derives from product recipe × material costs (currently uses live costs, not historical snapshots)
- Preserve historical sales when archiving products (`active: false`)
- The app starts with zero transactions; do not add mock financial activity

## Financial calculations

Analysis P&L for a period:
```
Revenue         = sum(sale.amount)
COGS            = sum(recipeUnitCost(product) × sale.quantity)
Gross profit    = Revenue − COGS
Taxes/comms     = expenses where category is "Податки" or "Комісії"
Operating exp   = all other expenses
Net profit      = Revenue − COGS − Operating exp − Taxes/comms
Margin          = Net profit / Revenue × 100 (0 if no revenue)
```

Home monthly cash result (separate from P&L):
```
Monthly cash result = monthly revenue − monthly operating expenses − monthly purchases
```

## Git commits

Do not add Co-Authored-By or any attribution lines to commit messages.

## Key constraints

- Store monetary values as positive numbers in UAH (no formatting strings)
- Dates are ISO strings (`YYYY-MM-DD`), displayed in Ukrainian timezone
- IDs are UUIDs (local or PostgreSQL-generated)
- A sale stores `productName` snapshot for history readability
- A purchase total must equal `quantity × unitPrice`
- Never reset user data or delete tables for development convenience
