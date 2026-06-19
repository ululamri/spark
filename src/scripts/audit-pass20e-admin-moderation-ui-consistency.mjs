#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  moderationPage: 'src/routes/admin/moderation/+page.svelte',
  moderationServer: 'src/routes/admin/moderation/+page.server.ts',
  moderationAccess: 'src/lib/server/admin-moderation-access.ts',
  adminApi: 'src/lib/admin/admin-api.ts',
  adminSocialOpsApi: 'src/lib/admin/admin-social-ops-api.ts',
  adminAccess: 'src/lib/server/admin-access.ts',
  adminLayoutServer: 'src/routes/admin/+layout.server.ts'
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

const serverFlow = [
  src.moderationServer,
  src.moderationAccess
].join('\n');

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
  if (condition) {
    pass(name);
  } else if (level === 'warning') {
    warn(name);
  } else {
    block(name);
  }
}

console.log('PASS 20E-A admin moderation UI consistency audit');
console.log('root: ' + root);
console.log('');

for (const file of Object.values(files)) {
  check(exists(file), 'file exists: ' + file);
}

check(
  hasAny(serverFlow, [
    'loadModerationAdminSurface',
    'adminApi.socialReports',
    'adminApi.socialPosts',
    'adminApi.socialComments'
  ]),
  'moderation page loads through server-side admin API'
);

check(
  hasAny(serverFlow, [
    'requireAdminAccess(event',
    'requireAdminAccess',
    'requestContext',
    'context = await'
  ]),
  'moderation server uses resolved admin access/request context'
);

check(
  hasAny(src.adminApi, [
    '/social/reports',
    'socialReports'
  ]),
  'admin API client exposes reports queue endpoint'
);

check(
  hasAny(src.adminApi, [
    '/social/posts',
    'socialPosts'
  ]),
  'admin API client exposes posts moderation endpoint'
);

check(
  hasAny(src.adminApi, [
    '/social/comments',
    'socialComments'
  ]),
  'admin API client exposes comments moderation endpoint'
);

check(
  hasAny(src.adminApi, [
    '/social/bulk/moderation-actions',
    'bulkModeration',
    'moderation-actions'
  ]),
  'admin API client exposes moderation action endpoint'
);

check(
  hasAny(src.adminSocialOpsApi, [
    'bulkJobs',
    '/social/ops/bulk-jobs',
    'bulk-jobs'
  ]),
  'admin social ops API exposes bulk job history',
  'warning'
);

check(
  hasAny(src.moderationPage + serverFlow, [
    'pending',
    'reviewed',
    'dismissed',
    'actioned'
  ]),
  'moderation UI understands report review states'
);

check(
  hasAny(src.moderationPage + serverFlow, ['hide', 'remove', 'restore']) &&
    hasAny(src.moderationPage + serverFlow, ['post', 'comment']),
  'moderation UI exposes content moderation action states'
);

check(
  hasAny(src.moderationPage + serverFlow, ['bulk', 'dry_run', 'dryRun']),
  'moderation UI supports bulk/dry-run workflow'
);

check(
  !hasAny(src.moderationPage + serverFlow, [
    'localStorage',
    'sessionStorage',
    'mockReports',
    'demoReports'
  ]),
  'moderation UI/server does not use local/mock report state'
);

check(
  !hasAny(src.moderationPage, [
    'KARYRA_ADMIN_TOKEN',
    'x-karyra-admin-token'
  ]),
  'moderation browser page does not expose admin token/header'
);

check(
  src.adminAccess.includes('superadmin') &&
    src.adminAccess.includes('delegated') &&
    hasAny(src.adminAccess, ['cookieHeader', 'requestContext']),
  'admin access resolver supports superadmin and delegated request contexts'
);

check(
  hasAny(all, [
    'moderation_read',
    'moderation_action',
    'reports_manage',
    'moderation_bulk',
    'ml_moderation_manage'
  ]),
  'frontend references moderation/report capability model',
  'warning'
);

console.log('OK:');
for (const item of ok) {
  console.log('  OK  ' + item);
}

if (warnings.length > 0) {
  console.log('');
  console.log('Warnings:');
  for (const item of warnings) {
    console.log('  WARN  ' + item);
  }
}

if (blockers.length > 0) {
  console.log('');
  console.log('Blockers:');
  for (const item of blockers) {
    console.log('  FAIL  ' + item);
  }
  console.log('');
  console.log('PASS 20E-A FAILED');
  process.exit(1);
}

console.log('');
console.log('PASS 20E-A OK');