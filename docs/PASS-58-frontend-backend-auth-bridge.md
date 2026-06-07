# Pass 58 — Frontend ↔ Backend Auth Bridge

Pass 58 makes the public Spark auth surface use the live Rust/Axum backend auth endpoints.

## What changes

- Login calls `POST /v1/auth/login`.
- Register calls `POST /v1/auth/register`.
- App shell hydrates session from `GET /v1/auth/me`.
- Logout helper calls `POST /v1/auth/logout` before clearing local UI cache.
- Fetch uses `credentials: 'include'` so the httpOnly session cookie is respected.
- Password copy now matches backend minimum length: 8 characters.

## What does not change

- Learning/progress data is still mostly frontend-local.
- Passport/proof frontend integration is not migrated yet.
- Server stack, PostgreSQL, MinIO, and Caddy are not changed by this pass.

## Server deployment after push

```bash
cd /opt/karyra/spark
git pull
npm run build

cd /opt/karyra/spark-api
docker compose --env-file config/env.unified.staging -f infra/docker-compose.unified.staging.yml up -d --build spark-web
```

Then test in browser:

- Register a new user with an 8+ character password.
- Confirm redirect to `/dashboard`.
- Refresh the page; the session should remain.
- Open a private window; not logged in.
- Log in with the same email/password.

## Operational note

The frontend still stores a small non-secret UI cache in localStorage. The real session authority is now the backend httpOnly cookie.
