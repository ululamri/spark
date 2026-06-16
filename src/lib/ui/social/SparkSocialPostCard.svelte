<script lang="ts">
  import SparkIcon from '$ui/SparkIcon.svelte';
  import SparkOptimizedImage from '$ui/SparkOptimizedImage.svelte';
  import {
    addSocialComment,
    hideSocialPost,
    reportSocialPost,
    shareSocialPost,
    toggleSocialFollow,
    toggleSocialReaction
  } from '$lib/social/local-social-gateway';
  import { getSocialProfile, SOCIAL_VIEWER_ID, socialPostKindLabels } from '$lib/social/social-model';
  import { evaluateSocialComment } from '$lib/social/social-policy';
  import { socialState } from '$lib/social/social-state.svelte';
  import type { SocialComment, SocialMediaAttachment, SocialPost, SocialProfile, SocialReactionKind } from '$lib/social/social-types';

  type Props = { post: SocialPost };
  let { post }: Props = $props();

  let commentDraft = $state('');
  let showComments = $state(false);
  let shareCopied = $state(false);
  let commentSubmitting = $state(false);
  let commentError = $state('');

  const author = $derived(getSocialProfile(post.authorId));
  const comments = $derived(socialState.comments[post.id] ?? []);
  const followed = $derived(socialState.followedProfileIds.includes(post.authorId));
  const commentPolicy = $derived(evaluateSocialComment(commentDraft));
  const media = $derived(post.media ?? []);

  const reactions: { key: SocialReactionKind; label: string; icon: string }[] = [
    { key: 'support', label: 'Dukung', icon: 'heart' },
    { key: 'helpful', label: 'Berguna', icon: 'check' },
    { key: 'inspiring', label: 'Inspirasi', icon: 'sparkles' }
  ];

  function profileHref(profileId: string) {
    return `/community/profile/${encodeURIComponent(profileId)}`;
  }

  async function addComment() {
    if (!commentPolicy.canKirim || commentSubmitting) return;
    commentSubmitting = true;
    commentError = '';
    showComments = true;

    try {
      await addSocialComment({ postId: post.id, body: commentDraft });
      commentDraft = '';
    } catch (error) {
      commentError = error instanceof Error ? error.message : 'Komentar belum bisa dikirim.';
    } finally {
      commentSubmitting = false;
    }
  }

  function handleCommentKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    void addComment();
  }

  function statusLabel(status: SocialPost['status']) {
    if (status === 'pending') return 'Mengirim...';
    if (status === 'failed') return 'Gagal sinkron · cek koneksi';
    if (status === 'local') return 'Menunggu sinkronisasi';
    return 'Tersinkron ke Spark API';
  }

  function commentStatusLabel(comment: SocialComment) {
    if (comment.status === 'pending') return 'mengirim';
    if (comment.status === 'failed') return 'gagal sinkron';
    if (comment.status === 'local') return 'menunggu sinkron';
    return '';
  }

  function isImageMedia(item: SocialMediaAttachment) {
    return item.mimeType.startsWith('image/') && Boolean(item.publicUrl);
  }

  function mediaImageHref(item: SocialMediaAttachment) {
    return item.optimizedUrls?.original ?? item.publicUrl ?? '#';
  }

  function mediaImageSrc(item: SocialMediaAttachment) {
    return item.optimizedUrls?.feed720 ?? item.optimizedUrls?.feed480 ?? item.publicUrl ?? '';
  }

  function mediaImageSrcset(item: SocialMediaAttachment) {
    const entries = [
      item.optimizedUrls?.feed480 ? `${item.optimizedUrls.feed480} 480w` : '',
      item.optimizedUrls?.feed720 ? `${item.optimizedUrls.feed720} 720w` : '',
      item.optimizedUrls?.detail1080 ? `${item.optimizedUrls.detail1080} 1080w` : ''
    ].filter(Boolean);
    return entries.join(', ');
  }

  function mediaSizeLabel(sizeBytes: number) {
    if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    if (sizeBytes >= 1024) return `${Math.round(sizeBytes / 1024)} KB`;
    return `${sizeBytes} B`;
  }

  function profileAvatarSrc(profile: SocialProfile) {
    return profile.avatarOptimizedUrls?.avatar64 ?? profile.avatarOptimizedUrls?.avatar128 ?? profile.avatarUrl;
  }

  function avatarBackgroundStyle(src?: string) {
    return src ? `--comment-avatar-url: url('${src}')` : undefined;
  }

  function commentAuthor(commentAuthorId: string) {
    return getSocialProfile(commentAuthorId);
  }

  async function copyShareLink() {
    if (typeof window === 'undefined') return;

    const href = `${window.location.origin}/community?tab=diskusi#${post.id}`;
    let shared = false;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Karyra Spark discussion', text: post.body.slice(0, 120), url: href });
        shared = true;
      } catch {
        shared = false;
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard?.writeText(href);
        shared = true;
      } catch {
        const fallback = document.createElement('textarea');
        fallback.value = href;
        fallback.setAttribute('readonly', 'true');
        fallback.style.position = 'fixed';
        fallback.style.left = '-9999px';
        document.body.appendChild(fallback);
        fallback.select();
        try {
          shared = document.execCommand('copy');
        } catch {
          shared = false;
        }
        fallback.remove();
      }
    }

    shareSocialPost(post.id);
    shareCopied = shared;
    window.setTimeout(() => {
      shareCopied = false;
    }, 1800);
  }
