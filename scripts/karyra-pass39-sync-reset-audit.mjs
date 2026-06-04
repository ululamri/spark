import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/lib/sync/sync-types.ts',
  'src/lib/sync/sync-storage-registry.ts',
  'src/lib/sync/sync-event-queue.svelte.ts',
  'src/lib/sync/local-sync-gateway.ts',
  'src/lib/sync/sync-policy.ts',
  'src/lib/sync/reset-local-data.ts',
  'src/lib/ui/SparkDataControlCenter.svelte',
  'docs/pass-39-storage-reset-policy.md',
  'docs/pass-39-backend-sync-contract.md'
];

const knownKeys = [
  'karyra-spark-learning-state-v3',
  'karyra-spark-gateway-state-v1',
  'karyra-spark-message-state-v1',
  'karyra-spark-social-state-v1',
  'karyra-spark-sync-queue-v1',
  'karyra-spark-session-v2',
  'karyra-spark-theme-v2',
  'karyra-spark-managed-content-v1',
  'karyra-spark-cookie-choice-v1'
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name === 'node_modules' || item.name === '.svelte-kit' || item.name === 'build') continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, out);
    else if (/\.(svelte|ts|js|mjs|md)$/.test(item.name)) out.push(full);
  }
  return out;
}

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const settingsPath = path.join(root, 'src/lib/ui/SparkSettingsControlCenter.svelte');
const settings = fs.existsSync(settingsPath) ? fs.readFileSync(settingsPath, 'utf8') : '';
const hasSettingsControl = settings.includes('SparkDataControlCenter') && settings.includes('<SparkDataControlCenter />');

const files = walk(path.join(root, 'src'));
const discoveredKeys = new Set();
const suspiciousSecretStorage = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/karyra-spark-[a-z0-9-]+/gi)) discoveredKeys.add(match[0]);
  if (/localStorage\.setItem\([^\n]*(seed phrase|private key|secret|mnemonic)/i.test(text)) {
    suspiciousSecretStorage.push(path.relative(root, file));
  }
}

const unknownKeys = [...discoveredKeys].filter((key) => !knownKeys.includes(key));
const registry = fs.existsSync(path.join(root, 'src/lib/sync/sync-storage-registry.ts'))
  ? fs.readFileSync(path.join(root, 'src/lib/sync/sync-storage-registry.ts'), 'utf8')
  : '';
const registryMissing = knownKeys.filter((key) => !registry.includes(key));

console.log('Karyra Pass 39 Sync & Reset Audit');
console.log('==================================');
console.log(`required files: ${required.length - missing.length}/${required.length}`);
console.log(`settings data control: ${hasSettingsControl ? 'ok' : 'missing'}`);
console.log(`known storage keys in registry: ${knownKeys.length - registryMissing.length}/${knownKeys.length}`);
console.log(`unknown karyra storage keys discovered: ${unknownKeys.length}`);
console.log(`suspicious secret storage files: ${suspiciousSecretStorage.length}`);

if (missing.length) {
  console.log('\nMissing files:');
  for (const file of missing) console.log(`- ${file}`);
}
if (registryMissing.length) {
  console.log('\nRegistry missing keys:');
  for (const key of registryMissing) console.log(`- ${key}`);
}
if (unknownKeys.length) {
  console.log('\nUnknown storage keys found:');
  for (const key of unknownKeys) console.log(`- ${key}`);
}
if (suspiciousSecretStorage.length) {
  console.log('\nPotentially unsafe localStorage usage:');
  for (const file of suspiciousSecretStorage) console.log(`- ${file}`);
}

if (missing.length || !hasSettingsControl || registryMissing.length || suspiciousSecretStorage.length) process.exitCode = 1;
