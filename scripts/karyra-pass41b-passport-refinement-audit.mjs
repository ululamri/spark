#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const checks = [
  {
    path: 'src/routes/passport/+page.svelte',
    includes: ['SparkPassportReadinessCenter', 'Passport']
  },
  {
    path: 'src/lib/ui/SparkPassportReadinessCenter.svelte',
    includes: [
      'data-karyra-passport="credential-refinement"',
      'Passport kesiapanmu.',
      'Issued by Karyra Spark',
      'Beginner, Intermediate, Advanced.',
      'Privasi tetap jadi dasar.',
      'credential-meta-grid',
      'passport-evidence-grid'
    ]
  }
];

let ok = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`Missing file: ${check.path}`);
    ok = false;
    continue;
  }
  const source = readFileSync(check.path, 'utf8');
  for (const needle of check.includes) {
    if (!source.includes(needle)) {
      console.error(`Missing marker in ${check.path}: ${needle}`);
      ok = false;
    }
  }
}

if (!ok) process.exit(1);
console.log('Pass 41B audit OK: Passport mainline credential UI markers are present.');
