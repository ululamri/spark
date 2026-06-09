#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const text = readFileSync('src/lib/content/spark-content.ts', 'utf8');
const expectedSlugs = [
  'why-blockchain',
  'shared-ledger',
  'what-is-token',
  'wallet-is-not-bank',
  'web3-interactions',
  'starknet-first-look',
  'cairo-gentle-intro'
];

const failures = [];

if (text.includes('body: defaultBody')) {
  failures.push('Masih ada lesson yang memakai body: defaultBody.');
}

for (const slug of expectedSlugs) {
  const slugIndex = text.indexOf(`slug: '${slug}'`);
  if (slugIndex < 0) {
    failures.push(`Lesson slug hilang: ${slug}`);
    continue;
  }

  const checkpointIndex = text.indexOf('checkpointQuestion:', slugIndex);
  if (checkpointIndex < 0) {
    failures.push(`checkpointQuestion tidak ditemukan untuk ${slug}`);
    continue;
  }

  const segment = text.slice(slugIndex, checkpointIndex);
  const bodyMatch = segment.match(/body:\s*\[([\s\S]*?)\]\s*,/);
  if (!bodyMatch) {
    failures.push(`Body array tidak ditemukan untuk ${slug}`);
    continue;
  }

  const paragraphCount = [...bodyMatch[1].matchAll(/'[^']+'/g)].length;
  if (paragraphCount < 4) {
    failures.push(`${slug} hanya punya ${paragraphCount} paragraf; minimal 4.`);
  }
}

const requiredSignals = ['Starknet', 'wallet', 'signature', 'testnet', 'account abstraction', 'Cairo'];
for (const signal of requiredSignals) {
  if (!text.toLowerCase().includes(signal.toLowerCase())) {
    failures.push(`Sinyal konten grant belum muncul: ${signal}`);
  }
}

console.log('Spark PASS 69A core lessons audit');
console.log('====================================');

if (failures.length) {
  console.error('\nBlockers:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('No hard blockers found.');

