#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const strict = process.argv.includes('--strict');

const scanTargets = [
  'src/routes',
  'src/lib/ui',
  'src/lib/content',
  'src/lib/passport',
  'src/lib/proof',
  'src/lib/hub',
  'src/lib/profile'
];

const ignoredSegments = [
  `${path.sep}.svelte-kit${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}build${path.sep}`,
  `${path.sep}coverage${path.sep}`
];

const rules = [
  { term: 'backend', level: 'warn', suggestion: 'sistem Spark / akun Spark / layanan Spark' },
  { term: 'api', level: 'warn', suggestion: 'layanan Spark / koneksi Spark' },
  { term: 'endpoint', level: 'warn', suggestion: 'fitur / jalur layanan' },
  { term: 'local-state', level: 'warn', suggestion: 'data sementara di perangkat' },
  { term: 'local state', level: 'warn', suggestion: 'data sementara di perangkat' },
  { term: 'sync queue', level: 'warn', suggestion: 'antrean penyimpanan' },
  { term: 'hydrate', level: 'warn', suggestion: 'memuat' },
  { term: 'hydration', level: 'warn', suggestion: 'pemuatan sesi/data' },
  { term: 'runtime', level: 'warn', suggestion: 'saat aplikasi berjalan / sekarang' },
  { term: 'smoke test', level: 'warn', suggestion: 'pengecekan cepat' },
  { term: 'route boundary', level: 'warn', suggestion: 'batas halaman/fitur' },
  { term: 'route', level: 'soft', suggestion: 'halaman / jalur' },
  { term: 'migration', level: 'warn', suggestion: 'pembaruan data' },
  { term: 'proof event ledger', level: 'warn', suggestion: 'catatan bukti perjalanan' },
  { term: 'event ledger', level: 'warn', suggestion: 'catatan bukti' },
  { term: 'evidence root', level: 'warn', suggestion: 'ringkasan bukti' },
  { term: 'hash chain', level: 'warn', suggestion: 'jejak bukti berurutan' },
  { term: 'backend-ready', level: 'warn', suggestion: 'siap tersimpan di akun' },
  { term: 'nft-ready', level: 'soft', suggestion: 'siap dikembangkan menjadi credential on-chain' },
  { term: 'storage registry', level: 'warn', suggestion: 'penyimpanan file' },
  { term: 'postgresql', level: 'warn', suggestion: 'jangan tampilkan teknologi database di UI publik' },
  { term: 'docker', level: 'warn', suggestion: 'jangan tampilkan infrastruktur di UI publik' },
  { term: 'caddy', level: 'warn', suggestion: 'jangan tampilkan infrastruktur di UI publik' },
  { term: 'minio', level: 'warn', suggestion: 'penyimpanan file' },
  { term: 'sqlx', level: 'warn', suggestion: 'jangan tampilkan library backend di UI publik' },
  { term: 'axum', level: 'warn', suggestion: 'jangan tampilkan framework backend di UI publik' },
  { term: 'unauthorized', level: 'warn', suggestion: 'sesi berakhir / masuk lagi' }
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (ignoredSegments.some((segment) => full.includes(segment))) continue;
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(svelte|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function stripNonVisibleBlocks(file, content) {
  if (file.endsWith('.svelte')) {
    return content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/data-[a-zA-Z0-9_-]+="[^"]*"/g, '');
  }

  // TypeScript model/content files may include public copy, but code identifiers create noise.
  // Keep quoted strings only for a first-pass copy audit.
  const strings = [];
  const regex = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;
  while ((match = regex.exec(content))) {
    strings.push(match[2]);
  }
  return strings.join('\n');
}

const findings = [];
for (const target of scanTargets) {
  const abs = path.join(root, target);
  for (const file of walk(abs)) {
    const raw = fs.readFileSync(file, 'utf8');
    const visible = stripNonVisibleBlocks(file, raw);
    const lines = visible.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const rule of rules) {
        const pattern = new RegExp(`(^|[^a-zA-Z0-9_-])${rule.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zA-Z0-9_-]|$)`, 'i');
        if (pattern.test(line)) {
          findings.push({
            file: path.relative(root, file),
            line: idx + 1,
            term: rule.term,
            level: rule.level,
            suggestion: rule.suggestion,
            text: line.trim().slice(0, 180)
          });
        }
      }
    });
  }
}

const grouped = findings.reduce((acc, item) => {
  acc[item.level] ??= [];
  acc[item.level].push(item);
  return acc;
}, {});

console.log('Karyra Pass 66 Public UI Language Audit');
console.log('=========================================');
console.log(`Scan root: ${root}`);
console.log(`Findings: ${findings.length}`);
console.log(`Warn: ${(grouped.warn ?? []).length}`);
console.log(`Soft: ${(grouped.soft ?? []).length}`);
console.log('');

for (const level of ['warn', 'soft']) {
  const items = grouped[level] ?? [];
  if (!items.length) continue;
  console.log(`${level.toUpperCase()} findings`);
  console.log('-'.repeat(16));
  for (const item of items.slice(0, 80)) {
    console.log(`${item.file}:${item.line} — "${item.term}" → ${item.suggestion}`);
    if (item.text) console.log(`  ${item.text}`);
  }
  if (items.length > 80) console.log(`  ...and ${items.length - 80} more`);
  console.log('');
}

console.log('Audit note: default mode is advisory. Use --strict later after UI copy cleanup begins.');

if (strict && (grouped.warn ?? []).length > 0) {
  console.error('Strict mode failed: public UI still contains warning-level developer/internal terms.');
  process.exit(1);
}
