# KORA Studio — instructions for coding agents

These instructions apply to Codex, Claude Code, Grok and any other coding agent working in this repository.

## Product intent

KORA Studio is a mobile-first Ukrainian workspace for a candle atelier. The product should make it possible to record a sale, expense or purchase in seconds and understand the business in one glance. It is not a general accounting ERP.

The visual direction is **Digital Atelier**: warm parchment, deep forest green, bark brown, muted sage and candle-orange accents. Keep the interface calm, tactile and human; do not turn it into a generic enterprise CRM.

## Non-negotiable domain rules

- UI language is Ukrainian; money is UAH.
- Keep the five-item bottom navigation exactly: `Головна`, `Продажі`, `Витрати`, `Аналіз`, `Ще`.
- Sales revenue, purchases, operating expenses, COGS and profit are different concepts. Do not merge them without an explicit product decision.
- A purchase increases material inventory and uses weighted-average cost. It is cash spent, but not automatically operating expense or COGS.
- COGS in analysis is derived from a product recipe and its materials. Do not present a value as exact historical COGS if there is no cost snapshot.
- Preserve historical sales when a product is archived; do not silently delete user history.
- The app starts with zero transactions. Do not reintroduce mock financial activity.
- All user-entered product data must remain editable or archivable from the UI.

## Architecture boundaries

- `app/page.tsx` is currently a single client-side screen and UI state container. Make small, cohesive changes there; extract a component only when it has a clear reusable boundary.
- `lib/types.ts` is the source of truth for domain types.
- `lib/data-store.ts` is the repository boundary. UI code must not directly read or write `localStorage` except the per-month goal preference.
- `lib/local-data.ts` is the local-first persistence implementation.
- `lib/production.ts` contains pure costing helpers.
- `supabase/schema.sql` must change together with `lib/data-store.ts` whenever persisted data changes.

## Safe change workflow

1. Read `README.md`, `docs/PRODUCT.md`, `docs/DATA_MODEL.md` and the relevant source before editing.
2. Check `git status --short`; preserve unrelated user changes.
3. For a data-model change, update types, local storage mapping, Supabase schema/mapping, UI and documentation in one change.
4. Prefer additive migrations and backwards-compatible reads. Never reset user data or delete a database table to simplify development.
5. Run the production build before handoff:

   ```bash
   node node_modules/next/dist/bin/next build
   ```

6. Manually check the affected flow at a mobile-width viewport. Verify that the bottom navigation stays one row, the floating plus button does not cover it, and a value persists after refresh.
7. Update `docs/CHANGELOG.md` for user-visible behavior, schema or calculation changes.

## Financial calculation contract

For a selected period:

```text
Revenue = sum(sale.amount)
COGS = sum(recipeUnitCost(product recipe) × sale.quantity)
Gross profit = Revenue − COGS
Taxes & commissions = expenses whose category is “Податки” or “Комісії”
Operating expenses = all other expenses
Net profit = Revenue − COGS − Operating expenses − Taxes & commissions
Margin = Net profit / Revenue × 100, or 0 when Revenue is 0
```

Home shows a separate cash-oriented monthly result:

```text
Monthly cash result = monthly revenue − monthly operating expenses − monthly purchases
```

Label it clearly; it is not a replacement for the Analysis P&L.

## Do not do these things

- Do not expose `.env.local`, Supabase keys, customer information or browser localStorage in logs, screenshots or commits.
- Do not replace the current product catalog with sample data.
- Do not add an external service, auth provider, analytics tracker, AI model or package without first explaining the need and its impact.
- Do not run destructive git commands or remove generated/user data unless explicitly requested.
- Do not make visual changes that hide information behind hover-only interactions; mobile users must be able to tap everything.
