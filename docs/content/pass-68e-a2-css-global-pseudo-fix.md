# Pass 68E-A2 — CSS Global Pseudo Fix

Pass ini memperbaiki warning build dari Lightning CSS setelah Pass 68D/68E.

## Kenapa warning muncul

File di `src/lib/styles/*.css` diproses sebagai CSS global biasa. Sintaks `:global(...)` hanya aman di style scoped komponen Svelte. Karena file pass berada di folder styles global, selector harus ditulis sebagai selector CSS biasa.

## Aturan baru

Di file CSS global:

- Gunakan `[data-theme='dark'] .nama-class`
- Gunakan `.wrapper [data-spark-button]`
- Jangan gunakan `:global(...)`

Di file `.svelte` scoped style, `:global(...)` masih boleh dipakai bila memang dibutuhkan.

## Scope

- `src/lib/styles/pass-68d-core-lab-flow-cleanup.css`
- `src/lib/styles/pass-68e-passport-explainability-preview.css`
- audit tambahan untuk mencegah `:global(` muncul lagi di `src/lib/styles/*.css`
