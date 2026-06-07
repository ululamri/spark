#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "src/lib/state/beta-session-state.svelte.ts"
  "src/lib/ui/SparkAuthShell.svelte"
  "src/lib/ui/SparkProtectedRoute.svelte"
  "src/lib/ui/SparkAccountMenu.svelte"
  "src/lib/shell/SparkMobileDrawer.svelte"
  "src/lib/shell/SparkAppShell.svelte"
  "scripts/karyra-pass59-auth-runtime-smoke.sh"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

grep -q "registerBackendSession" src/lib/state/beta-session-state.svelte.ts
grep -q "loginBackendSession" src/lib/state/beta-session-state.svelte.ts
grep -q "hydrateBackendSession" src/lib/state/beta-session-state.svelte.ts
grep -q "credentials: 'include'" src/lib/state/beta-session-state.svelte.ts
grep -q "Kata sandi minimal 8 karakter" src/lib/ui/SparkAuthShell.svelte
grep -q "loading={submitting}" src/lib/ui/SparkAuthShell.svelte
grep -q "betaSession.hydrating" src/lib/ui/SparkProtectedRoute.svelte
grep -q "await logoutBetaSession" src/lib/ui/SparkAccountMenu.svelte
grep -q "await logoutBetaSession" src/lib/shell/SparkMobileDrawer.svelte
grep -q "void hydrateBackendSession" src/lib/shell/SparkAppShell.svelte

echo "Pass 59 auth runtime audit OK"
