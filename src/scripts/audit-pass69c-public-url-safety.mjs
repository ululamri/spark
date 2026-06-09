#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

const runtimeScanRoots = ['src/lib', 'src/routes', 'static'];
const textExtensions = new Set(['.svelte', '.ts', '.js', '.mjs', '.json']);
const ignoredSegments = new Set(['node_modules', '.svelte-kit', 'build', 'dist', '.pass-backups', 'src/scripts']);
const ignoredSuffixes = ['.bak', '.backup', '.old'];

function exists(path) {
  return existsSync(join(root, path));
}

function walk(dir, files = []) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return files;

  for (const entry of readdirSync(abs)) {
    const full = join(abs, entry);
    const rel = relative(root, full).replaceAll('\\', '/');
    const stat = statSync(full);

    if (stat.isDirectory()) {
      if ([...ignoredSegments].some((segment) => rel === segment || rel.startsWith(`${segment}/`))) continue;
      walk(rel, files);
      continue;
    }

    if (ignoredSuffixes.some((suffix) => rel.endsWith(suffix)) || rel.includes('.pass-')) continue;
    const ext = full.slice(full.lastIndexOf('.'));
    if (textExtensions.has(ext)) files.push(rel);
  }

  return files;
}

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

function expectFile(path) {
  if (!exists(path)) failures.push(`${path} is missing.`);
}

function expectMissing(path) {
  if (exists(path)) failures.push(`${path} must not exist in the public live build.`);
}

expectFile('src/lib/backend/api-client.ts');
expectFile('src/lib/config/spark-env.ts');
expectFile('src/lib/config/spark-topology.ts');
expectFile('.env.example');
expectMissing('src/routes/studio');
expectMissing('static/studio-content-overrides.json');

if (exists('package.json')) {
  const pkg = JSON.parse(read('package.json'));
  if (!pkg.scripts?.['audit:pass69c']) failures.push('package.json missing audit:pass69c script.');
}

const devUrlPatterns = [
  { label: 'hardcoded localhost Hub URL', pattern: /https?:\/\/localhost:5174\b/g },
  { label: 'hardcoded localhost URL', pattern: /https?:\/\/localhost\b/g },
  { label: 'hardcoded loopback URL', pattern: /https?:\/\/127\.0\.0\.1\b/g },
  { label: 'public Studio route link', pattern: /(["'`])\/studio(?:\/|\1|\?|#)/g },
  { label: 'Studio override asset', pattern: /studio-content-overrides\.json/g }
];

const runtimeFiles = runtimeScanRoots.flatMap((scanRoot) => walk(scanRoot));
for (const file of runtimeFiles) {
  const text = read(file);
  for (const blocker of devUrlPatterns) {
    for (const match of text.matchAll(blocker.pattern)) {
      failures.push(`${file}:${lineNumber(text, match.index ?? 0)} ${blocker.label} must not appear in runtime/public code.`);
    }
  }
}

if (exists('.env.example')) {
  const envExample = read('.env.example');
  const blockedEnvValues = ['localhost', '127.0.0.1'];
  for (const value of blockedEnvValues) {
    if (envExample.includes(value)) failures.push(`.env.example must stay public-safe and must not contain ${value}.`);
  }

  const requiredDefaults = [
    'PUBLIC_SPARK_APP_URL="/"',
    'PUBLIC_SPARK_API_URL="/api"',
    'PUBLIC_SPARK_HUB_URL="/hub"'
  ];
  for (const required of requiredDefaults) {
    if (!envExample.includes(required)) failures.push(`.env.example missing safe default: ${required}`);
  }
}

if (exists('src/lib/backend/api-client.ts')) {
  const apiClient = read('src/lib/backend/api-client.ts');
  if (!apiClient.includes("const DEFAULT_API_BASE_PATH = '/api';")) {
    failures.push('api-client.ts must default to same-origin /api, not a loopback host.');
  }
}

if (exists('src/lib/config/spark-env.ts')) {
  const envText = read('src/lib/config/spark-env.ts');
  if (!envText.includes("PUBLIC_SPARK_API_URL: UrlOrPathSchema.optional().default('/api')")) {
    failures.push('spark-env.ts must default PUBLIC_SPARK_API_URL to /api.');
  }
  if (!envText.includes("PUBLIC_SPARK_APP_URL: UrlOrPathSchema.optional().default('/')")) {
    failures.push('spark-env.ts must allow and default PUBLIC_SPARK_APP_URL to /.');
  }
}

console.log('Spark PASS 69C public URL safety audit');
console.log('========================================');
console.log(`Runtime files scanned: ${runtimeFiles.length}`);

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

console.log('\nNo hard blockers found.');
