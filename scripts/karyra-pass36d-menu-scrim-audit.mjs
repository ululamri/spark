#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const drawerPath = path.join(root, 'src/lib/shell/SparkMobileDrawer.svelte');
const appCssPath = path.join(root, 'src/app.css');

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch { return ''; }
}

const drawer = read(drawerPath);
const appCss = read(appCssPath);

console.log('Karyra Spark — Pass 36D Menu Scrim Audit');
console.log('==========================================');

const checks = [
  ['drawer exists', drawer.length > 0],
  ['scrim button exists', drawer.includes('class="spark-mobile-scrim"')],
  ['36D marker exists', drawer.includes('KARYRA PASS 36D MENU SCRIM SHAPE FIX START')],
  ['scrim radius reset', /\.spark-mobile-scrim\s*\{[\s\S]*border-radius:\s*0/.test(drawer)],
  ['scrim min-height reset', /\.spark-mobile-scrim\s*\{[\s\S]*min-height:\s*0/.test(drawer)],
  ['broad global button radius still noted', /:where\([^)]*button[^)]*\)\s*\{[\s\S]*border-radius/.test(appCss)]
];

for (const [name, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${name}`);
}

console.log('
Expected visual result: the menu backdrop is a flat full-screen dim layer, not a large oval/circle.');
