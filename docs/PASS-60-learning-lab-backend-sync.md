# Pass 60 — Learning/Lab Backend Sync

Pass ini menghubungkan progress belajar dan lab frontend ke backend Spark API.

## Yang berubah

- Lesson completion frontend memanggil `POST /v1/learning/lessons/{lesson_id}/progress`.
- Checkpoint answer frontend memanggil `POST /v1/learning/checkpoints/{checkpoint_id}/results`.
- Lab completion frontend memanggil `POST /v1/lab/attempts`.
- Saat session backend tersedia, frontend hydrate progress dari:
  - `GET /v1/learning/me/progress`
  - `GET /v1/lab/me/attempts`
- Local storage tetap dipakai sebagai UI cache agar UX tidak patah ketika koneksi gagal.

## Prinsip

Frontend tidak lagi menjadikan local state sebagai sumber proof utama. Progress yang valid untuk Passport harus berasal dari backend tables dan proof ledger.

## Runtime smoke

Di server:

```bash
cd /opt/karyra/spark
bash scripts/karyra-pass60-progress-runtime-smoke.sh http://127.0.0.1 spark.user.cloudjkt01.com
```

Script ini membuat user smoke, mencatat lesson progress, checkpoint result, lab attempt, lalu mengecek proof event.
