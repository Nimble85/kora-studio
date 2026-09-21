# Data model and persistence contract

## Sources of truth

The same domain model works in two modes:

1. **Local-first:** browser `localStorage`, suitable for a single device and early usage.
2. **Supabase:** PostgreSQL schema in `supabase/schema.sql`, activated only when the public environment variables are present.

`lib/types.ts` is the canonical application model. `lib/data-store.ts` maps between TypeScript camelCase and Supabase snake_case rows.

## Entities

| Entity | Important fields | Notes |
| --- | --- | --- |
| Product | category, price, active, wax min/max | Archive via `active: false`; keep sale history. |
| Sale | date, product, product name snapshot, amount, quantity, channel, payment; optional workshop date, deposit, candle choices and Instagram URL | `amount` is the full agreed sale total. `deposit` is the paid amount for a workshop; remaining balance is calculated as `amount − deposit`. |
| Expense | date, category, amount, note | Categories `Податки` and `Комісії` are separated in P&L. |
| Material | unit, stock, min stock, average cost | `averageCost` is the current weighted average per unit. |
| Purchase | material, supplier name, quantity, unit, unit price, total | Increases stock and recalculates `averageCost`. |
| Partner | name, links/contact, note | May be created automatically from a purchase supplier name. |
| Recipe | product, version, yield, items | A recipe has material quantities per output. |
| Production batch | recipe, date, quantity, unit cost | Reduces inventory; represents a cost snapshot for the batch. |

## Invariants

- IDs are UUIDs generated locally or by PostgreSQL.
- Monetary values are positive numbers stored in UAH, without formatting strings.
- Dates are ISO date strings (`YYYY-MM-DD`) using the Kyiv time zone in the UI.
- Quantities are numeric and use the material/purchase unit.
- A purchase total must equal `quantity × unitPrice` at creation time.
- A sale retains `productName` so historical records are readable even after catalog edits.
- A recipe item references an existing material.
- A production batch must not reduce a material below zero.

## Costing caveat

Today’s Analysis COGS is calculated from the *current* recipe and material average costs. It is therefore an operational estimate, not immutable historical accounting. The production batch already stores `unitCost`, but sales are not yet allocated to a specific batch.

To make historical COGS exact, add a sale-to-batch allocation or a cost snapshot on every sale. This requires a schema migration, a migration plan for existing sales and tests for partial-batch allocation.

## Schema-change checklist

When adding or changing persisted data:

1. Update `lib/types.ts`.
2. Update default/local persistence in `lib/local-data.ts`.
3. Update row types, mappings and CRUD in `lib/data-store.ts`.
4. Add an **additive** migration to `supabase/schema.sql` (or a versioned migration folder when introduced).
5. Update form validation and UI.
6. Update this document and `docs/CHANGELOG.md`.
7. Test both no-Supabase and Supabase modes.

## Workshops

A workshop is a catalog product. Its sale stores the workshop date and selected candles. The calendar groups sales by workshop date and product name, so bookings of the same workshop on the same date appear together. Deposit and balance are shown separately; the existing revenue reports continue to use the agreed sale total.
