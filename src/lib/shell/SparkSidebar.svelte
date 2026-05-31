<script lang="ts">
  import { page } from '$app/state';
  import { getHubUrl } from '$lib/config/spark-topology';
  import { isNavActive, sparkNavItems } from '$lib/content/spark-navigation';
  import { getLearningProgressPercent, getReadinessScore } from '$state/learning-state.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
</script>

<aside class="spark-sidebar">
  <div class="spark-sidebar-head">
    <span>Gateway</span>
    <strong>Blockchain, Web3, Starknet.</strong>
    <p>Belajar, praktik, workshop, passport, dan Hub dalam satu wadah.</p>
  </div>

  <nav class="spark-sidebar-nav" aria-label="Navigasi utama">
    {#each sparkNavItems.filter((item) => item.key !== 'settings') as item}
      <a href={item.href} class:active={isNavActive(page.url.pathname, item.href)}>
        <span><SparkIcon name={item.icon} size={19} /></span>
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
    <span><SparkIcon name="compass" size={18} /></span>
    <span>
      <strong>Hub Gateway</strong>
      <small>Resource, apps, tools, dan komunitas setelah siap.</small>
    </span>
  </a>

  <a class="spark-sidebar-settings" href="/settings" class:active={isNavActive(page.url.pathname, '/settings')}>
    <SparkIcon name="settings" size={17} />
    <span>Settings</span>
  </a>
</aside>
