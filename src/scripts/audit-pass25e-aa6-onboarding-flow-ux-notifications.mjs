import fs from 'node:fs';
import path from 'node:path';

const frontendRoot = process.cwd();
const apiRoot = process.env.SPARK_API_ROOT || '../spark-api';
const failures = [];

function read(root, rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`Missing file: ${file}`);
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

const layout = read(frontendRoot, 'src/routes/+layout.svelte');
assertIncludes('global toaster import', layout, "svelte-sonner");
assertIncludes('global toaster rendered', layout, '<Toaster');

const login = read(frontendRoot, 'src/routes/admin/login/+page.svelte');
assertIncludes('login toast import', login, "toast");
assertIncludes('login password reveal', login, 'Lihat sandi');
assertIncludes('login relaxed 2FA', login, 'Masukkan 6 digit kode 2FA');
assertNotIncludes('login no strict browser pattern', login, 'pattern="[0-9]{6}"');

const loginServer = read(frontendRoot, 'src/routes/admin/login/+page.server.ts');
assertIncludes('login otp normalizer', loginServer, 'function otpValue');
assertIncludes('login strips non digits', loginServer, "replace(/\\D/g, '')");

const onboarding = read(frontendRoot, 'src/routes/admin/onboarding/+page.svelte');
assertIncludes('onboarding toast import', onboarding, "svelte-sonner");
assertIncludes('onboarding QR import', onboarding, "await import('qrcode')");
assertIncludes('onboarding QR alt', onboarding, 'QR code untuk setup 2FA admin');
assertIncludes('onboarding copy manual secret', onboarding, 'Salin kode manual');
assertIncludes('onboarding password reveal', onboarding, 'Lihat sandi');
assertIncludes('onboarding professional title', onboarding, 'Aktivasi Akses Admin');
assertNotIncludes('onboarding no strict browser pattern', onboarding, 'pattern="[0-9]{6}"');

const onboardingServer = read(frontendRoot, 'src/routes/admin/onboarding/+page.server.ts');
assertIncludes('onboarding password set auto setup', onboardingServer, "'/invite/totp/setup'");
assertIncludes('onboarding confirm auto accept', onboardingServer, "'/invite/accept'");
assertIncludes('onboarding activated message', onboardingServer, 'Admin access activated');

const apiTemplates = read(apiRoot, 'src/admin_email_templates.rs');
assertIncludes('onboarding success email template', apiTemplates, 'admin_onboarding_completed_email');

const apiOnboarding = read(apiRoot, 'src/admin_onboarding.rs');
assertIncludes('onboarding success email event', apiOnboarding, 'admin_invite_onboarding_completed_email');
assertIncludes('onboarding success email enqueue', apiOnboarding, 'enqueue_admin_notification');

console.log('PASS 25E-AA6 onboarding flow UX notifications audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: onboarding flow asks fewer password confirmations, adds success email, password reveal, QR polish, and login/onboarding toasts.');
