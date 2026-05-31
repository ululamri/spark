<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { appState } from '$state/app-state.svelte';

  const links = [
    { href: '/core', label: 'Jalur Belajar' },
    { href: '/lab', label: 'Practice Lab' },
    { href: '/community', label: 'Workshop & Komunitas' },
    { href: '/profile', label: 'Profile & Passport' },
    { href: '/hub', label: 'Hub Gateway' },
    { href: '/settings', label: 'Pengaturan' }
  ];
</script>

{#if appState.mobileMenuOpen}
  <button class="spark-mobile-scrim" transition:fade type="button" aria-label="Tutup menu" onclick={() => (appState.mobileMenuOpen = false)}></button>
  <aside class="spark-mobile-drawer" transition:fly={{ x: 28, duration: 180 }}>
    <strong>Menu Spark</strong>
    {#each links as link}
      <a href={link.href} onclick={() => (appState.mobileMenuOpen = false)}>{link.label}</a>
    {/each}
  </aside>
{/if}
