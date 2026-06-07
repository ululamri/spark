#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass61-$(date +%s)@karyra.test"
password="Pass61Test123"
headers_file="$(mktemp)"
body_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_file"' EXIT

request() {
  local expected="$1"
  local label="$2"
  shift 2
  local status
  status="$(curl -sS -o "$body_file" -w "%{http_code}" "$@")"
  if [[ "$status" != "$expected" ]]; then
    echo "$label failed: expected HTTP $expected, got HTTP $status" >&2
    cat "$body_file" >&2 || true
    exit 1
  fi
}

echo "Registering user for Passport smoke..."
status="$(curl -sS -o "$body_file" -D "$headers_file" -w "%{http_code}" \
  -H "Host: ${host_header}" \
  -H "Content-Type: application/json" \
  -X POST "${base_url}/v1/auth/register" \
  -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 61 Smoke\"}")"

if [[ "$status" != "201" && "$status" != "200" ]]; then
  echo "Register failed with HTTP $status" >&2
  cat "$body_file" >&2
  exit 1
fi

session_token="$(grep -i '^set-cookie:' "$headers_file" | sed -n 's/.*spark_session=\([^;]*\).*/\1/p' | tail -n 1 | tr -d '\r')"
if [[ -z "$session_token" ]]; then
  echo "Failed to extract spark_session cookie." >&2
  cat "$headers_file" >&2
  exit 1
fi

auth_args=(
  -H "Host: ${host_header}"
  -H "Cookie: spark_session=${session_token}"
  -H "Content-Type: application/json"
)

echo "Recording Core exam proof..."
request 201 "core exam attempt" \
  "${auth_args[@]}" \
  -X POST "${base_url}/v1/learning/exam-attempts" \
  -d '{"level":"beginner","exam_id":"pass61-core-beginner-exam","score":92,"passed":true,"exam_version":"pass61","payload":{"source":"pass61-smoke"}}'

echo "Recording Lab practice + safety proof..."
request 201 "lab attempt" \
  "${auth_args[@]}" \
  -X POST "${base_url}/v1/lab/attempts" \
  -d '{"lab_id":"pass61-wallet-safety-lab","level":"beginner","status":"passed","score":91,"safety_score":93,"payload":{"source":"pass61-smoke"}}'

echo "Checking Passport eligibility..."
request 200 "passport eligibility" \
  "${auth_args[@]}" \
  "${base_url}/v1/passport/me/eligibility"

if ! grep -q '"eligible":true' "$body_file"; then
  echo "Passport eligibility did not become true." >&2
  cat "$body_file" >&2
  exit 1
fi

if ! grep -q '"highest_eligible_level":"beginner"' "$body_file"; then
  echo "Passport highest eligible level is not beginner." >&2
  cat "$body_file" >&2
  exit 1
fi

echo "Issuing backend Passport credential..."
request 201 "passport issue" \
  "${auth_args[@]}" \
  -X POST "${base_url}/v1/passport/me/issue" \
  -d '{"readiness_level":"beginner"}'

if ! grep -q '"issue_status":"issued"' "$body_file"; then
  echo "Passport credential was not issued." >&2
  cat "$body_file" >&2
  exit 1
fi

if ! grep -q '"credential_hash"' "$body_file"; then
  echo "Issued Passport does not include credential_hash." >&2
  cat "$body_file" >&2
  exit 1
fi

echo "Checking current Passport and proof evidence root..."
request 200 "current passport" \
  "${auth_args[@]}" \
  "${base_url}/v1/passport/me"
grep -q '"credential"' "$body_file"

request 200 "proof evidence root" \
  "${auth_args[@]}" \
  "${base_url}/v1/proof/me/evidence-root"
grep -q '"ready_for_starknet_anchor":true' "$body_file"

echo "Pass 61 passport runtime smoke OK"
