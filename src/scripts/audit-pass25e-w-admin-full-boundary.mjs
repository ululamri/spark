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
  if (!needles.some((needle) => content.includes(needle))) {
    failures.push(`${label}: missing one of ${needles.join(' | ')}`);
  }
}

function assertNotIncludes(label, content, needle) {
  if (content.includes(needle)) failures.push(`${label}: forbidden ${needle}`);
}

const access = read('src/lib/server/admin-access.ts');
assertIncludes('auth surface login', access, '/admin/login');
assertIncludes('auth surface superadmin', access, '/admin/superadmin/login');
assertIncludes('auth surface onboarding', access, '/admin/onboarding');
assertIncludes('auth surface reset', access, '/admin/reset');
assertIncludes('auth surface recovery', access, '/admin/recovery');
assertIncludes('reset reviewer role helper', access, 'canReviewResetRequests');
assertAnyIncludes('reset reviewer admin/superadmin', access, ['superadmin', 'admin']);

const layout = read('src/routes/admin/+layout.svelte');
assertIncludes('layout recovery auth surface', layout, '/admin/recovery');
assertIncludes('layout superadmin auth surface', layout, '/admin/superadmin/login');

const login = read('src/routes/admin/login/+page.svelte');
assertIncludes('admin login title', login, 'Karyra Spark Admin Panel');
assertIncludes('admin reset link', login, '/admin/reset');
assertNotIncludes('admin login no CTA', login.toLowerCase(), 'get started');
assertNotIncludes('admin login no superadmin form copy', login, 'Root authority');

const superadmin = read('src/routes/admin/superadmin/login/+page.svelte');
assertAnyIncludes('superadmin login identity', superadmin, ['Root authority', 'Superadmin']);
assertNotIncludes('superadmin login no delegated copy', superadmin, 'request reset');

const onboardingServer = read('src/routes/admin/onboarding/+page.server.ts');
assertIncludes('onboarding inspect', onboardingServer, '/invite/inspect');
assertIncludes('onboarding email request', onboardingServer, '/invite/email/request');
assertIncludes('onboarding email confirm', onboardingServer, '/invite/email/confirm');
assertIncludes('onboarding password', onboardingServer, '/invite/password');
assertIncludes('onboarding totp setup', onboardingServer, '/invite/totp/setup');
assertIncludes('onboarding totp confirm', onboardingServer, '/invite/totp/confirm');
assertIncludes('onboarding accept', onboardingServer, '/invite/accept');
assertNotIncludes('onboarding no duplicate accept totp', onboardingServer, 'totp_code');

const onboardingPage = read('src/routes/admin/onboarding/+page.svelte');
assertAnyIncludes('onboarding wizard exists', onboardingPage, ['currentStep', 'Verify invitation', 'Fresh 2FA']);
assertNotIncludes('onboarding no old setup label', onboardingPage, 'first time setup');

const resetPage = read('src/routes/admin/reset/+page.svelte');
assertIncludes('reset neutral request page', resetPage, 'Request reset');
assertIncludes('reset email request type', resetPage, 'Email address');
assertIncludes('reset recovery artifact link', resetPage, '/admin/recovery');
assertNotIncludes('reset public no approval action', resetPage, 'reviewRequest');
assertNotIncludes('reset public no new password', resetPage, 'new_password');

const resetRequestsServer = read('src/routes/admin/reset/requests/+page.server.ts');
assertIncludes('reset review role gate', resetRequestsServer, 'canReviewResetRequests');
assertIncludes('reset artifact issue action', resetRequestsServer, 'issueRecoveryArtifact');
assertNotIncludes('reset review no password mutation', resetRequestsServer, 'new_password');
assertNotIncludes('reset review no email mutation', resetRequestsServer, 'set email');

const resetRequestsPage = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset requests review page', resetRequestsPage, 'Reset requests');
assertIncludes('reset requests artifact action', resetRequestsPage, 'Issue artifact');
assertIncludes('reset requests no direct credential copy', resetRequestsPage, 'does not automatically change credentials');
assertNotIncludes('reset requests no direct password field', resetRequestsPage, 'name="new_password"');
assertNotIncludes('reset requests no direct new email field', resetRequestsPage, 'name="new_email"');

const recoveryServer = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('recovery inspect action', recoveryServer, 'inspect');
assertIncludes('recovery password action', recoveryServer, 'recoverPassword');
assertIncludes('recovery totp setup action', recoveryServer, 'setupTotpRecovery');
assertIncludes('recovery totp confirm action', recoveryServer, 'confirmTotpRecovery');
assertIncludes('recovery email proof action', recoveryServer, 'requestEmailProof');
assertIncludes('recovery email confirm proof action', recoveryServer, 'confirmEmailProof');
assertIncludes('recovery email complete action', recoveryServer, 'completeEmailRecovery');
assertIncludes('recovery password endpoint', recoveryServer, '/recovery/password');
assertIncludes('recovery 2fa setup endpoint', recoveryServer, '/recovery/totp/setup');
assertIncludes('recovery 2fa confirm endpoint', recoveryServer, '/recovery/totp/confirm');
assertIncludes('recovery email request endpoint', recoveryServer, '/recovery/email/request');
assertIncludes('recovery email confirm endpoint', recoveryServer, '/recovery/email/confirm');
assertIncludes('recovery email complete endpoint', recoveryServer, '/recovery/email/complete');
assertNotIncludes('recovery server no review endpoint mutation', recoveryServer, '/reset/requests');

const recoveryPage = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('recovery page password flow', recoveryPage, 'Recover password');
assertIncludes('recovery page 2fa setup flow', recoveryPage, 'Start fresh 2FA setup');
assertIncludes('recovery page 2fa confirm flow', recoveryPage, 'Confirm fresh 2FA');
assertIncludes('recovery page email proof flow', recoveryPage, 'Request new-email proof');
assertIncludes('recovery page email complete flow', recoveryPage, 'Complete email recovery');
assertIncludes('recovery boundary copy', recoveryPage, 'Recovery boundary');
assertNotIncludes('recovery page no direct disable 2fa', recoveryPage, 'disable_totp');
assertNotIncludes('recovery page no direct review approval', recoveryPage, 'reviewRequest');

const teamServer = read('src/routes/admin/team/+page.server.ts');
assertIncludes('team invitation create action', teamServer, 'createInvitation');
assertIncludes('team revoke action', teamServer, 'revokeInvitation');
assertNotIncludes('team no direct grant action', teamServer, 'grantRole');

const teamPage = read('src/routes/admin/team/+page.svelte');
assertIncludes('team invite UI', teamPage, 'Create invitation');
assertIncludes('team queue UI', teamPage, 'Invitation');
assertNotIncludes('team no direct grant UI', teamPage, 'Grant role');

console.log('PASS 25E-W frontend full admin boundary audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend admin auth surfaces, invite onboarding, reset review, recovery, and team invite boundaries are intact.');
