#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

const routePath = 'src/routes/core/+page.svelte';
const guidedPath = 'src/lib/ui/SparkCoreGuidedFlow.svelte';
const route = existsSync(routePath) ? readFileSync(routePath, 'utf8') : '';
const guided = existsSync(guidedPath) ? readFileSync(guidedPath, 'utf8') : '';

check('core route uses guided flow', route.includes('SparkCoreGuidedFlow'), routePath);
check('guided flow component exists', guided.includes('data-karyra-core-guided="pass38a"'), guidedPath);
check('core tabbed surface removed from active route', !route.includes('SparkCoreTabbedSurface'), routePath);
check('no tablist in guided component', !guided.includes('role="tablist"'), guidedPath);
check('primary CTA is Lanjutkan belajar', guided.includes('Lanjutkan belajar'), guidedPath);
check('discussion is contextual', guided.includes('Masih ada yang ganjal?') && guided.includes('Tanya di Diskusi'), guidedPath);

const banned = ['Menyerahkan', 'Silahkan', 'Kamu bisa', 'Social layer', 'Feed lokal', 'Submit'];
for (const word of banned) {
  check(`banned copy not present: ${word}`, !guided.includes(word) && !route.includes(word), word);
}

const failed = checks.filter((item) => !item.ok);
console.log('Karyra Pass 38A Core Guided Audit');
for (const item of checks) {
  console.log(`${item.ok ? '✅' : '❌'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}
if (failed.length) {
  console.error(`\n${failed.length} audit check(s) failed.`);
  process.exit(1);
}
console.log('\nAll Pass 38A audit checks passed.');
