#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');

const banned = [
  'Menyerahkan',
  'menyerahkan',
  'Kamu bisa',
  'kamu bisa',
  'Silahkan',
  'silahkan',
  'Social layer',
  'social layer',
  'Filter feed',
  'Feed lokal',
  'Submit',
  'Terms & conditions'
];

const expectedFiles = [
  'src/lib/ui/SparkCoreTabbedSurface.svelte',
  'src/lib/ui/social/SparkSocialLayer.svelte',
  'src/lib/ui/social/SparkSocialComposer.svelte',
  'src/routes/core/+page.svelte'
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.svelte-kit', 'build', '.git', '.karyra-backups'].includes(entry.name)) continue;
      walk(full, out);
    } else if (/\.(svelte|ts|md)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const missing = expectedFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const hits = [];

for (const file of walk(srcRoot)) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  for (const term of banned) {
    if (text.includes(term)) hits.push({ file: rel, term });
  }
}

const coreRoute = fs.existsSync(path.join(root, 'src/routes/core/+page.svelte'))
  ? fs.readFileSync(path.join(root, 'src/routes/core/+page.svelte'), 'utf8')
  : '';

const coreTabbedOk = coreRoute.includes('SparkCoreTabbedSurface');
const socialLayer = fs.existsSync(path.join(root, 'src/lib/ui/social/SparkSocialLayer.svelte'))
  ? fs.readFileSync(path.join(root, 'src/lib/ui/social/SparkSocialLayer.svelte'), 'utf8')
  : '';
const discussionCopyOk = socialLayer.includes('Diskusi komunitas') && socialLayer.includes('Filter diskusi');

const report = {
  pass: '38-global-copy-core-discussion',
  missing,
  banned_hits: hits,
  checks: {
    core_tabbed_surface_route: coreTabbedOk,
    discussion_copy_ready: discussionCopyOk
  }
};

console.log(JSON.stringify(report, null, 2));

if (missing.length || hits.length || !coreTabbedOk || !discussionCopyOk) {
  process.exitCode = 1;
}
