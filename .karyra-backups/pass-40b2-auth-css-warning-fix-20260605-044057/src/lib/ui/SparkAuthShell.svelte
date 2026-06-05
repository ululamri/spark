<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { betaSession, getModeLabel, startLearningSession, type BetaUserMode } from '$state/beta-session-state.svelte';
  import { setExperience, setLearnerIdentity } from '$state/learning-state.svelte';
  import { pushToast } from '$state/app-state.svelte';

  type Props = {
    mode: 'login' | 'register';
  };

  let { mode }: Props = $props();

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let selectedMode = $state<BetaUserMode>('beginner');
  let formError = $state('');
  let redirecting = $state(false);

  const modeOptions: { key: BetaUserMode; label: string; copy: string }[] = [
    { key: 'beginner', label: 'Pemula', copy: 'Bahasa sederhana' },
    { key: 'guided', label: 'Terarah', copy: 'Langkah lebih rapi' },
    { key: 'explorer', label: 'Penjelajah', copy: 'Lebih teknis' }
  ];

  const rawNext = $derived(page.url.searchParams.get('next') ?? '/dashboard');
  const nextHref = $derived(rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard');
  const title = $derived(mode === 'login' ? 'Masuk ke Spark' : 'Buat ruang belajar');
  const copy = $derived(
    mode === 'login'
      ? 'Lanjutkan belajar, buka Passport, dan ikuti progress dari satu tempat.'
      : 'Daftar untuk menyimpan progress, Passport, dan pilihan belajar.'
  );

  $effect(() => {
    if (!betaSession.ready || !betaSession.user || redirecting) return;
    redirecting = true;
    void goto('/dashboard', { replaceState: true });
  });

  function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function submitForm() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    formError = '';

    if (mode === 'register' && trimmedName.length < 2) {
      formError = 'Tulis nama yang ingin kamu pakai di Spark.';
      return;
    }

    if (!isEmail(trimmedEmail)) {
      formError = 'Gunakan email yang valid.';
      return;
    }

    if (password.length < 6) {
      formError = 'Kata sandi minimal 6 karakter.';
      return;
    }

    const user = startLearningSession({ name: trimmedName, email: trimmedEmail, mode: selectedMode });
    setLearnerIdentity(user.id);
    setExperience(user.mode);

    pushToast({
      title: mode === 'login' ? 'Masuk berhasil' : 'Ruang belajar dibuat',
      copy: `Ritme belajar: ${getModeLabel(user.mode)}.`,
      tone: 'success'
    });

    await goto(nextHref, { replaceState: true });
  }
</script>

<section class="spark-auth-shell pass35-auth-shell pass40b-auth-shell">
  <SparkCard class="auth-form-card pass35-auth-card pass40b-auth-card">
    <div class="auth-form-head pass35-auth-head">
      <span><SparkIcon name={mode === 'login' ? 'login' : 'key'} size={19} /></span>
      <div>
        <h2>{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
        <p>{mode === 'login' ? 'Gunakan email dan kata sandi.' : 'Buat akses belajar baru.'}</p>
      </div>
    </div>

    {#if formError}
      <div class="pass35-form-error" role="alert">
        <SparkIcon name="shield" size={15} />
        <span>{formError}</span>
      </div>
    {/if}

    <div class="auth-input-grid pass35-auth-inputs">
      {#if mode === 'register'}
        <label>
          <span>Nama</span>
          <input bind:value={name} type="text" placeholder="Nama kamu" autocomplete="name" />
        </label>
      {/if}

      <label>
        <span>Email</span>
        <input bind:value={email} type="email" placeholder="nama@email.com" autocomplete="email" />
      </label>

      <label>
        <span>Kata sandi</span>
        <input bind:value={password} type="password" placeholder="Minimal 6 karakter" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} />
      </label>
    </div>

    {#if mode === 'login'}
      <a class="pass40b-forgot-link" href="/help?topic=password">Lupa kata sandi?</a>
    {:else}
      <div class="pass35-mode-picker" aria-label="Pilih ritme belajar">
        {#each modeOptions as item}
          <button type="button" class:active={selectedMode === item.key} onclick={() => (selectedMode = item.key)}>
            <strong>{item.label}</strong>
            <small>{item.copy}</small>
          </button>
        {/each}
      </div>
    {/if}

    <div class="auth-actions pass35-auth-actions">
      <SparkButton onclick={submitForm}>{mode === 'login' ? 'Masuk' : 'Daftar'}</SparkButton>
      <SparkButton href={mode === 'login' ? `/register?next=${encodeURIComponent(nextHref)}` : `/login?next=${encodeURIComponent(nextHref)}`} variant="ghost">
        {mode === 'login' ? 'Buat akun' : 'Sudah punya akun?'}
      </SparkButton>
    </div>

    <p class="pass35-auth-note">Ritme belajar dapat diubah dari Pengaturan.</p>
  </SparkCard>

  <div class="auth-hero-panel pass35-auth-intro pass40b-auth-intro">
    <span class="spark-eyebrow">Akses belajar</span>
    <h1>{title}</h1>
    <p>{copy}</p>

    <div class="auth-trust-row pass35-auth-trust-row">
      <SparkTrustBadge label="Safety-first" tone="safe" />
      <SparkTrustBadge label="Passport" tone="target" />
      <SparkTrustBadge label="Starknet path" tone="beta" />
    </div>

    <div class="pass35-auth-points" aria-label="Yang bisa dilanjutkan setelah masuk">
      <article>
        <SparkIcon name="dashboard" size={17} />
        <div><strong>Dashboard</strong><small>Fokus belajar hari ini.</small></div>
      </article>
      <article>
        <SparkIcon name="badge" size={17} />
        <div><strong>Passport</strong><small>Pantau kesiapanmu.</small></div>
      </article>
      <article>
        <SparkIcon name="messages" size={17} />
        <div><strong>Pesan</strong><small>Arahan penting dari Spark.</small></div>
      </article>
    </div>
  </div>
</section>

<style>
  .pass40b-auth-shell {
    align-items: start;
  }

  .pass40b-auth-card {
    order: -1;
  }

  .pass40b-forgot-link {
    width: fit-content;
    color: var(--spark-blue-strong);
    font-size: 12.5px;
    font-weight: 760;
  }

  @media (max-width: 860px) {
    .pass40b-auth-intro {
      order: 2;
    }
  }
</style>
