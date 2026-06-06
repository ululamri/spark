import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/lib/leveling/leveling-types.ts',
  'src/lib/leveling/leveling-model.ts',
  'src/lib/leveling/leveling-state.svelte.ts',
  'src/lib/ui/SparkLevelExamCard.svelte',
  'src/lib/ui/SparkCoreLevelingFlow.svelte',
  'src/lib/ui/SparkLabLevelingFlow.svelte',
  'src/routes/core/+page.svelte',
  'src/routes/lab/+page.svelte',
  'src/lib/sync/sync-types.ts',
  'src/lib/sync/sync-storage-registry.ts',
  'src/lib/sync/reset-local-data.ts'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('[pass42] Missing files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const coreRoute = readFileSync('src/routes/core/+page.svelte', 'utf8');
const labRoute = readFileSync('src/routes/lab/+page.svelte', 'utf8');
const model = readFileSync('src/lib/leveling/leveling-model.ts', 'utf8');
const registry = readFileSync('src/lib/sync/sync-types.ts',
  'src/lib/sync/sync-storage-registry.ts', 'utf8');
const reset = readFileSync('src/lib/sync/reset-local-data.ts', 'utf8');

const checks = [
  ['core route uses SparkCoreLevelingFlow', coreRoute.includes('SparkCoreLevelingFlow')],
  ['lab route uses SparkLabLevelingFlow', labRoute.includes('SparkLabLevelingFlow')],
  ['old lab advanced workspace removed from route', !labRoute.includes('Advanced workspace') && !labRoute.includes('CodeMirror')],
  ['level model has beginner', model.includes("'beginner'")],
  ['level model has intermediate', model.includes("'intermediate'")],
  ['level model has advanced', model.includes("'advanced'")],
  ['core exams exist', model.includes('core-beginner-final') && model.includes('core-intermediate-final') && model.includes('core-advanced-final')],
  ['lab exams exist', model.includes('lab-beginner-final') && model.includes('lab-intermediate-final') && model.includes('lab-advanced-final')],
  ['leveling sync event registered', syncTypes.includes('learning.level.exam.submitted') && syncTypes.includes('lab.level.exam.submitted')],
  ['leveling storage registered', registry.includes('karyra-spark-leveling-state-v1')],
  ['reset clears leveling state', reset.includes('resetLevelingState')]
];

let failed = false;
for (const [label, ok] of checks) {
  if (ok) {
    console.log(`✅ ${label}`);
  } else {
    console.error(`❌ ${label}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('\nPass 42 audit passed. Core/Lab leveling foundation is installed.');
