# PERF-UX-02 Delivery, Cache, and Compression Policy

**Priority:** UI/UX performance before Admin UI and Starknet integration.

This pass defines the delivery layer policy for Spark. The goal is to make navigation, public content, media, and API behavior feel fast while protecting auth/admin/private data from unsafe caching.

## Service names

```text
frontend systemd: karyra-spark-web
backend systemd:  karyra-spark-api
caddy systemd:    caddy
```

## Public domain routing

```text
spark.user.cloudjkt01.com
```

Required backend routes:

```text
/health*
/v1/*
/api/admin/*
```

These must always reverse proxy to `spark-api`. A previous regression happened when `/api/admin/*` was handled by SvelteKit and returned HTML instead of JSON.

## Cache policy

### Never cache aggressively

```text
/api/admin/*
/v1/auth*
/v1/profile*
/v1/media/upload-intents*
/v1/media/complete*
```

Use:

```text
Cache-Control: no-store
```

### Short dynamic cache only

```text
/v1/*
```

Use short private cache only when safe:

```text
Cache-Control: private, max-age=15, stale-while-revalidate=30
```

If an endpoint contains user-sensitive state, override to `no-store`.

### Long immutable cache

```text
/_app/immutable/*
```

Use:

```text
Cache-Control: public, max-age=31536000, immutable
```

### App shell / SSR fallback

```text
/*
```

Use:

```text
Cache-Control: private, max-age=0, must-revalidate
```

### Future optimized media

After the imgproxy pass:

```text
/media/optimized/*
```

Use:

```text
Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```

Only public, signed, transformed media should use this path.

## Compression

Caddy should enable:

```text
encode zstd gzip
```

## Reference Caddyfile

```text
deploy/Caddyfile.spark.example
```

Keep this repo file synced with the live server `/etc/caddy/Caddyfile` block.

## Deploy sequence

```bash
cd /opt/karyra/spark
git pull
pnpm install
pnpm build
systemctl restart karyra-spark-web
systemctl status karyra-spark-web --no-pager
```

```bash
cd /opt/karyra/spark-api
git pull
sqlx migrate run
cargo build --release
systemctl restart karyra-spark-api
systemctl status karyra-spark-api --no-pager
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

## Smoke tests

```bash
curl -i -sS https://spark.user.cloudjkt01.com/ | head -40
```

```bash
curl -i -sS https://spark.user.cloudjkt01.com/hub/ | head -40
```

```bash
curl -i -sS https://spark.user.cloudjkt01.com/health/live | head -40
curl -i -sS https://spark.user.cloudjkt01.com/health/ready | head -40
```

```bash
curl -i -sS -H "x-karyra-admin-token: $KARYRA_ADMIN_TOKEN" \
  https://spark.user.cloudjkt01.com/api/admin/ai/scope | head -80
```

Expected admin API response must be JSON, not SvelteKit HTML. A `401` JSON means the route is correct but the supplied admin token is missing or invalid.

## Guardrails

```text
Do not cache admin responses.
Do not cache auth/session responses.
Do not cache upload-intent responses.
Do not route /api/admin/* to frontend.
Do not enable PWA runtime caching until this policy is stable.
Do not enable optimized media public caching until imgproxy signed URLs exist.
```
