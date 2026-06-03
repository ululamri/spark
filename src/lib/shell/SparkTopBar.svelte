<script lang="ts">
  import SparkAccountMenu from '$ui/SparkAccountMenu.svelte';
  import SparkBrand from '$lib/ui/SparkBrand.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
  import SparkNotificationCenter from '$ui/SparkNotificationCenter.svelte';
  import SparkThemeToggle from '$ui/SparkThemeToggle.svelte';
  import { sparkMessages } from '$lib/messaging/spark-messaging-model';
  import { appState } from '$lib/state/app-state.svelte';
  import { messageState } from '$state/message-state.svelte';

  const unreadMessages = $derived(sparkMessages.filter((message) => !messageState.readMessageIds.includes(message.id)).length);
</script>

<header class="spark-topbar production-topbar topbar-v35b1">
  <SparkBrand />

  <div class="spark-topbar-center production-search-hint">
    <SparkIcon name="search" size={16} />
    <span>Cari pelajaran, latihan, pesan, atau resource</span>
  </div>

  <div class="spark-topbar-actions">
    <SparkNotificationCenter />
    <a class="spark-icon-btn inbox-trigger" href="/inbox" aria-label="Pesan">
      <SparkIcon name="messages" size={18} />
      {#if unreadMessages > 0}<span class="inbox-count">{unreadMessages}</span>{:else}<span class="inbox-dot"></span>{/if}
    </a>
    <div class="desktop-only"><SparkThemeToggle compact /></div>
    <a class="spark-icon-btn desktop-only" href="/settings" aria-label="Pengaturan"><SparkIcon name="settings" size={18} /></a>
    <div class="desktop-only"><SparkAccountMenu /></div>
    <button class="spark-icon-btn mobile-only" type="button" aria-label="Menu" aria-expanded={appState.mobileMenuOpen} onclick={() => (appState.mobileMenuOpen = !appState.mobileMenuOpen)}>
      <SparkIcon name="menu" size={20} />
    </button>
  </div>
</header>
