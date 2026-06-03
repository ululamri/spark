<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { sparkNavItems } from '$lib/content/spark-navigation';
  import { sparkMessages } from '$lib/messaging/spark-messaging-model';
  import { appState } from '$state/app-state.svelte';
  import { betaSession, getModeLabel, logoutBetaSession } from '$state/beta-session-state.svelte';
  import { messageState } from '$state/message-state.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';

  const drawerLinks = sparkNavItems.filter((item) => !['gateway', 'core', 'lab', 'profile'].includes(item.key));
  const unreadMessages = $derived(sparkMessages.filter((message) => !messageState.readMessageIds.includes(message.id)).length);

  function close() {
    appState.mobileMenuOpen = false;
  }

  function logout() {
    logoutBetaSession();
    close();
  }
</script>

{#if appState.mobileMenuOpen}
  <button class="spark-mobile-scrim" transition:fade type="button" aria-label="Tutup menu" onclick={close}></button>

  <aside class="spark-mobile-drawer" transition:fly={{ x: 24, duration: 160 }} aria-label="Menu Spark">
    <div class="drawer-head">
      <div>
        <strong>Menu</strong>
        <small>Lanjut dari mana?</small>
      </div>
      <button type="button" aria-label="Tutup menu" onclick={close}><SparkIcon name="x" size={17} /></button>
    </div>

    <div class="drawer-account-card">
      {#if betaSession.user}
        <span>{betaSession.user.name.slice(0, 1)}</span>
        <div>
          <strong>{betaSession.user.name}</strong>
          <small>{getModeLabel(betaSession.user.mode)}</small>
        </div>
      {:else}
        <span><SparkIcon name="sparkles" size={17} /></span>
        <div>
          <strong>Mulai dari Spark</strong>
          <small>Belajar Starknet dengan aman.</small>
        </div>
      {/if}
    </div>

    <div class="drawer-quick-actions" aria-label="Aksi cepat">
      <a href="/core" onclick={close}><SparkIcon name="book-open" size={15} /> Belajar</a>
      <a href="/lab" onclick={close}><SparkIcon name="flask-conical" size={15} /> Lab</a>
      <a href="/profile" onclick={close}><SparkIcon name="user-round" size={15} /> Passport</a>
    </div>

    <div class="drawer-link-stack">
      {#if !betaSession.user}
        <a href="/login" onclick={close}>
          <span><SparkIcon name="login" size={17} /></span>
          <div><strong>Masuk</strong><small>Lanjutkan perjalanan belajar.</small></div>
        </a>
      {:else}
        <a href="/dashboard" onclick={close}>
          <span><SparkIcon name="dashboard" size={17} /></span>
          <div><strong>Hari ini</strong><small>Lihat langkah paling dekat.</small></div>
        </a>
      {/if}

      <a href="/inbox" onclick={close}>
        <span><SparkIcon name="messages" size={17} /></span>
        <div><strong>Pesan</strong><small>{unreadMessages > 0 ? `${unreadMessages} pesan baru` : 'Tidak ada pesan baru'}</small></div>
      </a>

      {#each drawerLinks as link}
        <a href={link.href} onclick={close}>
          <span><SparkIcon name={link.icon} size={17} /></span>
          <div><strong>{link.shortLabel}</strong><small>{link.copy}</small></div>
        </a>
      {/each}

      {#if betaSession.user}
        <button class="drawer-logout" type="button" onclick={logout}>
          <span><SparkIcon name="logout" size={17} /></span>
          <div><strong>Keluar</strong><small>Selesai belajar di perangkat ini.</small></div>
        </button>
      {/if}
    </div>
  </aside>
{/if}
