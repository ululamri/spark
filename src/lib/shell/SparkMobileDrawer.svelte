<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { sparkNavItems } from '$lib/content/spark-navigation';
  import { appState } from '$state/app-state.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';

  const drawerLinks = sparkNavItems.filter((item) => item.key !== 'gateway');
</script>

{#if appState.mobileMenuOpen}
  <button class="spark-mobile-scrim" transition:fade type="button" aria-label="Tutup menu" onclick={() => (appState.mobileMenuOpen = false)}></button>
  <aside class="spark-mobile-drawer" transition:fly={{ x: 28, duration: 180 }}>
    <div class="drawer-head">
      <strong>Menu Spark</strong>
      <button type="button" aria-label="Tutup menu" onclick={() => (appState.mobileMenuOpen = false)}>
        <SparkIcon name="x" size={18} />
      </button>
    </div>

    {#each drawerLinks as link}
      <a href={link.href} onclick={() => (appState.mobileMenuOpen = false)}>
        <span><SparkIcon name={link.icon} size={18} /></span>
        <div>
          <strong>{link.label}</strong>
          <small>{link.copy}</small>
        </div>
      </a>
    {/each}
  </aside>
{/if}
