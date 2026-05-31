<script lang="ts">
  import { page } from '$app/state';
  import { isNavActive, primaryMobileNavItems } from '$lib/content/spark-navigation';
  import SparkIcon from '$ui/SparkIcon.svelte';
</script>

<nav class="spark-bottom-nav" aria-label="Navigasi mobile">
  {#each primaryMobileNavItems as item}
    <a href={item.href} class:active={isNavActive(page.url.pathname, item.href)}>
      <SparkIcon name={item.icon} size={19} />
      <span>{item.shortLabel}</span>
    </a>
  {/each}
</nav>
