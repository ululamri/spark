import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

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

function warnIfIncludes(label, content, needle) {
  if (content.includes(needle)) warnings.push(`${label}: contains ${needle}`);
}

function packageJson() {
  try {
    return JSON.parse(read('package.json'));
  } catch (error) {
    failures.push(`package.json parse failed: ${error.message}`);
    return { dependencies: {}, devDependencies: {}, scripts: {} };
  }
}

const pkg = packageJson();
const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

for (const dep of ['bits-ui', '@tanstack/svelte-query', '@tanstack/svelte-virtual', 'zod', '@lucide/svelte', 'sveltekit-superforms', 'formsnap']) {
  if (!deps[dep]) failures.push(`Admin baseline dependency missing: ${dep}`);
}

for (const forbidden of ['directus', '@directus/sdk']) {
  if (deps[forbidden]) failures.push(`Directus dependency must not exist after rollback: ${forbidden}`);
}

const auth = read('src/lib/server/admin-auth.ts');
assertIncludes('server admin auth', auth, 'ADMIN_COOKIE_NAME');
assertIncludes('server admin auth', auth, 'DELEGATED_ADMIN_COOKIE_NAME');
assertIncludes('server admin auth', auth, 'karyra_admin_session');
assertIncludes('server admin auth', auth, 'spark_admin_session');
assertIncludes('server admin auth', auth, 'setDelegatedAdminSession');
assertIncludes('server admin auth', auth, 'clearDelegatedAdminSession');

const loginServer = read('src/routes/admin/login/+page.server.ts');
assertIncludes('admin login server', loginServer, 'superadmin: async');
assertIncludes('admin login server', loginServer, 'delegated: async');
assertIncludes('admin login server', loginServer, "adminBaseUrl() + '/auth/login'");
assertIncludes('admin login server', loginServer, 'totp_code');
assertIncludes('admin login server', loginServer, 'setDelegatedAdminSession');

const loginPage = read('src/routes/admin/login/+page.svelte');
assertIncludes('admin login page', loginPage, 'Admin / Moderator');
assertIncludes('admin login page', loginPage, 'Superadmin');
assertIncludes('admin login page', loginPage, 'action="?/delegated"');
assertIncludes('admin login page', loginPage, 'action="?/superadmin"');
assertIncludes('admin login page', loginPage, 'name="totp_code"');
assertIncludes('admin login page', loginPage, 'email verification and 2FA');

const logout = read('src/routes/admin/logout/+server.ts');
assertIncludes('admin logout', logout, "adminBaseUrl() + '/auth/logout'");
assertIncludes('admin logout', logout, 'clearAdminSession');
assertIncludes('admin logout', logout, 'clearDelegatedAdminSession');

const access = read('src/lib/server/admin-access.ts');
assertIncludes('admin access', access, "mode: 'superadmin' | 'delegated'");
assertIncludes('admin access', access, "'content_read'");
assertIncludes('admin access', access, "'content_create'");
assertIncludes('admin access', access, "'content_edit'");
assertIncludes('admin access', access, "'content_publish'");
assertIncludes('admin access', access, "'content_archive'");
assertIncludes('admin access', access, "adminTeamApi.actor");
assertIncludes('admin access', access, "hasValidAdminSession");

const sidebar = read('src/lib/admin/ui/AdminSidebar.svelte');
assertIncludes('admin sidebar', sidebar, "Learn & Lab CMS");
assertIncludes('admin sidebar', sidebar, "capability: 'content_read'");
assertIncludes('admin sidebar', sidebar, "roles: ['superadmin', 'admin']");

const cmsApi = read('src/lib/admin/admin-cms-api.ts');
assertIncludes('admin cms api', cmsApi, "kind: 'core_lesson' | 'lab'");
assertIncludes('admin cms api', cmsApi, "requestAdmin<AdminCmsItems>");
assertIncludes('admin cms api', cmsApi, "requestAdminJson<AdminCmsWriteResult>");

const cmsSchemas = read('src/lib/admin/cms/admin-cms-schemas.ts');
assertIncludes('admin cms schemas', cmsSchemas, "adminCmsDraftSchema");
assertIncludes('admin cms schemas', cmsSchemas, "parseAdminCmsDraftForm");
assertIncludes('admin cms schemas', cmsSchemas, "buildAdminCmsDraftPayload");
assertIncludes('admin cms schemas', cmsSchemas, "schema_version: 1");

const contentServer = read('src/routes/admin/content/+page.server.ts');
assertIncludes('admin content server', contentServer, "guardAdminRoute(event)");
assertIncludes('admin content server', contentServer, "content_create");
assertIncludes('admin content server', contentServer, "content_edit");
assertIncludes('admin content server', contentServer, "content_publish");
assertIncludes('admin content server', contentServer, "content_archive");
assertIncludes('admin content server', contentServer, "adminCmsApi.createItem");
assertIncludes('admin content server', contentServer, "parseAdminCmsDraftForm");
assertIncludes('admin content server', contentServer, "buildAdminCmsDraftPayload");

const contentPage = read('src/routes/admin/content/+page.svelte');
assertIncludes('admin content page', contentPage, "Learn & Lab CMS");
assertIncludes('admin content page', contentPage, "Create Learn/Lab draft");
assertIncludes('admin content page', contentPage, "CMS item filters");
assertIncludes('admin content page', contentPage, "Learn/Lab CMS items");

for (const rel of [
  'src/routes/admin/lessons/+page.svelte',
  'src/routes/admin/lab/+page.svelte',
  'src/routes/admin/settings/+page.svelte',
  'src/routes/admin/team/+page.server.ts',
  'src/routes/admin/audit/+page.server.ts',
  'src/routes/admin/moderation/+page.server.ts'
]) {
  read(rel);
}

const frontendFiles = [
  'src/lib/server/admin-auth.ts',
  'src/lib/server/admin-access.ts',
  'src/lib/admin/ui/AdminSidebar.svelte',
  'src/lib/admin/admin-cms-api.ts',
  'src/lib/admin/cms/admin-cms-schemas.ts',
  'src/routes/admin/login/+page.server.ts',
  'src/routes/admin/login/+page.svelte',
  'src/routes/admin/logout/+server.ts',
  'src/routes/admin/content/+page.server.ts',
  'src/routes/admin/content/+page.svelte'
].map(read).join('\n');
warnIfIncludes('frontend admin baseline', frontendFiles.toLowerCase(), 'directus');

console.log('PASS 25A admin Spark baseline audit');
console.log(`dependencies checked: ${Object.keys(deps).length}`);
console.log(`warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);

if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log('OK: Admin Spark baseline is ready for production-grade CMS passes.');
