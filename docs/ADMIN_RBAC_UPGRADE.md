# Karyra Admin RBAC Upgrade Guide

## Final model

Karyra keeps superadmin as a traditional root/admin bootstrap, while delegated operational roles become user-based later.

| Role | Current source | Intended use |
| --- | --- | --- |
| `superadmin` | Legacy server-side admin configuration | Root/dev/operator access, recovery, role management, dangerous actions |
| `admin` | `admin_role_assignments` | CMS, moderation, bulk action, ML moderation workflow |
| `moderator` | `admin_role_assignments` | Moderation queue, reports, media review, limited bulk action |

## Important boundary

`superadmin` is not required to exist in `users` and is not required to exist in `admin_role_assignments`.

If this query returns zero rows, it is normal for the legacy root model:

```sql
select user_id, role, status, revoked_at, updated_at
from admin_role_assignments
order by updated_at desc;
```

Do not create a fake user/email just to represent superadmin. The traditional root path stays separate for safety and recovery.

## Upgrade order

1. Keep the existing admin login and server-side admin token working.
2. Apply RBAC/audit migrations so delegated roles can be added later.
3. Verify the legacy root can still access protected admin API routes.
4. Wire future admin/moderator UI actions to capability checks.
5. Add delegated `admin` and `moderator` users only when user-based admin accounts are ready.

## Deployment

From the live backend path:

```bash
cd /opt/karyra/spark-api
git pull

set -a
source .env.host
set +a

psql "$DATABASE_URL" -f migrations/202606170001_admin_rbac_audit_foundation.sql
psql "$DATABASE_URL" -f migrations/202606170002_normalize_admin_role_alias.sql
psql "$DATABASE_URL" -f migrations/202606170003_promote_single_active_admin_to_superadmin.sql
psql "$DATABASE_URL" -f migrations/202606170004_keep_superadmin_legacy_root.sql

cargo build --release
systemctl restart karyra-spark-api
systemctl status karyra-spark-api --no-pager
```

Migration `202606170003` may affect zero rows. That is not an error. Migration `202606170004` preserves the final boundary by converting any accidental database-backed `superadmin` assignment back into delegated `admin`.

## Verification

Check delegated roles:

```bash
psql "$DATABASE_URL" -c "select user_id, role, status, revoked_at, updated_at from admin_role_assignments order by updated_at desc;"
```

For current legacy-root deployments, zero rows is valid.

Check root admin API access:

```bash
curl -s https://spark.user.cloudjkt01.com/api/admin/team/scope \
  -H "x-karyra-admin-token: $KARYRA_ADMIN_TOKEN" | head
```

Expected: JSON response from `admin-rbac-foundation`.

## What not to do

- Do not bootstrap superadmin from `users.email` in the current traditional model.
- Do not require an email for superadmin.
- Do not put root secrets in `PUBLIC_*` variables.
- Do not use `admin_role_assignments` as the root recovery mechanism.

## Next implementation pass

After this alignment, the next backend pass should wire admin social moderation writes through shared authorization and audit helpers:

- superadmin token: full access
- admin role: moderation/CMS/bulk/ML capabilities
- moderator role: moderation/reports/media review capabilities
