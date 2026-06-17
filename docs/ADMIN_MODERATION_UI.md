# PASS 17G/17H/17I/17J — Admin Moderation UI Integration

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Status

PASS 17G menambahkan private admin UI untuk social moderation. PASS 17H menambahkan operations history agar operator bisa melihat riwayat bulk moderation setelah reload. PASS 17I menambahkan detail drilldown per bulk job. PASS 17J menambahkan URL-based filters untuk workflow operator.

Route:

```txt
/admin/moderation
/admin/moderation/jobs/[jobId]
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
/api/admin/social/ops/bulk-jobs/:job_id
```

Action endpoints:

```txt
/api/admin/social/ml/scan
/api/admin/social/ml/signals/:signal_id/mark-reviewed
/api/admin/social/bulk/moderation-actions
```

## Fitur UI

- Dashboard metric untuk loaded moderation window.
- URL-based filters untuk ML signals, jobs, reports, posts, dan comments.
- Operations history untuk recent bulk moderation jobs.
- Detail drilldown untuk per-target result setiap bulk job.
- ML signal queue.
- Manual scan target post/comment.
- Mark ML signal as reviewed.
- Bulk post action: hide, remove, restore.
- Bulk comment action: hide, remove, restore.
- Bulk report action: mark reviewed, dismiss report.
- Dry-run checkbox aktif secara default pada bulk action.

## URL filters

```txt
signal_status        all | clean | needs_review | high_risk | blocked_pending_review
signal_target_type   all | post | comment
job_status           all | running | dry_run | completed | partial_failed | failed
job_target_type      all | post | comment | report
report_status        all | pending | reviewed | dismissed | actioned
report_target_type   all | post | comment
post_status          all | published | hidden | removed | deleted
comment_status       all | published | hidden | removed | deleted
```

Contoh:

```txt
/admin/moderation?signal_status=high_risk&job_status=failed
/admin/moderation?post_status=hidden&comment_status=removed
/admin/moderation?report_status=all&report_target_type=post
```

## Safety boundary

- ML scan tidak melakukan action pada konten.
- Mark reviewed tidak melakukan hide/remove/restore.
- Operations history dan job detail read-only.
- Filter hanya mengubah query read/list; tidak melakukan action.
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
- Filter workflow tampil dan dapat mengubah URL query.
- Recent bulk moderation jobs tampil jika pernah ada job.
- Job ID di history bisa dibuka ke detail page.
- Scan target form terlihat.
- ML queue, post table, comment table, report table tampil sesuai data backend dan filter.

Server-side action smoke test dari UI:

1. Pilih 1 post.
2. Biarkan `Dry-run only` aktif.
3. Action `Hide`.
4. Submit `Run selected posts`.
5. Expected message: bulk job status `dry_run`, `would apply` bertambah.
6. Refresh halaman; expected job tersebut muncul di `Recent bulk moderation jobs`.
7. Klik job ID; expected detail page menampilkan item result.

DB verification:

```bash
cd /opt/karyra/spark-api
set -a
source .env.host
set +a

psql "$DATABASE_URL" -c "select status, dry_run, total_count, would_apply_count, applied_count, skipped_count, failed_count from social_moderation_bulk_jobs order by created_at desc limit 5;"

psql "$DATABASE_URL" -c "select actor_kind, action, target_type, target_id, created_at from admin_audit_events where action like 'social_bulk%' or action like 'ml_moderation%' order by created_at desc limit 10;"
```
