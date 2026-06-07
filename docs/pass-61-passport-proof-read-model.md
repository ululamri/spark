# Pass 61 — Passport Proof Read Model

Pass 61 menghubungkan halaman Passport frontend ke backend proof/passport read model.

## Endpoint yang dipakai frontend

- `GET /v1/passport/me/eligibility`
- `GET /v1/passport/me`
- `POST /v1/passport/me/issue`
- `GET /v1/proof/me/evidence-root`
- `GET /v1/proof/me/events`

## Prinsip produk

Passport tetap bukan profil. Passport adalah credential kesiapan yang diterbitkan dari bukti sistem:

- Proof-of-Learning dari ujian Core
- Proof-of-Practice dari Lab
- Proof-of-Safety dari safety score Lab
- Proof-of-Readiness dari backend evidence root

Tidak ada klaim proof manual dari user.

## Batas saat ini

- Credential masih off-chain
- NFT badge belum mint
- Starknet anchor belum aktif
- Public verifier belum aktif

Bagian tersebut tetap berada di grant scope.
