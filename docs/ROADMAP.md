# Roadmap

## Release 0.4 — reliability first

- [ ] Add unit/integration tests for financial calculations and stock changes.
- [x] Add an ESLint configuration and make `npm run lint` part of release verification (remaining warnings are tracked in `NEXT_ITERATIONS.md`).
- [ ] Add explicit confirmation before destructive record deletion.
- [ ] Add export/backup of local data and restore flow.
- [ ] Add validation and accessible error messages for all financial forms.
- [x] Add a versioned Supabase migration for the workshop release (migration tracking and a non-duplicated seed remain in `NEXT_ITERATIONS.md`).

## Release 0.5 — exact production economics

- [ ] Link a sale to produced stock/batches, allowing partial allocation.
- [ ] Use batch cost snapshots for historical COGS.
- [ ] Track finished-goods inventory independently of material stock.
- [ ] Build recipe versions and production instructions into a complete production module.
- [ ] Show low-stock forecast in units of products where a recipe is known.

## Release 0.6 — business intelligence

- [ ] Rule-based insights for trend, price and stock changes.
- [ ] Workshop and event entities with revenue, participant count and profitability.
- [ ] Seasonal planning calendar and goal recommendations.
- [ ] Monthly/annual report export.

## Later, only after the above is stable

- Authentication, role-based access and production-grade RLS.
- Receipt/media storage.
- CRM and customer communication.
- Marketplace, payment and social integrations.
- Offline mutation queue and conflict resolution.

## Prioritisation rule

Choose the next item only if it improves one of these outcomes: faster daily entry, more trustworthy numbers, clearer stock position or a better owner decision. Avoid adding complexity merely because another business system has it.
