# Pass 59 — Auth Runtime Complete

Pass ini menyelesaikan integrasi auth frontend dengan backend runtime Spark.

## Scope

- Register frontend memakai `POST /v1/auth/register`.
- Login frontend memakai `POST /v1/auth/login`.
- App shell melakukan session hydration dari `GET /v1/auth/me`.
- Protected route menunggu hydration backend sebelum redirect.
- Logout desktop/mobile memanggil `POST /v1/auth/logout`.
- Loading state login/register ditampilkan.
- Pesan error auth dibuat lebih spesifik dan tetap natural untuk user publik.
- Password minimum frontend disamakan dengan backend: 8 karakter.
- Smoke test auth runtime disediakan.

## Non-scope

- Password reset.
- Email verification.
- Rate limiting.
- OAuth/social login.
- CI/CD workflow.
- Learning/Lab/Passport backend integration.

## Server smoke

```bash
cd /opt/karyra/spark
bash scripts/karyra-pass59-auth-runtime-smoke.sh http://127.0.0.1 spark.user.cloudjkt01.com
```

## Browser checklist

1. Buka `/register`.
2. Daftar akun baru dengan password minimal 8 karakter.
3. Pastikan masuk dashboard.
4. Refresh dashboard dan pastikan session tetap aktif.
5. Logout dari menu akun.
6. Pastikan kembali menjadi guest.
7. Login ulang dengan akun yang sama.
8. Logout dari mobile drawer.

## Catatan

Session sumber utama sekarang adalah backend cookie `HttpOnly`. Local storage hanya menjadi cache UI agar render awal terasa halus.
