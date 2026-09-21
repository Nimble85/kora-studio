# LLM handoff guide

Use this file when handing a KORA Studio task to Codex, Claude Code, Grok or another coding agent.

## Required context to provide

Give the agent:

1. the concrete user request in Ukrainian or English;
2. whether the change is UI-only, data-model, calculation, Supabase or release work;
3. whether it may modify existing user data or schema;
4. the expected acceptance criteria.

The agent must read `AGENTS.md`, `README.md`, `docs/PRODUCT.md` and the relevant source files before editing.

For deployment or persistence work, also read `docs/DEPLOY_FROM_SCRATCH.md`, `docs/SUPABASE_MIGRATION.md` and `docs/NEXT_ITERATIONS.md`. Treat code deployment and database migration as separate operations; check the live project and its migration records before claiming a rollout is complete.

## Ready-to-copy task prompt

```text
You are continuing KORA Studio in this repository.

First read AGENTS.md, README.md, docs/PRODUCT.md, docs/DATA_MODEL.md and the relevant implementation files. Preserve unrelated working-tree changes.

Task: [describe one bounded change]

Acceptance criteria:
- [user-visible result]
- [financial/data behavior]
- [mobile behavior, if applicable]
- [persistence/Supabase requirement, if applicable]

Constraints:
- Keep UI copy in Ukrainian and preserve the five-item bottom navigation.
- Do not replace the real product catalog or add demo transactions.
- Do not conflate purchases, expenses, COGS and profit.
- Update schema, local persistence, mappings and docs together for any data-model change.
- Run `node node_modules/next/dist/bin/next build` and state the result.
- Add a short entry to docs/CHANGELOG.md for user-visible behavior.
```

## What a good agent handoff contains

- One focused problem, not a broad instruction such as “improve everything”.
- An explicit definition of whether a financial label is cash flow, gross profit or net profit.
- The source of truth for a new number: sale, expense, purchase, recipe, material or batch.
- A destructive-action decision: archive, delete with confirmation, or never delete.
- A test scenario with real-looking but non-sensitive sample values.

## Review questions after an agent finishes

1. Does the screen work with zero data and real data?
2. Can a phone user tap every interactive element?
3. Does data survive reload in local mode?
4. Did the agent keep purchase cash spend separate from operating costs and COGS?
5. If persistence changed, did types, local storage, Supabase mapping and schema move together?
6. Did the production build pass?
