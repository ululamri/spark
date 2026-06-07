#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass63-$(date +%s)@karyra.test"
password="Pass63Test123"
headers_file="$(mktemp)"
body_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_file"' EXIT

json_get() {
  python3 -c "import json,sys; print(json.load(sys.stdin)$1)"
}

echo "Registering auth user for media smoke..."
register_status="$(
  curl -sS -o "$body_file" -D "$headers_file" -w "%{http_code}" \
    -H "Host: ${host_header}" \
    -H "Content-Type: application/json" \
    -X POST "${base_url}/v1/auth/register" \
    -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 63 Media\"}"
)"

if [[ "$register_status" != "201" && "$register_status" != "200" ]]; then
  echo "Register failed with HTTP $register_status" >&2
  cat "$body_file" >&2
  exit 1
fi

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

auth_headers=(
  -sS
  --fail-with-body
  -H "Host: ${host_header}"
  -H "Content-Type: application/json"
  -H "Cookie: spark_session=${session_token}"
)

echo "Checking media policy..."
policy_json="$(curl "${auth_headers[@]}" "${base_url}/v1/media/policy")"
printf '%s\n' "$policy_json" | grep -q 's3-compatible'
printf '%s\n' "$policy_json" | grep -q 'avatar'

echo "Creating upload intent..."
intent_json="$(curl "${auth_headers[@]}" -X POST "${base_url}/v1/media/upload-intents" \
  -d '{"purpose":"avatar","file_name":"pass63-avatar.png","mime_type":"image/png","size_bytes":512,"private":false,"entity_type":"profile","entity_id":"pass63-smoke-profile","metadata":{"source":"pass63-smoke"}}')"

asset_id="$(printf '%s\n' "$intent_json" | json_get "['asset']['id']")"
if [[ -z "$asset_id" || "$asset_id" == "None" ]]; then
  echo "Failed to read media asset id." >&2
  printf '%s\n' "$intent_json" >&2
  exit 1
fi

echo "Completing upload lifecycle..."
complete_json="$(curl "${auth_headers[@]}" -X POST "${base_url}/v1/media/assets/${asset_id}/complete" \
  -d '{"checksum":"pass63-smoke-checksum","size_bytes":512,"metadata":{"source":"pass63-smoke","runtime":"lifecycle-only"}}')"
printf '%s\n' "$complete_json" | grep -q 'uploaded'

echo "Creating media link..."
link_json="$(curl "${auth_headers[@]}" -X POST "${base_url}/v1/media/assets/${asset_id}/links" \
  -d '{"entity_type":"profile","entity_id":"pass63-smoke-profile","purpose":"avatar"}')"
printf '%s\n' "$link_json" | grep -q 'pass63-smoke-profile'

echo "Listing media assets..."
assets_json="$(curl "${auth_headers[@]}" "${base_url}/v1/media/me/assets")"
printf '%s\n' "$assets_json" | grep -q "$asset_id"
printf '%s\n' "$assets_json" | grep -q 'pass63-avatar.png'

echo "Pass 63 media runtime smoke OK"
