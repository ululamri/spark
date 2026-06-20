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

const access = read('src/lib/server/admin-access.ts');
assertIncludes('admin access', access, "pathname === '/admin/reset/requests'");
assertIncludes('admin access', access, "hasCapability(actor, 'admin_manage')");
assertIncludes('admin access', access, "'/admin/reset'");

const api = read('src/lib/admin/admin-reset-api.ts');
assertIncludes('reset api', api, 'export type AdminResetRequest');
assertIncludes('reset api', api, "'/reset/requests?'");
assertIncludes('reset api', api, 'reviewRequest');
assertIncludes('reset api', api, "'/reset/requests/'");

const server = read('src/routes/admin/reset/requests/+page.server.ts');
assertIncludes('reset review server', server, 'guardAdminRoute');
assertIncludes('reset review server', server, "capabilities.includes('admin_manage')");
assertIncludes('reset review server', server, 'adminResetApi.requests');
assertIncludes('reset review server', server, 'adminResetApi.reviewRequest');
assertIncludes('reset review server', server, "decision !== 'approved' && decision !== 'rejected'");

const page = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset review page', page, 'Reset requests');
assertIncludes('reset review page', page, 'Approval does not automatically change credentials');
assertIncludes('reset review page', page, 'action="?/reviewRequest"');
assertIncludes('reset review page', page, 'value="approved"');
assertIncludes('reset review page', page, 'value="rejected"');
assertIncludes('reset review page', page, '/admin/audit?action=admin_reset_request_review');
assertNotIncludes('reset review page', page, 'change password');
assertNotIncludes('reset review page', page, 'disable 2FA');

console.log('PASS 25E-H admin reset review UI audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: admin reset request review UI is protected and review-only.');
