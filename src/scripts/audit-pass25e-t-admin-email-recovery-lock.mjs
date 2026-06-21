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
assertIncludes('email proof shell present', server, 'requestEmailProof');
assertIncludes('email proof confirm present', server, 'confirmEmailProof');
assertIncludes('email final requires proof', server, 'email_proof_token: proofToken');

const page = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('email final form present', page, 'Complete email recovery');
assertIncludes('email proof token hidden', page, 'name="email_proof_token"');

console.log('PASS 25E-T frontend admin email recovery lock audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend email recovery follows proof-first finalization model.');
