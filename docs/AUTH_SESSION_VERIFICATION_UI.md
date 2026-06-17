# PASS 18B — User-side Auth Session Verification

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Status

PASS 18B menambahkan panel verifikasi session akun di halaman user settings.

Route:

```txt
/settings
```

Komponen baru:

```txt
src/lib/ui/SparkAccountSessionPanel.svelte
```

## Tujuan

Memudahkan test manual dari sisi user setelah register/login:

- memastikan user punya `backend-session`,
- melihat email/user ID/handle/status,
- cek ulang `/v1/auth/me` dari browser,
- logout dari session backend.

## Safety boundary

- Tidak menampilkan cookie/token mentah.
- Tidak membuka admin token.
- Semua request user auth tetap memakai cookie `credentials: include` melalui state auth yang sudah ada.
- Panel hanya membaca state session dan memanggil endpoint user auth biasa.

## Deploy frontend

```bash
cd /opt/karyra/spark
git pull
pnpm build
systemctl restart karyra-spark-web
systemctl status karyra-spark-web --no-pager
```

## Smoke test user-side

1. Buka `/register`.
2. Daftar dengan email test.
3. Setelah redirect, buka `/settings`.
4. Expected panel `Akun` menampilkan:

```txt
Backend session aktif
Status: backend-session
Email: <email-user>
User ID: <uuid>
```

5. Klik `Cek ulang session`.
6. Expected toast `Session valid`.
7. Refresh browser.
8. Expected session tetap backend-session.
9. Klik `Keluar`.
10. Expected user logout dan protected route meminta login ulang.

## Admin team follow-up

Setelah user-side session valid, superadmin bisa membuka:

```txt
/admin/team
```

lalu grant role `moderator` atau `admin` ke email user aktif untuk menguji delegated admin end-to-end.
