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

const api = read('src/lib/admin/admin-team-api.ts');
assertIncludes('admin-team-api', api, 'export type AdminInvitation');
assertIncludes('admin-team-api', api, 'export type AdminInvitations');
assertIncludes('admin-team-api', api, 'createInvitation');
assertIncludes('admin-team-api', api, "'/team/invitations'");
assertIncludes('admin-team-api', api, 'revokeInvitation');
assertIncludes('admin-team-api', api, "'/team/invitations/'");
assertNotIncludes('admin-team-api', api, 'upsertMember:');
assertNotIncludes('admin-team-api', api, "'/team/members', input");

const server = read('src/routes/admin/team/+page.server.ts');
assertIncludes('team server', server, 'adminTeamApi.invitations');
assertIncludes('team server', server, 'createInvitation');
assertIncludes('team server', server, 'revokeInvitation');
assertIncludes('team server', server, "role === 'admin' && access.actor.role !== 'superadmin'");
assertNotIncludes('team server', server, 'upsertMember');

const page = read('src/routes/admin/team/+page.svelte');
assertIncludes('team page', page, 'Create admin/moderator invitation');
assertIncludes('team page', page, 'action="?/createInvitation"');
assertIncludes('team page', page, 'Invitation queue');
assertIncludes('team page', page, 'action="?/revokeInvitation"');
assertIncludes('team page', page, 'Manual invite token');
assertIncludes('team page', page, 'No direct delegated role creation');
assertNotIncludes('team page', page, 'Grant or update role');
assertNotIncludes('team page', page, 'action="?/upsertMember"');
assertNotIncludes('team page', page, 'Save delegated role');

console.log('PASS 25E-E admin team invitations audit');
if (failures.length) {
  console.error(`failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('OK: admin team UI is invite-only and no longer exposes direct delegated role creation.');
