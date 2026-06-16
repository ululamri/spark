<script lang="ts">
  import { onMount } from 'svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkSocialComposer from './SparkSocialComposer.svelte';
  import SparkSocialPostCardWithAvatar from './SparkSocialPostCardWithAvatar.svelte';
  import SparkSocialSafetyPanel from './SparkSocialSafetyPanel.svelte';
  import { hydrateSocialFeedFromBackend, socialBackendStatus } from '$lib/social/social-backend-gateway';
  import { socialPostKindLabels } from '$lib/social/social-model';
  import {
    markSocialEventsRead,
    restoreSocialState,
    saveSocialState,
    setSocialFilter,
    socialState
  } from '$lib/social/social-state.svelte';
  import type { SocialFeedFilter } from '$lib/social/social-types';

  const filters: SocialFeedFilter[] = ['all', 'progress', 'question', 'resource', 'workshop', 'lab'];
  const AUTO_REFRESH_MS = 30_000;

  let hasAttemptedHydrate = $state(false);
  let isRefreshingFeed = $state(false);
  let isLoadingMoreFeed = $state(false);
  let lastRefreshCopy = $state('');

  function refreshFeedLimit() {
    return Math.min(50, Math.max(20, socialState.posts.length || 20));
  }

  async function refreshSocialFeed(force = false, announce = true) {
    if (isRefreshingFeed || isLoadingMoreFeed) return;

    isRefreshingFeed = true;
    try {
      const hydrated = await hydrateSocialFeedFromBackend({ force, staleMs: 45_000, limit: refreshFeedLimit() });
      if (hydrated && announce) {
        lastRefreshCopy = force ? 'Feed disegarkan.' : 'Feed tersinkron.';
      }
    } finally {
      hasAttemptedHydrate = true;
      isRefreshingFeed = false;
    }
  }

  async function loadMoreSocialFeed() {
    if (isRefreshingFeed || isLoadingMoreFeed || !socialBackendStatus.nextCursor) return;

    isLoadingMoreFeed = true;
    try {
      const hydrated = await hydrateSocialFeedFromBackend({
        append: true,
        cursor: socialBackendStatus.nextCursor,
        force: true,
        limit: 15
      });
      if (hydrated) {
        lastRefreshCopy = socialBackendStatus.hasMore ? 'Diskusi lama ditambahkan.' : 'Semua diskusi lama sudah tampil.';
      }
    } finally {
      isLoadingMoreFeed = false;
    }
  }

  function refreshWhenActive() {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    void refreshSocialFeed(true, false);
  }

  onMount(() => {
    restoreSocialState();
    void refreshSocialFeed(false);

    const interval = window.setInterval(refreshWhenActive, AUTO_REFRESH_MS);
    window.addEventListener('focus', refreshWhenActive);
    document.addEventListener('visibilitychange', refreshWhenActive);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenActive);
      document.removeEventListener('visibilitychange', refreshWhenActive);
    };
  });

  $effect(() => {
    socialState.posts.length;
    socialState.events.length;
    socialState.followedProfileIds.length;
    socialState.activeFilter;
    if (socialState.ready) saveSocialState();
  });

  const socialUnreadEventCount = $derived(socialState.events.filter((event) => !event.read).length);

  const visiblePosts = $derived(
    socialState.posts
      .filter((post) => !post.viewer.hidden)
      .filter((post) => socialState.activeFilter === 'all' || post.kind === socialState.activeFilter)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  );

  const showInitialFeedLoading = $derived(isRefreshingFeed && !hasAttemptedHydrate && socialState.posts.length === 0);
  const showEmptyFeedState = $derived(!showInitialFeedLoading && visiblePosts.length === 0);
  const showPaginationCard = $derived(hasAttemptedHydrate && visiblePosts.length > 0);
  const feedStatusCopy = $derived(
    socialBackendStatus.error ||
      (isLoadingMoreFeed
        ? 'Mengambil diskusi lama...'
        : isRefreshingFeed
          ? socialState.posts.length > 0
            ? 'Menyegarkan...'
            : 'Mengambil feed...'
          : lastRefreshCopy || (socialBackendStatus.ready ? 'Auto-sync aktif.' : 'Menunggu koneksi backend.'))
  );
</script>

