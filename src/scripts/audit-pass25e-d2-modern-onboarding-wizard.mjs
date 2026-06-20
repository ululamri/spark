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
assertIncludes('onboarding page', page, 'function activeStep');
assertIncludes('onboarding page', page, "currentStep === 'inspect'");
assertIncludes('onboarding page', page, "currentStep === 'requestEmail'");
assertIncludes('onboarding page', page, "currentStep === 'confirmEmail'");
assertIncludes('onboarding page', page, "currentStep === 'password'");
assertIncludes('onboarding page', page, "currentStep === 'setupTotp'");
assertIncludes('onboarding page', page, "currentStep === 'confirmTotp'");
assertIncludes('onboarding page', page, "currentStep === 'accept'");
assertIncludes('onboarding page', page, 'Complete one secure step at a time');
assertNotIncludes('onboarding page', page, 'Step 7</span>');
assertNotIncludes('onboarding page', page, 'Flow locked');

console.log('PASS 25E-D2 modern onboarding wizard audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: onboarding is rendered as a progressive single-step wizard.');
