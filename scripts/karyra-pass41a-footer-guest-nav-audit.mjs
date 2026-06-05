#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const checks = [
  {
    file: 'src/lib/shell/SparkAppShell.svelte',
    includes: ['data-auth={signedIn ? \'user\' : \'guest\'}', '{#if signedIn}', '<SparkBottomNav />']
  },
  {
    file: 'src/lib/shell/SparkBottomNav.svelte',
    includes: ['primaryMobileNavItems', '<nav class:hidden', 'Navigasi mobile'],
    excludes: ['guestGatewayItem', 'betaSession.user']
  },
  {
    file: 'src/lib/ui/SparkSimpleFooter.svelte',
    includes: ['pass41a-public-footer', 'Jalur Spark', 'Bantuan', 'Akses']
  },
  {
    file: 'src/app.css',
    includes: ['KARYRA PASS 41A PUBLIC FOOTER + GUEST NAV FIX START', '.spark-app[data-auth=\'guest\'] .spark-main']
  }
];

let failed = false;
for (const check of checks) {
  if (!existsSync(check.file)) {
    console.error(`Missing file: ${check.file}`);
    failed = true;
    continue;
  }
  const content = readFileSync(check.file, 'utf8');
  for (const needle of check.includes ?? []) {
    if (!content.includes(needle)) {
      console.error(`Missing marker in ${check.file}: ${needle}`);
      failed = true;
    }
  }
  for (const needle of check.excludes ?? []) {
    if (content.includes(needle)) {
      console.error(`Unexpected leftover in ${check.file}: ${needle}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('Pass 41A audit OK: guest bottom nav hidden, public footer expanded, bottom spacing tightened.');
