import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/lib/content-builder/public-content-builder.ts',
  'src/lib/ui/SparkPublicContentBuilder.svelte',
  'src/routes/studio/content/+page.svelte',
  'src/routes/studio/content/api/override/+server.ts',
  'static/studio-content-overrides.json',
  'docs/studio/public-content-builder.md'
];

let failed = false;

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

const guardedFiles = requiredFiles.filter((file) => file.endsWith('.ts') || file.endsWith('.svelte') || file.endsWith('.mjs'));
for (const file of guardedFiles) {
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, 'utf-8').split('\n');
  lines.forEach((line, index) => {
    if (/^\s*\\/.test(line)) {
      console.error(`Suspicious leading backslash in ${file}:${index + 1}`);
      failed = true;
    }
  });
}

const endpoint = existsSync('src/routes/studio/content/api/override/+server.ts')
  ? readFileSync('src/routes/studio/content/api/override/+server.ts', 'utf-8')
  : '';
if (!endpoint.includes('SPARK_STUDIO_WRITE_ENABLED')) {
  console.error('Writer endpoint must be gated by SPARK_STUDIO_WRITE_ENABLED.');
  failed = true;
}
if (!endpoint.includes('static/studio-content-overrides.json')) {
  console.error('Writer endpoint must target static/studio-content-overrides.json.');
  failed = true;
}

const builder = existsSync('src/lib/ui/SparkPublicContentBuilder.svelte')
  ? readFileSync('src/lib/ui/SparkPublicContentBuilder.svelte', 'utf-8')
  : '';
for (const marker of ['clearSlot', 'restoreSlot', 'enabled', 'Hapus slot', 'Preview']) {
  if (!builder.includes(marker)) {
    console.error(`Builder is missing marker: ${marker}`);
    failed = true;
  }
}

const model = existsSync('src/lib/content-builder/public-content-builder.ts')
  ? readFileSync('src/lib/content-builder/public-content-builder.ts', 'utf-8')
  : '';
for (const marker of ['PublicContentSlotKey', 'isSlotVisible', 'makePublicContentOverride']) {
  if (!model.includes(marker)) {
    console.error(`Content builder model is missing marker: ${marker}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Pass 67 public content builder audit OK');
