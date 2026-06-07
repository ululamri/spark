#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass65-$(date +%s)@karyra.test"
password="Pass65Test123"
headers_file="$(mktemp)"
body_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_file"' EXIT

request() {
  local label="$1"
  local expected="$2"
  shift 2
  local status
  status="$(curl -sS -o "$body_file" -w "%{http_code}" "$@")"
  if [[ "$status" != "$expected" ]]; then
    echo "[pass65-smoke][FAIL] ${label} returned HTTP ${status}, expected ${expected}" >&2
    cat "$body_file" >&2 || true
    echo >&2
    exit 1
  fi
}

request_any_2xx() {
  local label="$1"
  shift 1
  local status
  status="$(curl -sS -o "$body_file" -w "%{http_code}" "$@")"
  if [[ ! "$status" =~ ^2[0-9][0-9]$ ]]; then
    echo "[pass65-smoke][FAIL] ${label} returned HTTP ${status}, expected 2xx" >&2
    cat "$body_file" >&2 || true
    echo >&2
    exit 1
  fi
}

echo "[pass65-smoke] Checking public scopes..."
for path in \
  /v1/auth/scope \
  /v1/learning/scope \
  /v1/lab/scope \
  /v1/proof/scope \
  /v1/passport/scope \
  /v1/profile/scope \
  /v1/media/policy \
  /v1/community/scope \
  /v1/hub/scope; do
  request "GET ${path}" 200 -H "Host: ${host_header}" "${base_url}${path}"
done

echo "[pass65-smoke] Registering test user..."
status="$(curl -sS -o "$body_file" -D "$headers_file" -w "%{http_code}" \
  -H "Host: ${host_header}" \
  -H "Content-Type: application/json" \
  -X POST "${base_url}/v1/auth/register" \
  -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 65 Smoke\"}")"
if [[ "$status" != "201" && "$status" != "200" ]]; then
  echo "[pass65-smoke][FAIL] register returned HTTP ${status}" >&2
  cat "$body_file" >&2 || true
  exit 1
fi

session_token="$(grep -i '^set-cookie:' "$headers_file" | sed -n 's/.*spark_session=\([^;]*\).*/\1/p' | tail -n 1 | tr -d '\r')"
if [[ -z "$session_token" ]]; then
  echo "[pass65-smoke][FAIL] could not extract spark_session cookie" >&2
  cat "$headers_file" >&2 || true
  exit 1
fi

auth_common=(
  -H "Host: ${host_header}"
  -H "Cookie: spark_session=${session_token}"
)
json_common=(
  "${auth_common[@]}"
  -H "Content-Type: application/json"
)

echo "[pass65-smoke] Checking auth/profile..."
request "GET /v1/auth/me" 200 "${auth_common[@]}" "${base_url}/v1/auth/me"
request_any_2xx "POST /v1/profile/me" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/profile/me" \
  -d '{"display_name":"Pass 65 Smoke","handle":"pass65-smoke","bio":"Runtime audit user","location":"Staging","visibility":"community","avatar_preset":"spark","avatar_url":""}'
request "GET /v1/profile/me" 200 "${auth_common[@]}" "${base_url}/v1/profile/me"

echo "[pass65-smoke] Recording learning/lab signals..."
request_any_2xx "POST lesson progress" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/learning/lessons/pass65-smoke-lesson/progress" \
  -d '{"level":"beginner","status":"completed","progress_percent":100,"completed":true,"payload":{"source":"pass65-smoke"}}'
request_any_2xx "POST checkpoint result" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/learning/checkpoints/pass65-smoke-checkpoint/results" \
  -d '{"lesson_id":"pass65-smoke-lesson","level":"beginner","score":100,"passed":true,"payload":{"source":"pass65-smoke"}}'
request_any_2xx "POST lab attempt" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/lab/attempts" \
  -d '{"lab_id":"pass65-smoke-lab","level":"beginner","status":"passed","score":100,"safety_score":100,"payload":{"source":"pass65-smoke"}}'
