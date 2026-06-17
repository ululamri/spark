# PASS 17M — Delegated Admin Team UI

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Status

PASS 17M menambahkan UI untuk delegated admin/moderator role assignments.

Route:

```txt
/admin/team
```

Superadmin tetap legacy/env root token. Route ini hanya mengelola delegated user-based roles: `admin` dan `moderator`.

## Backend yang dipakai

```txt
GET  /api/admin/team/capabilities
GET  /api/admin/team/members
POST /api/admin/team/members
POST /api/admin/team/members/:user_id/revoke
```

## RBAC backend

Read:

```txt
audit_read
```

Write/revoke:

```txt
admin_manage
```

## Fitur UI

- List delegated admin/moderator assignments.
- Filter role/status.
- Role capability catalog.
- Grant/update role by email or user ID.
- Optional custom capabilities.
- Optional expiry timestamp.
- Revoke active assignment.
- Link ke audit role changes.

## Safety boundary

- Tidak membuat superadmin user.
- Token admin tetap private server-side.
- Grant/update/revoke memakai backend RBAC dan audit.
- Empty capabilities memakai backend defaults.
- Moderator default tidak mendapat restore capability kecuali backend policy berubah.

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
https://spark.user.cloudjkt01.com/admin/team
```

Expected:

- Sidebar menampilkan `Admin team`.
- Role catalog tampil.
- Active assignments tampil jika ada.
- Filter role/status bekerja.

Safe write test:

1. Gunakan email user aktif non-superadmin.
2. Pilih `moderator`.
3. Kosongkan capabilities agar backend memakai default.
4. Isi reason.
5. Submit.
6. Expected assignment tampil sebagai moderator.
7. Cek `/admin/audit?action=admin_role_upsert`.
8. Revoke assignment jika hanya test.
