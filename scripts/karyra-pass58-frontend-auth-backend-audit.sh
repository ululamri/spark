#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "src/lib/api/spark-api-client.ts"
  "src/lib/state/beta-session-state.svelte.ts"
  "src/lib/ui/SparkAuthShell.svelte"
  "src/lib/shell/SparkAppShell.svelte"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

grep -q "loginWithBackend" src/lib/ui/SparkAuthShell.svelte || { echo "SparkAuthShell is not using backend login" >&2; exit 1; }
grep -q "registerWithBackend" src/lib/ui/SparkAuthShell.svelte || { echo "SparkAuthShell is not using backend register" >&2; exit 1; }
grep -q "hydrateBetaSessionFromBackend" src/lib/shell/SparkAppShell.svelte || { echo "SparkAppShell is not hydrating backend session" >&2; exit 1; }
grep -q "credentials: 'include'" src/lib/api/spark-api-client.ts || { echo "Spark API client must include credentials" >&2; exit 1; }
grep -q "status: 'backend-session'" src/lib/state/beta-session-state.svelte.ts || { echo "Backend session mapping is missing" >&2; exit 1; }

if grep -R "Minimal 6 karakter" src/lib/ui/SparkAuthShell.svelte >/dev/null 2>&1; then
  echo "Frontend still shows 6-character password copy; backend requires 8" >&2
  exit 1
fi

echo "Pass 58 frontend auth backend audit OK"
