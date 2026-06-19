#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  auditListServer: 'src/routes/admin/audit/+page.server.ts',
  auditListPage: 'src/routes/admin/audit/+page.svelte',
  auditDetailServer: 'src/routes/admin/audit/events/[eventId]/+page.server.ts',
  auditDetailPage: 'src/routes/admin/audit/events/[eventId]/+page.svelte',
  auditApi: 'src/lib/admin/admin-audit-api.ts',
  adminApi: 'src/lib/admin/admin-api.ts',
  adminAccess: 'src/lib/server/admin-access.ts'
};

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

function has(text, needle) {
  return needle instanceof RegExp ? needle.test(text) : text.includes(needle);
}

function hasAny(text, needles) {
  return needles.some((needle) => has(text, needle));
}

const src = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, read(file)])
);

const listFlow = [src.auditListServer, src.auditListPage].join('\n');
const detailFlow = [src.auditDetailServer, src.auditDetailPage].join('\n');
const all = Object.values(src).join('\n');

const ok = [];
const warnings = [];
const blockers = [];

function pass(name) {
  ok.push(name);
}

function warn(name) {
  warnings.push(name);
}

function block(name) {
  blockers.push(name);
}

function check(condition, name, level = 'blocker') {
  if (condition) pass(name);
  else if (level === 'warning') warn(name);
  else block(name);
}

console.log('PASS 21C admin audit UI consistency audit');
console.log('root: ' + root);
console.log('');

for (const file of Object.values(files)) {
  check(exists(file), 'file exists: ' + file);
}

check(
  has(src.auditListServer, 'guardAdminRoute(event)') &&
    has(src.auditListServer, 'access.requestContext') &&
    has(src.auditListServer, 'adminAuditApi.events'),
  'audit list route loads through guarded server-side admin audit API'
);

check(
  has(src.auditDetailServer, 'guardAdminRoute(event)') &&
    has(src.auditDetailServer, 'adminAuditApi.eventDetail') &&
    has(src.auditDetailServer, 'event.params.eventId'),
  'audit detail route loads through guarded server-side admin audit API'
);

check(
  has(src.auditApi, "requestAdmin<AdminAuditEvents>") &&
    has(src.auditApi, "'/audit/events?'") &&
    has(src.auditApi, "requestAdmin<AdminAuditEvent>") &&
    has(src.auditApi, "'/audit/events/'"),
  'admin audit API client exposes list and detail endpoints'
);

check(
  has(src.auditApi, 'AdminAuditEvent') &&
    has(src.auditApi, 'actor_kind') &&
    has(src.auditApi, 'actor_user_id') &&
    has(src.auditApi, 'action') &&
    has(src.auditApi, 'target_type') &&
    has(src.auditApi, 'target_user_id') &&
    has(src.auditApi, 'target_id') &&
    has(src.auditApi, 'capabilities') &&
    has(src.auditApi, 'summary') &&
    has(src.auditApi, 'metadata') &&
    has(src.auditApi, 'created_at'),
  'audit API types include required backend audit fields'
);

check(
  has(src.auditApi, 'actor_kind') &&
    has(src.auditApi, 'action') &&
    has(src.auditApi, 'target_type') &&
    has(src.auditApi, "!== 'all'"),
  'audit API client supports actor/action/target filters'
);

check(
  has(src.auditListServer, 'value.length > 80') &&
    has(src.auditListServer, '/[\\u0000-\\u001f]/.test(value)') &&
    has(src.auditListServer, "return 'all'"),
  'audit list server sanitizes URL filters before backend request'
);

check(
  has(src.auditListPage, 'method="GET"') &&
    has(src.auditListPage, 'name="actor_kind"') &&
    has(src.auditListPage, 'name="action"') &&
    has(src.auditListPage, 'name="target_type"') &&
    has(src.auditListPage, 'href="/admin/audit"'),
  'audit list UI exposes read-only URL filters and reset link'
);

check(
  has(src.auditListPage, 'events.length') &&
    has(src.auditListPage, 'AdminTable') &&
    has(src.auditListPage, "'/admin/audit/events/' + event.id") &&
    has(src.auditListPage, 'metadataPreview'),
  'audit list UI renders event rows with detail links and metadata preview'
);

check(
  has(src.auditDetailPage, 'metadataJson') &&
    has(src.auditDetailPage, 'Actor capabilities') &&
    has(src.auditDetailPage, 'Raw event metadata') &&
    has(src.auditDetailPage, 'Back to audit log'),
  'audit detail UI renders capabilities and raw metadata read-only'
);

check(
  hasAny(listFlow + detailFlow, ['apiError', 'AdminEmptyState']) &&
    hasAny(src.auditListServer + src.auditDetailServer, ['adminErrorMessage']),
  'audit UI handles API errors without browser-side token fallback'
);

check(
  !hasAny(src.auditListPage + src.auditDetailPage, [
    'KARYRA_ADMIN_TOKEN',
    'x-karyra-admin-token',
    'localStorage',
    'sessionStorage'
  ]),
  'audit browser pages do not expose admin token or local/session storage auth'
);

check(
  has(src.adminApi, 'headers[\'x-karyra-admin-token\'] = adminToken()') &&
    has(src.adminApi, "if (context.mode === 'delegated')") &&
    has(src.adminApi, 'headers.cookie = cookieHeader'),
  'shared admin API keeps superadmin token server-side and delegated cookie based'
);

check(
  has(src.adminAccess, 'superadmin') &&
    has(src.adminAccess, 'delegated') &&
    hasAny(src.adminAccess, ['requestContext', 'cookieHeader']),
  'shared admin access resolver supports superadmin and delegated contexts'
);

check(
  !hasAny(all, ['mockAudit', 'demoAudit', 'fixtureAudit']),
  'audit UI does not use mock/demo audit state'
);

console.log('OK:');
for (const item of ok) console.log('  OK  ' + item);

if (warnings.length > 0) {
  console.log('');
  console.log('Warnings:');
  for (const item of warnings) console.log('  WARN  ' + item);
}

if (blockers.length > 0) {
  console.log('');
  console.log('Blockers:');
  for (const item of blockers) console.log('  FAIL  ' + item);
  console.log('');
  console.log('PASS 21C FAILED');
  process.exit(1);
}

console.log('');
console.log('PASS 21C OK');
