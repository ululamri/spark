import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  {
    file: 'src/lib/ui/SparkSettingsControlCenter.svelte',
    mustNotContain: ['Studio', '/studio', 'contentStudioState', 'restoreManagedContent'],
    mustContain: ['Atur Spark', 'SparkDataControlCenter']
  },
  {
    file: 'src/lib/ui/SparkDataControlCenter.svelte',
    mustNotContain: ['backend', 'sync', 'local state', 'storage registry', 'antrean'],
    mustContain: ['Mulai ulang progress', 'Hapus data perangkat']
  },
  {
    file: 'src/lib/shell/SparkTopBar.svelte',
    mustContain: ['signedIn', '{#if signedIn}', 'Masuk'],
  },
  {
    file: 'src/lib/shell/SparkMobileDrawer.svelte',
    mustContain: ["href: '/settings'", "title: 'Pengaturan'"],
    mustNotContain: ['Teknis dan non-teknis']
  },
  {
    file: 'src/lib/ui/SparkAuthShell.svelte',
    mustContain: ['Lupa kata sandi?', "{#if mode === 'login'}"],
    mustNotContain: ['Password minimal']
  },
  {
    file: 'src/lib/ui/SparkCoreGuidedFlow.svelte',
    mustNotContain: ['Pilih cara belajar', 'core-track-grid', 'learnTrackCards', 'setExperience', 'tersimpan lokal'],
    mustContain: ['Pengaturan', 'Lanjutkan belajar']
  },
  {
    file: 'src/lib/content-managed/spark-managed-content.ts',
    mustNotContain: ['Buka Studio', "'/studio'"],
  },
  {
    file: 'src/app.css',
    mustContain: ['PASS 40B PUBLIC FOOTER BOUNDS']
  }
];

let failed = false;

for (const check of checks) {
  const full = path.join(root, check.file);
  if (!fs.existsSync(full)) {
    console.error(`✗ missing ${check.file}`);
    failed = true;
    continue;
  }
  const text = fs.readFileSync(full, 'utf8');
  for (const needle of check.mustContain ?? []) {
    if (!text.includes(needle)) {
      console.error(`✗ ${check.file} missing required text: ${needle}`);
      failed = true;
    }
  }
  for (const needle of check.mustNotContain ?? []) {
    if (text.includes(needle)) {
      console.error(`✗ ${check.file} still contains forbidden text: ${needle}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('Pass 40B audit passed: public UX, auth gating, settings cleanup, and footer bounds look ready.');
}
