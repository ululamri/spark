#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const checks = [
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', '/opt/karyra/spark'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', '/opt/karyra/spark-api'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', '/opt/karyra/hub/build'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', 'karyra-spark-web'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', 'karyra-spark-api'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', 'karyra-imgproxy'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', 'handle_path /hub/*'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', 'try_files {path} {path}/ /spa.html'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', '127.0.0.1:4173'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', '127.0.0.1:8787'],
  ['docs/LIVE_DEPLOYMENT_SURFACE.md', '127.0.0.1:8088']
];

const blockers = [];
for (const [file, expected] of checks) {
  const text = readFileSync(file, 'utf8');
  if (!text.includes(expected)) blockers.push(`${file} missing ${expected}`);
}

console.log('PASS 19B live deployment surface audit');
if (blockers.length) {
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('No PASS 19B live deployment blockers found.');
