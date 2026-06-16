import type { SocialComment, SocialPost, SocialProfile } from './social-types';

const API_BASE = (import.meta.env.PUBLIC_API_BASE || import.meta.env.PUBLIC_SPARK_API_BASE || '').replace(/\/$/, '');

export const SOCIAL_VIEWER_ID = 'local-viewer';

export const socialPostKindLabels = {
  all: 'Semua',
  progress: 'Perkembangan',
  question: 'Pertanyaan',
  resource: 'Rujukan',
  workshop: 'Workshop',
  lab: 'Lab'
} as const;

export const socialPostKindHints = {
  progress: 'Bagikan perkembangan kecil dari proses belajar.',
  question: 'Tanyakan bagian yang masih membingungkan.',
  resource: 'Bagikan rujukan yang aman dan relevan.',
  workshop: 'Koordinasikan event, cohort, atau meetup lokal.',
  lab: 'Bagikan latihan aman dari Lab.'
} as const;

const localViewerProfile: SocialProfile = {
  id: SOCIAL_VIEWER_ID,
  name: 'Pengguna Spark',
  handle: '@pengguna-spark',
  role: 'learner',
  location: 'Komunitas Spark',
  bio: 'Profil lokal sementara sebelum data profil backend tersedia.',
  avatarLabel: 'S',
  trusted: false
};

let backendSocialProfiles: SocialProfile[] = [];

function publicApiUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!API_BASE) return path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function avatarLabelFromName(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return letters || 'S';
}

function fallbackProfile(profileId: string): SocialProfile {
  if (profileId === SOCIAL_VIEWER_ID) return localViewerProfile;

  return {
    id: profileId,
    name: 'Pengguna Spark',
    handle: profileId.startsWith('@') ? profileId : `@${profileId.slice(0, 8) || 'spark'}`,
    role: 'learner',
    location: 'Komunitas Spark',
    bio: 'Profil komunitas Spark.',
    avatarLabel: 'S',
    trusted: false
  };
}

export function registerBackendSocialProfiles(profiles: SocialProfile[]) {
  const byId = new Map(backendSocialProfiles.map((profile) => [profile.id, profile]));
  for (const profile of profiles) byId.set(profile.id, profile);
  backendSocialProfiles = Array.from(byId.values());
}

export function backendProfileFromApi(input: {
  user_id: string;
  display_name: string;
  handle?: string | null;
  bio?: string;
  location?: string;
  visibility?: string;
  avatar_url?: string | null;
  avatar_optimized_urls?: {
    avatar_64?: string | null;
    avatar_128?: string | null;
    feed_480?: string | null;
    feed_720?: string | null;
    detail_1080?: string | null;
    detail_1440?: string | null;
    original?: string | null;
  } | null;
}): SocialProfile {
  const name = input.display_name?.trim() || 'Pengguna Spark';
  const avatarUrl = input.avatar_url?.trim();
  return {
    id: input.user_id,
    name,
    handle: input.handle?.trim() || `@${input.user_id.slice(0, 8)}`,
    role: 'learner',
    location: input.location?.trim() || 'Komunitas Spark',
    bio: input.bio?.trim().slice(0, 180) || 'Profil komunitas Spark.',
    avatarLabel: avatarLabelFromName(name).slice(0, 3),
    avatarUrl: avatarUrl || undefined,
    avatarOptimizedUrls: input.avatar_optimized_urls
      ? {
          avatar64: publicApiUrl(input.avatar_optimized_urls.avatar_64),
          avatar128: publicApiUrl(input.avatar_optimized_urls.avatar_128),
          feed480: publicApiUrl(input.avatar_optimized_urls.feed_480),
          feed720: publicApiUrl(input.avatar_optimized_urls.feed_720),
          detail1080: publicApiUrl(input.avatar_optimized_urls.detail_1080),
          detail1440: publicApiUrl(input.avatar_optimized_urls.detail_1440),
          original: publicApiUrl(input.avatar_optimized_urls.original)
        }
      : undefined,
    trusted: input.visibility === 'public'
  };
}

export const socialSeedPosts: SocialPost[] = [];
export const socialSeedComments: Record<string, SocialComment[]> = {};

export function getSocialProfile(profileId: string) {
  return backendSocialProfiles.find((profile) => profile.id === profileId) ?? fallbackProfile(profileId);
}
