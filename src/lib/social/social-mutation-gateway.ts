import {
  createBackendSocialComment,
  createBackendSocialPost,
  deleteBackendSocialReaction,
  followBackendSocialProfile,
  hideBackendSocialPost,
  hydrateSocialFeedFromBackend,
  isBackendSocialId,
  reportBackendSocialPost,
  setBackendSocialReaction,
  unfollowBackendSocialProfile
} from './social-backend-gateway';
import { createSocialEvent, createSocialId } from './social-events';
import { enqueueSyncEvent } from '$lib/sync/sync-event-queue.svelte';
import type { SyncEventName } from '$lib/sync/sync-types';
import { SOCIAL_VIEWER_ID } from './social-model';
import { evaluateSocialComment, evaluateSocialDraft, extractSocialTags } from './social-policy';
import { socialState } from './social-state.svelte';
import type { SocialComment, SocialCommentInput, SocialDraftInput, SocialPost, SocialReactionKind, SocialReportReason } from './social-types';

type MutationResult = 'synced' | 'queued' | 'failed' | 'ignored';
const QUEUED_STATUS = 'queued' as const;

function pushEvent(event: ReturnType<typeof createSocialEvent>) {
  socialState.events = [event, ...socialState.events].slice(0, 80);
  enqueueSyncEvent({
    name: `social.${event.kind}` as SyncEventName,
    entity: 'social',
    action: event.kind,
    subjectId: event.targetId,
    payload: { eventId: event.id, title: event.title, href: event.href }
  });
}

function feedRefreshLimit() {
  return Math.min(50, Math.max(20, socialState.posts.length || 20));
}

async function refreshFeedAfterMutation() {
  await hydrateSocialFeedFromBackend({ force: true, limit: feedRefreshLimit() });
}

function markPostStatus(postId: string, status: SocialPost['status']) {
  socialState.posts = socialState.posts.map((post) => (post.id === postId ? { ...post, status } : post));
}

function markCommentStatus(postId: string, commentId: string, status: SocialComment['status']) {
  const comments = socialState.comments[postId] ?? [];
  socialState.comments = {
    ...socialState.comments,
    [postId]: comments.map((item) => (item.id === commentId ? { ...item, status } : item))
  };
}

export async function createSocialPost(input: SocialDraftInput): Promise<MutationResult> {
  const policy = evaluateSocialDraft(input.body);
  if (!policy.canKirim) return 'ignored';

  const post: SocialPost = {
    id: createSocialId('post'),
    authorId: SOCIAL_VIEWER_ID,
    kind: input.kind,
    body: policy.normalized,
    tags: input.tags?.length ? input.tags.slice(0, 6) : extractSocialTags(policy.normalized, input.kind),
    visibility: input.visibility ?? 'community',
    createdAt: new Date().toISOString(),
    stats: { support: 0, helpful: 0, inspiring: 0, comments: 0, shares: 0 },
    viewer: { hidden: false, reported: false },
    status: 'pending'
  };

  socialState.posts = [post, ...socialState.posts];
  socialState.comments = { ...socialState.comments, [post.id]: [] };
  pushEvent(
    createSocialEvent({
      kind: 'post.created',
      targetId: post.id,
      title: 'Postingan terkirim',
      copy: 'Postingan sedang disinkronkan ke Ruang Diskusi.',
      href: `/community#${post.id}`
    })
  );

  try {
    const created = await createBackendSocialPost({ ...input, body: policy.normalized });
    if (!created) {
      markPostStatus(post.id, QUEUED_STATUS);
      return 'queued';
    }

    await refreshFeedAfterMutation();
    return 'synced';
  } catch {
    markPostStatus(post.id, 'failed');
    return 'failed';
  }
}

