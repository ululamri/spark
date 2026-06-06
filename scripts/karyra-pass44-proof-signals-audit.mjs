#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/lib/proof/proof-signals-model.ts',
  'src/lib/ui/SparkPassportReadinessCenter.svelte',
  'docs/pass-44-starknet-grant-scope.md',
  'docs/pass-44-proof-signals-notes.md'
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) failures.push(`Missing ${file}`);
}

function read(file) {
  return readFileSync(join(root, file), 'utf8');
}

if (!failures.length) {
  const model = read('src/lib/proof/proof-signals-model.ts');
  const passport = read('src/lib/ui/SparkPassportReadinessCenter.svelte');
  const roadmap = read('docs/pass-44-starknet-grant-scope.md');

  for (const term of [
    'Proof-of-Learning',
    'Proof-of-Practice',
    'Proof-of-Safety',
    'Proof-of-Participation',
    'Proof-of-Exploration',
    'Proof-of-Contribution',
    'starknetGrantIntegrationScope'
  ]) {
    if (!model.includes(term)) failures.push(`proof model missing ${term}`);
  }

  for (const term of ['passport-proof-family-card', 'getPassportProofSignals', 'Keluarga proof Spark']) {
    if (!passport.includes(term)) failures.push(`passport UI missing ${term}`);
  }

  for (const term of ['Cairo', 'Scarb', 'Starknet Foundry', 'StarknetKit', 'Dojo', 'Mainnet']) {
    if (!roadmap.includes(term)) failures.push(`roadmap missing ${term}`);
  }

  for (const term of ['Filecoin', 'Stellar']) {
    if (roadmap.includes(term) || passport.includes(term)) failures.push(`Pass 44 should not reintroduce ${term} scope`);
  }
}

if (failures.length) {
  console.error('Pass 44 audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Pass 44 audit passed: proof signals and Starknet grant scope are present.');
