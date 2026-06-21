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

const resetRequest = read('src/routes/admin/reset/+page.svelte');
assertIncludes('unauthenticated reset request page', resetRequest, 'Request reset');
assertIncludes('unauthenticated reset request page', resetRequest, 'never confirms whether an admin account exists');
assertIncludes('unauthenticated reset request page', resetRequest, 'Submit reset request');
assertNotIncludes('unauthenticated reset request page', resetRequest, 'value="approved"');
assertNotIncludes('unauthenticated reset request page', resetRequest, 'name="decision"');
assertNotIncludes('unauthenticated reset request page', resetRequest, 'new_password');
assertNotIncludes('unauthenticated reset request page', resetRequest, 'disable_totp');

const resetRequestServer = read('src/routes/admin/reset/+page.server.ts');
assertIncludes('unauthenticated reset request server', resetRequestServer, '/reset/request');
assertNotIncludes('unauthenticated reset request server', resetRequestServer, '/reset/requests/');
assertNotIncludes('unauthenticated reset request server', resetRequestServer, 'reviewRequest');
assertNotIncludes('unauthenticated reset request server', resetRequestServer, 'new_password');

const resetReview = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset review page', resetReview, 'Approval records review evidence only');
assertIncludes('reset review page', resetReview, 'Approve only after validating');
assertIncludes('reset review page', resetReview, 'value="approved"');
assertIncludes('reset review page', resetReview, 'value="rejected"');
assertNotIncludes('reset review page', resetReview, 'name="new_password"');
assertNotIncludes('reset review page', resetReview, 'reset_password');
assertNotIncludes('reset review page', resetReview, 'change_email');
assertNotIncludes('reset review page', resetReview, 'disable_totp');
assertNotIncludes('reset review page', resetReview, 'revoke_totp');

const resetReviewServer = read('src/routes/admin/reset/requests/+page.server.ts');
assertIncludes('reset review server', resetReviewServer, 'adminResetApi.reviewRequest');
assertIncludes('reset review server', resetReviewServer, "decision !== 'approved' && decision !== 'rejected'");
assertNotIncludes('reset review server', resetReviewServer, 'new_password');
assertNotIncludes('reset review server', resetReviewServer, 'reset_password');
assertNotIncludes('reset review server', resetReviewServer, 'change_email');
assertNotIncludes('reset review server', resetReviewServer, 'disable_totp');

const api = read('src/lib/admin/admin-reset-api.ts');
assertIncludes('reset api', api, 'reviewRequest');
assertIncludes('reset api', api, "'/reset/requests/'");
assertNotIncludes('reset api', api, 'executeRecovery');
assertNotIncludes('reset api', api, 'recovery_token');
assertNotIncludes('reset api', api, 'new_password');

console.log('PASS 25E-L frontend admin recovery execution lock audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend recovery UI remains request/review only with no direct credential mutation controls.');
