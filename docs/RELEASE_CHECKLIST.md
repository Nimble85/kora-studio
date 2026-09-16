# Release checklist

Use this before publishing a build or giving it to a real KORA user.

## Safety

- [ ] `.env.local` is not committed or shared.
- [ ] `.env.example` contains only empty placeholder values.
- [ ] No real customer, supplier or financial data exists in demo fixtures.
- [ ] If Supabase is enabled, schema/migrations have been applied to the intended project.
- [ ] Supabase RLS and authentication strategy were reviewed before opening the app to more than one person.

## Functional smoke test

- [ ] Add, edit and delete a sale; confirm the list and revenue update.
- [ ] Set quantity to 2+ in a sale; confirm total equals unit price × quantity.
- [ ] Add, edit and delete an operating expense.
- [ ] Add a purchase with a new supplier; confirm material stock and partner list update.
- [ ] Correct stock through inventory.
- [ ] Open each product from the catalog; edit and archive one test product.
- [ ] Confirm Home monthly goal can be saved and remains after refresh.
- [ ] Confirm Today expands/collapses.
- [ ] Confirm all Analysis periods work and a metric opens its formula help.
- [ ] Verify lower navigation by tap and swipe; it remains one row on a phone.

## Technical verification

```bash
npm install
node node_modules/next/dist/bin/next build
```

- [ ] Production build succeeds.
- [ ] Test at a narrow mobile viewport and a desktop viewport.
- [ ] Refresh after data entry in local mode; records persist.
- [ ] Test in Supabase mode if it is part of this release.
- [ ] Update `docs/CHANGELOG.md` and release notes.

## Deployment decision

The current local-first mode is appropriate for a single-device pilot. Do not call it a multi-user production financial system until authentication, strict RLS, backups and conflict handling are implemented.
