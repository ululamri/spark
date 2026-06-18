#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const moderationPage = readFileSync('src/routes/admin/moderation/+page.server.ts', 'utf8');
const jobDetail = readFileSync('src/routes/admin/moderation/jobs/[jobId]/+page.server.ts', 'utf8');
const helper = readFileSync('src/lib/server/admin-moderation-access.ts', 'utf8');

const required = [
  [moderationPage, 'loadModerationAdminSurface'],
  [moderationPage, 'runModerationScan'],
  [moderationPage, 'runBulkModeration'],
  [jobDetail, "requireAdminAccess(event, 'moderation_read')"],
  [jobDetail, 'adminSocialOpsApi.bulkJobDetail(fetch, params.jobId, context)'],
  [helper, "requireAdminAccess(event, 'moderation_read')"],
  [helper, "requireAdminAccess(event, 'ml_moderation_manage')"],
  [helper, "requireAdminAccess(event, 'moderation_bulk')"]
];

const forbidden = [
  [moderationPage, 'KARYRA_ADMIN_TOKEN'],
  [moderationPage, 'x-karyra-admin-token'],
  [jobDetail, 'KARYRA_ADMIN_TOKEN'],
  [jobDetail, 'x-karyra-admin-token']
];

const blockers = [];
for (const [text, needle] of required) if (!text.includes(needle)) blockers.push(`Missing ${needle}`);
for (const [text, needle] of forbidden) if (text.includes(needle)) blockers.push(`Forbidden stale admin token usage ${needle}`);

console.log('PASS 19C admin moderation routes audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19C admin moderation route blockers found.');
