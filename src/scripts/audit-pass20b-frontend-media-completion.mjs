#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'src';
const blockers = [];
const candidates = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.svelte-kit') continue;
      walk(path);
      continue;
    }
    if (!/\.(ts|js|svelte)$/.test(entry)) continue;
    const text = readFileSync(path, 'utf8');
    if (!text.includes('complete') && !text.includes('/assets/') && !text.includes('upload')) continue;
    candidates.push([path, text]);
  }
}

walk(root);

for (const [path, text] of candidates) {
  const looksLikeMediaCompletion =
    text.includes('/complete') ||
    text.includes('completeUpload') ||
    text.includes('complete_upload') ||
    text.includes('assets/${') && text.includes('complete');

  if (!looksLikeMediaCompletion) continue;

  const sendsChecksum = /\bchecksum\b/.test(text);
  const sendsSizeBytes = /\bsize_bytes\b/.test(text);
  if (sendsChecksum || sendsSizeBytes) {
    blockers.push(`${path} appears to send checksum/size_bytes during media completion`);
  }
}

console.log('PASS 20B frontend media completion audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 20B frontend media completion blockers found.');
