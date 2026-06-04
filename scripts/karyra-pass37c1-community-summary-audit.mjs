#!/usr/bin/env node
import fs from 'node:fs';

const file = 'src/lib/ui/SparkCommunityCommandCenter.svelte';
const source = fs.readFileSync(file, 'utf8');
const checks = [
  ['no SparkCard summary wrapper', !source.includes('<SparkCard class="community-summary-card"')],
  ['summary card is local element', source.includes('<div class="community-summary-card"')],
  ['no unused SparkCard import', !source.includes("import SparkCard from './SparkCard.svelte';")],
  ['keeps compact community actions', source.includes('pass37b-community-actions') || source.includes('pass37c-community-actions')]
];

const failed = checks.filter(([, ok]) => !ok);
console.log('Karyra Pass 37C1 Community Summary Audit');
for (const [name, ok] of checks) console.log(`${ok ? 'OK' : 'FAIL'} - ${name}`);
if (failed.length) process.exit(1);
