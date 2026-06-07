# Pass 68D — Core & Lab Flow Cleanup

Pass ini merapikan pengalaman utama Core dan Lab agar pengguna tidak merasa didorong ke ujian sebelum siap.

## Prinsip UX

1. **Belajar dulu, baru ujian.** Ujian adalah validasi, bukan pintu masuk pertama.
2. **Satu aksi utama per layar.** Hero Core/Lab mengarahkan pengguna ke lesson/latihan pertama atau lanjutan.
3. **Terkunci harus menjelaskan jalan keluar.** Saat ujian belum terbuka, UI harus memberi alasan dan langkah berikutnya.
4. **Gagal bukan dead-end.** Setelah ujian belum lulus, pengguna mendapat opsi review dan ulangi.
5. **Bahasa publik tetap manusiawi.** Hindari istilah internal, sistem, atau developer sebagai copy utama.

## Perubahan

- Core hero tidak lagi mengarahkan langsung ke ujian.
- Lab hero tidak lagi mengarahkan langsung ke ujian.
- Ujian Core/Lab diganti gate ramah sampai syarat level selesai.
- Gate ujian menampilkan jumlah materi/latihan yang tersisa.
- Exam card punya tombol ulang yang jelas setelah hasil belum lulus.
- Tambah audit `npm run audit:pass68d`.
