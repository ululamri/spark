#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "src/lib/api/spark-passport-api.ts"
  "src/lib/ui/SparkPassportBackendPanel.svelte"
  "scripts/karyra-pass61-passport-runtime-smoke.sh"
  "docs/pass-61-passport-proof-read-model.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

if ! grep -q "SparkPassportBackendPanel" src/routes/passport/+page.svelte; then
  echo "Passport route does not render SparkPassportBackendPanel." >&2
  exit 1
fi

if ! grep -q "/v1/passport/me/eligibility" src/lib/api/spark-passport-api.ts; then
  echo "Passport API client is missing eligibility endpoint." >&2
  exit 1
fi

if ! grep -q "/v1/proof/me/evidence-root" src/lib/api/spark-passport-api.ts; then
  echo "Passport API client is missing evidence-root endpoint." >&2
  exit 1
fi

echo "Pass 61 passport proof audit OK"
