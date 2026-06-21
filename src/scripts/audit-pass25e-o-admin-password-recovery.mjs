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

const server = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('recovery server password action', server, 'recoverPassword');
assertIncludes('recovery server password endpoint', server, "'/recovery/password'");
assertIncludes('recovery server new password payload', server, 'new_password: newPassword');
assertIncludes('recovery server totp payload', server, 'totp_code: totpCode');
assertIncludes('recovery server sessions copy', server, 'Existing admin sessions were revoked');
assertNotIncludes('recovery server no email recovery endpoint', server, '/recovery/email');
assertNotIncludes('recovery server no totp recovery endpoint', server, '/recovery/totp');

const page = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('recovery page password form', page, 'action="?/recoverPassword"');
assertIncludes('recovery page new password field', page, 'name="new_password"');
assertIncludes('recovery page totp field', page, 'name="totp_code"');
assertIncludes('recovery page password gate', page, "form?.artifact?.request_type === 'password'");
assertIncludes('recovery page boundary copy', page, 'Email and 2FA recovery are not enabled here yet.');
assertNotIncludes('recovery page no email recovery control', page, 'change_email');
assertNotIncludes('recovery page no totp recovery control', page, 'disable_totp');
assertNotIncludes('recovery page no totp recovery control', page, 'revoke_totp');

console.log('PASS 25E-O frontend admin password recovery audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend password recovery requires fresh password plus current 2FA and exposes no email/2FA recovery execution.');
