# Pass 39 — Storage, Reset, and Backend Authority Policy

## Prinsip utama

Spark boleh local-first, tetapi tidak boleh local-trapped. Selama backend belum aktif, localStorage membantu membuat produk terasa hidup. Setelah backend aktif, server menjadi sumber utama untuk data user, sementara penyimpanan lokal berubah menjadi cache, draft, optimistic update, dan antrean offline.

## Mode reset

### Reset progres lokal

Menghapus data perjalanan belajar di perangkat ini tanpa mengeluarkan user dari sesi lokal.

Yang dihapus:

- progress belajar
- checkpoint dan catatan belajar
- Lab completion
- workshop/resource tersimpan
- status baca notifikasi
- diskusi lokal user
- antrean sync

Yang dipertahankan:

- sesi lokal
- tema tampilan
- pilihan cookie
- konten terkelola lokal

### Hapus semua data lokal

Menghapus semua data Spark di perangkat ini. Mode ini cocok untuk QA, demo publik, perangkat bersama, atau saat user ingin mulai dari nol.

Yang dihapus:

- semua item reset progres lokal
- sesi lokal
- tema tampilan
- pilihan cookie
- konten terkelola lokal

## Kebijakan backend nanti

| Area | Server menjadi sumber utama | Local state setelah backend |
| --- | --- | --- |
| Learning | Ya | Cache, draft note, optimistic update |
| Lab | Ya | Recent simulation cache |
| Community | Ya | Cache event/workshop/cohort |
| Diskusi | Ya | Draft, optimistic feed, offline queue |
| Notifications | Ya | Read-state cache |
| Session | Ya | Cookie httpOnly secure, bukan localStorage |
| Theme | Opsional | Boleh tetap local preference |

## Data yang tidak boleh disimpan

Spark tidak boleh menyimpan seed phrase, private key, mnemonic, kode pemulihan, atau credential sensitif di browser, baik di localStorage, cookie, maupun IndexedDB.

## Jalur migrasi backend

1. Pertahankan UI local-first.
2. Event mutasi masuk ke `sync-event-queue`.
3. Saat backend siap, tambahkan `rest-sync-gateway` atau `server-sync-gateway`.
4. Server mengembalikan canonical state.
5. Local state diubah menjadi cache dari response server.
6. Reset progres lokal tidak menghapus data server.
7. Reset akun/server dibuat terpisah dan jauh lebih ketat.
