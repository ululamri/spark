# Spark Studio Public Content Builder

Pass 67 introduces a preview-friendly Studio surface for public UI copy cleanup.

The builder is intentionally slot-based, not plain text-based. Each UI block can contain these slots:

- eyebrow / small label
- title
- copy
- primary CTA
- secondary CTA
- note

Every slot can be edited, hidden, cleared, or restored. A hidden slot should not render in public UI once a page is migrated to the content runtime helper.

## Local / preview workflow

```bash
SPARK_STUDIO_WRITE_ENABLED=true pnpm run preview
```

Open:

```txt
/studio/content
```

Save writes to:

```txt
static/studio-content-overrides.json
```

For dev mode, the writer is enabled automatically by `NODE_ENV=development`, but setting `SPARK_STUDIO_WRITE_ENABLED=true` is still recommended for clarity.

## Safety rules

- Do not expose the writer on public production.
- Do not write directly to `.svelte` files from the browser.
- Use `git diff` after editing content from Studio.
- Public pages should migrate gradually to slot rendering helpers.

## Next migration step

After this pass, pages can be migrated one domain at a time:

1. Home + global shell
2. Auth + Profile + Settings
3. Dashboard + Core + Lab
4. Passport + Proof
5. Hub + Community
6. Toast + drawer + final microcopy sweep
