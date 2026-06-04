import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/lib/social/social-schema.ts',
  'src/lib/social/social-types.ts',
  'src/lib/social/social-model.ts',
  'src/lib/social/social-policy.ts',
  'src/lib/social/social-events.ts',
  'src/lib/social/social-gateway.ts',
  'src/lib/social/local-social-gateway.ts',
  'src/lib/social/social-state.svelte.ts',
  'src/lib/ui/social/SparkSocialLayer.svelte',
  'src/lib/ui/social/SparkSocialComposer.svelte',
  'src/lib/ui/social/SparkSocialPostCard.svelte',
  'src/lib/ui/social/SparkSocialSafetyPanel.svelte',
  'docs/pass-37-social-backend-contract.md'
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const community = fs.readFileSync(path.join(root, 'src/routes/community/+page.svelte'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

console.log('Karyra Spark — Pass 37 Social Audit');
console.log('====================================');
console.log(`Required files       : ${required.length}`);
console.log(`Missing files        : ${missing.length}`);
if (missing.length) missing.forEach((file) => console.log(`  - ${file}`));
console.log(`Community integrated : ${community.includes('SparkSocialLayer') ? 'yes' : 'no'}`);
console.log(`Zod available        : ${packageJson.dependencies?.zod ? 'yes' : 'no'}`);

const policy = fs.readFileSync(path.join(root, 'src/lib/social/social-policy.ts'), 'utf8');
console.log(`Secret guard         : ${policy.includes('private key') && policy.includes('seed phrase') ? 'yes' : 'review'}`);

if (missing.length || !community.includes('SparkSocialLayer')) {
  process.exitCode = 1;
  console.log('\nAudit result: review required.');
} else {
  console.log('\nAudit result: pass. Run pnpm check/build for compiler validation.');
}
