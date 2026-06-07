# Pass 68E — Passport Explainability Preview

Pass ini membuat Passport lebih mudah dipahami oleh pengguna publik.

## Tujuan

- Passport tidak terasa abstrak atau seperti istilah teknis.
- Pengguna tamu bisa melihat preview nilai Passport tanpa dipaksa login terlebih dahulu.
- Pengguna yang belum memenuhi syarat melihat alasan yang jelas: apa yang sudah tercatat dan apa langkah berikutnya.
- Bahasa teknis seperti `evidence root`, `proof event ledger`, dan istilah sistem tidak tampil sebagai copy utama UI publik.

## Perubahan

- Halaman `/passport` sekarang menampilkan preview untuk tamu.
- Pengguna masuk tetap melihat Passport personal dan panel jejak belajar.
- Hero Passport menekankan kesiapan, bukti belajar, dan langkah berikutnya.
- Status Passport menjelaskan mengapa belum terbit atau mengapa sudah siap.
- Label verifikasi dibuat lebih manusiawi: `Belajar mandiri`, `Diverifikasi komunitas`.
- Label teknis seperti `Target chain`, `Badge NFT`, dan `Issuer` diganti menjadi bahasa pengguna.

## Cek

```bash
npm run audit:pass68e
npm run audit:pass68d
npm run audit:pass68c
npm run audit:pass68b
npm run audit:public-copy
npm run check
npm run build
```
