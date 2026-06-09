#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

const forbiddenPaths = [
  'src/routes/studio',
  'src/lib/content-builder',
  'src/lib/content-managed',
  'src/lib/ui/SparkContentStudio.svelte',
  'src/lib/ui/SparkPublicContentBuilder.svelte',
  'src/lib/state/content-studio-state.svelte',
  'src/lib/state/content-studio-state.svelte.ts',
  'static/studio-content-overrides.json'
];

const forbiddenPatterns = [
  { label: 'public Studio route link', pattern: /(["'`])\/studio(?:\/|\1|\?|#)/ },
  { label: 'Studio component import', pattern: /SparkContentStudio|SparkPublicContentBuilder/ },
  { label: 'Studio state import', pattern: /content-studio-state/ },
  { label: 'Studio content builder helper', pattern: /content-builder\/public-content-builder/ },
  { label: 'managed Studio content helper', pattern: /content-managed\/spark-managed-content/ },
  { label: 'Studio write flag', pattern: /SPARK_STUDIO_WRITE_ENABLED/ },
  { label: 'Studio override asset', pattern: /studio-content-overrides\.json/ },
  { label: 'Studio API route copy', pattern: /\/studio\/content\/api\/override/ },
  { label: 'Studio marker', pattern: /data-karyra-studio|content-builder-shell|studio-content-builder/ }
];

const scanRoots = ['src/routes', 'src/lib/ui', 'src/lib/state', 'src/lib/content', 'src/lib/shell', 'static'];
const textExtensions = new Set(['.svelte', '.ts', '.js', '.mjs', '.json', '.css', '.html']);

function exists(path) {
  return existsSync(join(root, path));
}

function extensionOf(file) {
  if (file.endsWith('.svelte.ts')) return '.ts';
  const index = file.lastIndexOf('.');
  return index >= 0 ? file.slice(index) : '';
}

function walk(dir, files = []) {
  const fullDir = join(root, dir);
  if (!existsSync(fullDir)) return files;

  for (const entry of readdirSync(fullDir)) {
    const full = join(fullDir, entry);
    const rel = relative(root, full);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      if (['node_modules', '.svelte-kit', 'build', 'dist', '.pass-backups'].includes(entry)) continue;
      walk(rel, files);
      continue;
    }

    if (textExtensions.has(extensionOf(full))) files.push(rel);
  }

  return files;
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

const failures = [];

for (const forbiddenPath of forbiddenPaths) {
  if (exists(forbiddenPath)) failures.push(`${forbiddenPath} still exists`);
}

const files = scanRoots.flatMap((dir) => walk(dir));
for (const rel of files) {
  const text = readFileSync(join(root, rel), 'utf8');

  for (const item of forbiddenPatterns) {
    const match = text.match(item.pattern);
    if (match && match.index !== undefined) {
      failures.push(`${rel}:${lineNumber(text, match.index)} contains ${item.label}`);
    }
  }
}

console.log('Spark PASS 69B no public Studio audit');
console.log('======================================');

if (failures.length) {
  console.error('\nBlockers:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('No public Studio route, component, API, state, or override asset found.');
