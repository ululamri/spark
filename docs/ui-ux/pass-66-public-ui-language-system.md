# Pass 66 — Public UI/UX Language System

## Tujuan

Karyra Spark sudah memiliki backend staging yang tersambung untuk auth, profile, learning/lab progress, proof ledger, passport, media lifecycle, community signal, dan hub signal. Setelah fondasi teknis stabil, UI publik harus dibersihkan agar terasa seperti aplikasi pengguna akhir.

Masalah utama yang perlu dibenahi:

- CTA masih terasa seperti dibuat untuk developer.
- Copy sering menjelaskan mekanisme internal, bukan manfaat untuk pengguna.
- Panel/toast/drawer kadang memakai istilah teknis.
- Passport/Proof perlu tetap kuat, tetapi lebih manusiawi dan mudah dipahami.
- Home sampai Settings harus memakai satu bahasa produk yang konsisten.

## Prinsip bahasa Spark

### 1. Pengguna dulu, sistem di belakang

Tulis apa yang pengguna dapatkan, lakukan, atau pahami. Jangan membuka cara sistem bekerja kecuali memang konteksnya edukasi.

Contoh:

- Hindari: `Backend session aktif`
- Gunakan: `Sesi kamu aktif`

- Hindari: `Progress tersinkron ke API`
- Gunakan: `Progress tersimpan di akunmu`

- Hindari: `Proof event ledger siap`
- Gunakan: `Bukti perjalananmu sudah tercatat`

### 2. Non-teknikal first, teknikal later

Spark melayani pengguna lokal/non-teknikal. Istilah blockchain/Starknet boleh muncul bertahap, tetapi harus diberi jembatan.

Contoh:

- Hindari: `Evidence root siap untuk anchor`
- Gunakan: `Ringkasan bukti sudah siap untuk tahap verifikasi berikutnya`

- Hindari: `NFT-ready badge`
- Gunakan: `Badge siap dikembangkan menjadi credential on-chain nanti`

### 3. Passport bukan Profile

Profile adalah identitas akun pribadi. Passport adalah bukti kesiapan yang diterbitkan Spark.

Contoh:

- Profile: `Nama, handle, bio, lokasi, avatar`
- Passport: `Readiness level, bukti belajar, bukti praktik, bukti safety, status credential`

### 4. Status harus memberi arah

Status bukan hanya label. Status harus menjawab: apa artinya dan apa langkah berikutnya.

Contoh:

- Hindari: `Draft`
- Gunakan: `Belum siap diterbitkan — selesaikan Core dan Lab Beginner dulu`

### 5. CTA harus berbasis aksi pengguna

CTA harus memakai kata kerja konkret.

Baik:

- `Mulai belajar`
- `Lanjutkan Lab`
- `Buka Passport`
- `Simpan profil`
- `Lihat bukti kesiapan`
- `Ikuti workshop`
- `Simpan resource`

Kurangi:

- `Sync`
- `Hydrate`
- `Run`
- `Fetch`
- `Validate`
- `Open backend`

## Layer istilah

### Layer publik

Aman digunakan di UI publik:

- akun
- sesi
- profil
- progress
- perjalanan belajar
- bukti belajar
- bukti praktik
- bukti safety
- bukti kesiapan
- Passport
- badge
- credential
- workshop
- resource
- komunitas
- tersimpan
- tercatat
- siap diterbitkan

### Layer edukasi bertahap

Boleh digunakan jika diberi konteks:

- Starknet
- blockchain
- wallet
- on-chain
- credential
- verifier
- mainnet
- proof

### Layer internal/developer

Jangan muncul di UI publik. Boleh di docs, script, README, console, dan komentar kode:

- backend
- API
- endpoint
- route
- route boundary
- migration
- local-state
- sync queue
- hydration
- runtime
- smoke test
- Docker
- Caddy
- MinIO
- PostgreSQL
- SQLx
- Axum
- evidence root
- event ledger
- hash chain
- storage registry
- NFT-ready

## Pola copy per area

### Home

Home harus menjawab:

1. Spark itu apa?
2. Siapa yang cocok memulai?
3. Apa langkah pertama?
4. Apa hasil akhirnya?

Nada: hangat, jelas, mengundang.

### Auth

Login/register harus sederhana.

Gunakan:

- `Masuk ke akun Spark`
- `Daftar untuk mulai belajar`
- `Sesi kamu sudah berakhir. Masuk lagi untuk melanjutkan.`

Hindari:

- `Backend tidak tersedia`
- `Unauthorized`
- `Token expired`

### Dashboard

Dashboard adalah ringkasan perjalanan.

Gunakan:

- `Lanjutkan dari langkah terakhir`
- `Progress kamu tersimpan`
- `Bukti mulai terkumpul saat kamu menyelesaikan materi dan latihan`

### Core/Learn

Core menjelaskan pemahaman.

Gunakan:

- `Belajar fondasi`
- `Cek pemahaman`
- `Selesaikan level`
- `Bukti belajar tercatat`

### Lab

Lab menjelaskan praktik aman.

Gunakan:

- `Latihan aman`
- `Simulasi`
- `Checklist safety`
- `Bukti praktik tercatat`

### Passport

Passport harus terasa sebagai produk utama, bukan debug proof.

Gunakan:

- `Bukti kesiapan`
- `Siap diterbitkan`
- `Ringkasan bukti`
- `Credential Spark`
- `Belum memenuhi syarat`
- `Langkah berikutnya`

Hindari di UI utama:

- `evidence root`
- `proof event ledger`
- `hash chain`
- `backend eligibility engine`

Jika perlu ditampilkan, taruh di bagian detail/advanced dengan bahasa sederhana.

### Profile/Settings

Profile adalah identitas akun pribadi. Settings adalah preferensi.

Gunakan:

- `Akun pribadi`
- `Preferensi tampilan`
- `Simpan perubahan`
- `Profil tersimpan di akunmu`

### Hub/Community

Hub/Community harus terasa sebagai jembatan sosial dan eksplorasi.

Gunakan:

- `Simpan resource`
- `Ikuti workshop`
- `Eksplorasi bertahap`
- `Aktivitas komunitasmu tercatat`

## Aturan toast

Toast harus pendek, jelas, dan memberi arah.

Format:

- Judul: maksimal 4 kata
- Copy: satu kalimat pendek

Contoh:

- `Profil tersimpan` — `Perubahan profil sudah tersimpan di akunmu.`
- `Sesi berakhir` — `Masuk lagi untuk melanjutkan.`
- `Progress tercatat` — `Langkah belajar ini sudah masuk ke perjalananmu.`

## Aturan panel dan drawer

Panel/drawer tidak boleh menjadi debug dashboard.

Gunakan panel untuk:

- navigasi
- ringkasan progress
- langkah berikutnya
- status akun

Hindari panel untuk:

- status backend
- scope API
- local queue
- storage/backend readiness

## Target akhir fase UI/UX

Spark staging harus terasa seperti:

> aplikasi belajar publik yang membantu pengguna lokal memahami blockchain/Starknet secara bertahap, menyimpan progress, mengumpulkan bukti, dan menerbitkan Passport kesiapan.

Bukan seperti:

> dashboard developer yang menampilkan status backend, API, proof ledger, dan sync state.
