import type { SparkStorageEntry } from './sync-types';

export const SYNC_QUEUE_STORAGE_KEY = 'karyra-spark-sync-queue-v1';

export const sparkStorageRegistry: SparkStorageEntry[] = [
  {
    key: 'karyra-spark-learning-state-v3',
    owner: 'learning',
    label: 'Progress belajar',
    description: 'Pelajaran selesai, catatan, bookmark, checkpoint, dan status belajar yang dicache di perangkat.',
    authority: 'server-source',
    resetOnProgressReset: true,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Server menjadi sumber utama. State perangkat menjadi cache dan draft offline.'
  },
  {
    key: 'karyra-spark-leveling-state-v1',
    owner: 'learning',
    label: 'Level dan ujian',
    description: 'Hasil ujian Core/Lab, level yang lulus, dan jawaban sementara.',
    authority: 'server-source',
    resetOnProgressReset: true,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Server menyimpan hasil ujian, kelulusan level, dan eligibility Passport.'
  },
  {
    key: 'karyra-spark-gateway-state-v1',
    owner: 'community',
    label: 'Community dan Hub',
    description: 'Workshop tersimpan, resource Hub tersimpan, dan bridge yang sudah ditutup.',
    authority: 'server-source',
    resetOnProgressReset: true,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Server menyimpan relasi user dengan workshop, cohort, dan resource.'
  },
  {
    key: 'karyra-spark-message-state-v1',
    owner: 'message',
    label: 'Notifikasi dan inbox',
    description: 'Status baca, filter pesan, dan pesan yang disimpan sebagai cache UI di perangkat.',
    authority: 'server-source',
    resetOnProgressReset: true,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Server menyimpan status baca. State perangkat hanya cache UI.'
  },
  {
    key: 'karyra-spark-social-state-v1',
    owner: 'social',
    label: 'Diskusi komunitas',
    description: 'Cache diskusi, komentar, reaction, follow, report, dan draft interaksi komunitas.',
    authority: 'server-source',
    resetOnProgressReset: true,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Server menyimpan diskusi. State perangkat menjadi cache, draft, dan optimistic update.'
  },
  {
    key: SYNC_QUEUE_STORAGE_KEY,
    owner: 'system',
    label: 'Antrean sync',
    description: 'Event perangkat yang menunggu sinkronisasi backend saat jaringan atau session belum siap.',
    authority: 'local-cache',
    resetOnProgressReset: true,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Diperkuat dengan IndexedDB queue dan retry policy bila dibutuhkan.'
  },
  {
    key: 'karyra-spark-session-v2',
    owner: 'auth',
    label: 'Cache akun browser',
    description: 'Salinan ringan identitas akun backend untuk render UI. Sumber kebenaran tetap cookie httpOnly dan /v1/auth/me.',
    authority: 'local-cache',
    resetOnProgressReset: false,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Tetap cache UI non-rahasia. Tidak menjadi sumber kebenaran akun.'
  },
  {
    key: 'karyra-spark-theme-v2',
    owner: 'theme',
    label: 'Tema tampilan',
    description: 'Preferensi terang, gelap, atau mengikuti perangkat.',
    authority: 'local-preference',
    resetOnProgressReset: false,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Boleh tetap preference perangkat atau disalin ke profile settings.'
  },
  {
    key: 'karyra-spark-managed-content-v1',
    owner: 'content',
    label: 'Konten terkelola perangkat',
    description: 'Draft copy/resource legal/community yang diedit dari content studio sebelum dipublish ke backend.',
    authority: 'local-source',
    resetOnProgressReset: false,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Naik ke CMS/backend admin saat tersedia.'
  },
  {
    key: 'karyra-spark-cookie-choice-v1',
    owner: 'cookie',
    label: 'Pilihan cookie',
    description: 'Pilihan penyimpanan/cookie penting pada perangkat.',
    authority: 'local-preference',
    resetOnProgressReset: false,
    resetOnAllLocalReset: true,
    futureBackendRole: 'Tetap preference perangkat kecuali consent backend dibutuhkan.'
  }
];

export function getProgressResetKeys() {
  return sparkStorageRegistry.filter((entry) => entry.resetOnProgressReset).map((entry) => entry.key);
}

export function getAllLocalResetKeys() {
  return sparkStorageRegistry.filter((entry) => entry.resetOnAllLocalReset).map((entry) => entry.key);
}

export function getServerSourceEntries() {
  return sparkStorageRegistry.filter((entry) => entry.authority === 'server-source');
}
