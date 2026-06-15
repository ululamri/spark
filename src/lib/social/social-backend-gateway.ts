import { optimizeImageFileForUpload } from '$lib/media/image-upload-optimizer';
import { backendProfileFromApi, registerBackendSocialProfiles } from './social-model';
import { extractSocialTags } from './social-policy';
import { socialState } from './social-state.svelte';
import type { SocialComment, SocialDraftInput, SocialMediaAttachment, SocialPost, SocialPostKind, SocialProfile, SocialReactionKind, SocialReportReason } from './social-types';

const API_BASE = (import.meta.env.PUBLIC_API_BASE || import.meta.env.PUBLIC_SPARK_API_BASE || '').replace(/\/$/, '');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SOCIAL_UPLOAD_BYTES = 8 * 1024 * 1024;

export const socialBackendStatus = {
  ready: false,
  syncing: false,
  error: ''
};

type BackendProfile = {
  user_id: string;
  display_name: string;
  handle: string | null;
  bio: string;
  location: string;
  visibility: string;
  avatar_url?: string | null;
};

type BackendStats = {
  comments: number;
  reactions: Record<string, number>;
};

type BackendViewer = {
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
  created_at: string;
  updated_at: string;
};

type BackendComment = {
  id: string;
  post_id: string;
  author_user_id: string;
  body: string;
  created_at: string;
};

type BackendOptimizedMediaUrls = {
  avatar_64?: string | null;
  avatar_128?: string | null;
  feed_480?: string | null;
  feed_720?: string | null;
  detail_1080?: string | null;
  detail_1440?: string | null;
  original?: string | null;
};

type BackendMedia = {
  id: string;
  original_file_name: string;
  mime_type: string;
  size_bytes: number;
  public_url?: string | null;
  optimized_urls?: BackendOptimizedMediaUrls | null;
  created_at: string;
};

type BackendUploadIntent = {
  asset: BackendMedia;
  upload_method: string;
  upload_url: string;
  presigned: boolean;
};

type BackendHydratedComment = {
  comment: BackendComment;
  author: BackendProfile;
  media?: BackendMedia[];
  stats: BackendStats;
  viewer: BackendViewer;
};

type BackendHydratedPost = {
  post: BackendPost;
  author: BackendProfile;
  media?: BackendMedia[];
  stats: BackendStats;
  viewer: BackendViewer;
  comments: BackendHydratedComment[];
};

type BackendFeedResponse = {
  items: BackendHydratedPost[];
};

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

function publicApiUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return apiUrl(path.startsWith('/') ? path : `/${path}`);
}

