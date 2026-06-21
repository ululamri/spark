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

const recoveryPage = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('recovery page exists', recoveryPage, 'Admin recovery');
assertIncludes('recovery page has token input', recoveryPage, 'Recovery artifact token');
assertIncludes('recovery page mentions 2FA type label', recoveryPage, '2FA / authenticator');
assertNotIncludes('recovery page has no direct totp disable', recoveryPage, 'disable_totp');
assertNotIncludes('recovery page has no direct totp revoke', recoveryPage, 'revoke_totp');
assertNotIncludes('recovery page has no totp setup execution yet', recoveryPage, 'totp/setup');
assertNotIncludes('recovery page has no totp confirm execution yet', recoveryPage, 'totp/confirm');

const recoveryServer = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('recovery server inspect endpoint', recoveryServer, "'/recovery/inspect'");
assertIncludes('recovery server password endpoint', recoveryServer, "'/recovery/password'");
assertNotIncludes('recovery server has no totp setup endpoint yet', recoveryServer, "'/recovery/totp/setup'");
assertNotIncludes('recovery server has no totp confirm endpoint yet', recoveryServer, "'/recovery/totp/confirm'");
assertNotIncludes('recovery server has no direct totp disable', recoveryServer, 'disable_totp');
assertNotIncludes('recovery server has no direct totp revoke', recoveryServer, 'revoke_totp');

const resetReview = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset review page boundary copy', resetReview, 'Approval records review evidence only');
assertNotIncludes('reset review page no direct totp disable', resetReview, 'disable_totp');
assertNotIncludes('reset review page no direct totp revoke', resetReview, 'revoke_totp');
assertNotIncludes('reset review page no direct totp delete', resetReview, 'delete_totp');

console.log('PASS 25E-R frontend admin 2FA recovery rotation lock audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend exposes no direct 2FA disable/revoke recovery controls.');
