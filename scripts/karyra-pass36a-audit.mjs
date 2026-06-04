#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const srcDir = join(root, 'src');
const scriptsDir = join(root, 'scripts');
const suspiciousTitles = [
  'Belajar Core',
  'Praktik Lab',
  'Terbukti Passport',
  'Bersama Community',
  'Jelajah Hub',
];
const flowSelectors = [
  'flow-card',
  'home-flow-card',
  'journey-card',
  'spark-step-card',
  'step-card',
  'path-card',
  'data-spark-flow-card',
  'data-card-kind="flow"',
];
const riskyInstructionPatterns = [
  /masuk(?:kan)?\s+(seed phrase|private key|frasa pemulihan|kunci privat)/i,
  /input\s+(seed phrase|private key|frasa pemulihan|kunci privat)/i,
  /submit\s+(seed phrase|private key|frasa pemulihan|kunci privat)/i,
  /kirim\s+(seed phrase|private key|frasa pemulihan|kunci privat)/i,
];

function walk(dir, acc = []) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return acc; }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.svelte-kit' || entry === 'build' || entry === 'dist' || entry === '.git') continue;
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, acc);
    else if (/\.(svelte|ts|js|css|md)$/.test(entry)) acc.push(path);
  }
  return acc;
}

const files = [...walk(srcDir), ...walk(scriptsDir)];
const findings = [];
let cssHasPass36A = false;

for (const file of files) {
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  const rel = relative(root, file);

  if (rel === 'src/app.css' && text.includes('KARYRA PASS 36A')) cssHasPass36A = true;

  for (const title of suspiciousTitles) {
    if (text.includes(title)) {
      findings.push({ level: 'medium', type: 'awkward-flow-title', file: rel, note: `Exact title remains: ${title}` });
    }
  }

  for (const pattern of riskyInstructionPatterns) {
    const match = text.match(pattern);
    if (match) {
      findings.push({ level: 'high', type: 'seed-phrase-instruction-risk', file: rel, note: `Potential unsafe instruction: ${match[0]}` });
    }
  }
}

console.log('Karyra Spark — Pass 36A Audit');
console.log('=================================');
console.log(`Files scanned        : ${files.length}`);
console.log(`Pass 36A CSS present : ${cssHasPass36A ? 'yes' : 'no'}`);
console.log('');

if (!cssHasPass36A) {
  findings.unshift({ level: 'high', type: 'missing-pass36a-css', file: 'src/app.css', note: 'Pass 36A managed CSS block was not found.' });
}

console.log('Home flow selector coverage hints:');
for (const selector of flowSelectors) console.log(`  - ${selector}`);
console.log('');

if (findings.length === 0) {
  console.log('No obvious Pass 36A issues found. Still verify /home or / on a real mobile viewport.');
} else {
  console.log('Findings:');
  for (const finding of findings) {
    console.log(`  - [${finding.level}] ${finding.type}`);
    console.log(`    ${finding.file}`);
    console.log(`    ${finding.note}`);
  }
}
console.log('');
console.log('Manual mobile check: open Home, inspect cards 1–5, and confirm each description spans full card width.');
