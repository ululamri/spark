#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const files = {
  adminApi: readFileSync('src/lib/admin/admin-api.ts', 'utf8'),
  teamApi: readFileSync('src/lib/admin/admin-team-api.ts', 'utf8'),
  socialOpsApi: readFileSync('src/lib/admin/admin-social-ops-api.ts', 'utf8')
};

const required = [
  [files.adminApi, "export type AdminRequestMode = 'superadmin' | 'delegated'"],
  [files.adminApi, 'cookieHeader'],
  [files.adminApi, 'headers.cookie = cookieHeader'],
  [files.adminApi, "headers['x-karyra-admin-token'] = adminToken()"],
  [files.adminApi, 'export async function requestAdmin'],
  [files.adminApi, 'export async function requestAdminJson'],
  [files.teamApi, "requestAdmin<AdminActor>(fetcher, '/team/actor', context)"],
  [files.teamApi, 'type AdminRequestContext'],
  [files.socialOpsApi, 'type AdminRequestContext']
];

const forbidden = [
  [files.teamApi, 'KARYRA_ADMIN_TOKEN'],
  [files.socialOpsApi, 'KARYRA_ADMIN_TOKEN'],
  [files.teamApi, 'x-karyra-admin-token'],
  [files.socialOpsApi, 'x-karyra-admin-token']
];

const blockers = [];
for (const [text, needle] of required) if (!text.includes(needle)) blockers.push(`Missing ${needle}`);
for (const [text, needle] of forbidden) if (text.includes(needle)) blockers.push(`Forbidden direct token usage ${needle}`);

console.log('PASS 19C admin API mode audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19C admin API mode blockers found.');
