# PERF-UX Tooling Stack

**Decision:** UI/UX performance is the current priority. Admin UI and Starknet integration are paused until Spark feels fast, stable, clean, and professional.

## Locked tooling

### Frontend dependencies

```text
@tanstack/svelte-query
@tanstack/svelte-virtual
gsap
```

These are runtime dependencies because they directly support app interaction, server-state UX, feed rendering, and advanced animation surfaces.

### Frontend dev tooling

```text
@vite-pwa/sveltekit
vite-imagetools
```

These are build/runtime-support tools for app shell resilience and static image optimization.

### Server/service tooling planned

```text
imgproxy
Caddy cache/compression policy
```

`imgproxy` is planned as the dynamic uploaded-media optimizer. Caddy remains the front delivery layer for route safety, compression, and cache headers.

## Why GSAP is included

Spark needs richer animation for:

```text
Core/Learn story flow
Lab guided simulations
Hub exploratory surfaces
future mission/progress reveals
```

GSAP is the chosen heavy animation framework. Animation must remain progressive, respectful of reduced-motion preferences, and lazy-loaded in feature components.

## Current foundation files

```text
src/lib/perf/spark-query-client.ts
src/lib/perf/spark-animation.ts
src/lib/perf/feed-rendering.ts
src/lib/perf/media-performance.ts
```

## Vite configuration

`vite-imagetools` is enabled for static assets. PWA dependency is installed but activation remains deferred until the safe cache policy is finalized.

## Pass order

```text
PERF-UX-01 Tooling foundation
PERF-UX-02 Caddy/cache/compression policy
PERF-UX-03 imgproxy media optimizer foundation
PERF-UX-04 optimized media components and avatar polish
PERF-UX-05 query cache and optimistic interaction layer
PERF-UX-06 virtual/incremental feed rendering
PERF-UX-07 PWA shell and poor-network resilience
PERF-UX-08 learning/lab/hub animation system
```

## Guardrails

```text
No aggressive caching for auth routes.
No aggressive caching for admin routes.
No aggressive caching for private media.
No animation that ignores reduced-motion settings.
No original-size image in feed cards once optimized variants are available.
No heavy animation imported globally by default.
```