request "GET learning progress" 200 "${auth_common[@]}" "${base_url}/v1/learning/me/progress"
grep -q 'pass65-smoke-lesson' "$body_file" || { echo "[pass65-smoke][FAIL] learning progress did not include smoke lesson" >&2; cat "$body_file" >&2; exit 1; }
request "GET lab attempts" 200 "${auth_common[@]}" "${base_url}/v1/lab/me/attempts"
grep -q 'pass65-smoke-lab' "$body_file" || { echo "[pass65-smoke][FAIL] lab attempts did not include smoke lab" >&2; cat "$body_file" >&2; exit 1; }

echo "[pass65-smoke] Checking media lifecycle..."
request_any_2xx "POST media upload-intent" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/media/upload-intents" \
  -d '{"purpose":"avatar","file_name":"pass65.txt","mime_type":"text/plain","size_bytes":12,"private":false,"metadata":{"source":"pass65-smoke"}}'
asset_id="$(grep -oE '"id":"[0-9a-fA-F-]{36}"' "$body_file" | head -n 1 | cut -d'"' -f4)"
if [[ -z "$asset_id" ]]; then
  echo "[pass65-smoke][FAIL] could not extract media asset id" >&2
  cat "$body_file" >&2
  exit 1
fi
request_any_2xx "POST media complete" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/media/assets/${asset_id}/complete" \
  -d '{"size_bytes":12,"metadata":{"source":"pass65-smoke-complete"}}'
request_any_2xx "POST media link" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/media/assets/${asset_id}/links" \
  -d '{"entity_type":"profile","entity_id":"self","purpose":"avatar"}'
request "GET media assets" 200 "${auth_common[@]}" "${base_url}/v1/media/me/assets"
grep -q "$asset_id" "$body_file" || { echo "[pass65-smoke][FAIL] media asset list did not include smoke asset" >&2; cat "$body_file" >&2; exit 1; }

echo "[pass65-smoke] Recording community/hub signals..."
request_any_2xx "POST community register" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/community/workshops/pass65-smoke-workshop/register" \
  -d '{"payload":{"source":"pass65-smoke"}}'
request "GET community workshops" 200 "${auth_common[@]}" "${base_url}/v1/community/me/workshops"
grep -q 'pass65-smoke-workshop' "$body_file" || { echo "[pass65-smoke][FAIL] community list did not include smoke workshop" >&2; cat "$body_file" >&2; exit 1; }
request_any_2xx "POST hub save" \
  "${json_common[@]}" \
  -X POST "${base_url}/v1/hub/resources/pass65-smoke-resource/save" \
  -d '{"payload":{"source":"pass65-smoke"}}'
request "GET hub resources" 200 "${auth_common[@]}" "${base_url}/v1/hub/me/resources"
grep -q 'pass65-smoke-resource' "$body_file" || { echo "[pass65-smoke][FAIL] hub list did not include smoke resource" >&2; cat "$body_file" >&2; exit 1; }

echo "[pass65-smoke] Checking proof/passport read models..."
request "GET proof events" 200 "${auth_common[@]}" "${base_url}/v1/proof/me/events?limit=100"
grep -Eq 'proof_of_learning|proof_of_practice|proof_of_safety|proof_of_participation|proof_of_exploration' "$body_file" || { echo "[pass65-smoke][FAIL] proof events missing expected proof markers" >&2; cat "$body_file" >&2; exit 1; }
request "GET evidence root" 200 "${auth_common[@]}" "${base_url}/v1/proof/me/evidence-root"
request "GET passport eligibility" 200 "${auth_common[@]}" "${base_url}/v1/passport/me/eligibility"
request "GET passport current" 200 "${auth_common[@]}" "${base_url}/v1/passport/me"

echo "Pass 65 backend integration runtime smoke OK"
