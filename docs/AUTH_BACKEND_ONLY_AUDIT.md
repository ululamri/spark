# PASS 18C — Backend-only Auth Cleanup Audit

Tanggal: 2026-06-17  
Repo: `ululamri/spark`  
Live path: `/opt/karyra/spark`

## Kesimpulan audit

Registrasi/login tidak dibangun ulang. Auth backend sudah ada dari pass lama dan masih menjadi basis final:

```txt
POST /v1/auth/register
POST /v1/auth/login
GET  /v1/auth/me
POST /v1/auth/logout
```

Masalah yang ditemukan adalah warisan frontend saat backend belum aktif:

1. `BetaUserStatus` masih mengizinkan `local-session`.
2. `startLearningSession` masih bisa membuat user lokal dengan id `user-*`.
3. Protected route menganggap `betaSession.user` cukup untuk membuka halaman.
4. Storage registry masih mendeskripsikan auth key sebagai sesi lokal sebelum backend aktif.
5. Full device reset membersihkan cache browser tetapi sebelumnya belum menjamin backend logout cookie httpOnly.

## Perbaikan PASS 18C

### 1. Auth state backend-only

File:

```txt
src/lib/state/beta-session-state.svelte.ts
```

Perubahan:

- `BetaUserStatus` sekarang hanya `backend-session`.
- Restore session dari localStorage hanya menerima user dengan status `backend-session`.
- Id warisan `spark-local`, `example`, dan `user-*` ditolak saat restore.
- `hydrateBackendSession` sekarang selalu membersihkan user jika `/v1/auth/me` gagal selain error yang bisa dipertahankan.
- `isSignedIn()` hanya true jika status user `backend-session`.
- `startLearningSession()` dipertahankan sebagai compatibility export, tetapi dialihkan ke `registerBackendSession(input)` agar tidak membuat user lokal lagi.

### 2. Auth storage direklasifikasi sebagai cache akun backend

File:

```txt
src/lib/sync/sync-storage-registry.ts
```

Auth storage sekarang dijelaskan sebagai cache UI non-rahasia:

```txt
Cookie httpOnly + /v1/auth/me = sumber kebenaran.
LocalStorage auth key = cache UI non-rahasia.
```

### 3. Full device reset menutup session backend

File:

```txt
src/lib/ui/SparkDataControlCenter.svelte
```

`Bersihkan Perangkat` sekarang memanggil `logoutBetaSession()` sebelum membersihkan cache perangkat. Ini penting karena cookie session adalah httpOnly dan tidak bisa ditutup hanya dengan menghapus localStorage.

### 4. Dokumentasi 18B diselaraskan

File:

```txt
docs/AUTH_SESSION_VERIFICATION_UI.md
```

Dokumentasi tidak lagi menjadikan `local-session` sebagai status user-facing.

## Model final

```txt
User account = backend auth session.
Cookie httpOnly = session authority.
/v1/auth/me = session verification.
LocalStorage = UI cache only.
No production user flow may create local account/session.
```

## Deploy frontend

```bash
cd /opt/karyra/spark
git pull
pnpm build
systemctl restart karyra-spark-web
systemctl status karyra-spark-web --no-pager
```

## Smoke test

1. Pastikan ada akun hasil register backend.
2. Buka `/settings`.
3. Expected: `Akun backend aktif`.
4. Refresh browser.
5. Expected tetap akun backend aktif.
6. Klik `Bersihkan Perangkat`.
7. Expected backend logout berjalan dan protected route meminta login ulang.
8. Login ulang.
9. Expected akun kembali aktif dari backend.

## Catatan lanjutan

Istilah local masih boleh ada untuk cache perangkat, draft offline, theme preference, dan sync queue. Tetapi istilah local tidak boleh lagi menjadi identitas akun atau alternatif auth production.
