#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const route = readFileSync('src/routes/admin/moderation/+page.server.ts', 'utf8');
const helper = readFileSync('src/lib/server/admin-moderation-access.ts', 'utf8');

const required = [
  [route, 'loadModerationAdminSurface'],
  [route, 'runModerationScan'],
  [route, 'markModerationSignalReviewed'],
  [route, 'runBulkModeration'],
  [helper, "requireAdminAccess(event, 'moderation_read')"],
  [helper, "requireAdminAccess(event, 'ml_moderation_manage')"],
  [helper, "requireAdminAccess(event, 'moderation_bulk')"],
  [helper, "payload: { source: 'admin_ui_pass_19c' }"]
];

const forbidden = [
  [route, 'KARYRA_ADMIN_TOKEN'],
  [route, 'x-karyra-admin-token'],
  [route, "payload: { source: 'admin_ui_pass_17g' }"]
];

const blockers = [];
for (const [text, needle] of required) if (!text.includes(needle)) blockers.push(`Missing ${needle}`);
for (const [text, needle] of forbidden) if (text.includes(needle)) blockers.push(`Forbidden stale token/source usage ${needle}`);

console.log('PASS 19C admin moderation session-mode audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19C admin moderation session-mode blockers found.');
