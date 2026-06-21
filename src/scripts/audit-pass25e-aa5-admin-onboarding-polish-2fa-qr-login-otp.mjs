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

const pkg = read('package.json');
assertIncludes('qrcode dependency', pkg, '"qrcode"');

const qrType = read('src/lib/types/qrcode.d.ts');
assertIncludes('qrcode type declaration', qrType, "declare module 'qrcode'");
assertIncludes('qrcode toDataURL type', qrType, 'toDataURL');

const onboarding = read('src/routes/admin/onboarding/+page.svelte');
assertIncludes('onboarding QR import', onboarding, "await import('qrcode')");
assertIncludes('onboarding QR render', onboarding, 'QR code untuk setup 2FA admin');
assertIncludes('onboarding manual code copy', onboarding, 'Salin kode manual');
assertIncludes('onboarding professional title', onboarding, 'Aktivasi Akses Admin');
assertIncludes('onboarding security copy', onboarding, 'Gunakan sandi unik');
assertIncludes('onboarding otp normalization copy', onboarding, 'Spasi atau tanda hubung akan dibersihkan otomatis');
assertIncludes('onboarding no strict otp browser pattern', onboarding, 'maxlength="16"');
assertNotIncludes('onboarding no strict pattern', onboarding, 'pattern="[0-9]{6}"');

const onboardingServer = read('src/routes/admin/onboarding/+page.server.ts');
assertIncludes('onboarding otp normalizer', onboardingServer, 'function otpValue');
assertIncludes('onboarding otp strips non digits', onboardingServer, "replace(/\\D/g, '')");

const login = read('src/routes/admin/login/+page.svelte');
assertIncludes('login professional copy', login, 'Masuk dengan email admin');
assertIncludes('login relaxed 2fa input', login, 'Masukkan 6 digit kode 2FA');
assertIncludes('login one time code', login, 'autocomplete="one-time-code"');
assertNotIncludes('login no strict pattern', login, 'pattern="[0-9]{6}"');

const loginServer = read('src/routes/admin/login/+page.server.ts');
assertIncludes('login otp normalizer', loginServer, 'function otpValue');
assertIncludes('login totp uses normalizer', loginServer, "const totpCode = otpValue(formData.get('totp_code'));");

console.log('PASS 25E-AA5 admin onboarding polish, 2FA QR, and login OTP audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: onboarding UI is polished, 2FA setup shows QR/manual copy, and login/onboarding OTP inputs are normalized without strict browser pattern.');
