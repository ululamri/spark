#!/usr/bin/env bash
set -euo pipefail

required=(
  "package.json"
  "svelte.config.js"
  "Dockerfile.staging"
  ".env.unified.staging.example"
)

for path in "${required[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "Missing required frontend file: $path" >&2
    exit 1
  fi
done

if ! grep -q "@sveltejs/adapter-node" package.json; then
  echo "package.json should include @sveltejs/adapter-node for Docker node runtime" >&2
  exit 1
fi

if ! grep -q "CMD \["node", "build"\]" Dockerfile.staging; then
  echo "Dockerfile.staging should run node build" >&2
  exit 1
fi

if grep -Eq "CHANGE_ME|replace_with|example.com" .env.unified.staging.example; then
  echo "Frontend env example still contains unsafe placeholders" >&2
  exit 1
fi

echo "Pass 55 unified frontend audit OK"
