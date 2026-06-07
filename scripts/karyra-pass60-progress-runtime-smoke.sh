#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass60-$(date +%s)@karyra.test"
password="Pass60Test123"

headers_file="$(mktemp)"
body_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_file"' EXIT

echo "Registering auth user for progress smoke..."
status="$(
  curl -sS     -o "$body_file"     -D "$headers_file"     -w "%{http_code}"     -H "Host: ${host_header}"     -H "Content-Type: application/json"     -X POST "${base_url}/v1/auth/register"     -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 60 Smoke\"}"
)"

if [[ "$status" != "201" && "$status" != "200" ]]; then
  echo "Register failed with HTTP $status" >&2
  cat "$body_file" >&2
  exit 1
fi

session_token="$(
  grep -i '^set-cookie:' "$headers_file"     | sed -n 's/.*spark_session=\([^;]*\).*/\1/p'     | tail -n 1     | tr -d '\r'
)"

if [[ -z "$session_token" ]]; then
  echo "Failed to extract spark_session cookie from register response." >&2
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

echo "Checking /v1/auth/me..."
curl "${auth_headers[@]}" "${base_url}/v1/auth/me" >/dev/null

echo "Recording lesson progress..."
curl "${auth_headers[@]}" -X POST "${base_url}/v1/learning/lessons/pass60-smoke-lesson/progress"   -d '{"level":"beginner","status":"completed","progress_percent":100,"completed":true,"payload":{"source":"pass60-smoke"}}' >/dev/null

echo "Recording checkpoint result..."
curl "${auth_headers[@]}" -X POST "${base_url}/v1/learning/checkpoints/pass60-smoke-checkpoint/results"   -d '{"lesson_id":"pass60-smoke-lesson","level":"beginner","score":100,"passed":true,"payload":{"source":"pass60-smoke"}}' >/dev/null

echo "Recording lab attempt..."
curl "${auth_headers[@]}" -X POST "${base_url}/v1/lab/attempts"   -d '{"lab_id":"pass60-smoke-lab","level":"beginner","status":"passed","score":100,"safety_score":100,"payload":{"source":"pass60-smoke"}}' >/dev/null

echo "Checking backend lists..."
progress_json="$(curl "${auth_headers[@]}" "${base_url}/v1/learning/me/progress")"
lab_json="$(curl "${auth_headers[@]}" "${base_url}/v1/lab/me/attempts")"
proof_json="$(curl "${auth_headers[@]}" "${base_url}/v1/proof/me/events")"

printf '%s\n' "$progress_json" | grep -q 'pass60-smoke-lesson'
printf '%s\n' "$lab_json" | grep -q 'pass60-smoke-lab'
printf '%s\n' "$proof_json" | grep -Eq 'proof_of_learning|proof_of_practice|core_checkpoint'

echo "Pass 60 progress runtime smoke OK"
