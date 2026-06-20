import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`Missing file: ${rel}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function assertIncludes(label, content, needle) {
  if (!content.includes(needle)) failures.push(`${label}: missing ${needle}`);
}

function assertNotIncludes(label, content, needle) {
  if (content.includes(needle)) failures.push(`${label}: forbidden ${needle}`);
}

const layout = read('src/routes/admin/+layout.svelte');
assertIncludes('admin layout', layout, "'/admin/reset'");
assertNotIncludes('admin layout', layout, "'/admin/reset/requests'");

const access = read('src/lib/server/admin-access.ts');
assertIncludes('admin access', access, "pathname === '/admin/reset/requests'");
assertIncludes('admin access', access, 'canReviewResetRequests(actor)');
assertIncludes('admin access', access, "actor.role === 'superadmin' || actor.role === 'admin'");

const sidebar = read('src/lib/admin/ui/AdminSidebar.svelte');
const resetNavLine = sidebar
  .split('\n')
  .find((line) => line.includes("href: '/admin/reset/requests'")) || '';

assertIncludes('admin sidebar', sidebar, "href: '/admin/reset/requests'");
assertIncludes('admin sidebar reset nav', resetNavLine, "label: 'Reset requests'");
assertIncludes('admin sidebar reset nav', resetNavLine, "roles: ['superadmin', 'admin']");
assertNotIncludes('admin sidebar reset nav', resetNavLine, 'moderator');

const page = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset review page', page, 'Hierarchical recovery review');
assertIncludes('reset review page', page, 'Admin can review moderator reset requests only.');

console.log('PASS 25E-J admin reset navigation audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: reset request review is discoverable for superadmin/admin and hidden from moderator navigation.');
