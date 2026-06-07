#!/usr/bin/env bash
set -euo pipefail

echo "Running Pass 60B frontend smoke script audit..."

test -f scripts/karyra-pass60-progress-runtime-smoke.sh
grep -q 'Cookie: spark_session=' scripts/karyra-pass60-progress-runtime-smoke.sh
grep -q '/v1/learning/lessons/pass60-smoke-lesson/progress' scripts/karyra-pass60-progress-runtime-smoke.sh
grep -q '/v1/learning/checkpoints/pass60-smoke-checkpoint/results' scripts/karyra-pass60-progress-runtime-smoke.sh
grep -q '/v1/lab/attempts' scripts/karyra-pass60-progress-runtime-smoke.sh

echo "Pass 60B frontend smoke script audit OK"
