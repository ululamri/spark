import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/lib/passport/passport-types.ts',
  'src/lib/passport/passport-proof-model.ts',
  'src/lib/ui/SparkPassportBadge.svelte',
  'src/lib/ui/SparkPassportReadinessCenter.svelte',
  'docs/pass-43-passport-starknet-proof-roadmap.md'
];

const forbiddenUiTerms = [
  'Filecoin',
  'Stellar',
  'CodeMirror',
  'StarknetKit placeholder'
];

const passportUiPath = 'src/lib/ui/SparkPassportReadinessCenter.svelte';
let failed = false;

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

if (existsSync(passportUiPath)) {
  const content = readFileSync(passportUiPath, 'utf8');
  for (const term of forbiddenUiTerms) {
    if (content.includes(term)) {
      console.error(`Forbidden public Passport term found: ${term}`);
      failed = true;
    }
  }

  const requiredMarkers = [
    'proof-of-readiness',
    'Starknet Mainnet',
    'NFT badge',
    'evidence root',
    'SparkPassportBadge'
  ];

  for (const marker of requiredMarkers) {
    if (!content.includes(marker)) {
      console.error(`Passport UI marker missing: ${marker}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('Pass 43 Passport proof audit passed.');
