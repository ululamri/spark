#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1}"
host_header="${2:-spark.user.cloudjkt01.com}"
email="pass59-$(date +%s)@spark.test"
password="pass59Password123"
cookie_file="$(mktemp)"
trap 'rm -f "$cookie_file"' EXIT

request() {
  curl -sS -H "Host: ${host_header}" "$@"
}

status_request() {
  curl -sS -o /tmp/pass59_response.txt -w "%{http_code}" -H "Host: ${host_header}" "$@"
}

echo "Checking auth scope..."
request "${base_url}/v1/auth/scope" >/dev/null

echo "Registering test user: ${email}"
status=$(status_request \
  -c "$cookie_file" \
  -H "Content-Type: application/json" \
  -X POST "${base_url}/v1/auth/register" \
  -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"Pass 59 Smoke\"}")
if [[ "$status" != "201" ]]; then
  echo "Register failed with status $status" >&2
  cat /tmp/pass59_response.txt >&2
  exit 1
fi

echo "Checking /me with registration cookie..."
status=$(status_request -b "$cookie_file" "${base_url}/v1/auth/me")
if [[ "$status" != "200" ]]; then
  echo "/me after register failed with status $status" >&2
  cat /tmp/pass59_response.txt >&2
  exit 1
fi

echo "Logging out..."
status=$(status_request -b "$cookie_file" -c "$cookie_file" -X POST "${base_url}/v1/auth/logout")
if [[ "$status" != "204" ]]; then
  echo "Logout failed with status $status" >&2
  cat /tmp/pass59_response.txt >&2
  exit 1
fi

echo "Checking /me after logout should be unauthorized..."
status=$(status_request -b "$cookie_file" "${base_url}/v1/auth/me" || true)
if [[ "$status" != "401" ]]; then
  echo "/me after logout expected 401, got $status" >&2
  cat /tmp/pass59_response.txt >&2
  exit 1
fi

echo "Logging in again..."
status=$(status_request \
  -c "$cookie_file" \
  -H "Content-Type: application/json" \
  -X POST "${base_url}/v1/auth/login" \
  -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")
if [[ "$status" != "200" ]]; then
  echo "Login failed with status $status" >&2
  cat /tmp/pass59_response.txt >&2
  exit 1
fi

echo "Checking /me after login..."
status=$(status_request -b "$cookie_file" "${base_url}/v1/auth/me")
if [[ "$status" != "200" ]]; then
  echo "/me after login failed with status $status" >&2
  cat /tmp/pass59_response.txt >&2
  exit 1
fi

echo "Pass 59 auth runtime smoke OK"