function transformOptimizedUrls(urls?: BackendOptimizedMediaUrls | null): SocialMediaAttachment['optimizedUrls'] {
  if (!urls) return undefined;
  return {
    avatar64: publicApiUrl(urls.avatar_64),
    avatar128: publicApiUrl(urls.avatar_128),
    feed480: publicApiUrl(urls.feed_480),
    feed720: publicApiUrl(urls.feed_720),
    detail1080: publicApiUrl(urls.detail_1080),
    detail1440: publicApiUrl(urls.detail_1440),
    original: publicApiUrl(urls.original)
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function readApiError(response: Response, fallback: string) {
  try {
    const body = await readJson<{ error?: string }>(response);
    return body.error?.trim() || fallback;
  } catch {
    return fallback;
  }
}

async function apiGet<T>(path: string, fallback: string): Promise<T | null> {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await readApiError(response, fallback));
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
  if (!response.ok) throw new Error(await readApiError(response, fallback));
  return readJson<T>(response);
}

async function apiDelete(path: string, fallback: string): Promise<boolean> {
  const response = await fetch(apiUrl(path), {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });

  if (response.status === 401) return false;
  if (!response.ok) throw new Error(await readApiError(response, fallback));
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

function transformMedia(item: BackendMedia): SocialMediaAttachment {
  return {
    id: item.id,
    fileName: item.original_file_name,
    mimeType: item.mime_type,
    sizeBytes: item.size_bytes,
    publicUrl: publicApiUrl(item.public_url),
    optimizedUrls: transformOptimizedUrls(item.optimized_urls),
    createdAt: item.created_at
  };
}

function transformPost(item: BackendHydratedPost): SocialPost {
  const kind = backendKindToSocialKind(item.post.kind);
  const reaction = item.viewer.reaction_kinds.map(backendReactionToSocialReaction).find((value): value is SocialReactionKind => Boolean(value));

  return {
    id: item.post.id,
    authorId: item.author.user_id,
    kind,
    body: item.post.body,
    tags: extractSocialTags(item.post.body, kind),
    media: (item.media ?? []).map(transformMedia),
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
    viewer: { reaction, hidden: item.viewer.is_hidden, reported: false },
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

function validateSocialUploadFile(file: File) {
  const mimeType = file.type || 'application/octet-stream';
  const allowed = mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType.startsWith('text/');
  if (!allowed) throw new Error('File harus berupa gambar, PDF, atau teks.');
  if (file.size <= 0) throw new Error('File kosong tidak bisa diunggah.');
  if (file.size > MAX_SOCIAL_UPLOAD_BYTES) throw new Error('Ukuran file maksimal 8 MB.');
}

export function isBackendSocialId(id: string) {
  return UUID_PATTERN.test(id);
}

export async function fetchBackendSocialProfile(profileId: string): Promise<SocialProfile | null> {
  if (!isBackendSocialId(profileId)) return null;

  const profile = await apiGet<BackendProfile>(
    `/v1/social/profiles/${encodeURIComponent(profileId)}`,
    'Profil komunitas belum bisa dibaca.'
  );
  if (!profile) return null;

  const normalized = backendProfileFromApi(profile);
  registerBackendSocialProfiles([normalized]);
  return normalized;
}

export async function hydrateSocialFeedFromBackend() {
  if (typeof window === 'undefined') return false;

  socialBackendStatus.syncing = true;
  socialBackendStatus.error = '';

  try {
    const feed = await apiGet<BackendFeedResponse>('/v1/social/feed?limit=30', 'Feed komunitas belum bisa dibaca dari Spark API.');
    if (!feed) return false;

    registerProfiles(feed.items);
    socialState.posts = feed.items.map(transformPost);
    socialState.comments = Object.fromEntries(feed.items.map((item) => [item.post.id, item.comments.map(transformComment)]));
    socialBackendStatus.ready = true;
    return true;
  } catch (error) {
    socialBackendStatus.error = error instanceof Error ? error.message : 'Feed komunitas belum bisa disinkronkan.';
    return false;
  } finally {
    socialBackendStatus.syncing = false;
  }
}

export async function uploadSocialMediaFile(file: File) {
  const uploadFile = file.type.startsWith('image/') ? await optimizeImageFileForUpload(file, 'community') : file;
  validateSocialUploadFile(uploadFile);

  const intent = await apiPost<BackendUploadIntent>(
    '/v1/media/upload-intents',
    {
      purpose: 'community',
      file_name: uploadFile.name || 'spark-upload.bin',
      mime_type: uploadFile.type || 'application/octet-stream',
      size_bytes: uploadFile.size,
      private: false,
      metadata: {
        source: 'social-composer',
        original_file_name: file.name,
        original_size_bytes: file.size,
        optimized: uploadFile.size !== file.size || uploadFile.type !== file.type
      }
    },
    'Media upload belum tersedia. Post text-only tetap bisa dikirim.'
  );

  if (!intent) throw new Error('Login diperlukan untuk mengunggah media.');

  const uploadResponse = await fetch(intent.upload_url, {
    method: intent.upload_method || 'PUT',
    headers: { 'Content-Type': uploadFile.type || 'application/octet-stream' },
    body: uploadFile
  });

  if (!uploadResponse.ok) {
    throw new Error('Media belum bisa diunggah ke storage. Post text-only tetap bisa dikirim.');
  }

  const completed = await apiPost<BackendMedia>(
    `/v1/media/assets/${encodeURIComponent(intent.asset.id)}/complete`,
    { size_bytes: uploadFile.size },
    'Media sudah terunggah, tetapi belum bisa ditandai complete.'
  );

  if (!completed) throw new Error('Login diperlukan untuk menyelesaikan upload media.');

  return transformMedia(completed);
}

export async function createBackendSocialPost(input: SocialDraftInput) {
  return apiPost<BackendHydratedPost>(
    '/v1/social/posts',
    { kind: socialKindToBackendKind(input.kind), body: input.body, visibility: input.visibility ?? 'community', media_asset_ids: input.mediaAssetIds ?? [] },
    'Postingan belum bisa dikirim ke Spark API.'
  );
}

export async function createBackendSocialComment(postId: string, body: string) {
  return apiPost<BackendHydratedComment>(`/v1/social/posts/${encodeURIComponent(postId)}/comments`, { body, media_asset_ids: [] }, 'Komentar belum bisa dikirim ke Spark API.');
}

export async function setBackendSocialReaction(postId: string, reaction: SocialReactionKind) {
  return apiPost<{ ok: boolean }>(`/v1/social/posts/${encodeURIComponent(postId)}/reactions`, { kind: socialReactionToBackendReaction(reaction) }, 'Reaksi belum bisa disimpan ke Spark API.');
}

export async function deleteBackendSocialReaction(postId: string, reaction: SocialReactionKind) {
  return apiDelete(`/v1/social/posts/${encodeURIComponent(postId)}/reactions/${encodeURIComponent(socialReactionToBackendReaction(reaction))}`, 'Reaksi belum bisa dilepas dari Spark API.');
}

export async function hideBackendSocialPost(postId: string) {
  return apiPost<{ ok: boolean }>(`/v1/social/posts/${encodeURIComponent(postId)}/hide`, {}, 'Post belum bisa disembunyikan di Spark API.');
}

export async function reportBackendSocialPost(postId: string, reason: SocialReportReason) {
  return apiPost<{ id: string }>(`/v1/social/posts/${encodeURIComponent(postId)}/report`, { reason: reportReasonToBackendReason(reason), details: '' }, 'Laporan belum bisa dikirim ke Spark API.');
}

export async function followBackendSocialProfile(profileId: string) {
  return apiPost<{ ok: boolean }>(`/v1/social/profiles/${encodeURIComponent(profileId)}/follow`, {}, 'Profil belum bisa diikuti dari Spark API.');
}

export async function unfollowBackendSocialProfile(profileId: string) {
  return apiDelete(`/v1/social/profiles/${encodeURIComponent(profileId)}/follow`, 'Profil belum bisa dilepas dari Spark API.');
}
