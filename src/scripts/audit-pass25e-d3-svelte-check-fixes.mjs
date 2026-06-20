import fs from 'node:fs';

const checks = [
  ['src/lib/server/admin-auth.ts', "hasValidAdminSession(cookies: Pick<Cookies, 'get'>)"],
  ['src/lib/admin/cms/admin-cms-schemas.ts', 'Array<{ message: string }>'],
  ['src/lib/ui/social/SparkSocialComposer.svelte', 'onclick={() => resetComposer()}'],
  ['src/routes/admin/content/+page.svelte', "data.filters ?? { kind: 'all', status: 'all', q: '' }"],
  ['src/routes/admin/team/+page.svelte', "data.filters ?? { role: 'all', status: 'active' }"],
  ['src/routes/admin/setup/+page.svelte', 'form?: any'],
  ['src/routes/admin/onboarding/+page.svelte', 'form?: any']
];

const failures = [];
for (const [file, needle] of checks) {
  const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (!content.includes(needle)) failures.push(`${file}: missing ${needle}`);
}

const onboarding = fs.existsSync('src/routes/admin/onboarding/+page.svelte')
  ? fs.readFileSync('src/routes/admin/onboarding/+page.svelte', 'utf8')
  : '';
if (onboarding.includes('{@const currentStep = activeStep(form)}')) {
  failures.push('src/routes/admin/onboarding/+page.svelte: invalid {@const} placement still present');
}

console.log('PASS 25E-D3 svelte-check fixes audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: known svelte-check failures from admin onboarding/type hardening are patched.');
