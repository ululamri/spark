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

function assertAnyIncludes(label, content, needles) {
  if (!needles.some((needle) => content.includes(needle))) failures.push(`${label}: missing one of ${needles.join(' | ')}`);
}

function assertNotIncludes(label, content, needle) {
  if (content.includes(needle)) failures.push(`${label}: forbidden ${needle}`);
}

function lineContaining(content, needle) {
  return content.split('\n').find((line) => line.includes(needle)) || '';
}

function blockAround(content, needle, before = 160, after = 240) {
  const index = content.indexOf(needle);
  if (index < 0) return '';
  return content.slice(Math.max(0, index - before), Math.min(content.length, index + after));
}

const layout = read('src/routes/admin/+layout.svelte');
assertIncludes('admin layout auth surfaces', layout, "'/admin/login'");
assertIncludes('admin layout auth surfaces', layout, "'/admin/superadmin/login'");
assertIncludes('admin layout auth surfaces', layout, "'/admin/onboarding'");
assertIncludes('admin layout unauthenticated reset request surface', layout, "'/admin/reset'");
assertNotIncludes('admin layout auth surfaces', layout, "'/admin/reset/requests'");

const access = read('src/lib/server/admin-access.ts');
assertIncludes('admin access superadmin login', access, "'/admin/superadmin/login'");
assertIncludes('admin access delegated login', access, "'/admin/login'");
assertIncludes('admin access unauthenticated reset request', access, "'/admin/reset'");
assertIncludes('admin access reset review guard', access, "pathname === '/admin/reset/requests'");
assertIncludes('admin access reset review roles', access, "actor.role === 'superadmin' || actor.role === 'admin'");
assertIncludes('admin access team guard', access, "pathname === '/admin/team'");

const sidebar = read('src/lib/admin/ui/AdminSidebar.svelte');
const resetNavLine = lineContaining(sidebar, "href: '/admin/reset/requests'");
assertIncludes('admin sidebar reset nav', resetNavLine, "label: 'Reset requests'");
assertIncludes('admin sidebar reset nav', resetNavLine, "roles: ['superadmin', 'admin']");
assertNotIncludes('admin sidebar reset nav', resetNavLine, 'moderator');

const delegatedLogin = read('src/routes/admin/login/+page.svelte');
assertIncludes('delegated admin login', delegatedLogin, 'Karyra Spark Admin Panel');
assertIncludes('delegated admin login', delegatedLogin, '/admin/reset');
assertNotIncludes('delegated admin login', delegatedLogin, '/admin/superadmin/login');
assertNotIncludes('delegated admin login', delegatedLogin, 'Superadmin');
assertNotIncludes('delegated admin login', delegatedLogin, 'Create account');

const superLogin = read('src/routes/admin/superadmin/login/+page.svelte');
assertAnyIncludes('superadmin login title', superLogin, ['Karyra Spark Superadmin', 'Karyra Spark Admin Panel']);
assertIncludes('superadmin login root boundary', superLogin, 'Root authority');
assertNotIncludes('superadmin login', superLogin, '/admin/onboarding');

const resetRequest = read('src/routes/admin/reset/+page.svelte');
assertIncludes('unauthenticated reset request', resetRequest, 'never confirms whether an admin account exists');
assertIncludes('unauthenticated reset request', resetRequest, 'request_type');
assertIncludes('unauthenticated reset request', resetRequest, 'Submit reset request');
assertNotIncludes('unauthenticated reset request', resetRequest, 'action="?/reviewRequest"');
assertNotIncludes('unauthenticated reset request', resetRequest, 'name="decision"');
assertNotIncludes('unauthenticated reset request', resetRequest, 'value="approved"');
assertNotIncludes('unauthenticated reset request', resetRequest, 'name="new_password"');
assertNotIncludes('unauthenticated reset request', resetRequest, 'reset_password');

const resetReview = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset review page', resetReview, 'Hierarchical recovery review');
assertIncludes('reset review page', resetReview, 'superadmin controls all reset approvals');
assertIncludes('reset review page', resetReview, 'Admin can review moderator reset requests only.');
assertIncludes('reset review page', resetReview, 'Admin reset requests go upward to superadmin.');
assertIncludes('reset review page', resetReview, 'target_role');
assertNotIncludes('reset review page', resetReview, 'name="new_password"');
assertNotIncludes('reset review page', resetReview, 'reset_password');
assertNotIncludes('reset review page', resetReview, 'disable_totp');

const onboarding = read('src/routes/admin/onboarding/+page.svelte');
assertIncludes('onboarding wizard', onboarding, 'Step');
assertIncludes('onboarding wizard', onboarding, '2FA');
assertIncludes('onboarding wizard', onboarding, 'Activate');
assertNotIncludes('onboarding wizard', onboarding, 'Fresh 2FA code');

const onboardingServer = read('src/routes/admin/onboarding/+page.server.ts');
const acceptBlock = blockAround(onboardingServer, "call<InviteAcceptData>");
assertIncludes('onboarding server accept endpoint', acceptBlock, "'/invite/accept'");
assertNotIncludes('onboarding server accept block', acceptBlock, 'totp_code');
assertNotIncludes('onboarding server accept block', acceptBlock, 'code:');

const teamPage = read('src/routes/admin/team/+page.svelte');
assertIncludes('admin team page', teamPage, 'Create invitation');
assertIncludes('admin team page', teamPage, 'Invitation queue');
assertNotIncludes('admin team page', teamPage, 'Grant admin role');
assertNotIncludes('admin team page', teamPage, 'upsertMember');

const setupServer = read('src/routes/admin/setup/+page.server.ts');
assertIncludes('legacy setup redirect import', setupServer, 'redirect');
assertIncludes('legacy setup redirect target', setupServer, '/admin/onboarding');

console.log('PASS 25E-K frontend admin security boundary audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend admin login/onboarding/reset/team boundaries match invite-only hierarchy.');
