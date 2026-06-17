# PASS 18B/18C — User-side Auth Verification

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Status

PASS 18B menambahkan panel verifikasi akun di halaman user settings. PASS 18C meluruskan model auth frontend menjadi backend-session only dan menghapus narasi local-session dari user-facing flow.

Route:

```txt
/settings
```

Komponen:

```txt
src/lib/ui/SparkAccountSessionPanel.svelte
```

## Tujuan

Memudahkan test manual dari sisi user setelah register/login:

- memastikan akun backend aktif,
- melihat email/user ID/handle,
- cek ulang `/v1/auth/me` dari browser,
- logout dari session backend.

## Model final

```txt
Akun user = backend auth session.
Cookie httpOnly + /v1/auth/me = sumber kebenaran.
LocalStorage auth key = cache UI non-rahasia, bukan sumber kebenaran akun.
```

Warisan `local-session` tidak lagi menjadi status akun yang valid di frontend production.

## Safety boundary

- Tidak menampilkan cookie/token mentah.
- Tidak membuka admin token.
- Semua request user auth tetap memakai cookie `credentials: include` melalui state auth yang sudah ada.
- Panel hanya membaca state akun dan memanggil endpoint user auth biasa.
- `Bersihkan Perangkat` pada data control menutup session backend lebih dulu sebelum membersihkan cache browser.

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
Akun backend aktif
Email: <email-user>
User ID: <uuid>
Status akun: Terverifikasi backend
```

5. Klik `Cek ulang akun`.
6. Expected toast `Session valid`.
7. Refresh browser.
8. Expected akun tetap aktif.
9. Klik `Keluar`.
10. Expected user logout dan protected route meminta login ulang.

## Admin team follow-up

Setelah user-side account valid, superadmin bisa membuka:

```txt
/admin/team
```

lalu grant role `moderator` atau `admin` ke email user aktif untuk menguji delegated admin end-to-end.
