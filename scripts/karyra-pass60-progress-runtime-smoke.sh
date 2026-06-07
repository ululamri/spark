#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass60-$(date +%s)@karyra.test"
password="Pass60Test123"
cookie_jar="$(mktemp)"
trap 'rm -f "$cookie_jar"' EXIT

curl_common=(--fail-with-body -sS -H "Host: ${host_header}" -H "Content-Type: application/json" -c "$cookie_jar" -b "$cookie_jar")

echo "Registering auth user for progress smoke..."
curl "${curl_common[@]}" -X POST "${base_url}/v1/auth/register" \
  -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 60 Smoke\"}" >/dev/null

echo "Recording lesson progress..."
curl "${curl_common[@]}" -X POST "${base_url}/v1/learning/lessons/pass60-smoke-lesson/progress" \
  -d '{"level":"beginner","status":"completed","progress_percent":100,"completed":true,"payload":{"source":"pass60-smoke"}}' >/dev/null

echo "Recording checkpoint result..."
curl "${curl_common[@]}" -X POST "${base_url}/v1/learning/checkpoints/pass60-smoke-checkpoint/results" \
  -d '{"lesson_id":"pass60-smoke-lesson","level":"beginner","score":100,"passed":true,"payload":{"source":"pass60-smoke"}}' >/dev/null

echo "Recording lab attempt..."
curl "${curl_common[@]}" -X POST "${base_url}/v1/lab/attempts" \
  -d '{"lab_id":"pass60-smoke-lab","level":"beginner","status":"passed","score":100,"safety_score":100,"payload":{"source":"pass60-smoke"}}' >/dev/null

echo "Checking backend lists..."
progress_json="$(curl "${curl_common[@]}" "${base_url}/v1/learning/me/progress")"
lab_json="$(curl "${curl_common[@]}" "${base_url}/v1/lab/me/attempts")"
proof_json="$(curl "${curl_common[@]}" "${base_url}/v1/proof/me/events")"

printf '%s\n' "$progress_json" | grep -q 'pass60-smoke-lesson'
printf '%s\n' "$lab_json" | grep -q 'pass60-smoke-lab'
printf '%s\n' "$proof_json" | grep -q 'proof_of_learning\|proof_of_practice\|core_checkpoint'

echo "Pass 60 progress runtime smoke OK"
