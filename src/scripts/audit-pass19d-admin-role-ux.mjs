#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const matrix = readFileSync('src/lib/admin/admin-role-matrix.ts', 'utf8');
const panel = readFileSync('src/lib/admin/ui/AdminModerationRolePanel.svelte', 'utf8');
const layout = readFileSync('src/routes/admin/moderation/+layout.svelte', 'utf8');
const page = readFileSync('src/routes/admin/moderation/+page.svelte', 'utf8');

const required = [
  [matrix, "superadmin"],
  [matrix, "admin"],
  [matrix, "moderator"],
  [matrix, "canManageMl"],
  [matrix, "canRunBulk"],
  [matrix, "primarySurface"],
  [panel, "Allowed work"],
  [panel, "Blocked or out-of-scope work"],
  [layout, "AdminModerationRolePanel"],
  [layout, "adminRoleProfile"],
  [page, "actor?.capabilities?.includes('ml_moderation_manage')"],
  [page, "actor?.capabilities?.includes('moderation_bulk')"],
  [page, "ML actions are read-only"],
  [page, "Read-only for this role."]
];

const blockers = required.filter(([text, needle]) => !text.includes(needle));
console.log('PASS 19D admin role UX audit');
if (blockers.length) {
  for (const [, needle] of blockers) console.error(`Missing ${needle}`);
  process.exit(1);
}
console.log('No PASS 19D admin role UX blockers found.');
