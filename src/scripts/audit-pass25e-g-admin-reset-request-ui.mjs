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

const server = read('src/routes/admin/reset/+page.server.ts');
assertIncludes('reset server', server, "adminBaseUrl() + '/reset/request'");
assertIncludes('reset server', server, 'request_type: requestType');
assertIncludes('reset server', server, 'ResetReceipt');
assertIncludes('reset server', server, 'AbortSignal.timeout(15_000)');

const page = read('src/routes/admin/reset/+page.svelte');
assertIncludes('reset page', page, 'Request reset');
assertIncludes('reset page', page, 'never confirms whether an admin account exists');
assertIncludes('reset page', page, 'name="email"');
assertIncludes('reset page', page, 'name="request_type"');
assertIncludes('reset page', page, 'value="password"');
assertIncludes('reset page', page, 'value="email"');
assertIncludes('reset page', page, 'value="totp"');
assertIncludes('reset page', page, 'Submit reset request');
assertIncludes('reset page', page, 'href="/admin/login"');
assertNotIncludes('reset page', page, 'Send your reset request through the approved internal channel');

console.log('PASS 25E-G admin reset request UI audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: admin reset page submits neutral password/email/2FA reset requests to backend.');
