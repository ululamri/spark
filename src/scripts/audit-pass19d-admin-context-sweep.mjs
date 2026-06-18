#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'src/routes/admin';
const serverFiles = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (entry === '+page.server.ts') serverFiles.push(full);
  }
}

walk(root);

const adminApiCall = /admin[A-Za-z]*Api\.[A-Za-z0-9_]+\(/;
const blockers = [];

for (const file of serverFiles) {
  const text = readFileSync(file, 'utf8');
  if (!adminApiCall.test(text)) continue;
  if (!text.includes('guardAdminRoute') && !text.includes('requireAdminAccess')) {
    blockers.push(`${file}: admin API call without explicit admin access resolver`);
  }
  if (text.includes('adminAuditApi') && !text.includes('access.requestContext')) {
    blockers.push(`${file}: audit API call without explicit request context`);
  }
  if (text.includes('adminTeamApi') && !text.includes('access.requestContext')) {
    blockers.push(`${file}: team API call without explicit request context`);
  }
}

console.log('PASS 19D admin context sweep audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19D admin context sweep blockers found.');
