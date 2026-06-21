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
assertIncludes('admin access recovery surface', access, "'/admin/recovery'");

const layout = read('src/routes/admin/+layout.svelte');
assertIncludes('admin layout recovery surface', layout, "'/admin/recovery'");

const resetPage = read('src/routes/admin/reset/+page.svelte');
assertIncludes('reset page recovery link', resetPage, '/admin/recovery');
assertIncludes('reset page recovery link text', resetPage, 'I already have a recovery artifact');

const recoveryServer = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('recovery server endpoint', recoveryServer, "'/recovery/inspect'");
assertIncludes('recovery server token', recoveryServer, "formData.get('token')");
assertIncludes('recovery server email', recoveryServer, "formData.get('email')");
assertIncludes('recovery server no mutation success', recoveryServer, 'Credential recovery execution is not enabled yet.');
assertNotIncludes('recovery server no credential payload', recoveryServer, 'new_password');
assertNotIncludes('recovery server no credential payload', recoveryServer, 'reset_password');
assertNotIncludes('recovery server no artifact consumption', recoveryServer, 'used_at');

const recoveryPage = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('recovery page title', recoveryPage, 'Admin recovery');
assertIncludes('recovery page token input', recoveryPage, 'Recovery artifact token');
assertIncludes('recovery page email input', recoveryPage, 'Admin email');
assertIncludes('recovery page mutation disabled', recoveryPage, 'Credential mutation');
assertIncludes('recovery page no credential change copy', recoveryPage, 'No credential change in this step');
assertNotIncludes('recovery page no direct password', recoveryPage, 'name="new_password"');
assertNotIncludes('recovery page no direct password', recoveryPage, 'reset_password');
assertNotIncludes('recovery page no direct email', recoveryPage, 'change_email');
assertNotIncludes('recovery page no direct totp', recoveryPage, 'disable_totp');
assertNotIncludes('recovery page no direct totp', recoveryPage, 'revoke_totp');

console.log('PASS 25E-N frontend admin recovery intake audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend recovery artifact intake is available and does not expose credential mutation controls.');
