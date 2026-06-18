#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const text = readFileSync('src/lib/server/admin-access.ts', 'utf8');
const required = [
  'resolveAdminAccess',
  'guardAdminRoute',
  'hasValidAdminSession',
  'adminTeamApi.actor',
  "mode: 'delegated'",
  'ENABLE_DELEGATED_ADMIN_ROUTES = true',
  "actor.role === 'superadmin'",
  "pathname === '/admin/moderation'",
  "redirect(303, defaultAdminPath(access.actor))"
];

const blockers = required.filter((item) => !text.includes(item));
console.log('PASS 19C admin access resolver audit');
if (blockers.length) {
  for (const item of blockers) console.error(`Missing ${item}`);
  process.exit(1);
}
console.log('No PASS 19C admin access resolver blockers found.');
