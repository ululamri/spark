\
#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass64-$(date +%s)@karyra.test"
password="Pass64Test123"
headers_file="$(mktemp)"
body_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_file"' EXIT

api_post() {
  local path="$1"
  local data="$2"
  local expected="$3"
  local label="$4"
  local status
  status="$({
    curl -sS -o "$body_file" -D "$headers_file" -w "%{http_code}" \
      -H "Host: ${host_header}" \
      -H "Content-Type: application/json" \
      -X POST "${base_url}${path}" \
      -d "$data"
  })"
  if [[ "$status" != "$expected" ]]; then
    echo "$label failed with HTTP $status" >&2
    cat "$body_file" >&2
    exit 1
  fi
}

authed_get() {
  local path="$1"
  curl -sS --fail-with-body \
    -H "Host: ${host_header}" \
    -H "Cookie: spark_session=${session_token}" \
    "${base_url}${path}"
}

authed_post() {
  local path="$1"
  local data="$2"
  curl -sS --fail-with-body \
    -H "Host: ${host_header}" \
    -H "Cookie: spark_session=${session_token}" \
    -H "Content-Type: application/json" \
    -X POST "${base_url}${path}" \
    -d "$data"
}

echo "Registering auth user for community/hub smoke..."
api_post "/v1/auth/register" "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 64 Smoke\"}" "201" "register"

session_token="$(
  grep -i '^set-cookie:' "$headers_file" \
    | sed -n 's/.*spark_session=\([^;]*\).*/\1/p' \
    | tail -n 1 \
    | tr -d '\r'
)"

if [[ -z "$session_token" ]]; then
  echo "Failed to extract spark_session cookie." >&2
  cat "$headers_file" >&2
  exit 1
fi

echo "Checking community/hub scopes..."
curl -sS --fail-with-body -H "Host: ${host_header}" "${base_url}/v1/community/scope" >/dev/null
curl -sS --fail-with-body -H "Host: ${host_header}" "${base_url}/v1/hub/scope" >/dev/null

echo "Recording community participation signal..."
authed_post "/v1/community/workshops/pass64-workshop/register" '{"payload":{"source":"pass64-smoke"}}' >/dev/null
workshops_json="$(authed_get "/v1/community/me/workshops")"
printf '%s\n' "$workshops_json" | grep -q 'pass64-workshop'

echo "Recording hub exploration signal..."
authed_post "/v1/hub/resources/pass64-resource/save" '{"payload":{"source":"pass64-smoke"}}' >/dev/null
resources_json="$(authed_get "/v1/hub/me/resources")"
printf '%s\n' "$resources_json" | grep -q 'pass64-resource'

echo "Checking proof events..."
proof_json="$(authed_get "/v1/proof/me/events")"
printf '%s\n' "$proof_json" | grep -q 'proof_of_participation_signal_recorded'
printf '%s\n' "$proof_json" | grep -q 'proof_of_exploration_signal_recorded'

echo "Pass 64 community/hub runtime smoke OK"
