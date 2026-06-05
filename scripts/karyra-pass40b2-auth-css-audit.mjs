#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const file = 'src/lib/ui/SparkAuthShell.svelte';
const text = readFileSync(file, 'utf8');
const failures = [];

if (/^\s*\.pass40b-auth-card\s*\{/m.test(text)) {
  failures.push('Raw scoped selector .pass40b-auth-card remains; use :global(.pass40b-auth-card).');
}

if (text.includes('pass40b-auth-card') && !text.includes(':global(.pass40b-auth-card)')) {
  failures.push('Auth card hook exists but global selector is missing.');
}

if (failures.length) {
  console.error('Pass 40B2 audit failed:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Pass 40B2 audit passed: auth CSS warning fix is in place.');
