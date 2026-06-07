# Pass 68K — Desktop Layout Repair

This pass restores proper desktop UI rhythm across Karyra Spark after a long mobile-first cleanup cycle.

## Why

Spark's public home and several product pages inherited oversized marketing typography from older landing styles. On desktop, headings became too large, cards looked cramped, and layouts felt less professional even though mobile readability had improved.

## Scope

- Desktop-only layout repair for screens `>= 981px`.
- Home landing hero, section headings, CTA, cards, footer, and flow grids.
- Shared Spark shell, page sections, cards, hero surfaces, lesson layout, and common grids.
- No public copy rewrite in this pass.
- No mobile behavior change unless a browser is wider than 981px.

## Product direction

Spark should feel readable and steady on desktop, while staying friendly on mobile. The desktop experience should support grant review, demo recording, and reviewer exploration without giving the impression of a mobile-only prototype.

## Checks

```bash
pnpm run audit:pass68k
pnpm run audit:hub-topology
pnpm run audit:public-copy
pnpm run check
pnpm run build
```
