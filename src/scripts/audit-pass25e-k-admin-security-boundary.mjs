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

function lineContaining(content, needle) {
  return content.split('\n').find((line) => line.includes(needle)) || '';
}

const layout = read('src/routes/admin/+layout.svelte');
assertIncludes('admin layout auth surfaces', layout, "'/admin/login'");
assertIncludes('admin layout auth surfaces', layout, "'/admin/superadmin/login'");
assertIncludes('admin layout auth surfaces', layout, "'/admin/onboarding'");
assertIncludes('admin layout auth surfaces', layout, "'/admin/reset'");
assertNotIncludes('admin layout auth surfaces', layout, "'/admin/reset/requests'");

const access = read('src/lib/server/admin-access.ts');
assertIncludes('admin access superadmin login', access, "'/admin/superadmin/login'");
assertIncludes('admin access delegated login', access, "'/admin/login'");
assertIncludes('admin access reset public request', access, "'/admin/reset'");
assertIncludes('admin access reset review guard', access, "pathname === '/admin/reset/requests'");
assertIncludes('admin access reset review roles', access, "actor.role === 'superadmin' || actor.role === 'admin'");
assertIncludes('admin access team guard', access, "pathname === '/admin/team'");
assertIncludes('admin access moderation guard', access, "capability: string");

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
assertIncludes('superadmin login', superLogin, 'Karyra Spark Admin Panel');
assertIncludes('superadmin login', superLogin, 'Superadmin');
assertNotIncludes('superadmin login', superLogin, '/admin/onboarding');

const resetPublic = read('src/routes/admin/reset/+page.svelte');
assertIncludes('public reset request', resetPublic, 'never confirms whether an admin account exists');
assertIncludes('public reset request', resetPublic, 'request_type');
assertNotIncludes('public reset request', resetPublic, 'approve');
assertNotIncludes('public reset request', resetPublic, 'new_password');

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
assertIncludes('onboarding server', onboardingServer, '/onboarding/invite/accept');
assertNotIncludes('onboarding server', onboardingServer, 'totp_code');

const teamPage = read('src/routes/admin/team/+page.svelte');
assertIncludes('admin team page', teamPage, 'Create invitation');
assertIncludes('admin team page', teamPage, 'Invitation queue');
assertNotIncludes('admin team page', teamPage, 'Grant admin role');
assertNotIncludes('admin team page', teamPage, 'upsertMember');

const setupServer = read('src/routes/admin/setup/+page.server.ts');
assertIncludes('legacy setup redirect', setupServer, "redirect(303, '/admin/onboarding')");

console.log('PASS 25E-K frontend admin security boundary audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend admin login/onboarding/reset/team boundaries match invite-only hierarchy.');
