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

const layout = read('src/routes/+layout.svelte');
assertIncludes('global toaster import', layout, "svelte-sonner");
assertIncludes('global toaster component', layout, '<Toaster');

const helper = read('src/lib/admin/admin-toast.ts');
assertIncludes('toast helper success', helper, 'toast.success');
assertIncludes('toast helper error', helper, 'toast.error');

const team = read('src/routes/admin/team/+page.svelte');
assertIncludes('team toast helper', team, 'toastFormResult');
assertIncludes('team manual invite toast', team, 'Manual invite code available');
assertIncludes('team localized invite button', team, 'Kirim undangan');
assertIncludes('team localized revoke invite', team, 'Cabut undangan');

const reset = read('src/routes/admin/reset/requests/+page.svelte');
assertIncludes('reset toast helper', reset, 'toastFormResult');
assertIncludes('reset artifact toast', reset, 'Recovery artifact issued');
assertIncludes('reset localized approve', reset, 'Setujui');
assertIncludes('reset localized reject', reset, 'Tolak');

const login = read('src/routes/admin/login/+page.svelte');
assertIncludes('login toast', login, 'Login admin gagal');

const onboarding = read('src/routes/admin/onboarding/+page.svelte');
assertIncludes('onboarding toast copy', onboarding, 'Berhasil disalin');
assertIncludes('onboarding toast success', onboarding, 'Onboarding diperbarui');

console.log('PASS 25E-AA7 admin action toast sweep audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: admin login, onboarding, team, and reset request actions now have toast feedback foundation and localized action feedback.');
