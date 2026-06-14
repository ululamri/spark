<script lang="ts">
  import { onMount } from 'svelte';
  import SparkSocialPostCard from '$lib/ui/social/SparkSocialPostCard.svelte';
  import { fetchBackendSocialProfile, hydrateSocialFeedFromBackend } from '$lib/social/social-backend-gateway';
  import { toggleSocialFollow } from '$lib/social/local-social-gateway';
  import { getSocialProfile, SOCIAL_VIEWER_ID } from '$lib/social/social-model';
  import { restoreSocialState, saveSocialState, socialState } from '$lib/social/social-state.svelte';
  import type { SocialProfile } from '$lib/social/social-types';

  type Props = { data: { profileId: string } };
  let { data }: Props = $props();

  let profile = $state<SocialProfile>(getSocialProfile(data.profileId));
  let loading = $state(true);
  let error = $state('');

  onMount(() => {
    restoreSocialState();
    void loadProfileSurface();
  });

  $effect(() => {
    socialState.posts.length;
    socialState.comments;
    socialState.followedProfileIds.length;
    if (socialState.ready) saveSocialState();
  });

  async function loadProfileSurface() {
    loading = true;
    error = '';
    try {
      const remoteProfile = await fetchBackendSocialProfile(data.profileId);
      if (remoteProfile) profile = remoteProfile;
      await hydrateSocialFeedFromBackend();
      profile = getSocialProfile(data.profileId);
    } catch {
      error = 'Profil masih memakai data cache lokal.';
      profile = getSocialProfile(data.profileId);
    } finally {
      loading = false;
    }
  }

  const profilePosts = $derived(
    socialState.posts
      .filter((post) => post.authorId === data.profileId && !post.viewer.hidden)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  );

  const profileStats = $derived({
    posts: profilePosts.length,
    comments: profilePosts.reduce((total, post) => total + post.stats.comments, 0),
    reactions: profilePosts.reduce(
      (total, post) => total + post.stats.support + post.stats.helpful + post.stats.inspiring,
      0
    ),
    media: profilePosts.reduce((total, post) => total + (post.media?.length ?? 0), 0)
  });

  const followed = $derived(socialState.followedProfileIds.includes(data.profileId));
  const canFollow = $derived(data.profileId !== SOCIAL_VIEWER_ID);
</script>

<svelte:head>
  <title>{profile.name} — Community Profile — Karyra Spark</title>
</svelte:head>

