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

  let hasAttemptedHydrate = $state(false);
  let isRefreshingFeed = $state(false);
  let lastRefreshCopy = $state('');

  async function refreshSocialFeed(force = false) {
    if (isRefreshingFeed) return;

    isRefreshingFeed = true;
    try {
      const hydrated = await hydrateSocialFeedFromBackend({ force, staleMs: 45_000 });
      if (hydrated) {
        lastRefreshCopy = force ? 'Feed disegarkan manual.' : 'Feed tersinkron dari Spark API.';
      }
    } finally {
      hasAttemptedHydrate = true;
      isRefreshingFeed = false;
    }
  }

  onMount(() => {
    restoreSocialState();
    void refreshSocialFeed(false);
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
  const feedStatusCopy = $derived(
    socialBackendStatus.error ||
      (isRefreshingFeed
        ? socialState.posts.length > 0
          ? 'Menyegarkan feed tanpa mengosongkan tampilan.'
          : 'Mengambil feed komunitas dari Spark API...'
        : lastRefreshCopy || (socialBackendStatus.ready ? 'Feed siap dari cache singkat.' : 'Cache lokal siap sambil menunggu backend.'))
  );
</script>

<div class="social-layer" data-karyra-social-layer="public-social-api-bridge">
  <div class="social-layer-head">
    <SparkSectionHeader
      eyebrow="Diskusi komunitas"
      title="Tanya, koordinasi, dan berbagi progress."
      copy="Ruang diskusi publik untuk pertanyaan, koordinasi workshop, rujukan aman, catatan belajar, dan showcase Lab. Feed dibaca dari Spark API saat backend tersedia, lalu jatuh kembali ke cache lokal bila jaringan belum siap."
    />

    <div class="social-event-card">
      <span><SparkIcon name="bell" size={17} /></span>
      <div>
        <strong>{socialUnreadEventCount} aktivitas baru</strong>
        <small>Aktivitas ini menjadi jejak sinkronisasi feed, komentar, reaksi, follow, hide, dan report.</small>
      </div>
      <button type="button" onclick={markSocialEventsRead}>Tandai</button>
    </div>
  </div>

  <div class="social-layout">
    <aside class="social-left-rail">
      <SparkSocialSafetyPanel />

      <div class="social-filter-card">
        <strong>Filter diskusi</strong>
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

      <div class="feed-sync-card" data-syncing={isRefreshingFeed} data-error={Boolean(socialBackendStatus.error)}>
        <span><SparkIcon name={socialBackendStatus.error ? 'alert-triangle' : 'refresh-cw'} size={15} /></span>
        <p>{feedStatusCopy}</p>
        <button type="button" disabled={isRefreshingFeed} onclick={() => void refreshSocialFeed(true)}>
          {isRefreshingFeed ? 'Menyegarkan...' : 'Refresh'}
        </button>
      </div>

      <div class="social-feed-list" aria-live="polite">
        {#if showInitialFeedLoading}
          <div class="social-empty-state loading">
            <SparkIcon name="loader" size={22} />
            <strong>Mengambil feed komunitas...</strong>
            <p>Cache lokal tetap dipakai setelah data pertama siap.</p>
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
    </div>
  </div>
</div>

<style>
  .social-layer {
    display: grid;
    gap: 16px;
  }

  .social-layer-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.46fr);
    gap: 14px;
    align-items: end;
  }

  .social-event-card,
  .feed-sync-card {
    border: 1px solid var(--spark-line);
    border-radius: 20px;
    background: var(--spark-card);
  }

  .social-event-card {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 12px;
  }

  .social-event-card > span,
  .feed-sync-card > span {
    display: grid;
    place-items: center;
    color: var(--spark-blue-strong);
    background: rgba(31, 117, 255, 0.1);
  }

  .social-event-card > span {
    width: 38px;
    height: 38px;
    border-radius: 14px;
  }

  .social-event-card strong,
  .social-filter-card strong {
    display: block;
    color: var(--spark-navy);
    font-size: 14px;
    line-height: 1.15;
  }

  :global([data-theme='dark']) .social-event-card strong,
  :global([data-theme='dark']) .social-filter-card strong { color: #fff; }

  .social-event-card small {
    display: block;
    margin-top: 3px;
    color: var(--spark-muted);
    font-size: 11.5px;
    line-height: 1.35;
  }

  .social-event-card button,
  .feed-sync-card button {
    min-height: 32px;
    padding: 0 10px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.58);
    color: var(--spark-blue-strong);
    font-size: 11.5px;
    font-weight: 700;
  }

  .feed-sync-card button:disabled {
    opacity: .68;
  }

  :global([data-theme='dark']) .social-event-card button,
  :global([data-theme='dark']) .feed-sync-card button { background: rgba(255,255,255,.055); }

  .social-layout {
    display: grid;
    grid-template-columns: minmax(220px, 0.38fr) minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .social-left-rail,
  .social-feed-column,
  .social-feed-list {
    display: grid;
    gap: 12px;
  }

  .social-left-rail {
    position: sticky;
    top: 92px;
  }

  .social-filter-card {
    display: grid;
    gap: 10px;
    padding: 13px;
    border: 1px solid var(--spark-line);
    border-radius: 20px;
    background: var(--spark-card);
  }

  .social-filter-card div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .social-filter-card button {
    min-height: 31px;
    padding: 0 10px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255,255,255,.58);
    color: var(--spark-muted);
    font-size: 11.5px;
    font-weight: 680;
  }

  :global([data-theme='dark']) .social-filter-card button { background: rgba(255,255,255,.055); }

  .social-filter-card button.active {
    color: var(--spark-blue-strong);
    border-color: rgba(31,117,255,.3);
    background: rgba(31,117,255,.1);
  }

  .feed-sync-card {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
    padding: 10px 11px;
  }

  .feed-sync-card > span {
    width: 30px;
    height: 30px;
    border-radius: 12px;
  }

  .feed-sync-card[data-error='true'] > span {
    color: #b42318;
    background: rgba(180, 35, 24, 0.1);
  }

  .feed-sync-card p {
    margin: 0;
    color: var(--spark-muted);
    font-size: 11.8px;
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

  .social-empty-state.loading {
    border-style: solid;
  }

  .social-empty-state strong {
    color: var(--spark-navy);
  }

  :global([data-theme='dark']) .social-empty-state {
    background: rgba(255,255,255,.04);
  }

  :global([data-theme='dark']) .social-empty-state strong { color: #fff; }

  @media (max-width: 860px) {
    .social-layer-head,
    .social-layout {
      grid-template-columns: 1fr;
    }

    .social-left-rail {
      position: static;
    }
  }

  @media (max-width: 560px) {
    .feed-sync-card {
      grid-template-columns: 30px minmax(0, 1fr);
    }

    .feed-sync-card button {
      grid-column: 2;
      width: fit-content;
    }
  }
</style>