</script>

<article class="social-post-card" id={post.id} data-kind={post.kind} data-status={post.status}>
  <header class="post-head">
    <a class="avatar" href={profileHref(post.authorId)} aria-label={`Buka profil ${author.name}`}>{author.avatarLabel}</a>
    <div>
      <div class="author-row">
        <a class="author-link" href={profileHref(post.authorId)}>{author.name}</a>
        {#if author.trusted}<em>verified</em>{/if}
        {#if post.status !== 'synced'}<span class="status-pill">{statusLabel(post.status)}</span>{/if}
      </div>
      <small>{author.handle} · {socialPostKindLabels[post.kind]} · komunitas</small>
    </div>
    {#if post.authorId !== SOCIAL_VIEWER_ID}
      <button type="button" class:active={followed} class="follow-btn" onclick={() => void toggleSocialFollow(post.authorId)}>
        {followed ? 'Diikuti' : 'Ikuti'}
      </button>
    {/if}
  </header>

  <p class="post-body">{post.body}</p>

  {#if media.length > 0}
    <div class="media-grid" aria-label="Lampiran media">
      {#each media as item (item.id)}
        {#if isImageMedia(item)}
          <a class="media-image" href={mediaImageHref(item)} target="_blank" rel="noreferrer" aria-label={`Buka ${item.fileName}`}>
            <SparkOptimizedImage
              src={mediaImageSrc(item)}
              srcset={mediaImageSrcset(item)}
              sizes="(max-width: 720px) 92vw, 640px"
              alt={item.fileName}
              class="media-optimized-image"
            />
          </a>
        {:else}
          <a class="media-file" href={item.publicUrl ?? '#'} target="_blank" rel="noreferrer" aria-label={`Buka ${item.fileName}`}>
            <SparkIcon name="document" size={15} />
            <span>
              <strong>{item.fileName}</strong>
              <small>{item.mimeType} · {mediaSizeLabel(item.sizeBytes)}</small>
            </span>
          </a>
        {/if}
      {/each}
    </div>
  {/if}

  {#if post.tags.length > 0}
    <div class="tag-row">
      {#each post.tags as tag}
        <span>#{tag}</span>
      {/each}
    </div>
  {/if}

  <div class="post-actions" aria-label="Aksi post">
    {#each reactions as reaction}
      <button
        type="button"
        class:active={post.viewer.reaction === reaction.key}
        onclick={() => void toggleSocialReaction(post.id, reaction.key)}
      >
        <SparkIcon name={reaction.icon} size={14} /> {reaction.label} <span>{post.stats[reaction.key]}</span>
      </button>
    {/each}
    <button type="button" onclick={() => (showComments = !showComments)}>
      <SparkIcon name="messages" size={14} /> Komentar <span>{post.stats.comments}</span>
    </button>
    <button type="button" class:active={shareCopied} onclick={copyShareLink} aria-live="polite">
      <SparkIcon name="share" size={14} /> {shareCopied ? 'Tersalin' : 'Share'} <span>{post.stats.shares}</span>
    </button>
  </div>

  {#if showComments}
    <section class="comment-thread" aria-label="Komentar">
      {#if comments.length === 0}
        <p class="empty-comment">Belum ada komentar. Mulai dengan pertanyaan atau dukungan singkat.</p>
      {:else}
        {#each comments as comment (comment.id)}
          <div class="comment-row" data-status={comment.status}>
            <a
              class="comment-avatar"
              class:hasAvatar={Boolean(profileAvatarSrc(commentAuthor(comment.authorId)))}
              style={avatarBackgroundStyle(profileAvatarSrc(commentAuthor(comment.authorId)))}
              href={profileHref(comment.authorId)}
              aria-label={`Buka profil ${commentAuthor(comment.authorId).name}`}
            >{commentAuthor(comment.authorId).avatarLabel}</a>
            <p>
              <a href={profileHref(comment.authorId)}>{commentAuthor(comment.authorId).name}</a> {comment.body}
              {#if commentStatusLabel(comment)}<small>{commentStatusLabel(comment)}</small>{/if}
            </p>
          </div>
        {/each}
      {/if}

      <div class="comment-compose">
        <input
          bind:value={commentDraft}
          placeholder="Tulis komentar aman..."
          aria-label="Tulis komentar"
          disabled={commentSubmitting}
          onkeydown={handleCommentKeydown}
        />
        <button type="button" disabled={!commentPolicy.canKirim || commentSubmitting} onclick={() => void addComment()}>
          {commentSubmitting ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
      {#if commentError}
        <small class="comment-error">{commentError}</small>
      {:else if commentDraft.trim().length > 0 && commentPolicy.errors.length > 0}
        <small class="comment-error">{commentPolicy.errors[0]}</small>
      {/if}
    </section>
  {/if}

  <footer class="post-tools">
    <small>{statusLabel(post.status)}</small>
    <div>
      <button type="button" onclick={() => void hideSocialPost(post.id)}>Sembunyikan</button>
      <button type="button" disabled={post.viewer.reported} onclick={() => void reportSocialPost(post.id, 'unsafe')}>
        {post.viewer.reported ? 'Dilaporkan' : 'Report'}
      </button>
    </div>
  </footer>
</article>

<style>
  .social-post-card {
    display: grid;
    gap: 12px;
    padding: 14px;
    border: 1px solid var(--spark-line);
    border-radius: 24px;
    background: var(--spark-card);
    box-shadow: 0 10px 26px rgba(5, 9, 78, 0.06);
  }

  .post-head {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .avatar,
  .comment-avatar {
    display: grid;
    place-items: center;
    border-radius: 15px;
    color: #fff;
    background: linear-gradient(135deg, var(--spark-blue), var(--spark-blue-strong));
    font-weight: 800;
    text-decoration: none;
  }

  .avatar { width: 40px; height: 40px; }

  .comment-avatar.hasAvatar {
    color: transparent;
    background-image: var(--comment-avatar-url);
    background-size: cover;
    background-position: center;
  }

  .author-row {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
    min-width: 0;
  }

  .author-link {
    color: var(--spark-navy);
    font-size: 14px;
    font-weight: 800;
    line-height: 1.1;
    text-decoration: none;
  }

  .author-link:hover,
  .comment-row p a:hover { color: var(--spark-blue-strong); }
  :global([data-theme='dark']) .author-link { color: #fff; }

  .author-row em,
  .status-pill,
  .comment-row p small {
    padding: 3px 6px;
    border-radius: 999px;
    font-size: 10px;
    font-style: normal;
    font-weight: 760;
  }

  .author-row em {
    background: rgba(34, 183, 122, 0.12);
    color: var(--spark-green);
  }

  .status-pill,
  .comment-row p small {
    background: rgba(31, 117, 255, 0.1);
    color: var(--spark-blue-strong);
  }

  .social-post-card[data-status='failed'] .status-pill,
  .comment-row[data-status='failed'] p small {
    background: rgba(180, 35, 24, 0.1);
    color: #b42318;
  }

  .post-head small,
  .post-tools small {
    color: var(--spark-muted);
    font-size: 11px;
    line-height: 1.25;
  }

  .follow-btn {
    min-height: 32px;
    padding: 0 10px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.58);
    color: var(--spark-blue-strong);
    font-size: 11.5px;
    font-weight: 700;
  }

  :global([data-theme='dark']) .follow-btn { background: rgba(255,255,255,.055); }

  .follow-btn.active {
    background: rgba(31, 117, 255, 0.1);
    border-color: rgba(31, 117, 255, 0.28);
  }

  .post-body {
    margin: 0;
    color: var(--spark-ink);
    font-size: 13.5px;
    line-height: 1.6;
  }

  :global([data-theme='dark']) .post-body { color: #e5edff; }

  .media-grid { display: grid; gap: 8px; }

  .media-image,
  .media-file {
    overflow: hidden;
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    background: rgba(248, 251, 255, 0.72);
  }

  .media-image { display: block; text-decoration: none; }

  :global([data-theme='dark']) .media-image,
  :global([data-theme='dark']) .media-file { background: rgba(255,255,255,.045); }

  .media-image :global(.spark-optimized-image) { min-height: 180px; }
  .media-image :global(.spark-optimized-image img) { max-height: 420px; }

  .media-file {
    display: flex;
    gap: 9px;
    align-items: center;
    padding: 11px;
    color: var(--spark-blue-strong);
    text-decoration: none;
  }

  .media-file span { display: grid; gap: 2px; min-width: 0; }

  .media-file strong {
    overflow: hidden;
    color: var(--spark-navy);
    font-size: 12.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global([data-theme='dark']) .media-file strong { color: #fff; }

  .media-file small { color: var(--spark-muted); font-size: 11px; }

  .tag-row,
  .post-actions,
  .post-tools,
  .post-tools div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
  }

  .tag-row span {
    color: var(--spark-blue-strong);
    font-size: 11.5px;
    font-weight: 680;
  }

  .post-actions { padding-top: 2px; }

  .post-actions button,
  .post-tools button,
  .comment-compose button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 33px;
    padding: 0 9px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.56);
    color: var(--spark-muted);
    font-size: 11.5px;
    font-weight: 680;
  }

  :global([data-theme='dark']) .post-actions button,
  :global([data-theme='dark']) .post-tools button,
  :global([data-theme='dark']) .comment-compose button { background: rgba(255,255,255,.055); }

  .post-actions button.active {
    color: var(--spark-blue-strong);
    background: rgba(31, 117, 255, 0.1);
    border-color: rgba(31, 117, 255, 0.28);
  }

  .post-actions span { color: currentColor; opacity: .72; }

  .comment-thread {
    display: grid;
    gap: 9px;
    padding: 11px;
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    background: rgba(248, 251, 255, 0.66);
  }

  :global([data-theme='dark']) .comment-thread { background: rgba(255,255,255,.04); }

  .empty-comment {
    margin: 0;
    color: var(--spark-muted);
    font-size: 12px;
    line-height: 1.4;
  }

  .comment-row {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 8px;
    align-items: start;
  }

  .comment-avatar {
    width: 28px;
    height: 28px;
    border-radius: 11px;
    font-size: 11px;
  }

  .comment-row p {
    margin: 0;
    color: var(--spark-muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .comment-row p a {
    color: var(--spark-navy);
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
  }

  .comment-row p small { margin-left: 5px; }

  :global([data-theme='dark']) .comment-row p a { color: #fff; }

  .comment-compose {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  .comment-compose input {
    width: 100%;
    min-height: 36px;
    padding: 0 11px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.7);
    color: var(--spark-ink);
    outline: none;
    font-size: 12.5px;
  }

  :global([data-theme='dark']) .comment-compose input { background: rgba(255,255,255,.06); }

  .comment-error {
    color: #b42318;
    font-size: 11.5px;
  }

  button:disabled,
  input:disabled {
    cursor: not-allowed;
    opacity: .58;
  }

  .post-tools {
    justify-content: space-between;
    padding-top: 2px;
  }

  @media (max-width: 520px) {
    .social-post-card { padding: 12px; border-radius: 20px; }
    .post-head { grid-template-columns: 38px minmax(0, 1fr); }
    .follow-btn { grid-column: 2; width: fit-content; }
    .avatar { width: 36px; height: 36px; border-radius: 14px; }
    .post-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .post-actions button { width: 100%; }
  }
</style>
