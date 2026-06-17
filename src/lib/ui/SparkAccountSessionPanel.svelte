<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import {
    betaSession,
    authErrorMessage,
    hydrateBackendSession,
    logoutBetaSession
  } from '$state/beta-session-state.svelte';
  import { pushToast } from '$state/app-state.svelte';

  let refreshing = $state(false);
  let loggingOut = $state(false);
  let localError = $state('');

  const user = $derived(betaSession.user);
  const isBackendSession = $derived(user?.status === 'backend-session');
  const statusLabel = $derived(isBackendSession ? 'Backend session aktif' : user?.status === 'local-session' ? 'Local session' : 'Belum masuk');

  async function refreshSession() {
    if (refreshing) return;
    refreshing = true;
    localError = '';
    try {
      const refreshed = await hydrateBackendSession();
      if (refreshed?.status === 'backend-session') {
        pushToast({ title: 'Session valid', copy: 'Akun backend masih aktif setelah dicek ulang.', tone: 'success' });
      } else {
        pushToast({ title: 'Session belum aktif', copy: 'Masuk ulang untuk membuat session backend.', tone: 'warning' });
      }
    } catch (error) {
      localError = authErrorMessage(error);
    } finally {
      refreshing = false;
    }
  }

  async function signOut() {
    if (loggingOut) return;
    loggingOut = true;
    localError = '';
    try {
      await logoutBetaSession();
      pushToast({ title: 'Keluar berhasil', copy: 'Session akun sudah ditutup dari perangkat ini.', tone: 'success' });
    } catch (error) {
      localError = authErrorMessage(error);
    } finally {
      loggingOut = false;
    }
  }
</script>

<SparkCard class="settings-simple-card pass18b-session-card">
  <div class="settings-section-head pass40b-section-head">
    <span class="spark-eyebrow">Akun</span>
    <h2>Verifikasi session akun.</h2>
  </div>

  <div class="pass18b-session-status" data-ok={isBackendSession}>
    <span><SparkIcon name={isBackendSession ? 'shield-check' : 'shield'} size={18} /></span>
    <div>
      <strong>{statusLabel}</strong>
      <small>{isBackendSession ? 'Register/login sudah tersambung ke Spark API.' : 'Session backend belum terkonfirmasi.'}</small>
    </div>
  </div>

  {#if localError || betaSession.lastError}
    <div class="pass35-form-error" role="alert">
      <SparkIcon name="shield" size={15} />
      <span>{localError || betaSession.lastError}</span>
    </div>
  {/if}

  {#if user}
    <dl class="pass18b-account-list">
      <div><dt>Nama</dt><dd>{user.name}</dd></div>
      <div><dt>Email</dt><dd>{user.email || '—'}</dd></div>
      <div><dt>Handle</dt><dd>{user.handle}</dd></div>
      <div><dt>User ID</dt><dd>{user.id}</dd></div>
      <div><dt>Mode</dt><dd>{user.mode}</dd></div>
      <div><dt>Status</dt><dd>{user.status}</dd></div>
    </dl>
  {:else}
    <p class="pass18b-session-copy">Belum ada user aktif di perangkat ini. Masuk atau daftar dulu untuk membuat backend session.</p>
  {/if}

  <div class="pass18b-session-actions">
    <SparkButton variant="secondary" loading={refreshing} disabled={refreshing || loggingOut} onclick={refreshSession}>Cek ulang session</SparkButton>
    {#if user}
      <SparkButton variant="ghost" loading={loggingOut} disabled={refreshing || loggingOut} onclick={signOut}>Keluar</SparkButton>
    {:else}
      <SparkButton href="/login" variant="ghost">Masuk</SparkButton>
    {/if}
  </div>
</SparkCard>

<style>
  .pass18b-session-card {
    display: grid;
    gap: 14px;
  }

  .pass18b-session-status {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--spark-border) 75%, transparent);
    border-radius: 18px;
    padding: 12px;
    background: color-mix(in srgb, var(--spark-card) 88%, transparent);
  }

  .pass18b-session-status[data-ok='true'] {
    border-color: color-mix(in srgb, var(--spark-green, #16a34a) 42%, var(--spark-border));
  }

  .pass18b-session-status > span {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--spark-blue-soft) 70%, transparent);
    color: var(--spark-blue-strong);
  }

  .pass18b-session-status strong,
  .pass18b-session-status small {
    display: block;
  }

  .pass18b-session-status small,
  .pass18b-session-copy,
  .pass18b-account-list dt {
    color: var(--spark-muted);
  }

  .pass18b-account-list {
    display: grid;
    gap: 8px;
    margin: 0;
  }

  .pass18b-account-list div {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    font-size: 13px;
  }

  .pass18b-account-list dd {
    margin: 0;
    overflow-wrap: anywhere;
    font-weight: 720;
  }

  .pass18b-session-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 640px) {
    .pass18b-account-list div {
      grid-template-columns: 1fr;
      gap: 2px;
    }
  }
</style>
