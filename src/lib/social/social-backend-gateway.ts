import { backendProfileFromApi, registerBackendSocialProfiles } from './social-model';
import { extractSocialTags } from './social-policy';
import { socialState } from './social-state.svelte';
import type { SocialComment, SocialDraftInput, SocialPost, SocialPostKind, SocialReactionKind, SocialReportReason } from './social-types';

const API_BASE = (import.meta.env.PUBLIC_API_BASE || import.meta.env.PUBLIC_SPARK_API_BASE || '').replace(/\/$/, '');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BackendProfile = {
  user_id: string;
  display_name: string;
  handle: string | null;
  bio: string;
  location: string;
  visibility: string;
  avatar_preset?: string;
  avatar_url?: string | null;
};

type BackendStats = {
  comments: number;
  reactions: Record<string, number>;
};

type BackendViewer = {
  has_reacted: boolean;
  reaction_kinds: string[];
  is_following_author: boolean;
  is_hidden: boolean;
};

type BackendPost = {
  id: string;
  author_user_id: string;
  kind: string;
  body: string;
  visibility: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

type BackendComment = {
  id: string;
  post_id: string;
  author_user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type BackendHydratedComment = {
  comment: BackendComment;
  author: BackendProfile;
  stats: BackendStats;
  viewer: BackendViewer;
};

type BackendHydratedPost = {
  post: BackendPost;
  author: BackendProfile;
  stats: BackendStats;
  viewer: BackendViewer;
  comments: BackendHydratedComment[];
};

type BackendFeedResponse = {
  items: BackendHydratedPost[];
  next_cursor?: string | null;
};

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function apiGet<T>(path: string, fallback: string): Promise<T | null> {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(fallback);
  return readJson<T>(response);
}

async function apiPost<T>(path: string, payload: Record<string, unknown>, fallback: string): Promise<T | null> {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(fallback);
  return readJson<T>(response);
}

async function apiDelete(path: string, fallback: string): Promise<boolean> {
  const response = await fetch(apiUrl(path), {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });

  if (response.status === 401) return false;
  if (!response.ok) throw new Error(fallback);
  return true;
}

function backendKindToSocialKind(kind: string): SocialPostKind {
  if (kind === 'question') return 'question';
  if (kind === 'proof') return 'lab';
  if (kind === 'milestone') return 'workshop';
  if (kind === 'update') return 'resource';
  return 'progress';
}

function socialKindToBackendKind(kind: SocialPostKind) {
  if (kind === 'question') return 'question';
  if (kind === 'lab') return 'proof';
  if (kind === 'workshop') return 'milestone';
  if (kind === 'resource') return 'update';
  return 'reflection';
}

function backendReactionToSocialReaction(kind: string): SocialReactionKind | undefined {
  if (kind === 'support' || kind === 'like') return 'support';
  if (kind === 'insightful') return 'helpful';
  if (kind === 'celebrate') return 'inspiring';
  return undefined;
}

function socialReactionToBackendReaction(kind: SocialReactionKind) {
  if (kind === 'helpful') return 'insightful';
  if (kind === 'inspiring') return 'celebrate';
  return 'support';
}

function reportReasonToBackendReason(reason: SocialReportReason) {
  if (reason === 'secret-risk') return 'privacy';
  return reason;
}

function reactionCount(reactions: Record<string, number>, keys: string[]) {
  return keys.reduce((total, key) => total + (Number(reactions[key]) || 0), 0);
}

function transformPost(item: BackendHydratedPost): SocialPost {
  const kind = backendKindToSocialKind(item.post.kind);
  const reaction = item.viewer.reaction_kinds.map(backendReactionToSocialReaction).find(Boolean);
  return {
    id: item.post.id,
    authorId: item.author.user_id,
    kind,
    body: item.post.body,
    tags: extractSocialTags(item.post.body, kind),
    visibility: item.post.visibility === 'public' ? 'public' : 'community',
    createdAt: item.post.created_at,
    updatedAt: item.post.updated_at,
    stats: {
      support: reactionCount(item.stats.reactions, ['support', 'like']),
      helpful: reactionCount(item.stats.reactions, ['insightful']),
      inspiring: reactionCount(item.stats.reactions, ['celebrate']),
      comments: item.stats.comments,
      shares: 0
    },
    viewer: {
      reaction,
      hidden: item.viewer.is_hidden,
      reported: false
    },
    status: 'synced'
  };
}

function transformComment(item: BackendHydratedComment): SocialComment {
  return {
    id: item.comment.id,
    postId: item.comment.post_id,
    authorId: item.author.user_id,
    body: item.comment.body,
    createdAt: item.comment.created_at,
    status: 'synced'
  };
}

function registerProfiles(items: BackendHydratedPost[]) {
  registerBackendSocialProfiles(
    items.flatMap((item) => [item.author, ...item.comments.map((comment) => comment.author)]).map(backendProfileFromApi)
  );
}

export function isBackendSocialId(id: string) {
  return UUID_PATTERN.test(id);
}

export async function hydrateSocialFeedFromBackend() {
  if (typeof window === 'undefined') return false;

  socialState.backendSyncing = true;
  socialState.backendError = '';

  try {
    const feed = await apiGet<BackendFeedResponse>('/v1/social/feed?limit=30', 'Feed komunitas belum bisa dibaca dari Spark API.');
    if (!feed) return false;

    registerProfiles(feed.items);
    socialState.posts = feed.items.map(transformPost);
    socialState.comments = Object.fromEntries(
      feed.items.map((item) => [item.post.id, item.comments.map(transformComment)])
    );
    socialState.backendReady = true;
    return true;
  } catch (error) {
    socialState.backendError = error instanceof Error ? error.message : 'Feed komunitas belum bisa disinkronkan.';
    return false;
  } finally {
    socialState.backendSyncing = false;
  }
}

export async function createBackendSocialPost(input: SocialDraftInput) {
  return apiPost<BackendHydratedPost>(
    '/v1/social/posts',
    {
      kind: socialKindToBackendKind(input.kind),
      body: input.body,
      visibility: input.visibility ?? 'community',
      media_asset_ids: []
    },
    'Postingan belum bisa dikirim ke Spark API.'
  );
}

export async function createBackendSocialComment(postId: string, body: string) {
  return apiPost<BackendHydratedComment>(
    `/v1/social/posts/${encodeURIComponent(postId)}/comments`,
    { body, media_asset_ids: [] },
    'Komentar belum bisa dikirim ke Spark API.'
  );
}

export async function setBackendSocialReaction(postId: string, reaction: SocialReactionKind) {
  return apiPost<{ ok: boolean }>(
    `/v1/social/posts/${encodeURIComponent(postId)}/reactions`,
    { kind: socialReactionToBackendReaction(reaction) },
    'Reaksi belum bisa disimpan ke Spark API.'
  );
}

export async function deleteBackendSocialReaction(postId: string, reaction: SocialReactionKind) {
  return apiDelete(
    `/v1/social/posts/${encodeURIComponent(postId)}/reactions/${encodeURIComponent(socialReactionToBackendReaction(reaction))}`,
    'Reaksi belum bisa dilepas dari Spark API.'
  );
}

export async function hideBackendSocialPost(postId: string) {
  return apiPost<{ ok: boolean }>(
    `/v1/social/posts/${encodeURIComponent(postId)}/hide`,
    {},
    'Post belum bisa disembunyikan di Spark API.'
  );
}

export async function reportBackendSocialPost(postId: string, reason: SocialReportReason) {
  return apiPost<{ id: string }>(
    `/v1/social/posts/${encodeURIComponent(postId)}/report`,
    { reason: reportReasonToBackendReason(reason), details: '' },
    'Laporan belum bisa dikirim ke Spark API.'
  );
}

export async function followBackendSocialProfile(profileId: string) {
  return apiPost<{ ok: boolean }>(
    `/v1/social/profiles/${encodeURIComponent(profileId)}/follow`,
    {},
    'Profil belum bisa diikuti dari Spark API.'
  );
}

export async function unfollowBackendSocialProfile(profileId: string) {
  return apiDelete(
    `/v1/social/profiles/${encodeURIComponent(profileId)}/follow`,
    'Profil belum bisa dilepas dari Spark API.'
  );
}