<main class="profile-page" data-karyra-social-profile="public-profile-surface">
  <a class="back-link" href="/community?tab=diskusi#diskusi">← Kembali ke diskusi</a>

  <section class="profile-hero">
    <div class="avatar" aria-hidden="true">{profile.avatarLabel}</div>
    <div class="profile-copy">
      <span class="eyebrow">Profil komunitas</span>
      <h1>{profile.name}</h1>
      <p class="handle">{profile.handle} · {profile.location ?? 'Komunitas Spark'}</p>
      <p>{profile.bio ?? 'Profil komunitas Spark.'}</p>
      {#if error}
        <small class="profile-note">{error}</small>
      {:else if loading}
        <small class="profile-note">Menyegarkan profil komunitas...</small>
      {/if}
    </div>

    {#if canFollow}
      <button type="button" class:active={followed} onclick={() => void toggleSocialFollow(data.profileId)}>
        {followed ? 'Diikuti' : 'Ikuti'}
      </button>
    {/if}
  </section>

  <section class="profile-stats" aria-label="Statistik profil">
    <article>
      <strong>{profileStats.posts}</strong>
      <span>post</span>
    </article>
    <article>
      <strong>{profileStats.comments}</strong>
      <span>komentar</span>
    </article>
    <article>
      <strong>{profileStats.reactions}</strong>
      <span>reaksi</span>
    </article>
    <article>
      <strong>{profileStats.media}</strong>
      <span>media</span>
    </article>
  </section>

  <section class="profile-feed" aria-label="Post dari profil">
    <div class="section-head">
      <span>Aktivitas publik</span>
      <h2>Post dari {profile.name}</h2>
      <p>Hanya post publik/komunitas yang terlihat di permukaan profil ini.</p>
    </div>

    {#if profilePosts.length === 0}
      <div class="empty-state">
        <strong>Belum ada post publik dari profil ini</strong>
        <p>Begitu author membuat post di Ruang Diskusi, aktivitasnya akan tampil di sini.</p>
      </div>
    {:else}
      <div class="post-list">
        {#each profilePosts as post (post.id)}
          <SparkSocialPostCard {post} />
        {/each}
      </div>
    {/if}
  </section>
</main>

<style>
  .profile-page {
    display: grid;
    gap: 16px;
    width: min(1040px, calc(100% - 28px));
    margin: 0 auto;
    padding: 92px 0 36px;
  }

  .back-link {
    width: fit-content;
    color: var(--spark-blue-strong);
    font-size: 12.5px;
    font-weight: 760;
    text-decoration: none;
  }

  .profile-hero,
  .profile-stats article,
  .profile-feed,
  .empty-state {
    border: 1px solid var(--spark-line);
    background: var(--spark-card);
    box-shadow: 0 12px 30px rgba(5, 9, 78, 0.06);
  }

  .profile-hero {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    padding: 18px;
    border-radius: 28px;
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    border-radius: 24px;
    color: #fff;
    background: linear-gradient(135deg, var(--spark-blue), var(--spark-blue-strong));
    font-size: 24px;
    font-weight: 880;
  }

  .profile-copy {
    display: grid;
    gap: 5px;
    min-width: 0;
  }

  .eyebrow {
    color: var(--spark-blue-strong);
    font-size: 11px;
    font-weight: 820;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin: 0;
  }

  h1 {
    color: var(--spark-navy);
    font-size: clamp(26px, 4vw, 42px);
    line-height: 1.02;
    letter-spacing: -.04em;
  }

  h2 {
    color: var(--spark-navy);
    font-size: 20px;
    line-height: 1.1;
  }

  :global([data-theme='dark']) h1,
  :global([data-theme='dark']) h2 { color: #fff; }

  .handle,
  .profile-copy p,
  .section-head p,
  .empty-state p,
  .profile-note {
    color: var(--spark-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .profile-copy p {
    max-width: 68ch;
  }

  .profile-note {
    font-size: 11.5px;
  }

  .profile-hero button {
    min-height: 38px;
    padding: 0 14px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.58);
    color: var(--spark-blue-strong);
    font-size: 12px;
    font-weight: 780;
  }

  :global([data-theme='dark']) .profile-hero button { background: rgba(255,255,255,.055); }

  .profile-hero button.active {
    border-color: rgba(31,117,255,.32);
    background: rgba(31,117,255,.1);
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .profile-stats article {
    display: grid;
    gap: 3px;
    padding: 14px;
    border-radius: 20px;
  }

  .profile-stats strong {
    color: var(--spark-navy);
    font-size: 24px;
    line-height: 1;
  }

  :global([data-theme='dark']) .profile-stats strong { color: #fff; }

  .profile-stats span {
    color: var(--spark-muted);
    font-size: 11.5px;
    font-weight: 720;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .profile-feed {
    display: grid;
    gap: 13px;
    padding: 15px;
    border-radius: 26px;
  }

  .section-head {
    display: grid;
    gap: 5px;
  }

  .section-head span {
    color: var(--spark-blue-strong);
    font-size: 11px;
    font-weight: 820;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .post-list {
    display: grid;
    gap: 12px;
  }

  .empty-state {
    display: grid;
    gap: 6px;
    padding: 18px;
    border-radius: 20px;
    text-align: center;
  }

  .empty-state strong {
    color: var(--spark-navy);
    font-size: 14px;
  }

  :global([data-theme='dark']) .empty-state strong { color: #fff; }

  @media (max-width: 720px) {
    .profile-page { padding-top: 78px; }
    .profile-hero { grid-template-columns: 64px minmax(0, 1fr); }
    .avatar { width: 60px; height: 60px; border-radius: 20px; font-size: 20px; }
    .profile-hero button { grid-column: 2; width: fit-content; }
    .profile-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
