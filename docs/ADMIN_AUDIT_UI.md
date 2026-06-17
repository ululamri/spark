# PASS 17K/17L — Admin Audit Log UI

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Status

PASS 17K menambahkan UI read-only untuk audit trail admin. PASS 17L menambahkan detail drilldown untuk satu audit event.

Route:

```txt
/admin/audit
/admin/audit/events/[eventId]
```

Route ini memakai SvelteKit server load. Token admin tetap private server-side dan tidak dikirim ke browser.

## Backend yang dipakai

```txt
GET /api/admin/audit/events
GET /api/admin/audit/events/:event_id
```

## Fitur UI

- Metric audit event window.
- Filter actor kind, action, target type.
- Tabel audit event terbaru.
- Event row link ke detail page.
- Detail page untuk full metadata JSON.
- Detail page untuk capabilities lengkap.
- Actor badge.
- Target preview.
- Summary dan metadata preview.
- Sidebar menu `Audit log`.

## Safety boundary

- Read-only.
- Tidak ada action/mutasi dari UI audit.
- Filter hanya mengubah query read/list.
- Detail page hanya membaca satu event by ID.
- Access tetap dikontrol backend dengan `audit_read`.

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
https://spark.user.cloudjkt01.com/admin/audit
```

Expected:

- Sidebar menampilkan `Audit log`.
- Audit table tampil jika backend punya rows.
- Filter actor/action/target type bekerja dan mengubah URL query.
- Klik action/event di audit table membuka `/admin/audit/events/<event-id>`.
- Detail page menampilkan actor, target, summary, capabilities, dan full metadata JSON.

Contoh filter:

```txt
/admin/audit?action=ml_moderation_signal_create
/admin/audit?actor_kind=super_admin_token
/admin/audit?target_type=post
```
