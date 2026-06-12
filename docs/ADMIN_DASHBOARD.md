# Karyra Admin Dashboard v1

## Purpose

The Admin Dashboard is a private SvelteKit surface for operational visibility across Karyra Spark learning, Safe Practice Lab, Readiness Passport, Proof Ledger foundations, community pilots, and Starknet Hub readiness.

It is intentionally separated from the public learner shell. It does not provide wallet connection, signature, transaction, private-key, seed-phrase, or onchain write behavior.

## Routes

| Route | Purpose |
| --- | --- |
| `/admin` | Overview metrics, recent activity state, API health, and read-only Starknet status |
| `/admin/login` | Environment-gated admin login |
| `/admin/learners` | Learner search/filter contract and protected empty state |
| `/admin/learners/[id]` | Protected learner detail contract |
| `/admin/lessons` | Source-backed Core lesson inventory and public previews |
| `/admin/lab` | Safe Practice Lab module inventory and recent activity |
| `/admin/passport` | Passport derivation, records, and Evidence Trail contract |
| `/admin/proofs` | Proof Ledger and facilitator-verification contract |
| `/admin/pilots` | Community pilot session templates and evidence guidance |
| `/admin/starknet` | Hub route, read-only RPC status, reader status, and roadmap |
| `/admin/content` | Documentation availability map |
| `/admin/settings` | Safe environment summary, feature flags, and safety checklist |

## Security model

Admin access is fail-closed. The dashboard is disabled unless all of these private runtime variables are valid:

- `KARYRA_ADMIN_ENABLED=true`
- `KARYRA_ADMIN_PASSWORD` with at least 12 characters
- `KARYRA_ADMIN_SESSION_SECRET` with at least 32 characters

Optional variables:

- `KARYRA_ADMIN_SESSION_HOURS` between 1 and 24, defaulting to 8

Admin API variables, both private and server-only:

- `KARYRA_ADMIN_API_BASE_URL` pointing to the Spark API origin, `/api` base, or full `/api/admin` base
- `KARYRA_ADMIN_TOKEN` sent by server load functions as `x-karyra-admin-token`

The login action creates an HttpOnly, SameSite=Strict, signed session cookie scoped to `/admin`. Admin responses use `Cache-Control: private, no-store`, `X-Frame-Options: DENY`, and a same-origin referrer policy. Login attempts have a small in-memory rate limit.

Do not place admin credentials, session secrets, private RPC URLs, database URLs, or tokens in `PUBLIC_*` variables.

### Production TODO

The environment credential is a minimal v1 gate, not complete production RBAC. Before enabling admin writes or broader deployment, replace it with:

- identity-provider authentication and explicit admin/facilitator roles;
- revocable server-side sessions;
- per-action authorization;
- durable rate limiting;
- audit logs for sensitive reads and every write;
- field-level privacy and retention policies;
- CSRF review for future state-changing actions.

## Data behavior

All operational data is loaded from Spark Admin API v1 under `/api/admin/*`. The server-only client is defined in `src/lib/admin/admin-api.ts`; page server loads attach the private admin token, and only response data is serialized to the browser.

Source-controlled lesson and Lab catalogs may label IDs observed by the backend. They never populate an unavailable or empty backend dataset. When an endpoint returns `data_source: not_available`, the UI shows an explicit empty state instead of mock metrics or records.

## Starknet boundary

Starknet status is read from the protected Admin API. Private RPC configuration remains owned by the backend and never reaches the browser.

Account readers, Passport anchors, badges, payments, merchant utility, wallet connection, signatures, transactions, and onchain writes are unavailable or explicitly marked as roadmap.

## Current limitations

- Admin API v1 is read-only.
- Lesson and Lab catalog metadata remains source-controlled and read-only.
- Documentation files are checked for repository presence but are not individually rendered as public routes.
- Rate limiting is process-local and resets when the server restarts.
- The single environment credential does not provide individual administrator identity.
- No audit log is implemented yet.

## Future improvements

1. Add production RBAC and durable audit logging.
2. Add privacy-reviewed facilitator verification workflows.
3. Add source-controlled metadata editing only after a reviewed content-write contract exists.
4. Add operational monitoring without exposing private infrastructure details.

## Safety invariants

- No wallet auto-connect.
- No signature prompt.
- No transaction prompt.
- No seed phrase or private key handling.
- No public `/studio` route.
- No onchain Passport or badge claim.
