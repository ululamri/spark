\
#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "src/lib/api/spark-gateway-api.ts"
  "src/lib/state/gateway-state.svelte.ts"
  "src/routes/community/+page.svelte"
  "src/routes/hub/+page.svelte"
  "scripts/karyra-pass64-community-hub-runtime-smoke.sh"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing $file" >&2; exit 1; }
done

grep -q 'getBackendWorkshopRegistrations' src/lib/api/spark-gateway-api.ts
grep -q 'hydrateGatewayStateFromBackend' src/lib/state/gateway-state.svelte.ts
grep -q 'registerBackendWorkshop' src/lib/state/gateway-state.svelte.ts
grep -q 'saveBackendHubResource' src/lib/state/gateway-state.svelte.ts
grep -q 'hydrateGatewayStateFromBackend' src/routes/community/+page.svelte
grep -q 'hydrateGatewayStateFromBackend' src/routes/hub/+page.svelte

echo "Pass 64 frontend community/hub signals audit OK"
