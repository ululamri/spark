#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const files = {
  layoutServer: readFileSync('src/routes/admin/+layout.server.ts', 'utf8'),
  layout: readFileSync('src/routes/admin/+layout.svelte', 'utf8'),
  adminLayout: readFileSync('src/lib/admin/ui/AdminLayout.svelte', 'utf8'),
  sidebar: readFileSync('src/lib/admin/ui/AdminSidebar.svelte', 'utf8')
};

const checks = [
  [files.layoutServer, 'adminActor'],
  [files.layoutServer, 'mode: \'superadmin\''],
  [files.layout, '<AdminLayout actor={data.adminActor}>'],
  [files.adminLayout, '<AdminSidebar {actor} />'],
  [files.sidebar, "roles: ['superadmin']"],
  [files.sidebar, "roles: ['superadmin', 'admin', 'moderator']"],
  [files.sidebar, "capability: 'moderation_read'"],
  [files.sidebar, "capability: 'admin_manage'"],
  [files.sidebar, 'visibleNavigation']
];

const blockers = checks.filter(([text, needle]) => !text.includes(needle));
console.log('PASS 19C admin role boundary audit');
if (blockers.length) {
  for (const [, needle] of blockers) console.error(`Missing ${needle}`);
  process.exit(1);
}
console.log('No PASS 19C admin role boundary blockers found.');
