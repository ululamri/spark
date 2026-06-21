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
assertIncludes('recovery page mentions email disabled', recoveryPage, 'Email recovery is not enabled here yet.');
assertIncludes('recovery page keeps password recovery', recoveryPage, 'Recover password');
assertIncludes('recovery page keeps 2fa recovery', recoveryPage, 'Confirm fresh 2FA');
assertNotIncludes('no new email field', recoveryPage, 'name="new_email"');
assertNotIncludes('no change email action', recoveryPage, 'change_email');
assertNotIncludes('no email recovery action', recoveryPage, 'recoverEmail');

const recoveryServer = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('recovery server keeps password action', recoveryServer, 'recoverPassword');
assertIncludes('recovery server keeps 2fa setup action', recoveryServer, 'setupTotpRecovery');
assertIncludes('recovery server keeps 2fa confirm action', recoveryServer, 'confirmTotpRecovery');
assertNotIncludes('no email recovery endpoint', recoveryServer, "'/recovery/email");
assertNotIncludes('no new email payload', recoveryServer, 'new_email');
assertNotIncludes('no change email marker', recoveryServer, 'change_email');

const resetPage = read('src/routes/admin/reset/+page.svelte');
assertIncludes('reset page can request email recovery', resetPage, 'Email address');

console.log('PASS 25E-T frontend admin email recovery lock audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend email recovery remains request-only and exposes no email mutation controls.');
