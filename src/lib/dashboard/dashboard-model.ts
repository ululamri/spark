export type DashboardAction = {
  href: string;
  title: string;
  copy: string;
  icon: string;
  tone: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
};

export const dashboardActions: DashboardAction[] = [
  {
    href: '/core',
    title: 'Lanjut Belajar',
    copy: 'Masuk ke Spark Core dan lanjutkan lesson berikutnya.',
    icon: 'book-open',
    tone: 'blue'
  },
  {
    href: '/lab',
    title: 'Practice Lab',
    copy: 'Coba simulasi dan bangun proof-of-practice secara aman.',
    icon: 'flask-conical',
    tone: 'purple'
  },
  {
    href: '/profile',
    title: 'Passport',
    copy: 'Lihat readiness, progress, mode belajar, dan akses Hub.',
    icon: 'badge',
    tone: 'green'
  },
  {
    href: '/community',
    title: 'Komunitas',
    copy: 'Ikut workshop, cohort, dan aktivitas komunitas lokal.',
    icon: 'users',
    tone: 'pink'
  }
];

export const dashboardModes = [
  {
    key: 'beginner',
    title: 'Pemula',
    copy: 'Mulai dengan bahasa sederhana dan konteks sehari-hari.',
    icon: 'shield'
  },
  {
    key: 'guided',
    title: 'Terarah',
    copy: 'Belajar lebih ringkas, tetap dengan guardrail yang jelas.',
    icon: 'layers'
  },
  {
    key: 'explorer',
    title: 'Penjelajah',
    copy: 'Lihat jalur teknis, Lab advanced, dan preview Starknet.',
    icon: 'zap'
  }
] as const;
