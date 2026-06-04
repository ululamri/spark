import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const appCss = join(root, 'src', 'app.css');
const marker = 'KARYRA PASS 36B HOME FLOW HARD FIX';

console.log('Karyra Spark — Pass 36B Audit');
console.log('================================');

if (!existsSync(appCss)) {
  console.log('[fail] src/app.css not found');
  process.exitCode = 1;
} else {
  const css = readFileSync(appCss, 'utf8');
  console.log(css.includes(marker) ? '[ok] Pass 36B CSS block found in src/app.css' : '[warn] Pass 36B CSS block not found in src/app.css');
}

const likelyFiles = [
  'src/routes/+page.svelte',
  'src/routes/home/+page.svelte',
  'src/lib/ui/SparkLandingHero.svelte',
  'src/lib/landing/landing-model.ts'
];

for (const file of likelyFiles) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  const hasScope = text.includes('data-karyra-pass36b-home-flow');
  const hasHeading = text.includes('Satu perjalanan dari pemahaman ke readiness') || text.includes('ALUR SPARK');
  const hasCards = ['Core', 'Lab', 'Passport', 'Community', 'Hub'].every((word) => text.includes(word));
  if (hasScope || hasHeading || hasCards) {
    console.log(`${hasScope ? '[ok]' : '[info]'} ${file} ${hasScope ? 'has scoped marker' : 'contains home-flow content'}`);
  }
}

console.log('\nManual check: open Home on a narrow mobile viewport. Each card description should render as normal sentences across the card width, not as one broken word per line.');
