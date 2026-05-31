export type CommunityMetric = {
  label: string;
  value: string;
  copy: string;
  icon: string;
};

export type SparkCohort = {
  id: string;
  title: string;
  status: 'Berjalan' | 'Pendaftaran Dibuka' | 'Menunggu Batch';
  facilitator: string;
  location: string;
  format: 'Offline' | 'Online' | 'Hybrid';
  summary: string;
  members: number;
  relatedPath: string;
};

export type CommunityActivation = {
  title: string;
  copy: string;
  icon: string;
  href: string;
  tone: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
};

export const communityMetrics: CommunityMetric[] = [
  {
    label: 'Workshop Direncanakan',
    value: '12',
    copy: 'Sesi lokal dan online untuk onboarding komunitas.',
    icon: 'calendar'
  },
  {
    label: 'Peserta Target',
    value: '240+',
    copy: 'Target awal dari cohort kecil dan komunitas lokal.',
    icon: 'users'
  },
  {
    label: 'Cohort Aktif',
    value: '3',
    copy: 'Batch komunitas yang bergerak dari Learn ke Practice.',
    icon: 'layers'
  },
  {
    label: 'Fasilitator',
    value: '6',
    copy: 'Mentor lokal, volunteer, dan technical guide.',
    icon: 'shield'
  }
];

export const sparkCohorts: SparkCohort[] = [
  {
    id: 'spark-local-starter',
    title: 'Spark Local Starter',
    status: 'Pendaftaran Dibuka',
    facilitator: 'Community Mentor',
    location: 'Komunitas Lokal',
    format: 'Hybrid',
    summary: 'Cohort pemula untuk memahami blockchain, wallet safety, dan readiness dasar.',
    members: 32,
    relatedPath: '/core'
  },
  {
    id: 'spark-practice-circle',
    title: 'Spark Practice Circle',
    status: 'Berjalan',
    facilitator: 'Spark Facilitator',
    location: 'Online + Meetup',
    format: 'Hybrid',
    summary: 'Cohort lanjutan untuk Practice Lab, testnet readiness, dan proof of practice.',
    members: 18,
    relatedPath: '/lab'
  },
  {
    id: 'starknet-gateway-group',
    title: 'Starknet Gateway Group',
    status: 'Menunggu Batch',
    facilitator: 'Technical Guide',
    location: 'Online',
    format: 'Online',
    summary: 'Kelompok eksplorasi Starknet setelah pengguna punya fondasi dan Passport awal.',
    members: 11,
    relatedPath: '/hub'
  }
];

export const communityActivations: CommunityActivation[] = [
  {
    title: 'Workshop',
    copy: 'Belajar terstruktur bersama fasilitator dengan contoh lokal.',
    icon: 'calendar',
    href: '#workshops',
    tone: 'blue'
  },
  {
    title: 'Meetup Lokal',
    copy: 'Pertemuan kecil untuk diskusi, tanya jawab, dan praktik bersama.',
    icon: 'users',
    href: '#cohorts',
    tone: 'green'
  },
  {
    title: 'Diskusi Komunitas',
    copy: 'Ruang berbagi pengalaman agar pemula tidak belajar sendirian.',
    icon: 'messages',
    href: '/community',
    tone: 'purple'
  },
  {
    title: 'Jadi Fasilitator',
    copy: 'Jalur untuk volunteer yang ingin membantu onboarding lokal.',
    icon: 'shield',
    href: '/profile',
    tone: 'orange'
  }
];
