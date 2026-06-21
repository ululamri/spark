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

const api = read('src/lib/admin/admin-reset-api.ts');
assertIncludes('reset api artifact type', api, 'export type AdminRecoveryArtifact');
assertIncludes('reset api artifact issue type', api, 'AdminRecoveryArtifactIssueResult');
assertIncludes('reset api artifact endpoint', api, "'/reset/requests/' + encodeURIComponent(requestId) + '/recovery-artifacts'");
assertIncludes('reset api artifact method', api, 'issueRecoveryArtifact');
assertNotIncludes('reset api no execution', api, 'executeRecovery');
assertNotIncludes('reset api no credential payload', api, 'new_password');

const server = read('src/routes/admin/reset/requests/+page.server.ts');
assertIncludes('reset requests server artifact action', server, 'issueRecoveryArtifact');
assertIncludes('reset requests server api call', server, 'adminResetApi.issueRecoveryArtifact');
assertIncludes('reset requests server role guard', server, 'canReviewResetRequests(access.actor.role)');
assertNotIncludes('reset requests server no credential mutation', server, 'new_password');
assertNotIncludes('reset requests server no credential mutation', server, 'reset_password');
assertNotIncludes('reset requests server no credential mutation', server, 'disable_totp');

const page = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset requests page artifact policy', page, 'Approved requests may issue a short-lived recovery artifact');
assertIncludes('reset requests page artifact action', page, 'action="?/issueRecoveryArtifact"');
assertIncludes('reset requests page artifact button', page, 'Issue artifact');
assertIncludes('reset requests page artifact status gate', page, "item.status === 'approved'");
assertIncludes('reset requests page artifact delivery', page, 'Delivery mode');
assertNotIncludes('reset requests page no direct password', page, 'name="new_password"');
assertNotIncludes('reset requests page no direct password', page, 'reset_password');
assertNotIncludes('reset requests page no direct email', page, 'change_email');
assertNotIncludes('reset requests page no direct totp', page, 'disable_totp');
assertNotIncludes('reset requests page no direct totp', page, 'revoke_totp');

console.log('PASS 25E-M frontend admin recovery artifact audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: approved reset requests can issue recovery artifacts without direct credential mutation UI.');
