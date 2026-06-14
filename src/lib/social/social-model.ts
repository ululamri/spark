import type { SocialComment, SocialPost, SocialProfile } from './social-types';

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
}): SocialProfile {
  const name = input.display_name?.trim() || 'Pengguna Spark';
  return {
    id: input.user_id,
    name,
    handle: input.handle?.trim() || `@${input.user_id.slice(0, 8)}`,
    role: 'learner',
    location: input.location?.trim() || 'Komunitas Spark',
    bio: input.bio?.trim().slice(0, 180) || 'Profil komunitas Spark.',
    avatarLabel: avatarLabelFromName(name).slice(0, 3),
    trusted: input.visibility === 'public'
  };
}

export const socialSeedPosts: SocialPost[] = [];
export const socialSeedComments: Record<string, SocialComment[]> = {};

export function getSocialProfile(profileId: string) {
  return backendSocialProfiles.find((profile) => profile.id === profileId) ?? fallbackProfile(profileId);
}
