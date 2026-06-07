#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "[pass65][frontend][FAIL] $*" >&2
  exit 1
}

warn() {
  echo "[pass65][frontend][WARN] $*" >&2
}

info() {
  echo "[pass65][frontend] $*"
}

[[ -f package.json ]] || fail "Run this script from the spark frontend root."
[[ -d src ]] || fail "Missing src directory."

info "Checking accidental leading backslash introduced in code files..."
if grep -RIn --include='*.ts' --include='*.svelte' --include='*.js' --include='*.mjs' --include='*.sh' '^[[:space:]]*\\' src scripts 2>/dev/null; then
  fail "Found suspicious leading backslash in frontend source/script files."
fi

info "Checking frontend API endpoint coverage..."
for endpoint in \
  '/v1/auth/me' \
  '/v1/auth/login' \
  '/v1/auth/register' \
  '/v1/auth/logout' \
  '/v1/learning/' \
  '/v1/lab/' \
  '/v1/proof/' \
  '/v1/passport/' \
  '/v1/profile/me' \
  '/v1/media/' \
  '/v1/community/' \
  '/v1/hub/'; do
  grep -R "$endpoint" -n src >/dev/null || fail "Missing frontend API usage for ${endpoint}"
done

info "Checking expected frontend API client files..."
for file in \
  src/lib/api/spark-profile-api.ts \
  src/lib/api/spark-media-api.ts \
  src/lib/api/spark-gateway-api.ts; do
  [[ -f "$file" ]] || fail "Missing ${file}"
done

if [[ -f src/lib/api/spark-passport-api.ts ]]; then
  info "Found spark-passport-api.ts"
else
  warn "spark-passport-api.ts not found by this exact name; endpoint grep already confirmed passport usage."
fi

if [[ -f src/lib/api/spark-progress-api.ts ]]; then
  info "Found spark-progress-api.ts"
else
  warn "spark-progress-api.ts not found by this exact name; endpoint grep already confirmed learning/lab usage."
fi

info "Checking state hydration helpers..."
grep -R "hydrate" -n src/routes src/lib/ui src/lib/state >/dev/null || warn "No hydrate marker found; review backend state hydration manually."
grep -R "applyBackendProfileSnapshot" -n src >/dev/null || fail "Missing profile backend snapshot application."
grep -R "hydrateGateway" -n src >/dev/null || warn "Gateway hydration helper name may differ; review Community/Hub pages manually."

info "Scanning public UI for developer-view wording that should be cleaned later..."
if grep -RInE 'local-state|backend-ready|sync queue|storage registry|api-contract|placeholder|route-boundary' src/routes src/lib/ui src/lib/shell 2>/dev/null; then
  warn "Developer-view wording still appears in public UI. This is expected before UI/UX cleanup, but should be addressed next."
fi

info "Checking smoke scripts exist..."
for script in \
  scripts/karyra-pass60-progress-runtime-smoke.sh \
  scripts/karyra-pass61-passport-runtime-smoke.sh \
  scripts/karyra-pass62-profile-runtime-smoke.sh \
  scripts/karyra-pass63-media-runtime-smoke.sh \
  scripts/karyra-pass64-community-hub-runtime-smoke.sh; do
  [[ -f "$script" ]] || warn "Missing historical smoke script: ${script}"
done

info "Pass 65 frontend integration seal audit OK"