<div class="social-layer" data-karyra-social-layer="public-social-api-bridge">
  <div class="social-layer-head">
    <SparkSectionHeader
      eyebrow="Diskusi komunitas"
      title="Tanya, koordinasi, dan berbagi progress."
      copy="Ruang diskusi publik untuk pertanyaan, koordinasi workshop, rujukan aman, catatan belajar, dan showcase Lab. Feed dibaca bertahap dan disegarkan otomatis agar tetap ringan."
    />

    <div class="social-event-card">
      <span><SparkIcon name="bell" size={17} /></span>
      <div>
        <strong>{socialUnreadEventCount} aktivitas baru</strong>
        <small>Jejak sinkronisasi feed, komentar, reaksi, follow, hide, dan report.</small>
      </div>
      <button type="button" onclick={markSocialEventsRead}>Tandai</button>
    </div>
  </div>

  <div class="social-layout">
    <aside class="social-left-rail">
      <SparkSocialSafetyPanel />

      <div class="social-filter-card">
        <strong>Filter</strong>
        <div>
          {#each filters as filter}
            <button type="button" class:active={socialState.activeFilter === filter} onclick={() => setSocialFilter(filter)}>
              {socialPostKindLabels[filter]}
            </button>
          {/each}
        </div>
      </div>
    </aside>

    <div class="social-feed-column">
      <SparkSocialComposer />

      <div class="feed-mini-toolbar" data-syncing={isRefreshingFeed || isLoadingMoreFeed} data-error={Boolean(socialBackendStatus.error)}>
        <span>{feedStatusCopy}</span>
        <button type="button" disabled={isRefreshingFeed || isLoadingMoreFeed} onclick={() => void refreshSocialFeed(true)} aria-label="Refresh feed">
          <SparkIcon name={isRefreshingFeed ? 'loader' : 'refresh-cw'} size={14} />
        </button>
      </div>

      <div class="social-feed-list" aria-live="polite">
        {#if showInitialFeedLoading}
          <div class="social-empty-state loading">
            <SparkIcon name="loader" size={22} />
            <strong>Mengambil feed komunitas...</strong>
            <p>Tampilan lama tetap dipakai setelah data pertama siap.</p>
          </div>
        {:else if showEmptyFeedState}
          <div class="social-empty-state">
            <SparkIcon name="messages" size={22} />
            <strong>Belum ada diskusi di filter ini</strong>
            <p>Silakan pilih filter lain atau mulai percakapan dari composer.</p>
          </div>
        {:else}
          {#each visiblePosts as post (post.id)}
            <SparkSocialPostCardWithAvatar {post} />
          {/each}
        {/if}
      </div>

      {#if showPaginationCard}
        <div class="feed-pagination-card" data-exhausted={!socialBackendStatus.hasMore}>
          <p>{socialBackendStatus.hasMore ? 'Muat diskusi lama saat dibutuhkan.' : 'Semua diskusi tersedia sudah tampil.'}</p>
          {#if socialBackendStatus.hasMore}
            <button type="button" disabled={isRefreshingFeed || isLoadingMoreFeed} onclick={() => void loadMoreSocialFeed()}>
              {isLoadingMoreFeed ? 'Memuat...' : 'Muat lama'}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .social-layer { display: grid; gap: 14px; }

  .social-layer-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.4fr);
    gap: 12px;
    align-items: end;
  }

  .social-event-card,
  .social-filter-card,
  .feed-pagination-card {
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    background: var(--spark-card);
  }

  .social-event-card {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
    padding: 10px;
  }

  .social-event-card > span {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 13px;
    color: var(--spark-blue-strong);
    background: rgba(31, 117, 255, 0.1);
  }

  .social-event-card strong,
  .social-filter-card strong {
    display: block;
    color: var(--spark-navy);
    font-size: 13px;
    line-height: 1.15;
  }

  :global([data-theme='dark']) .social-event-card strong,
  :global([data-theme='dark']) .social-filter-card strong { color: #fff; }

  .social-event-card small {
    display: block;
    margin-top: 2px;
    color: var(--spark-muted);
    font-size: 11px;
    line-height: 1.3;
  }

  .social-event-card button,
  .feed-pagination-card button,
  .feed-mini-toolbar button {
    min-height: 30px;
    padding: 0 9px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.58);
    color: var(--spark-blue-strong);
    font-size: 11px;
    font-weight: 700;
  }

  .feed-mini-toolbar button {
    display: inline-grid;
    place-items: center;
    width: 32px;
    padding: 0;
  }

  .feed-pagination-card button:disabled,
  .feed-mini-toolbar button:disabled { opacity: .68; }

  :global([data-theme='dark']) .social-event-card button,
  :global([data-theme='dark']) .feed-pagination-card button,
  :global([data-theme='dark']) .feed-mini-toolbar button { background: rgba(255,255,255,.055); }

  .social-layout {
    display: grid;
    grid-template-columns: minmax(210px, 0.34fr) minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .social-left-rail,
  .social-feed-column,
  .social-feed-list { display: grid; gap: 10px; }

  .social-left-rail { position: sticky; top: 92px; }

  .social-filter-card { display: grid; gap: 8px; padding: 10px; }

  .social-filter-card div { display: flex; flex-wrap: wrap; gap: 6px; }

  .social-filter-card button {
    min-height: 28px;
    padding: 0 8px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.48);
    color: var(--spark-muted);
    font-size: 11px;
    font-weight: 660;
  }

  :global([data-theme='dark']) .social-filter-card button { background: rgba(255,255,255,.05); }

  .social-filter-card button.active {
    color: var(--spark-blue-strong);
    border-color: rgba(31,117,255,.3);
    background: rgba(31,117,255,.1);
  }

  .feed-mini-toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 7px;
    align-items: center;
    min-height: 30px;
    padding: 0 2px;
  }

  .feed-mini-toolbar span {
    color: var(--spark-muted);
    font-size: 11px;
    line-height: 1.25;
  }

  .feed-mini-toolbar[data-error='true'] span { color: #b42318; }

  .feed-pagination-card {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: center;
    padding: 9px 10px;
  }

  .feed-pagination-card[data-exhausted='true'] {
    border-style: dashed;
    background: color-mix(in srgb, var(--spark-card) 78%, transparent);
  }

  .feed-pagination-card p {
    margin: 0;
    color: var(--spark-muted);
    font-size: 11.5px;
    line-height: 1.35;
  }

  .social-empty-state {
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 24px;
    border: 1px dashed var(--spark-line);
    border-radius: 22px;
    color: var(--spark-muted);
    background: rgba(255,255,255,.46);
    text-align: center;
  }

  .social-empty-state.loading { border-style: solid; }
  .social-empty-state strong { color: var(--spark-navy); }
  :global([data-theme='dark']) .social-empty-state { background: rgba(255,255,255,.04); }
  :global([data-theme='dark']) .social-empty-state strong { color: #fff; }

  @media (max-width: 860px) {
    .social-layer-head,
    .social-layout { grid-template-columns: 1fr; }
    .social-left-rail { position: static; }
  }

  @media (max-width: 560px) {
    .feed-pagination-card { align-items: flex-start; flex-direction: column; }
  }
</style>
