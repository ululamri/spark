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
assertIncludes('server email proof request action', server, 'requestEmailProof');
assertIncludes('server email proof confirm action', server, 'confirmEmailProof');
assertIncludes('server email request endpoint', server, "'/recovery/email/request'");
assertIncludes('server email confirm endpoint', server, "'/recovery/email/confirm'");
assertIncludes('server final consumes proof', server, 'email_proof_token: proofToken');

const page = read('src/routes/admin/recovery/+page.svelte');
assertIncludes('page email proof action', page, 'action="?/requestEmailProof"');
assertIncludes('page email confirm action', page, 'action="?/confirmEmailProof"');
assertIncludes('page final after proof action', page, 'action="?/completeEmailRecovery"');

console.log('PASS 25E-U frontend admin email recovery proof shell audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend email proof shell remains present and feeds finalization.');
