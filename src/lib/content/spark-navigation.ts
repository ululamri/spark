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
    label: 'Gateway',
    shortLabel: 'Home',
    copy: 'Ringkasan ekosistem Spark',
    icon: 'home',
    primary: true
  },
  {
    key: 'core',
    href: '/core',
    label: 'Learn',
    shortLabel: 'Learn',
    copy: 'Jalur belajar blockchain dan Starknet',
    icon: 'book-open',
    primary: true
  },
  {
    key: 'lab',
    href: '/lab',
    label: 'Practice',
    shortLabel: 'Lab',
    copy: 'Simulasi, readiness, dan praktik aman',
    icon: 'flask-conical',
    primary: true
  },
  {
    key: 'community',
    href: '/community',
    label: 'Community',
    shortLabel: 'Komunitas',
    copy: 'Workshop, cohort, dan fasilitator lokal',
    icon: 'users',
    primary: true
  },
  {
    key: 'profile',
    href: '/profile',
    label: 'Profile',
    shortLabel: 'Profil',
    copy: 'Passport, progress, dan readiness',
    icon: 'user-round',
    primary: true
  },
  {
    key: 'hub',
    href: '/hub',
    label: 'Hub',
    shortLabel: 'Hub',
    copy: 'Resource, apps, tools, dan ekosistem',
    icon: 'compass',
    primary: false
  },
  {
    key: 'settings',
    href: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    copy: 'Tema, tampilan, dan preferensi',
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
