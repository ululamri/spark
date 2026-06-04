import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  {
    name: 'community page uses tabbed surface',
    file: 'src/routes/community/+page.svelte',
    mustInclude: ['SparkCommunityTabbedSurface', '<SparkCommunityTabbedSurface />'],
    mustNotInclude: ['<SparkSocialLayer />', 'id="social-layer"']
  },
  {
    name: 'tabbed surface exists and owns discussion tab',
    file: 'src/lib/ui/SparkCommunityTabbedSurface.svelte',
    mustInclude: ['data-karyra-community-tabs="pass37b"', "activeTab === 'diskusi'", '<SparkSocialLayer />', "tab=diskusi"],
    mustNotInclude: []
  },
  {
    name: 'command center links to tabs',
    file: 'src/lib/ui/SparkCommunityCommandCenter.svelte',
    mustInclude: ['?tab=workshop#community-tabs', '?tab=cohort#community-tabs', '?tab=diskusi#community-tabs'],
    mustNotInclude: ['href="#workshops"', 'href="#cohorts"']
  }
];

let failed = 0;
console.log('Karyra Spark — Pass 37B Community Tabs Audit');
console.log('================================================');

for (const check of checks) {
  const target = path.join(root, check.file);
  if (!fs.existsSync(target)) {
    failed += 1;
    console.log(`✗ ${check.name}: missing ${check.file}`);
    continue;
  }

  const content = fs.readFileSync(target, 'utf8');
  const missing = check.mustInclude.filter((item) => !content.includes(item));
  const forbidden = check.mustNotInclude.filter((item) => content.includes(item));

  if (missing.length || forbidden.length) {
    failed += 1;
    console.log(`✗ ${check.name}`);
    if (missing.length) console.log(`  missing: ${missing.join(', ')}`);
    if (forbidden.length) console.log(`  forbidden: ${forbidden.join(', ')}`);
  } else {
    console.log(`✓ ${check.name}`);
  }
}

if (failed) {
  console.log(`\n${failed} audit check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll Pass 37B community tab checks passed.');
}
