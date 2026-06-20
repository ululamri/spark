import fs from 'node:fs';

const server = fs.readFileSync('src/routes/admin/onboarding/+page.server.ts', 'utf8');
const page = fs.readFileSync('src/routes/admin/onboarding/+page.svelte', 'utf8');
const failures = [];

if (server.includes('totpCode')) failures.push('server action must not read totpCode during accept.');
if (server.includes('totp_code')) failures.push('server action must not send totp_code during accept.');
if (!server.includes("'/invite/accept'")) failures.push('server action must still call /invite/accept.');
if (page.includes('Fresh 2FA code')) failures.push('page must not ask for fresh 2FA code at final activation.');
if (page.includes('name="totp_code"')) failures.push('page must not render totp_code input at final activation.');
if (!page.includes('Your authenticator factor is already verified')) failures.push('page must explain that 2FA is already verified.');

console.log('PASS 25E-F frontend onboarding no-double-TOTP audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: frontend final activation no longer asks for a second 2FA code.');
