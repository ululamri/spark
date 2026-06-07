#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

const forbiddenWorkspaceFolders = [
  'pass-68b-shell-toast-settings-microcopy',
  'pass-68b-a1-shell-toast-settings-microcopy'
];

for (const folder of forbiddenWorkspaceFolders) {
  if (existsSync(join(root, folder))) {
    failures.push(`${folder}/ is inside the frontend workspace. Extract pass ZIP outside ~/spark, then remove this folder before push.`);
  }
}

const requiredFiles = [
  'src/scripts/audit-pass68b-public-microcopy.mjs',
  'docs/content/pass-68b-shell-toast-settings-microcopy.md',
  'src/lib/ui/SparkPublicContentBuilder.svelte',
  'src/lib/ui/SparkAccountMenu.svelte',
  'src/lib/ui/SparkNotificationCenter.svelte',
  'src/lib/ui/SparkCookieNotice.svelte',
  'src/lib/shell/SparkMobileDrawer.svelte',
  'src/lib/ui/SparkSettingsControlCenter.svelte',
  'src/lib/ui/SparkDataControlCenter.svelte',
  'src/lib/messaging/spark-messaging-model.ts'
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) failures.push(`Missing ${file}`);
}

const packageJsonPath = join(root, 'package.json');
if (existsSync(packageJsonPath)) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  if (pkg.scripts?.['audit:pass68b'] !== 'node src/scripts/audit-pass68b-public-microcopy.mjs') {
    failures.push('package.json missing script audit:pass68b');
  }
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (['node_modules', '.svelte-kit', 'build', 'dist', '.pass-backups'].includes(entry)) continue;
      walk(full, files);
    } else if (/\.(svelte|ts|js|mjs|md)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

const publicFiles = [
  'src/routes',
  'src/lib/ui',
  'src/lib/shell',
  'src/lib/content',
  'src/lib/messaging'
].flatMap((dir) => walk(join(root, dir)));

const hardTerms = [
  'Sesi backend',
  'session backend',
  'proof event ledger',
  'evidence root',
  'recorded proof event',
  'local-state',
  'sync queue'
];

for (const file of publicFiles) {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  for (const term of hardTerms) {
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx !== -1) failures.push(`${rel}:${lineNumber(text, idx)} contains technical public copy: ${term}`);
  }
}

const builderPath = join(root, 'src/lib/ui/SparkPublicContentBuilder.svelte');
if (existsSync(builderPath)) {
  const builder = readFileSync(builderPath, 'utf8');
  const staleSelectors = [
    '\n  .editor-card,\n  .preview-card {',
    '\n    .editor-card,\n    .preview-card {',
    ":global([data-theme='dark']) .editor-card",
    ":global([data-theme='dark']) .preview-card"
  ];
  for (const selector of staleSelectors) {
    if (builder.includes(selector)) failures.push(`SparkPublicContentBuilder still has stale scoped selector: ${selector.trim()}`);
  }
  if (!builder.includes(':global(.editor-card)') || !builder.includes(':global(.preview-card)')) {
    warnings.push('SparkPublicContentBuilder does not show expected global editor/preview card selectors.');
  }
}

console.log('Spark Pass 68B public microcopy audit');
console.log('======================================');
console.log(`Files scanned: ${publicFiles.length}`);

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
} else {
  console.log('\nWarnings: none');
}

if (failures.length) {
  console.error('\nBlockers:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\nNo Pass 68B blockers found.');
