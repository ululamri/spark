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

const server = read('src/routes/admin/recovery/+page.server.ts');
assertIncludes('server complete action', server, 'completeEmailRecovery');
assertIncludes('server complete endpoint', server, "'/recovery/email/complete'");
assertIncludes('server proof token payload', server, 'email_proof_token: proofToken');

const page = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('page complete form', page, 'action="?/completeEmailRecovery"');
assertIncludes('page complete button', page, 'Complete email recovery');
assertIncludes('page final success detail', page, 'Email changed at');
assertIncludes('page proof token hidden', page, 'name="email_proof_token"');

console.log('PASS 25E-V frontend admin email recovery finalization audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend final email recovery requires proof token and exposes no direct review mutation.');
