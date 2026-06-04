# Pass 38A — Core Guided Learn Flow Notes

## Prinsip UX

Core/Learn tidak diperlakukan sebagai kumpulan tab setara. Core adalah alur belajar. Karena itu, halaman harus mengutamakan:

- resume progres,
- langkah berikutnya,
- peta level,
- modul lengkap sebagai pendukung,
- diskusi sebagai bantuan kontekstual.

## Copy Guideline

Gunakan bahasa Indonesia yang kasual, profesional, dan natural.

Contoh yang dipakai:

- `Lanjutkan belajar`
- `Lihat jalur`
- `Buka materi`
- `Tanya di Diskusi`
- `Silakan pilih ritme yang paling cocok`

Hindari:

- `Menyerahkan`
- `Silahkan`
- `Kamu bisa`
- `Submit`
- `Social layer`
- `Feed lokal`

## Alasan tidak menambah plugin

Untuk pass ini, plugin UI baru tidak diperlukan. Risiko konflik lebih besar daripada manfaatnya karena repo sudah memiliki sistem komponen, state Svelte, dan styling scoped yang cukup.

## Jalur berikutnya

Jika flow ini terasa cocok, langkah berikutnya bisa berupa:

- lesson page polish,
- contextual discussion per lesson,
- outline sheet mobile,
- audit copy global lebih luas,
- analytics event untuk resume/next lesson.
