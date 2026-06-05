import { readFileSync } from 'node:fs';

const checks = [
  {
    file: 'src/lib/social/local-social-gateway.ts',
    forbidden: ['SocialLaporanReason'],
    required: ['SocialReportReason']
  },
  {
    file: 'src/lib/ui/social/SparkSocialComposer.svelte',
    forbidden: ["'rujukan'", '"rujukan"'],
    required: ["'resource'"]
  }
];

let failed = false;

for (const check of checks) {
  const text = readFileSync(check.file, 'utf8');

  for (const item of check.forbidden) {
    if (text.includes(item)) {
      console.error(`[pass-40a] Forbidden token found in ${check.file}: ${item}`);
      failed = true;
    }
  }

  for (const item of check.required) {
    if (!text.includes(item)) {
      console.error(`[pass-40a] Required token missing in ${check.file}: ${item}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('[pass-40a] Public type audit passed.');
