<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { sparkMessages } from '$lib/messaging/spark-messaging-model';
  import { appState } from '$state/app-state.svelte';
  import { betaSession, getModeLabel, logoutBetaSession } from '$state/beta-session-state.svelte';
  import { messageState } from '$state/message-state.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
  import SparkThemeToggle from '$ui/SparkThemeToggle.svelte';

  const unreadMessages = $derived(sparkMessages.filter((message) => !messageState.readMessageIds.includes(message.id)).length);

  const utilityLinks = $derived([
    betaSession.user
      ? { href: '/dashboard', title: 'Hari ini', copy: 'Fokus belajar terdekat', icon: 'dashboard' }
      : { href: '/login', title: 'Masuk', copy: 'Simpan perjalanan belajar', icon: 'login' },
    { href: '/inbox', title: 'Inbox', copy: unreadMessages > 0 ? `${unreadMessages} pesan baru` : 'Pesan dan arahan', icon: 'messages' },
    { href: '/help', title: 'Bantuan', copy: 'FAQ dan panduan', icon: 'help' },
    { href: '/docs', title: 'Dokumentasi', copy: 'Teknis dan non-teknis', icon: 'code' },
    { href: '/terms', title: 'Ketentuan', copy: 'Terms & conditions', icon: 'shield' }
  ]);

  const primaryShortcuts = $derived(
    betaSession.user
      ? [
          { href: '/core', label: 'Core', icon: 'book-open' },
          { href: '/lab', label: 'Lab', icon: 'flask-conical' },
          { href: '/profile', label: 'Saya', icon: 'user-round' }
        ]
      : [
          { href: '/core', label: 'Core', icon: 'book-open' },
          { href: '/about', label: 'Tentang', icon: 'sparkles' },
          { href: '/community', label: 'Komunitas', icon: 'users' }
        ]
  );

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

  <aside class="spark-mobile-drawer production-drawer utility-drawer-v35b1" transition:fly={{ x: 24, duration: 160 }} aria-label="Menu Spark">
    <div class="drawer-head production-drawer-head utility-drawer-head-v35b1">
      <div>
        <strong>Menu</strong>
        <small>Pengaturan, bantuan, dan jalur cepat.</small>
      </div>
      <button type="button" aria-label="Tutup menu" onclick={close}><SparkIcon name="x" size={17} /></button>
    </div>

    <div class="drawer-account-card production-drawer-account utility-account-v35b1">
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
          <small>Belajar Starknet dengan ritme aman.</small>
        </div>
      {/if}
    </div>

    <div class="utility-theme-v35b1">
      <div>
        <strong>Tampilan</strong>
        <small>Ikuti sistem atau pilih tema.</small>
      </div>
      <SparkThemeToggle />
    </div>

    <nav class="utility-shortcuts-v35b1" aria-label="Jalur cepat">
      {#each primaryShortcuts as item}
        <a href={item.href} onclick={close}>
          <SparkIcon name={item.icon} size={15} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <nav class="utility-link-list-v35b1" aria-label="Utilitas Spark">
      {#each utilityLinks as link}
        <a href={link.href} onclick={close}>
          <span><SparkIcon name={link.icon} size={16} /></span>
          <div>
            <strong>{link.title}</strong>
            <small>{link.copy}</small>
          </div>
          <SparkIcon name="chevron-right" size={14} />
        </a>
      {/each}

      {#if betaSession.user}
        <button class="utility-logout-v35b1" type="button" onclick={logout}>
          <span><SparkIcon name="logout" size={16} /></span>
          <div>
            <strong>Keluar</strong>
            <small>Selesai di perangkat ini</small>
          </div>
          <SparkIcon name="chevron-right" size={14} />
        </button>
      {/if}
    </nav>
  </aside>
{/if}
