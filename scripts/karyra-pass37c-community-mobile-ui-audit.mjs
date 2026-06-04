#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const files = [
  'src/lib/ui/SparkCommunityCommandCenter.svelte',
  'src/lib/ui/SparkCommunityTabbedSurface.svelte'
];

let ok = true;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (!text.includes('pass37c')) {
    console.error(`[pass37c] missing marker in ${file}`);
    ok = false;
  }
}

const tabs = readFileSync('src/lib/ui/SparkCommunityTabbedSurface.svelte', 'utf8');
if (/position:\s*sticky/.test(tabs)) {
  console.error('[pass37c] tab row still uses sticky positioning.');
  ok = false;
}
if (!/url\.hash\s*=\s*''/.test(tabs)) {
  console.error('[pass37c] selectTab should not force #community-tabs during normal tab changes.');
  ok = false;
}

const command = readFileSync('src/lib/ui/SparkCommunityCommandCenter.svelte', 'utf8');
for (const tab of ['workshop', 'cohort', 'diskusi']) {
  if (!command.includes(`/community?tab=${tab}#community-tabs`)) {
    console.error(`[pass37c] command center missing quick link for ${tab}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('Karyra Spark Pass 37C audit passed.');
