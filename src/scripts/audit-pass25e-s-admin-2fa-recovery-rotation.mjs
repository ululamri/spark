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
assertIncludes('server setup action', server, 'setupTotpRecovery');
assertIncludes('server confirm action', server, 'confirmTotpRecovery');
assertIncludes('server setup endpoint', server, "'/recovery/totp/setup'");
assertIncludes('server confirm endpoint', server, "'/recovery/totp/confirm'");
assertIncludes('server requires password', server, "formData.get('password')");
assertIncludes('server requires code', server, "formData.get('code')");
assertNotIncludes('server no email recovery', server, 'change_email');

const page = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('page totp branch', page, "form?.artifact?.request_type === 'totp'");
assertIncludes('page setup form', page, 'action="?/setupTotpRecovery"');
assertIncludes('page confirm form', page, 'action="?/confirmTotpRecovery"');
assertIncludes('page fresh setup button', page, 'Start fresh 2FA setup');
assertIncludes('page confirm button', page, 'Confirm fresh 2FA');
assertIncludes('page delayed revoke copy', page, 'not until confirmation');
assertNotIncludes('page no direct disable', page, 'disable_totp');
assertNotIncludes('page no direct email recovery', page, 'change_email');

console.log('PASS 25E-S frontend admin 2FA recovery rotation audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend exposes 2FA recovery as fresh setup + confirm rotation, not direct disable.');