export async function addSocialComment(input: SocialCommentInput): Promise<MutationResult> {
  const policy = evaluateSocialComment(input.body);
  if (!policy.canKirim) return 'ignored';

  const comment: SocialComment = {
    id: createSocialId('comment'),
    postId: input.postId,
    authorId: SOCIAL_VIEWER_ID,
    body: policy.normalized,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  const existing = socialState.comments[input.postId] ?? [];
  socialState.comments = { ...socialState.comments, [input.postId]: [...existing, comment] };
  socialState.posts = socialState.posts.map((post) =>
    post.id === input.postId ? { ...post, stats: { ...post.stats, comments: post.stats.comments + 1 } } : post
  );

  pushEvent(
    createSocialEvent({
      kind: 'comment.created',
      targetId: input.postId,
      title: 'Komentar terkirim',
      copy: 'Komentar sedang disinkronkan.',
      href: `/community#${input.postId}`
    })
  );

  if (!isBackendSocialId(input.postId)) {
    markCommentStatus(input.postId, comment.id, QUEUED_STATUS);
    return 'queued';
  }

  try {
    const created = await createBackendSocialComment(input.postId, policy.normalized);
    if (!created) {
      markCommentStatus(input.postId, comment.id, QUEUED_STATUS);
      return 'queued';
    }

    await refreshFeedAfterMutation();
    return 'synced';
  } catch {
    markCommentStatus(input.postId, comment.id, 'failed');
    return 'failed';
  }
}

export async function toggleSocialReaction(postId: string, reaction: SocialReactionKind): Promise<MutationResult> {
  let previous: SocialReactionKind | undefined;
  let nextReaction: SocialReactionKind | undefined;

  socialState.posts = socialState.posts.map((post) => {
    if (post.id !== postId) return post;

    previous = post.viewer.reaction;
    const stats = { ...post.stats };
    if (previous) stats[previous] = Math.max(0, stats[previous] - 1);
    nextReaction = previous === reaction ? undefined : reaction;
    if (nextReaction) stats[nextReaction] += 1;

    return { ...post, stats, viewer: { ...post.viewer, reaction: nextReaction } };
  });

  pushEvent(
    createSocialEvent({
      kind: 'reaction.toggled',
      targetId: postId,
      title: 'Reaksi disimpan',
      copy: 'Terima kasih sudah memberi respons.',
      href: `/community#${postId}`
    })
  );

  if (!isBackendSocialId(postId)) return 'queued';

  try {
    if (nextReaction) await setBackendSocialReaction(postId, nextReaction);
    else if (previous) await deleteBackendSocialReaction(postId, previous);
    return 'synced';
  } catch {
    return 'failed';
  }
}

export async function toggleSocialFollow(profileId: string): Promise<MutationResult> {
  if (profileId === SOCIAL_VIEWER_ID) return 'ignored';
  const followed = socialState.followedProfileIds.includes(profileId);
  socialState.followedProfileIds = followed
    ? socialState.followedProfileIds.filter((id) => id !== profileId)
    : [...socialState.followedProfileIds, profileId];

  pushEvent(
    createSocialEvent({
      kind: 'follow.toggled',
      targetId: profileId,
      title: followed ? 'Berhenti mengikuti' : 'Mulai mengikuti',
      copy: followed ? 'Profil ini tidak lagi diikuti.' : 'Profil ini sekarang diikuti.',
      href: '/community?tab=diskusi#diskusi'
    })
  );

  if (!isBackendSocialId(profileId)) return 'queued';

  try {
    if (followed) await unfollowBackendSocialProfile(profileId);
    else await followBackendSocialProfile(profileId);
    return 'synced';
  } catch {
    return 'failed';
  }
}

export async function hideSocialPost(postId: string): Promise<MutationResult> {
  socialState.posts = socialState.posts.map((post) =>
    post.id === postId ? { ...post, viewer: { ...post.viewer, hidden: true } } : post
  );
  pushEvent(
    createSocialEvent({
      kind: 'post.hidden',
      targetId: postId,
      title: 'Post disembunyikan',
      copy: 'Postingan tidak lagi muncul di Ruang Diskusi kamu.',
      href: '/community?tab=diskusi#diskusi'
    })
  );

  if (!isBackendSocialId(postId)) return 'queued';
  try {
    await hideBackendSocialPost(postId);
    return 'synced';
  } catch {
    return 'failed';
  }
}

export async function reportSocialPost(postId: string, reason: SocialReportReason = 'other'): Promise<MutationResult> {
  socialState.posts = socialState.posts.map((post) =>
    post.id === postId ? { ...post, viewer: { ...post.viewer, reported: true } } : post
  );
  pushEvent(
    createSocialEvent({
      kind: 'post.reported',
      targetId: postId,
      title: 'Laporan dikirim',
      copy: `Laporan diterima. Alasan: ${reason}.`,
      href: '/community?tab=diskusi#diskusi'
    })
  );

  if (!isBackendSocialId(postId)) return 'queued';
  try {
    await reportBackendSocialPost(postId, reason);
    return 'synced';
  } catch {
    return 'failed';
  }
}

export function shareSocialPost(postId: string) {
  socialState.posts = socialState.posts.map((post) =>
    post.id === postId ? { ...post, stats: { ...post.stats, shares: post.stats.shares + 1 } } : post
  );
  pushEvent(
    createSocialEvent({
      kind: 'post.shared',
      targetId: postId,
      title: 'Link post disalin',
      copy: 'Link postingan siap dibagikan.',
      href: `/community#${postId}`
    })
  );
}
