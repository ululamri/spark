<script lang="ts">
  import { page } from '$app/state';
  import { getLearningProgressPercent, getReadinessScore } from '$state/learning-state.svelte';
  import { getHubUrl } from '$lib/config/spark-topology';

  const nav = [
    { href: '/', label: 'Gateway', copy: 'Ringkasan Spark', icon: '⌂' },
    { href: '/core', label: 'Learn', copy: 'Jalur Belajar Spark', icon: '◆' },
    { href: '/lab', label: 'Practice', copy: 'Lab dan simulasi', icon: '⌁' },
    { href: '/community', label: 'Community', copy: 'Workshop dan cohort', icon: '●' },
    { href: '/profile', label: 'Profile', copy: 'Passport & progress', icon: '◉' },
    { href: '/hub', label: 'Hub', copy: 'Eksplorasi ekosistem', icon: '✦' }
  ];

  function isActive(href: string) {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }
</script>

<aside class="spark-sidebar">
  <div class="spark-sidebar-head">
    <span>Gateway</span>
    <strong>Blockchain, Web3, Starknet.</strong>
    <p>Belajar, praktik, workshop, passport, dan Hub dalam satu wadah.</p>
  </div>

  <nav class="spark-sidebar-nav" aria-label="Navigasi utama">
    {#each nav as item}
      <a href={item.href} class:active={isActive(item.href)}>
        <span>{item.icon}</span>
        <div>
          <strong>{item.label}</strong>
          <small>{item.copy}</small>
        </div>
      </a>
    {/each}
  </nav>

  <a class="spark-sidebar-status" href="/profile">
    <div class="spark-ring" style={`--value: ${getReadinessScore()}`}>{getReadinessScore()}%</div>
    <div>
      <strong>Readiness Passport</strong>
      <p>{getLearningProgressPercent()}% belajar · lihat detail di Profile.</p>
    </div>
  </a>

  <a class="spark-sidebar-hub" href={getHubUrl('/')}>
    <span>✦</span>
    <span>
      <strong>Hub Gateway</strong>
      <small>Resource, apps, tools, dan komunitas setelah siap.</small>
    </span>
  </a>
</aside>
