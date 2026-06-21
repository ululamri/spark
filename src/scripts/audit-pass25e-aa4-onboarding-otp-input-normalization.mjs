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

const server = read('src/routes/admin/onboarding/+page.server.ts');
assertIncludes('otp normalizer', server, 'function otpValue');
assertIncludes('otp removes non digits', server, "replace(/\D/g, '')");
assertIncludes('email otp uses normalizer', server, "const otp = otpValue(formData.get('otp'));");
assertIncludes('totp uses normalizer', server, "const code = otpValue(formData.get('code'));");

const page = read('src/routes/admin/onboarding/+page.svelte');
assertIncludes('email otp placeholder', page, 'Masukkan 6 digit kode OTP');
assertIncludes('totp placeholder', page, 'Masukkan 6 digit kode 2FA');
assertNotIncludes('no strict otp pattern', page, 'pattern="[0-9]{6}"');
assertIncludes('otp still one time code', page, 'autocomplete="one-time-code"');

console.log('PASS 25E-AA4 onboarding OTP input normalization audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: onboarding OTP/TOTP inputs allow pasted email codes and normalize to 6 digits before backend submission.');
