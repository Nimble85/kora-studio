# Release checklist

Use this before publishing a build or giving it to a real KORA user.

## Safety

- [ ] `.env.local` is not committed or shared.
- [ ] `.env.example` contains only empty placeholder values.
- [ ] No real customer, supplier or financial data exists in demo fixtures.
- [ ] If Supabase is enabled, run `supabase/migrations/20260921_workshops.sql` on the intended existing project before deploying this code; verify new products and sale fields. For a fresh project, run `supabase/schema.sql` and `supabase/seed-products.sql`.
- [ ] Supabase RLS and authentication strategy were reviewed before opening the app to more than one person.

## Functional smoke test

- [ ] Add, edit and delete a sale; confirm the list and revenue update.
- [ ] Set quantity to 2+ in a sale; confirm total equals unit price × quantity.
- [ ] Add, edit and delete an operating expense.
- [ ] Add a purchase with a new supplier; confirm material stock and partner list update.
- [ ] Correct stock through inventory.
- [ ] Confirm coconut sizes and workshop prices; edit and archive one test product.
- [ ] Confirm Home monthly goal can be saved and remains after refresh.
- [ ] Confirm Today and the workshop calendar expand/collapse. Create two bookings of one MК on the same date and confirm they appear together.
- [ ] Create and edit a workshop sale with two different candle choices, Instagram URL, channel, payment and comment. Confirm its date, choices and partial deposit persist after refresh.
- [ ] Confirm the balance is red with an outstanding amount and green when fully prepaid. Check a booking three days away appears on Home and opens the right calendar day; a booking four days away does not.
- [ ] Set a material minimum and confirm the Home restock list updates; check the four quick-add actions.
- [ ] Confirm all Analysis periods work and a metric opens its formula help.
- [ ] Verify lower navigation by tap and swipe; it remains one row on a phone.

## Technical verification

```bash
npm ci
npm run lint
node node_modules/next/dist/bin/next build
```

- [ ] Production build succeeds; lint has no errors (review any warnings).
- [ ] Test at a narrow mobile viewport and a desktop viewport.
- [ ] Refresh after data entry in local mode; records persist.
- [ ] Test in Supabase mode if it is part of this release.
- [ ] Update `docs/CHANGELOG.md` and release notes.

## Deployment decision

The current local-first mode is appropriate for a single-device pilot. Do not call it a multi-user production financial system until authentication, strict RLS, backups and conflict handling are implemented.
