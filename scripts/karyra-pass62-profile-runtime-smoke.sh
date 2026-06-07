#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass62-$(date +%s)@karyra.test"
password="Pass62Test123"
headers_file="$(mktemp)"
body_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_file"' EXIT

curl -sS -o "$body_file" -D "$headers_file" -w "REGISTER HTTP %{http_code}\n" \
  -H "Host: ${host_header}" \
  -H "Content-Type: application/json" \
  -X POST "${base_url}/v1/auth/register" \
  -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 62\"}"

session_token="$(
  grep -i '^set-cookie:' "$headers_file" \
    | sed -n 's/.*spark_session=\([^;]*\).*/\1/p' \
    | tail -n 1 \
    | tr -d '\r'
)"

if [[ -z "$session_token" ]]; then
  echo "Failed to extract spark_session" >&2
  cat "$headers_file" >&2
  exit 1
fi

common_headers=(
  -sS
  --fail-with-body
  -H "Host: ${host_header}"
  -H "Content-Type: application/json"
  -H "Cookie: spark_session=${session_token}"
)

echo "Checking profile scope..."
curl "${common_headers[@]}" "${base_url}/v1/profile/scope" >/dev/null

echo "Checking current profile..."
curl "${common_headers[@]}" "${base_url}/v1/profile/me" | grep -q 'Pass 62'

echo "Updating profile..."
curl "${common_headers[@]}" -X POST "${base_url}/v1/profile/me" \
  -d '{"display_name":"Pass 62 Runtime","handle":"pass62-runtime","bio":"Profil ini dibuat oleh smoke test Pass 62.","location":"Komunitas lokal","visibility":"community","avatar_preset":"spark"}' \
  | tee "$body_file" >/dev/null

grep -q 'Pass 62 Runtime' "$body_file"
grep -q '@pass62-runtime' "$body_file"

echo "Verifying profile persisted..."
curl "${common_headers[@]}" "${base_url}/v1/profile/me" | tee "$body_file" >/dev/null
grep -q 'Pass 62 Runtime' "$body_file"
grep -q '@pass62-runtime' "$body_file"

echo "Pass 62 profile runtime smoke OK"
