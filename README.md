# KORA Studio

KORA Studio is a mobile-first Ukrainian business workspace for a candle atelier: sales, expenses, purchases, inventory and financial analysis in one calm, practical interface.

It is currently a **local-first MVP**. Without Supabase variables, records are stored only in the browser on the current device.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production verification:

```bash
node node_modules/next/dist/bin/next build
```

## Optional Supabase connection

1. Create a Supabase project.
2. Execute `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Never commit `.env.local`.

## Documentation

- [Product specification](docs/PRODUCT.md)
- [Data model and persistence contract](docs/DATA_MODEL.md)
- [Roadmap](docs/ROADMAP.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Changelog](docs/CHANGELOG.md)
- [Instructions for coding agents](AGENTS.md)
- [LLM handoff guide](docs/LLM_HANDOFF.md)

`KORA_IMPLEMENTATION.md` provides the current implementation overview; `KORA_PROJECT_CONTEXT.md` preserves earlier discovery and product context.

## Main technology

Next.js 16 App Router, React, TypeScript, Tailwind CSS, PWA manifest, localStorage and optional Supabase/PostgreSQL.
