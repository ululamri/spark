# Karyra Spark live deployment surface

This document records the current non-Docker live deployment surface for the Karyra Spark development stack.

## Live domain

- Public domain: `https://spark.user.cloudjkt01.com`

## Live paths and services

| Surface | Live path | Service | Listen address |
|---|---|---|---|
| Spark frontend | `/opt/karyra/spark` | `karyra-spark-web` | `127.0.0.1:4173` |
| Spark API | `/opt/karyra/spark-api` | `karyra-spark-api` | `127.0.0.1:8787` |
| Hub static build | `/opt/karyra/hub/build` | served by Caddy | `/hub` |
| imgproxy | `/etc/karyra/imgproxy.env` | `karyra-imgproxy` | `127.0.0.1:8088` |
| Caddy | `/etc/caddy/Caddyfile` | `caddy` | public HTTPS |

## Deployment order

1. Deploy and restart Spark API.
2. Deploy and restart Spark frontend.
3. Build Hub static output with its live build command.
4. Validate and reload Caddy when route rules changed.
5. Check browser and HTTP status for Spark, API health, Hub, and static Hub assets.

## Backend deployment

```bash
cd /opt/karyra/spark-api
git pull
set -a
source .env.host
set +a
cargo build --release
systemctl restart karyra-spark-api
systemctl status karyra-spark-api --no-pager
curl -fsS http://127.0.0.1:8787/health/live
curl -fsS http://127.0.0.1:8787/health/ready
```

## Frontend deployment

```bash
cd /opt/karyra/spark
git pull
pnpm build
systemctl restart karyra-spark-web
systemctl status karyra-spark-web --no-pager
```

## Hub deployment

Hub is a SvelteKit static build served directly by Caddy. The live server does not run the Hub Docker staging runtime.

```bash
cd /opt/karyra/hub
git pull
pnpm install
pnpm run check
pnpm run audit:hub-paths
pnpm run audit:hub-live
pnpm run build:live
```

Expected Hub contract:

- build output lives at `/opt/karyra/hub/build`;
- Hub is mounted at `/hub`;
- `/hub` redirects to `/hub/`;
- Caddy uses `handle_path /hub/*` so the `/hub` prefix is stripped before reading files;
- immutable assets under `/hub/_app/immutable/*` return JS/CSS asset content, not the HTML fallback;
- route fallback points to `/spa.html`.

## Caddy route contract

The Hub route must stay before the frontend fallback. A safe Hub rule has one Hub handler only:

```caddy
redir /hub /hub/ 308

handle_path /hub/* {
    root * /opt/karyra/hub/build

    @hub_immutable path /_app/immutable/*
    header @hub_immutable Cache-Control "public, max-age=31536000, immutable"

    @hub_html path *.html /
    header @hub_html Cache-Control "private, max-age=0, must-revalidate"

    try_files {path} {path}/ /spa.html
    file_server
}
```

Do not use a separate `handle_path /hub/_app/immutable/*` block for the same build folder. That can strip too much path and break static asset lookup.

## Required smoke checks

```bash
curl -I https://spark.user.cloudjkt01.com/hub/
curl -I https://spark.user.cloudjkt01.com/hub/_app/immutable/
curl -fsS http://127.0.0.1:8787/health/live
curl -fsS http://127.0.0.1:8787/health/ready
```

For browser verification, open DevTools Network and confirm Hub CSS/JS requests under `/hub/_app/immutable/` return `200` and the correct asset content type.

## Boundary

This document records the live deployment contract only. It does not replace the official clean repositories and does not imply immediate merge to `karyra-spark/*`.
