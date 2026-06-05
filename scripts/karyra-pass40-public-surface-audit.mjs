#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SEARCH_ROOTS = ['src/routes', 'src/lib/ui'];
const BLOCKED = [
  'backend-ready',
  'backend ready',
  'source of truth',
  'local-state',
  'local state',
  'localStorage',
  'IndexedDB',
  'storage registry',
  'registry penyimpanan',
  'event queue',
  'sync queue',
  'antrean sync',
  'menunggu sync',
  'siap backend',
  'sync backend',
  'server menjadi sumber',
  'backend aktif',
  'developer',
  'admin panel'
];

function walk(dir) {
  const out = [];
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (path.endsWith('.svelte')) out.push(path);
  }
  return out;
}

const findings = [];
for (const root of SEARCH_ROOTS) {
  const abs = join(ROOT, root);
  let files = [];
  try { files = walk(abs); } catch { continue; }
  for (const file of files) {
    const rel = relative(ROOT, file);
    const text = readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const term of BLOCKED) {
        if (line.toLowerCase().includes(term.toLowerCase())) {
          findings.push({ file: rel, line: index + 1, term, text: line.trim() });
        }
      }
    });
  }
}

if (findings.length) {
  console.log('Pass 40 public surface audit found technical terms in public UI:');
  for (const finding of findings) {
    console.log(`- ${finding.file}:${finding.line} [${finding.term}] ${finding.text}`);
  }
  process.exitCode = 1;
} else {
  console.log('Pass 40 public surface audit passed: no developer/admin/backend terms found in public UI.');
}
