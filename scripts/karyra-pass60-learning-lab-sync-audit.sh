#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "src/lib/api/spark-progress-api.ts"
  "src/lib/state/learning-state.svelte.ts"
  "src/lib/shell/SparkAppShell.svelte"
  "scripts/karyra-pass60-progress-runtime-smoke.sh"
  "docs/PASS-60-learning-lab-backend-sync.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

grep -q "saveLessonProgress" src/lib/state/learning-state.svelte.ts
grep -q "recordCoreCheckpointResult" src/lib/state/learning-state.svelte.ts
grep -q "recordLabAttempt" src/lib/state/learning-state.svelte.ts
grep -q "hydrateLearningBackendSnapshot" src/lib/shell/SparkAppShell.svelte

echo "Pass 60 learning/lab backend sync audit OK"
