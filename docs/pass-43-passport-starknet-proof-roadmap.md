# Pass 43 — Passport Proof Foundation & Starknet-Native Roadmap

Pass 43 keeps the implementation lightweight while correcting the Passport direction.

Passport Spark is not just a certificate screen. It is the product surface for **proof-of-readiness**: a Spark-issued readiness credential based on Core exams, Lab exams, community signals, and eventually Starknet-native verification.

## What Pass 43 implements now

- Adds a Passport proof model.
- Adds an evidence bundle shape without storing raw answers in the public UI.
- Adds a local proof preview and evidence root preview.
- Adds a visual Passport badge component.
- Updates Passport UI to show:
  - readiness level,
  - issuer,
  - evidence root preview,
  - Starknet Mainnet target,
  - NFT badge roadmap,
  - Core/Lab pass requirements.

This pass does **not** deploy contracts, mint NFTs, add wallet requirements, or add real KYC.

## Why this is intentionally lightweight

We should not overbuild before grant support is secured. Heavy parts are placed in the grant roadmap:

1. Backend-issued readiness event ledger.
2. Server-side signed Core/Lab exam records.
3. Merkle/evidence root generation.
4. Cairo PassportRegistry contract.
5. Sepolia testing.
6. Starknet Mainnet anchoring.
7. NFT or non-transferable badge issuance.
8. Community verifier flow.
9. Optional Tier 3 KYC integration in the future.

## Starknet-native target

The final Passport architecture should use Starknet as the verification layer:

```txt
Core/Lab exam events
→ Spark backend signs readiness events
→ evidence bundle is hashed
→ evidence root is anchored in Starknet PassportRegistry
→ Passport badge/NFT can reference the issued credential
→ verifier checks status on Starknet
```

Sepolia is only for MVP testing. The target is Starknet Mainnet.

## Proof tiers

### Tier 1 — Spark-issued learning proof

Based on Core and Lab exams. No KYC. This proves the Spark account passed the readiness flow.

### Tier 2 — Community-verified proof

Adds workshop, cohort, or facilitator verification. This improves trust without requiring sensitive identity documents.

### Tier 3 — Identity-verified proof

Placeholder for the future only. This should not be active until the ecosystem, privacy policy, partner flow, and legal requirements are stable.

## NFT badge direction

The badge should eventually become a Starknet-native NFT or non-transferable badge. Pass 43 only prepares the visual and data architecture. Minting belongs in a later grant-funded phase.

## Privacy boundary

On-chain data should be minimal:

- passport ID,
- holder/account reference,
- readiness level,
- verification tier,
- evidence root,
- issuer,
- status,
- issued/updated timestamp.

Not on-chain:

- email,
- raw quiz answers,
- personal notes,
- KYC documents,
- sensitive identity details,
- private profile data.
