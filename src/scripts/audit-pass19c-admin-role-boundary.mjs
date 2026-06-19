#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const files = {
  layoutServer: readFileSync('src/routes/admin/+layout.server.ts', 'utf8'),
  access: readFileSync('src/lib/server/admin-access.ts', 'utf8'),
  layout: readFileSync('src/routes/admin/+layout.svelte', 'utf8'),
  adminLayout: readFileSync('src/lib/admin/ui/AdminLayout.svelte', 'utf8'),
  sidebar: readFileSync('src/lib/admin/ui/AdminSidebar.svelte', 'utf8')
};

const checks = [
  [files.layoutServer, 'adminActor'],
  [files.layoutServer, 'guardAdminRoute(event)'],
  [files.access, "mode: 'superadmin'"],
  [files.access, "requestContext: { mode: 'superadmin' }"],
  [files.access, "mode: 'delegated'"],
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
