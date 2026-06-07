# Karyra Spark Public Copy Contract

Pass: 68A  
Scope: semua microcopy publik Spark.

## 1. Definisi Public Copy

Semua teks yang bisa dilihat, diklik, dibaca, didengar screen reader, atau muncul sebagai feedback pengguna adalah **Public Copy**.

Termasuk:

- judul halaman dan section
- deskripsi dan helper text
- tombol, tautan, dan CTA
- header, footer, sidebar, bottom nav, mobile drawer
- menu profil dan settings
- toast/snackbar
- notification dan inbox preview
- modal, confirmation dialog, alert, banner
- empty state, loading state, error state
- form label, placeholder, validation, dan helper text
- badge, status, chip, tooltip
- cookie notice
- breadcrumb
- aria-label dan screen-reader text
- success/fail message
- destructive action copy

## 2. Suara Produk

Spark harus terdengar seperti:

- teman belajar yang tenang,
- fasilitator lokal yang jelas,
- produk profesional yang memberi kepastian.

Spark tidak boleh terdengar seperti dashboard teknis yang menjelaskan sistem internal.

## 3. Prinsip CTA

CTA publik wajib menggunakan kata kerja aksi yang jelas.

Gunakan:

- Mulai
- Lanjutkan
- Ikuti
- Kirim
- Lihat
- Temukan
- Jelajahi
- Selesaikan
- Simpan
- Coba
- Buka, hanya jika benar-benar membuka halaman/ruang, bukan sebagai label pasif.

Hindari tombol yang hanya berupa nama fitur:

- Core
- Lab
- Passport
- Hub
- Dashboard
- Settings

Contoh:

| Jangan | Gunakan |
|---|---|
| Core | Mulai Core Beginner |
| Lab | Mulai Simulasi Wallet |
| Passport | Lihat Passport Saya |
| Hub | Jelajahi Resource Starknet |
| Masuk | Masuk untuk Lanjutkan Progres |
| Daftar | Buat Akun Gratis & Mulai Belajar |
| Kirim jawaban | Kirim & Lihat Hasil |
| Simpan | Simpan ke Hub Saya |

## 4. Value Proposition

CTA penting harus menjawab: setelah klik, pengguna dapat apa?

Contoh:

- “Buat Akun Gratis & Mulai Belajar” lebih jelas daripada “Daftar”.
- “Daftar Gratis & Mulai Bangun Passport” lebih jujur daripada “Daftar & Dapatkan Passport Gratis”, karena Passport perlu diselesaikan bertahap.
- “Masuk untuk Lihat Progres” lebih jelas daripada “Masuk”.

## 5. Jargon Internal

Istilah berikut boleh muncul di docs/script/internal, tetapi bukan bahasa utama UI publik:

- backend
- API
- runtime
- route
- local-state
- sync queue
- storage
- evidence root
- proof event ledger
- proof event
- recorded proof event
- session backend
- HttpOnly
- endpoint
- payload
- schema
- hash chain
- anchor

Padanan bahasa publik:

| Istilah internal | Bahasa publik |
|---|---|
| backend/session | akun tersimpan aman |
| sync queue | menunggu tersinkron |
| local-state | data di perangkat ini |
| storage | penyimpanan data |
| evidence root | bukti tersimpan aman |
| proof event ledger | jejak belajar |
| proof event recorded | bukti belajarmu tercatat |
| API error | belum bisa memuat data |
| route | halaman |
| runtime | aplikasi |

## 6. Aksi Berisiko

Aksi berisiko wajib dua langkah.

Contoh:

1. Tombol awal: “Reset Progress Belajar”
2. Modal: “Yakin ingin mereset semua progress? Tindakan ini tidak dapat dibatalkan.”
3. Tombol final: “Ya, reset progress saya”

Aksi yang wajib konfirmasi:

- reset progress
- hapus data lokal
- keluar dari akun bila ada perubahan belum tersimpan
- batalkan pendaftaran workshop/cohort
- hapus catatan/highlight
- revoke/hapus bukti/credential

## 7. Pola Pesan

### Sukses

- “Progres tersimpan.”
- “Bukti belajarmu tercatat.”
- “Kamu sudah menyelesaikan lesson ini.”

### Loading

- “Menyimpan progresmu...”
- “Memuat langkah berikutnya...”
- “Menyiapkan ruang praktik...”

### Error

- “Belum bisa memuat data. Coba lagi sebentar.”
- “Koneksi terputus. Progress di perangkat ini tetap aman.”
- “Belum bisa menyimpan. Coba ulangi.”

### Empty state

- “Belum ada pesan baru.”
- “Belum ada workshop tersimpan. Jelajahi jadwal terdekat.”
- “Passport-mu belum terbit. Mulai dari Core Beginner untuk membangun bukti kesiapan.”

## 8. A/B Test Copy

A/B test boleh dilakukan setelah analytics siap. Untuk sekarang, pilih copy yang paling jelas dan jujur.

Kandidat awal:

- “Mulai Belajar” vs “Mulai dari Lesson Pertama” vs “Mulai Perjalanan Amanmu”
- “Daftar” vs “Buat Akun Gratis & Mulai Belajar”
- “Kirim jawaban” vs “Kirim & Lihat Hasil”
- “Simpan” vs “Simpan ke Hub Saya”
