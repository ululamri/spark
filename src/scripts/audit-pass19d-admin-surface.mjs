#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const scripts = [
  'src/scripts/audit-pass19c-admin-role-boundary.mjs',
  'src/scripts/audit-pass19c-admin-api-modes.mjs',
  'src/scripts/audit-pass19c-admin-access-resolver.mjs',
  'src/scripts/audit-pass19c-admin-moderation-session-mode.mjs',
  'src/scripts/audit-pass19c-admin-moderation-capability-ui.mjs',
  'src/scripts/audit-pass19c-admin-moderation-routes.mjs',
  'src/scripts/audit-pass19d-admin-role-ux.mjs',
  'src/scripts/audit-pass19d-admin-team-root-boundary.mjs',
  'src/scripts/audit-pass19d-admin-audit-context.mjs',
  'src/scripts/audit-pass19d-admin-context-sweep.mjs',
  'src/scripts/audit-pass20e-admin-moderation-ui-consistency.mjs',
  'src/scripts/audit-pass21c-admin-audit-ui-consistency.mjs'
];

let failed = false;
console.log('Admin frontend production surface aggregate audit');
for (const script of scripts) {
  console.log(`\n> node ${script}`);
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}

if (failed) process.exit(1);
console.log('\nNo admin frontend production surface blockers found.');
