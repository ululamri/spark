#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const files = [
  'src/lib/ui/social/SparkSocialComposer.svelte',
  'src/lib/ui/social/SparkSocialPostCard.svelte',
  'src/lib/ui/social/SparkSocialSafetyPanel.svelte',
  'src/lib/ui/social/SparkSocialLayer.svelte'
];

let warnings = 0;
console.log('Karyra Spark — Pass 37A Social CSS Scope Audit');
console.log('================================================');

for (const file of files) {
  if (!existsSync(file)) {
    console.log(`missing: ${file}`);
    warnings++;
    continue;
  }

  const text = readFileSync(file, 'utf8');
  const style = text.match(/<style[\s\S]*?<\/style>/g)?.join('\n') ?? '';
  const rawDark = (style.match(/(^|[^\w:])\[data-theme='dark'\]/g) ?? []).length;
  const fixedDark = (style.match(/:global\(\[data-theme='dark'\]\)/g) ?? []).length;
  const rawChildSvg = file.endsWith('SparkSocialLayer.svelte') && style.includes('.social-empty-state svg');

  console.log(`${file}`);
  console.log(`  global dark selectors: ${fixedDark}`);
  if (rawDark > 0) {
    console.log(`  WARN raw scoped dark selectors: ${rawDark}`);
    warnings++;
  }
  if (rawChildSvg) {
    console.log('  WARN raw child svg selector still present');
    warnings++;
  }
}

console.log('------------------------------------------------');
if (warnings) {
  console.log(`Audit finished with ${warnings} warning(s). Run pnpm check for compiler confirmation.`);
  process.exitCode = 1;
} else {
  console.log('Audit clean. Run pnpm check to confirm Svelte warnings are gone.');
}
