export type SparkNavKey = 'gateway' | 'core' | 'lab' | 'community' | 'profile' | 'hub' | 'settings';

export type SparkNavItem = {
  key: SparkNavKey;
  href: string;
  label: string;
  shortLabel: string;
  copy: string;
  icon: string;
  primary?: boolean;
};

export const sparkNavItems: SparkNavItem[] = [
  {
    key: 'gateway',
    href: '/',
    label: 'Home',
    shortLabel: 'Home',
    copy: 'Mulai mengenal Spark',
    icon: 'home',
    primary: true
  },
  {
    key: 'core',
    href: '/core',
    label: 'Belajar',
    shortLabel: 'Belajar',
    copy: 'Mulai dari dasar blockchain dan Starknet',
    icon: 'book-open',
    primary: true
  },
  {
    key: 'lab',
    href: '/lab',
    label: 'Lab',
    shortLabel: 'Lab',
    copy: 'Coba latihan aman sebelum menjelajah',
    icon: 'flask-conical',
    primary: true
  },
  {
    key: 'community',
    href: '/community',
    label: 'Komunitas',
    shortLabel: 'Komunitas',
    copy: 'Workshop, cohort, dan belajar bersama',
    icon: 'users',
    primary: true
  },
  {
    key: 'profile',
    href: '/profile',
    label: 'Ruang Saya',
    shortLabel: 'Saya',
    copy: 'Profile, Passport, dan perjalanan belajar',
    icon: 'user-round',
    primary: true
  },
  {
    key: 'hub',
    href: '/hub',
    label: 'Hub',
    shortLabel: 'Hub',
    copy: 'Resource dan jalur eksplorasi Starknet',
    icon: 'compass',
    primary: false
  },
  {
    key: 'settings',
    href: '/settings',
    label: 'Pengaturan',
    shortLabel: 'Atur',
    copy: 'Tampilan, ritme belajar, dan bantuan',
    icon: 'settings',
    primary: false
  }
];

export const primaryMobileNavItems = sparkNavItems.filter((item) =>
  ['gateway', 'core', 'lab', 'community', 'profile'].includes(item.key)
);

export function getNavItem(key: SparkNavKey) {
  return sparkNavItems.find((item) => item.key === key);
}

export function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
