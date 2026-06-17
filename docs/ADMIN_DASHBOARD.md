# Karyra Admin Dashboard v1

## Purpose

The Admin Dashboard is a private SvelteKit surface for operational visibility across Karyra Spark learning, Safe Practice Lab, Readiness Passport, Proof Ledger foundations, community pilots, Starknet Hub readiness, CMS operations, and moderation operations.

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
| `/admin/content` | Documentation availability map; future home for structured Learn/Core and Lab CMS |
| `/admin/settings` | Safe environment summary, feature flags, and safety checklist |

## Security model

Admin access is fail-closed. The current root admin is intentionally traditional: it is a server-side superadmin/dev bootstrap, not a normal database user. This keeps root access separate from future user-based admin and moderator accounts.

The current dashboard gate is enabled only when the private runtime admin configuration is valid. The frontend admin login creates an HttpOnly, SameSite=Strict, signed session cookie scoped to `/admin`. Admin responses use `Cache-Control: private, no-store`, `X-Frame-Options: DENY`, and a same-origin referrer policy. Login attempts have a small in-memory rate limit.

The backend Admin API uses a private server-side admin token sent as `x-karyra-admin-token`. A valid bootstrap token acts as `superadmin` and has full capability. This superadmin does not need an email, a `users` row, or an `admin_role_assignments` row.

Do not place admin credentials, session secrets, private RPC URLs, database URLs, or tokens in `PUBLIC_*` variables.

## Role model

| Role | Storage | Purpose |
| --- | --- | --- |
| `superadmin` | Legacy server-side admin configuration | Root/dev/operator access, emergency recovery, role management, dangerous/system actions |
| `admin` | Future database-backed delegated assignment | CMS operations, moderation operations, bulk actions, ML moderation workflow, user safety management |
| `moderator` | Future database-backed delegated assignment | Moderation queue, reports, media review, limited bulk actions |

`admin_role_assignments` is expected to be empty on older deployments. `0 rows` is normal when the system is still running in legacy superadmin mode. Do not bootstrap superadmin from `users.email` unless the project intentionally migrates root access away from the legacy model.

## Data behavior

All operational data is loaded from Spark Admin API v1 under `/api/admin/*`. The server-only client is defined in `src/lib/admin/admin-api.ts`; page server loads attach the private admin token, and only response data is serialized to the browser.

Source-controlled lesson and Lab catalogs may label IDs observed by the backend. They never populate an unavailable or empty backend dataset. When an endpoint returns `data_source: not_available`, the UI shows an explicit empty state instead of mock metrics or records.

## CMS boundary

`ksbuilder` owns public website copy, CTA, and public surface building. Admin CMS is separate and should own structured Learn/Core and Lab content: lessons, lab steps, checkpoints, references, draft/review/publish/archive state, and revision history.

## Starknet boundary

Starknet status is read from the protected Admin API. Private RPC configuration remains owned by the backend and never reaches the browser.

Account readers, Passport anchors, badges, payments, merchant utility, wallet connection, signatures, transactions, and onchain writes are unavailable or explicitly marked as roadmap.

## Current limitations

- Superadmin is still the legacy root credential, intentionally separate from user-based roles.
- Delegated `admin` and `moderator` roles are foundation-ready but not yet wired through the full admin UI.
- Lesson and Lab catalog metadata remains source-controlled and read-only until the dedicated Admin CMS pass.
- Bulk moderation and ML moderation are planned after RBAC/audit alignment.
- Rate limiting is process-local and resets when the server restarts.

## Future improvements

1. Wire all admin write surfaces through capability checks and audit logging.
2. Add Admin CMS for structured Learn/Core and Lab content.
3. Add bulk moderation job support with dry-run, idempotency, and per-item result logs.
4. Add ML moderation signals as human-in-the-loop queue inputs.
5. Add privacy-reviewed facilitator verification workflows.
6. Add operational monitoring without exposing private infrastructure details.

## Safety invariants

- No wallet auto-connect.
- No signature prompt.
- No transaction prompt.
- No seed phrase or private key handling.
- No public `/studio` route.
- No onchain Passport or badge claim.
