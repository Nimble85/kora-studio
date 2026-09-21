# KORA Studio

KORA Studio is a mobile-first Ukrainian business workspace for a candle atelier: sales, expenses, purchases, inventory and financial analysis in one calm, practical interface.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Authentication:** Login required. This MVP does not provide tenant-specific Supabase access controls.

Production verification:

```bash
npm run build
```

## Supabase connection

Without Supabase variables, records are stored only in browser localStorage on the current device.

**Setup:**

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql` to create tables.
3. Run `supabase/seed-products.sql` to populate the product catalog and materials. For an **existing** database, run `supabase/migrations/20260921_workshops.sql` before deploying this version; it adds the workshop sale fields and catalog entries without replacing existing records.
4. Copy `.env.example` to `.env.local`.
5. Add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

Never commit `.env.local`.

## Documentation

- [Product specification](docs/PRODUCT.md)
- [Data model and persistence contract](docs/DATA_MODEL.md)
- [Roadmap](docs/ROADMAP.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Changelog](docs/CHANGELOG.md)
- [Release notes](docs/RELEASE_NOTES.md)
- [Instructions for coding agents](AGENTS.md)
- [LLM handoff guide](docs/LLM_HANDOFF.md)

`KORA_IMPLEMENTATION.md` provides the current implementation overview; `KORA_PROJECT_CONTEXT.md` preserves earlier discovery and product context.

## Main technology

Next.js 16 App Router, React, TypeScript, Tailwind CSS, PWA manifest, localStorage and optional Supabase/PostgreSQL.
