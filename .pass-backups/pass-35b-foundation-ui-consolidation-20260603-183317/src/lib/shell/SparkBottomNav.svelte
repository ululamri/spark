<script lang="ts">
  import { page } from '$app/state';
  import { isNavActive, primaryMobileNavItems } from '$lib/content/spark-navigation';
  import { betaSession } from '$state/beta-session-state.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';

  const dashboardItem = {
    href: '/dashboard',
    shortLabel: 'Home',
    icon: 'dashboard'
  };

  const guestGatewayItem = {
    href: '/',
    shortLabel: 'Home',
    icon: 'home'
  };

  const mobileItems = $derived([
    betaSession.user ? dashboardItem : guestGatewayItem,
    ...primaryMobileNavItems
      .filter((item) => item.key !== 'gateway')
      .map((item) => ({
        href: item.href,
        shortLabel: item.shortLabel,
        icon: item.icon
      }))
  ]);
</script>

<nav class="spark-bottom-nav" aria-label="Navigasi mobile">
  {#each mobileItems as item}
    <a href={item.href} class:active={isNavActive(page.url.pathname, item.href)}>
      <SparkIcon name={item.icon} size={19} />
      <span>{item.shortLabel}</span>
    </a>
  {/each}
</nav>
