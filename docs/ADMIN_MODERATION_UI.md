# PASS 17G/17H — Admin Moderation UI Integration

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Status

PASS 17G menambahkan private admin UI untuk social moderation. PASS 17H menambahkan operations history agar operator bisa melihat riwayat bulk moderation setelah reload.

Route:

```txt
/admin/moderation
```

Route ini memakai SvelteKit server load/actions. Token admin tetap dibaca dari private env server-side melalui `$lib/admin/admin-api.ts`; token tidak dikirim ke browser.

## Backend yang dipakai

```txt
PASS 17E — /api/admin/social/bulk/moderation-actions
PASS 17F — /api/admin/social/ml/*
PASS 17H — /api/admin/social/ops/*
```

Read endpoints:

```txt
/api/admin/social/reports
/api/admin/social/posts
/api/admin/social/comments
/api/admin/social/ml/signals
/api/admin/social/ops/bulk-jobs
```

Action endpoints:

```txt
/api/admin/social/ml/scan
/api/admin/social/ml/signals/:signal_id/mark-reviewed
/api/admin/social/bulk/moderation-actions
```

## Fitur UI

- Dashboard metric untuk loaded moderation window.
- Operations history untuk recent bulk moderation jobs.
- ML signal queue.
- Manual scan target post/comment.
- Mark ML signal as reviewed.
- Bulk post action: hide, remove, restore.
- Bulk comment action: hide, remove, restore.
- Bulk report action: mark reviewed, dismiss report.
- Dry-run checkbox aktif secara default pada bulk action.

## Safety boundary

- ML scan tidak melakukan action pada konten.
- Mark reviewed tidak melakukan hide/remove/restore.
- Operations history read-only.
- Bulk action membutuhkan checkbox selection eksplisit.
- Dry-run default aktif agar operator memvalidasi target sebelum mutasi.
- Superadmin tetap legacy/env root; admin/moderator tetap delegated backend role.

## Deploy frontend

```bash
cd /opt/karyra/spark
git pull
pnpm build
systemctl restart karyra-spark-web
systemctl status karyra-spark-web --no-pager
```

## Smoke checks

Buka:

```txt
https://spark.user.cloudjkt01.com/admin/moderation
```

Expected:

- Sidebar menampilkan `Moderation`.
- Page menampilkan metric ML signals, reports, dan bulk jobs.
- Recent bulk moderation jobs tampil jika pernah ada job.
- Scan target form terlihat.
- ML queue, post table, comment table, report table tampil sesuai data backend.

Server-side action smoke test dari UI:

1. Pilih 1 post.
2. Biarkan `Dry-run only` aktif.
3. Action `Hide`.
4. Submit `Run selected posts`.
5. Expected message: bulk job status `dry_run`, `would apply` bertambah.
6. Refresh halaman; expected job tersebut muncul di `Recent bulk moderation jobs`.

DB verification:

```bash
cd /opt/karyra/spark-api
set -a
source .env.host
set +a

psql "$DATABASE_URL" -c "select status, dry_run, total_count, would_apply_count, applied_count, skipped_count, failed_count from social_moderation_bulk_jobs order by created_at desc limit 5;"

psql "$DATABASE_URL" -c "select actor_kind, action, target_type, target_id, created_at from admin_audit_events where action like 'social_bulk%' or action like 'ml_moderation%' order by created_at desc limit 10;"
```
