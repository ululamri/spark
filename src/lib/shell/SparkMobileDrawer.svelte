<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { sparkMessages } from '$lib/messaging/spark-messaging-model';
  import { appState } from '$state/app-state.svelte';
  import { betaSession, getModeLabel, logoutBetaSession } from '$state/beta-session-state.svelte';
  import { messageState } from '$state/message-state.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
  import SparkThemeToggle from '$ui/SparkThemeToggle.svelte';

  const unreadMessages = $derived(sparkMessages.filter((message) => !messageState.readMessageIds.includes(message.id)).length);

  const accountLinks = $derived(
    betaSession.user
      ? [
          { href: '/dashboard', icon: 'dashboard', title: 'Hari ini', copy: 'Fokus belajar terdekat' },
          { href: '/profile', icon: 'user-round', title: 'Saya', copy: 'Profil dan Passport' },
          { href: '/inbox', icon: 'messages', title: 'Inbox', copy: unreadMessages > 0 ? `${unreadMessages} pesan baru` : 'Pesan dan arahan' }
        ]
      : [
          { href: '/login', icon: 'login', title: 'Masuk', copy: 'Simpan perjalanan belajar' },
          { href: '/core', icon: 'book-open', title: 'Belajar', copy: 'Mulai dari fondasi' }
        ]
  );

  const utilityLinks = [
    { href: '/help', icon: 'help', title: 'Bantuan', copy: 'FAQ dan panduan' },
    { href: '/docs', icon: 'code', title: 'Dokumentasi', copy: 'Teknis dan non-teknis' },
    { href: '/terms', icon: 'shield', title: 'Ketentuan', copy: 'Terms & conditions' }
  ];

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

  <aside class="spark-mobile-drawer production-drawer pass35b2-drawer" transition:fly={{ x: 24, duration: 160 }} aria-label="Menu Spark">
    <div class="drawer-head production-drawer-head pass35b2-drawer-head">
      <strong>Menu</strong>
      <button type="button" aria-label="Tutup menu" onclick={close}><SparkIcon name="x" size={17} /></button>
    </div>

    <div class="drawer-account-card production-drawer-account pass35b2-drawer-account">
      {#if betaSession.user}
        <span>{betaSession.user.name.slice(0, 1)}</span>
        <div>
          <strong>{betaSession.user.name}</strong>
          <small>{getModeLabel(betaSession.user.mode)}</small>
        </div>
      {:else}
        <span><SparkIcon name="sparkles" size={17} /></span>
        <div>
          <strong>Karyra Spark</strong>
          <small>Belajar bertahap dengan ritme aman</small>
        </div>
      {/if}
    </div>

    <div class="production-drawer-theme pass35b2-drawer-theme">
      <span>Tampilan</span>
      <SparkThemeToggle />
    </div>

    <nav class="drawer-link-stack production-drawer-links pass35b2-drawer-links" aria-label="Menu utama">
      {#each accountLinks as link}
        <a href={link.href} onclick={close}>
          <span><SparkIcon name={link.icon} size={17} /></span>
          <div><strong>{link.title}</strong><small>{link.copy}</small></div>
          <SparkIcon name="chevron-right" size={14} />
        </a>
      {/each}

      {#each utilityLinks as link}
        <a href={link.href} onclick={close}>
          <span><SparkIcon name={link.icon} size={17} /></span>
          <div><strong>{link.title}</strong><small>{link.copy}</small></div>
          <SparkIcon name="chevron-right" size={14} />
        </a>
      {/each}

      {#if betaSession.user}
        <button class="drawer-logout" type="button" onclick={logout}>
          <span><SparkIcon name="logout" size={17} /></span>
          <div><strong>Keluar</strong><small>Selesai di perangkat ini</small></div>
          <SparkIcon name="chevron-right" size={14} />
        </button>
      {/if}
    </nav>
  </aside>
{/if}
