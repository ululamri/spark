# Pass 65 — Backend Integration Seal

Pass 65 is the known-good integration seal before broad UI/UX cleanup.

## Backend-backed domains

| Domain | Runtime status |
| --- | --- |
| Auth/session | Backend session cookie |
| Profile/account | Backend profile record + local UI cache |
| Learning progress | Backend progress + proof event |
| Lab attempts | Backend attempts + proof/safety events |
| Proof ledger | Backend event hash chain + evidence root |
| Passport | Backend eligibility + credential read model |
| Media | Backend asset lifecycle + media links |
| Community | Backend participation signals |
| Hub | Backend exploration signals |

## Still intentionally not final

- Public UI copy still needs cleanup from developer-facing wording.
- Real browser-to-MinIO binary upload remains a later storage hardening step.
- Starknet Sepolia/Mainnet anchor remains grant scope.
- NFT/non-transferable Passport Badge mint remains grant scope.

## Runtime smoke

```bash
bash scripts/karyra-pass65-backend-integration-runtime-smoke.sh http://127.0.0.1 spark.user.cloudjkt01.com
```
