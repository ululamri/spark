import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const checks = [];
function file(rel) {
  return readFileSync(join(root, rel), 'utf8');
}
function pass(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

const nav = file('src/lib/content/spark-navigation.ts');
const bottom = file('src/lib/shell/SparkBottomNav.svelte');
const drawer = file('src/lib/shell/SparkMobileDrawer.svelte');
const account = file('src/lib/ui/SparkAccountMenu.svelte');
const sidebar = file('src/lib/shell/SparkSidebar.svelte');
const profileRoute = file('src/routes/profile/+page.svelte');

pass('passport route exists', existsSync(join(root, 'src/routes/passport/+page.svelte')));
pass('passport component exists', existsSync(join(root, 'src/lib/ui/SparkPassportReadinessCenter.svelte')));
pass('profile identity component exists', existsSync(join(root, 'src/lib/ui/SparkProfileIdentityCenter.svelte')));
pass('nav has passport key', nav.includes("key: 'passport'") && nav.includes("href: '/passport'"));
pass('profile no longer primary mobile item', !/primaryMobileNavItems[\s\S]*'profile'/.test(nav));
pass('bottom nav uses dashboard for signed in users', bottom.includes("key !== 'dashboard'") && bottom.includes('betaSession.user'));
pass('logged-in drawer has no dashboard shortcut', !drawer.includes("href: '/dashboard'"));
pass('logged-in drawer includes profile and settings', drawer.includes("href: '/profile'") && drawer.includes("href: '/settings'"));
pass('account menu separates passport and profile', account.includes('href="/passport"') && account.includes('href="/profile"') && !account.includes('Profile & Passport'));
pass('sidebar status points to passport', sidebar.includes('href="/passport"') && sidebar.includes('Passport Spark'));
pass('profile route uses identity center', profileRoute.includes('SparkProfileIdentityCenter') && !profileRoute.includes('SparkProfileAccountCenter'));

const failed = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? '✓' : '✗'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}

if (failed.length) {
  console.error(`\nPass 41 audit failed: ${failed.length} issue(s).`);
  process.exit(1);
}
console.log('\nPass 41 audit passed. Passport is now a mainline surface; Profile is account identity.');
