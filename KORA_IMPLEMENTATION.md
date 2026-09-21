# KORA Studio — implementation overview

**Status:** working local-first MVP  
**Last verified:** September 2026  
**Primary check:** `node node_modules/next/dist/bin/next build`

## Current behavior

- Five bottom tabs: Home, Sales, Expenses, Analysis and More; tab swipe is supported.
- Home shows monthly revenue goal, monthly cash result, quick actions, expandable today list, upcoming workshop reminders, low-stock materials and a seasonal reminder.
- Sales supports catalog selection, quantity-driven totals, editable workshop bookings with deposits, CRUD, average check and monthly/product performance. The history groups by year and month.
- Expenses separates operating costs and material purchases; purchases add stock and calculate weighted-average material cost.
- Analysis supports day, week, month, year and custom periods for revenue, COGS, gross profit, operating expenses, taxes/commissions, net profit and margin. Every metric explains its formula on tap.
- More contains a collapsible workshop calendar, editable catalog, inventory, suppliers and current production foundation.

## Key implementation locations

| Path | Responsibility |
| --- | --- |
| `app/page.tsx` | Current client UI, forms, dashboard calculations and interaction state. |
| `app/globals.css` | KORA Digital Atelier visual system and responsive behavior. |
| `lib/types.ts` | Domain model. |
| `lib/data-store.ts` | Local/Supabase repository and row mappings. |
| `lib/local-data.ts` | Browser persistence. |
| `lib/demo-data.ts` | Product and material seed catalog; financial records start at zero. |
| `lib/production.ts` | Recipe costing helpers. |
| `supabase/schema.sql` | PostgreSQL schema for optional persistence. |
| `supabase/seed-products.sql` | Initial catalog and material rows for a new database. |
| `supabase/migrations/20260921_workshops.sql` | Additive upgrade for an existing database. |
| `docs/DEPLOY_FROM_SCRATCH.md` | Installation, verification and recovery steps. |

## Known technical debt

- `app/page.tsx` should gradually be divided into focused feature components once a feature is changed substantially.
- Financial COGS currently uses current recipe/material cost rather than immutable historical batch allocation.
- Current Supabase setup is a development foundation, not multi-user-ready security.
- Automated tests are not yet present. ESLint is configured but still reports existing warnings; the current UI effect hydration has a scoped lint exception.
- Database migrations do not run during deployment. See `docs/SUPABASE_MIGRATION.md` and `docs/NEXT_ITERATIONS.md` for current rollout risks.

Detailed product, data, release and agent instructions live in `README.md` and `docs/`.
