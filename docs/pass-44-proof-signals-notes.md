# Pass 44 — Proof Signals Notes

## Prinsip

User tidak memberikan proof manual ke Spark. Spark membangun proof dari event belajar, ujian, Lab, partisipasi, dan eksplorasi yang dicatat oleh sistem.

## MVP ringan

Untuk saat ini, proof signals dihitung dari state yang sudah ada:

- hasil ujian Core dan Lab dari Pass 42;
- workshop tersimpan sebagai sinyal partisipasi ringan;
- resource Hub tersimpan sebagai sinyal eksplorasi;
- Contribution masih roadmap.

## Nanti saat backend aktif

Proof signals harus naik dari local preview menjadi signed server events:

- lesson quiz passed;
- level exam submitted;
- level exam passed;
- lab practice completed;
- workshop verified;
- hub exploration recorded;
- passport eligible;
- passport issued;
- passport anchored.

## Nanti saat Starknet integration aktif

Detail event tetap off-chain. Yang di-anchor ke Starknet adalah evidence root, Passport status, issuer, holder reference, level, schema version, dan revocation state.
