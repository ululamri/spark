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

const page = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('2fa recovery is rotation', page, 'fresh 2FA setup');
assertIncludes('2fa old not revoked before confirm', page, 'not until confirmation');
assertIncludes('2fa confirmation required', page, 'Confirm fresh 2FA');
assertNotIncludes('no direct disable UI', page, 'disable_totp');
assertNotIncludes('no direct revoke UI', page, 'revoke_totp');
assertNotIncludes('no email recovery UI', page, 'change_email');

console.log('PASS 25E-R frontend 2FA recovery rotation lock audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend 2FA recovery boundary remains rotation-based.');
