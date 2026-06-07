#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, normalize } from 'node:path';

const root = process.cwd();

const scanDirs = [
  'src/routes',
  'src/lib/ui',
  'src/lib/shell',
  'src/lib/content',
  'src/lib/messaging'
];

const allowedExactFiles = new Set([
  normalize('src/lib/content/public-copy-contract.ts')
]);

const textExtensions = new Set(['.svelte', '.ts', '.js', '.mjs']);

const blockers = [
  {
    label: 'localhost Hub URL',
    pattern: /https?:\/\/localhost:5174\b/gi,
    help: 'Hub publik tidak boleh jatuh ke localhost:5174.'
  },
  {
    label: 'technical public copy',
    pattern: /\b(sesi backend|session backend|proof event ledger|recorded proof event|evidence root|local-state|sync queue)\b/gi,
    help: 'Ganti dengan bahasa pengguna: akun tersimpan aman, bukti belajar tercatat, atau data tersinkron.'
  }
];

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function walk(dir, files = []) {
  if (!exists(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (['node_modules', '.svelte-kit', 'build', 'dist', '.pass-backups'].includes(entry)) continue;
      walk(full, files);
    } else {
      const ext = full.slice(full.lastIndexOf('.'));
      if (textExtensions.has(ext)) files.push(full);
    }
  }
  return files;
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

const failures = [];
const scannedFiles = scanDirs
  .flatMap((dir) => walk(join(root, dir)))
  .filter((file) => !allowedExactFiles.has(normalize(relative(root, file))));

for (const file of scannedFiles) {
  const rel = normalize(relative(root, file));
  const text = readFileSync(file, 'utf8');
  for (const blocker of blockers) {
    for (const match of text.matchAll(blocker.pattern)) {
      failures.push(`${rel}:${lineNumber(text, match.index ?? 0)} contains ${blocker.label}: ${JSON.stringify(match[0])} — ${blocker.help}`);
    }
  }
}

console.log('Spark Pass 68B public microcopy audit');
console.log('=======================================');
console.log(`Files scanned: ${scannedFiles.length}`);

if (failures.length) {
  console.error('\nBlockers:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\nNo Pass 68B blockers found.');
