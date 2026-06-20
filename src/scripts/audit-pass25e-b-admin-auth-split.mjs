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
  if (content.includes(needle)) failures.push(`${label}: must not contain ${needle}`);
}

const loginPage = read('src/routes/admin/login/+page.svelte');
assertIncludes('delegated login page', loginPage, 'Karyra Spark Admin Panel');
assertIncludes('delegated login page', loginPage, 'action="?/delegated"');
assertIncludes('delegated login page', loginPage, 'name="totp_code"');
assertIncludes('delegated login page', loginPage, 'href="/admin/onboarding"');
assertIncludes('delegated login page', loginPage, 'href="/admin/reset"');
assertNotIncludes('delegated login page', loginPage, 'action="?/superadmin"');
assertNotIncludes('delegated login page', loginPage, 'Root credential');
assertNotIncludes('delegated login page', loginPage, 'href="/admin/setup"');

const loginServer = read('src/routes/admin/login/+page.server.ts');
assertIncludes('delegated login server', loginServer, 'delegated: async');
assertIncludes('delegated login server', loginServer, "adminBaseUrl() + '/auth/login'");
assertIncludes('delegated login server', loginServer, 'totp_code');
assertNotIncludes('delegated login server', loginServer, 'verifyAdminPassword');
assertNotIncludes('delegated login server', loginServer, 'setAdminSession');
assertNotIncludes('delegated login server', loginServer, 'superadmin: async');

const superadminPage = read('src/routes/admin/superadmin/login/+page.svelte');
assertIncludes('superadmin login page', superadminPage, 'Karyra Spark Superadmin');
assertIncludes('superadmin login page', superadminPage, 'action="?/superadmin"');
assertIncludes('superadmin login page', superadminPage, 'Root credential');
assertNotIncludes('superadmin login page', superadminPage, 'action="?/delegated"');

const superadminServer = read('src/routes/admin/superadmin/login/+page.server.ts');
assertIncludes('superadmin login server', superadminServer, 'verifyAdminPassword');
assertIncludes('superadmin login server', superadminServer, 'setAdminSession');
assertIncludes('superadmin login server', superadminServer, 'superadmin: async');
assertNotIncludes('superadmin login server', superadminServer, "adminBaseUrl() + '/auth/login'");

const access = read('src/lib/server/admin-access.ts');
assertIncludes('admin access guard', access, "'/admin/superadmin/login'");
assertIncludes('admin access guard', access, "'/admin/onboarding'");
assertIncludes('admin access guard', access, "'/admin/reset'");
assertIncludes('admin access guard', access, 'ADMIN_AUTH_SURFACE_PATHS');

const layout = read('src/routes/admin/+layout.svelte');
assertIncludes('admin layout', layout, "'/admin/superadmin/login'");
assertIncludes('admin layout', layout, "'/admin/onboarding'");
assertIncludes('admin layout', layout, "'/admin/reset'");

const setupServer = read('src/routes/admin/setup/+page.server.ts');
assertIncludes('admin setup redirect', setupServer, "redirect(308, '/admin/onboarding')");
assertNotIncludes('admin setup redirect', setupServer, "'/auth/email/request'");
assertNotIncludes('admin setup redirect', setupServer, "'/auth/totp/setup'");

const onboarding = read('src/routes/admin/onboarding/+page.svelte');
assertIncludes('onboarding page', onboarding, 'Invite-only onboarding');
assertIncludes('onboarding page', onboarding, 'invite-token acceptance flow');

const reset = read('src/routes/admin/reset/+page.svelte');
assertIncludes('reset page', reset, 'Request reset');
assertIncludes('reset page', reset, 'Superadmin approval required');

console.log('PASS 25E-B admin auth split audit');

if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log('OK: /admin/login is delegated-only, superadmin is isolated, setup is no longer free-form, and onboarding/reset surfaces are separated.');
