#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const api = readFileSync('src/lib/admin/admin-audit-api.ts', 'utf8');
const route = readFileSync('src/routes/admin/audit/+page.server.ts', 'utf8');

const required = [
  [api, "requestAdmin"],
  [api, "type AdminRequestContext"],
  [api, "context?: AdminRequestContext"],
  [route, "guardAdminRoute"],
  [route, "const access = await guardAdminRoute(event)"],
  [route, "access.requestContext"]
];

const forbidden = [
  [api, "$env/dynamic/private"],
  [api, "KARYRA_ADMIN_TOKEN"],
  [api, "x-karyra-admin-token"],
  [route, "adminAuditApi.events(fetch, {"]
];

const blockers = [];
for (const [text, item] of required) if (!text.includes(item)) blockers.push(`Missing ${item}`);
for (const [text, item] of forbidden) if (text.includes(item)) blockers.push(`Forbidden stale pattern ${item}`);

console.log('PASS 19D admin audit context audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19D admin audit context blockers found.');
