# Pass 42 — Core & Lab Leveling Architecture

Pass 42 mengembalikan tiga mainline Spark ke arah utama: Core membangun pemahaman, Lab membangun kemampuan praktik aman, dan Passport nanti memakai hasil keduanya sebagai dasar proof-of-readiness Starknet-native.

## Keputusan produk

Core dan Lab tidak lagi dibaca sebagai alur linear biasa. Keduanya memakai level:

- Beginner
- Intermediate
- Advanced

Setiap level punya materi/latihan, ujian akhir, passing score, dan status kelulusan. Level berikutnya terbuka setelah level sebelumnya lulus.

## Scope Pass 42

- Menambah model level dan ujian.
- Menambah local leveling state.
- Mengubah `/core` menjadi Core Leveling Flow.
- Mengubah `/lab` menjadi Lab Leveling Flow.
- Menambah reset support untuk data leveling.
- Menambah audit script.

## Bukan scope Pass 42

- Belum membuat Passport eligibility engine.
- Belum membuat Starknet contract.
- Belum membuat backend auth/database.
- Belum membuat KYC.
- Belum membuat credential issuance.

## Hubungan ke Passport

Pass 42 menghasilkan bahan dasar untuk Pass 43:

- Core Beginner/Intermediate/Advanced exam result
- Lab Beginner/Intermediate/Advanced exam result
- Passing score
- Level status
- Evidence yang bisa dipakai Passport

Pass 43 harus dibahas ulang sebelum dibuat, karena konsep Passport Starknet-native perlu dikunci lebih matang.
