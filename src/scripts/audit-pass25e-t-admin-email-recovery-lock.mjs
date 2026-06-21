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
assertIncludes('recovery page email final locked', recoveryPage, 'final account email mutation is still locked');
assertIncludes('recovery page keeps password recovery', recoveryPage, 'Recover password');
assertIncludes('recovery page keeps 2fa recovery', recoveryPage, 'Confirm fresh 2FA');
assertIncludes('recovery page email proof shell', recoveryPage, 'Request new-email proof');
assertNotIncludes('no final email action', recoveryPage, 'recoverEmailFinal');
assertNotIncludes('no change email action', recoveryPage, 'change_email');

const recoveryServer = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('recovery server email proof shell', recoveryServer, 'requestEmailProof');
assertIncludes('recovery server email proof confirmation', recoveryServer, 'confirmEmailProof');
assertNotIncludes('no final email completed audit', recoveryServer, 'admin_recovery_email_completed');
assertNotIncludes('no change email marker', recoveryServer, 'change_email');

console.log('PASS 25E-T frontend admin email recovery lock audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend email recovery remains proof-only with no final email mutation controls.');
