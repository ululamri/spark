#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

test -f src/lib/api/spark-media-api.ts

grep -F "createMediaUploadIntent" src/lib/api/spark-media-api.ts >/dev/null
grep -F "completeMediaUpload" src/lib/api/spark-media-api.ts >/dev/null
grep -F "createMediaAssetLink" src/lib/api/spark-media-api.ts >/dev/null
grep -F "/v1/media/upload-intents" src/lib/api/spark-media-api.ts >/dev/null
grep -F "/v1/media/me/assets" src/lib/api/spark-media-api.ts >/dev/null

test -x scripts/karyra-pass63-media-runtime-smoke.sh

echo "Pass 63 frontend media runtime audit OK"
