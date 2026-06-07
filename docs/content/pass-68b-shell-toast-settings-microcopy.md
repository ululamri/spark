# Pass 68B — Shell, Toast, Settings & Microcopy Sweep

Pass ini menerapkan kontrak copy publik ke microcopy global Spark, terutama area yang sering muncul saat pengguna mengambil keputusan kecil:

- shell/header/topbar/menu;
- account menu;
- mobile drawer;
- notification center;
- cookie notice;
- settings;
- data control/destructive action;
- pesan/inbox model;
- warning CSS Studio dari Pass 67.

## Prinsip

1. Tombol memakai kata kerja yang jelas.
2. Copy menjelaskan manfaat atau hasil setelah klik.
3. Istilah teknis internal tidak muncul di UI publik.
4. Aksi berisiko memakai konfirmasi yang jelas.
5. Microcopy kecil tetap terdengar seperti teman belajar, bukan dashboard teknis.

## Audit

Jalankan:

```bash
npm run audit:pass68b
npm run audit:public-copy
npm run check
npm run build
```
