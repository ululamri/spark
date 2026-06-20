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
assertIncludes('admin access', access, 'canReviewResetRequests(actor)');
assertIncludes('admin access', access, "actor.role === 'superadmin' || actor.role === 'admin'");
assertIncludes('admin access', access, "'/admin/reset'");
assertNotIncludes('admin access', access, "pathname === '/admin/reset/requests' || pathname.startsWith('/admin/reset/requests/')) return hasCapability(actor, 'admin_manage')");

const api = read('src/lib/admin/admin-reset-api.ts');
assertIncludes('reset api', api, 'export type AdminResetRequest');
assertIncludes('reset api', api, 'target_role');
assertIncludes('reset api', api, "'/reset/requests?'");
assertIncludes('reset api', api, 'reviewRequest');
assertIncludes('reset api', api, "'/reset/requests/'");

const server = read('src/routes/admin/reset/requests/+page.server.ts');
assertIncludes('reset review server', server, 'guardAdminRoute');
assertIncludes('reset review server', server, 'canReviewResetRequests(access.actor.role)');
assertIncludes('reset review server', server, 'reviewerRole: access.actor.role');
assertIncludes('reset review server', server, 'adminResetApi.requests');
assertIncludes('reset review server', server, 'adminResetApi.reviewRequest');
assertIncludes('reset review server', server, "decision !== 'approved' && decision !== 'rejected'");
assertNotIncludes('reset review server', server, "capabilities.includes('admin_manage')");

const page = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset review page', page, 'Hierarchical recovery review');
assertIncludes('reset review page', page, 'superadmin controls all reset approvals');
assertIncludes('reset review page', page, 'Admin can review moderator reset requests only.');
assertIncludes('reset review page', page, 'Admin reset requests go upward to superadmin.');
assertIncludes('reset review page', page, 'target_role');
assertIncludes('reset review page', page, 'Approval records review evidence only');
assertIncludes('reset review page', page, 'action="?/reviewRequest"');
assertIncludes('reset review page', page, 'value="approved"');
assertIncludes('reset review page', page, 'value="rejected"');
assertIncludes('reset review page', page, '/admin/audit?action=admin_reset_request_review');
assertNotIncludes('reset review page', page, 'name="new_password"');
assertNotIncludes('reset review page', page, 'name="password" type="password"');
assertNotIncludes('reset review page', page, 'reset_password');
assertNotIncludes('reset review page', page, 'disable_totp');
assertNotIncludes('reset review page', page, 'revoke_totp');
assertNotIncludes('reset review page', page, 'change_email');

console.log('PASS 25E-I admin reset hierarchical review UI audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: admin reset review UI follows hierarchical superadmin/admin/moderator policy.');
