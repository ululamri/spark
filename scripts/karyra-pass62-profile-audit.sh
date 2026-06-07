#!/usr/bin/env bash
set -euo pipefail

missing=0
required_files=(
  "src/lib/api/spark-profile-api.ts"
  "src/lib/state/profile-state.svelte.ts"
  "src/lib/ui/SparkProfileIdentityCenter.svelte"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required frontend file: $file" >&2
    missing=1
  fi
done

if ! grep -q 'getBackendProfile' src/lib/ui/SparkProfileIdentityCenter.svelte; then
  echo "profile UI does not hydrate backend profile" >&2
  missing=1
fi

if ! grep -q 'updateBackendProfile' src/lib/ui/SparkProfileIdentityCenter.svelte; then
  echo "profile UI does not save backend profile" >&2
  missing=1
fi

if ! grep -q 'applyBackendProfileSnapshot' src/lib/state/profile-state.svelte.ts; then
  echo "profile state backend snapshot helper missing" >&2
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

echo "Pass 62 frontend profile audit OK"
