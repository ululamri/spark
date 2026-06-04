import { createSocialEvent, createSocialId } from './social-events';
import { SOCIAL_VIEWER_ID } from './social-model';
import { evaluateSocialComment, evaluateSocialDraft, extractSocialTags } from './social-policy';
import { socialState } from './social-state.svelte';
import type { SocialComment, SocialCommentInput, SocialDraftInput, SocialPost, SocialReactionKind, SocialReportReason } from './social-types';

function pushEvent(event: ReturnType<typeof createSocialEvent>) {
  socialState.events = [event, ...socialState.events].slice(0, 80);
}

export function createSocialPost(input: SocialDraftInput) {
  const policy = evaluateSocialDraft(input.body);
  if (!policy.canSubmit) return;

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
    status: 'local'
  };

  socialState.posts = [post, ...socialState.posts];
  socialState.comments = { ...socialState.comments, [post.id]: [] };
  pushEvent(
    createSocialEvent({
      kind: 'post.created',
      targetId: post.id,
      title: 'Post komunitas dibuat',
      copy: 'Post tersimpan lokal dan siap disinkronkan saat backend aktif.',
      href: `/community#${post.id}`
    })
  );
}

export function toggleSocialReaction(postId: string, reaction: SocialReactionKind) {
  socialState.posts = socialState.posts.map((post) => {
    if (post.id !== postId) return post;

    const previous = post.viewer.reaction;
    const stats = { ...post.stats };
    if (previous) stats[previous] = Math.max(0, stats[previous] - 1);
    const nextReaction = previous === reaction ? undefined : reaction;
    if (nextReaction) stats[nextReaction] += 1;

    return { ...post, stats, viewer: { ...post.viewer, reaction: nextReaction } };
  });

  pushEvent(
    createSocialEvent({
      kind: 'reaction.toggled',
      targetId: postId,
      title: 'Reaction diperbarui',
      copy: 'Aktivitas reaction tersimpan sebagai event lokal.',
      href: `/community#${postId}`
    })
  );
}

export function addSocialComment(input: SocialCommentInput) {
  const policy = evaluateSocialComment(input.body);
  if (!policy.canSubmit) return;

  const comment: SocialComment = {
    id: createSocialId('comment'),
    postId: input.postId,
    authorId: SOCIAL_VIEWER_ID,
    body: policy.normalized,
    createdAt: new Date().toISOString(),
    status: 'local'
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
      copy: 'Komentar tersimpan lokal dan masuk antrean sync masa depan.',
      href: `/community#${input.postId}`
    })
  );
}

export function toggleSocialFollow(profileId: string) {
  if (profileId === SOCIAL_VIEWER_ID) return;
  const followed = socialState.followedProfileIds.includes(profileId);
  socialState.followedProfileIds = followed
    ? socialState.followedProfileIds.filter((id) => id !== profileId)
    : [...socialState.followedProfileIds, profileId];

  pushEvent(
    createSocialEvent({
      kind: 'follow.toggled',
      targetId: profileId,
      title: followed ? 'Berhenti mengikuti' : 'Mulai mengikuti',
      copy: followed ? 'Author dihapus dari daftar ikuti lokal.' : 'Author ditambahkan ke daftar ikuti lokal.',
      href: '/community#social-layer'
    })
  );
}

export function hideSocialPost(postId: string) {
  socialState.posts = socialState.posts.map((post) =>
    post.id === postId ? { ...post, viewer: { ...post.viewer, hidden: true } } : post
  );
  pushEvent(
    createSocialEvent({
      kind: 'post.hidden',
      targetId: postId,
      title: 'Post disembunyikan',
      copy: 'Post tidak lagi muncul di feed lokal perangkat ini.',
      href: '/community#social-layer'
    })
  );
}

export function reportSocialPost(postId: string, reason: SocialReportReason = 'other') {
  socialState.posts = socialState.posts.map((post) =>
    post.id === postId ? { ...post, viewer: { ...post.viewer, reported: true } } : post
  );
  pushEvent(
    createSocialEvent({
      kind: 'post.reported',
      targetId: postId,
      title: 'Report tersimpan',
      copy: `Alasan report: ${reason}. Backend nanti dapat menerima event ini untuk moderation queue.`,
      href: '/community#social-layer'
    })
  );
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
      copy: 'Share masih lokal/copy link. Backend nanti dapat membuat permalink sungguhan.',
      href: `/community#${postId}`
    })
  );
}
