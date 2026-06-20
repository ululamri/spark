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

const page = read('src/routes/admin/onboarding/+page.svelte');
assertIncludes('onboarding page', page, 'Invite-only onboarding');
assertIncludes('onboarding page', page, 'action="?/inspect"');
assertIncludes('onboarding page', page, 'action="?/requestEmail"');
assertIncludes('onboarding page', page, 'action="?/confirmEmail"');
assertIncludes('onboarding page', page, 'action="?/setPassword"');
assertIncludes('onboarding page', page, 'action="?/setupTotp"');
assertIncludes('onboarding page', page, 'action="?/confirmTotp"');
assertIncludes('onboarding page', page, 'action="?/accept"');
assertIncludes('onboarding page', page, 'name="email_proof_token"');
assertIncludes('onboarding page', page, 'name="totp_code"');
assertIncludes('onboarding page', page, 'href="/admin/login"');
assertNotIncludes('onboarding page', page, 'Flow locked');

const server = read('src/routes/admin/onboarding/+page.server.ts');
assertIncludes('onboarding server', server, "adminBaseUrl() + '/onboarding'");
assertIncludes('onboarding server', server, "'/invite/inspect'");
assertIncludes('onboarding server', server, "'/invite/email/request'");
assertIncludes('onboarding server', server, "'/invite/email/confirm'");
assertIncludes('onboarding server', server, "'/invite/password'");
assertIncludes('onboarding server', server, "'/invite/totp/setup'");
assertIncludes('onboarding server', server, "'/invite/totp/confirm'");
assertIncludes('onboarding server', server, "'/invite/accept'");
assertIncludes('onboarding server', server, 'email_proof_token');
assertIncludes('onboarding server', server, 'totp_code');
assertIncludes('onboarding server', server, 'AbortSignal.timeout(15_000)');

const login = read('src/routes/admin/login/+page.svelte');
assertIncludes('admin login', login, 'href="/admin/onboarding"');
assertNotIncludes('admin login', login, 'href="/admin/setup"');

console.log('PASS 25E-D admin invite onboarding frontend audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend onboarding is wired to backend invite-token onboarding endpoints.');
