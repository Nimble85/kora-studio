# KORA Studio — product specification

**Status:** working local-first MVP  
**Interface:** Ukrainian  
**Currency:** UAH  
**Primary device:** phone, with responsive desktop support

## Product promise

KORA Studio gives a candle atelier a single place to record sales, purchases, expenses, materials and products, then turn them into a clear financial picture. The owner should understand in ten seconds: how much was sold, what was spent, what remains, and which part of the business needs attention.

## Current navigation

| Section | Purpose |
| --- | --- |
| `Головна` | Monthly revenue goal and cash result, today’s sales, workshop reminders three days ahead, low-stock materials and the next holiday. |
| `Продажі` | New sale, workshop booking details, monthly revenue, average check, product performance and history grouped by year and month. |
| `Витрати` | Operating expenses and inventory purchases, their total, spending mix and editable history. |
| `Аналіз` | Period P&L, comparison with the previous matching period, monthly trend and sales channels. |
| `Ще` | Collapsible workshop calendar, editable product catalog, inventory, suppliers/partners and the production entry point. |

The bottom navigation has five equal items. A raised central `＋` opens four quick actions: sale, purchase, expense and new product. Horizontal swipe changes the active section and must keep the bottom navigation state in sync.

## Financial vocabulary

| Metric | Definition |
| --- | --- |
| Sales / revenue | Total amount of all sales in a period. |
| Purchase | Money paid for material that increases stock. It affects cash but not operating expense by default. |
| Operating expense | Rent, marketing, services, household supplies, logistics and other spending not stored as production material. |
| COGS | Recipe material cost of products that were sold. |
| Gross profit | Revenue less COGS. |
| Taxes and commissions | Expenses specifically categorized as `Податки` or `Комісії`. |
| Net profit | Revenue less COGS, operating expenses, taxes and commissions. |
| Margin | Net profit divided by revenue. |

## Catalog and materials

The catalog begins with KORA’s wood, molded wood, coconut, plaster and glass candle families, learning packages and configurable candle-making boxes. Product names, prices and wax ranges are editable. New products may be added and obsolete products archived.

Inventory begins with cost-relevant material types: pots/containers, waxes, wicks, wick holders, aroma, decor, boxes, packaging, cards, oil wax and epoxy resin. Inventory supports physical-count corrections, stock threshold and weighted average cost.

## Current scope

Implemented:

- CRUD for sales, expenses, products, inventory materials and partners; purchase creation with stock updates and purchase history;
- automatic supplier card creation from the free-text supplier field in a purchase;
- product catalog selection inside the sale form and automatic total based on price × quantity;
- local-first storage with optional Supabase persistence;
- financial analysis by day, week, month, year or custom dates;
- recipes and production batches as an initial production foundation;
- seasonal and workshop reminders, low-stock materials and editable monthly revenue goal.

Deliberately deferred:

- secure multi-user authentication, roles and tenant-specific database policies;
- receipt file storage, CRM, client history and payment reconciliation;
- historical batch-to-sale COGS allocation;
- a separate event model beyond workshop bookings attached to sales;
- offline sync queue and conflict resolution;
- automated integrations with shops, payments or social networks.

See `docs/ROADMAP.md` before choosing the next feature.

## Workshop booking and inventory reminders

Workshop products have editable prices. A workshop sale records its date, deposit, selected candle types and quantities, Instagram link, payment, channel, and comment. The collapsible calendar under `Ще` groups bookings for the same workshop and date. Home reminds about bookings from three days before the workshop through its date; tapping a reminder selects that day in the calendar. Home lists materials whose configured minimum stock is above zero and whose current stock is at or below that minimum.
