#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const text = readFileSync('src/routes/admin/team/+page.server.ts', 'utf8');
const required = [
  "import { guardAdminRoute } from '$lib/server/admin-access'",
  'const access = await guardAdminRoute(event)',
  'adminTeamApi.members(fetch, { limit: 50, role: filters.role, status: filters.status }, access.requestContext)',
  'adminTeamApi.capabilities(fetch, access.requestContext)',
  'capabilities: []',
  'adminTeamApi.revokeMember(',
  'access.requestContext'
];

const forbidden = [
  'listFromForm(formData, \'capabilities\')',
  'adminTeamApi.members(fetch, { limit: 50, role: filters.role, status: filters.status })',
  'adminTeamApi.capabilities(fetch)'
];

const blockers = [];
for (const item of required) if (!text.includes(item)) blockers.push(`Missing ${item}`);
for (const item of forbidden) if (text.includes(item)) blockers.push(`Forbidden stale pattern ${item}`);

console.log('PASS 19D admin team root boundary audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19D admin team root boundary blockers found.');
