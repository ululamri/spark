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
  const title = $derived(mode === 'login' ? 'Masuk ke Karyra Spark' : 'Buat ruang belajar');
  const copy = $derived(
    mode === 'login'
      ? 'Lanjutkan belajar, buka Passport, dan simpan langkah penting di satu tempat.'
      : 'Siapkan ruang belajar untuk menyimpan progress, Passport, dan preferensi kamu.'
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
      formError = 'Password minimal 6 karakter.';
      return;
    }

    const user = startLearningSession({ name: trimmedName, email: trimmedEmail, mode: selectedMode });
    setLearnerIdentity(user.id);
    setExperience(user.mode);

    pushToast({
      title: mode === 'login' ? 'Masuk berhasil' : 'Ruang belajar dibuat',
      copy: `Mode belajar: ${getModeLabel(user.mode)}.`,
      tone: 'success'
    });

    await goto(nextHref, { replaceState: true });
  }
</script>

<section class="spark-auth-shell pass35-auth-shell">
  <div class="auth-hero-panel pass35-auth-intro">
    <span class="spark-eyebrow">Akses belajar</span>
    <h1>{title}</h1>
    <p>{copy}</p>

    <div class="auth-trust-row pass35-auth-trust-row">
      <SparkTrustBadge label="Safety-first" tone="safe" />
      <SparkTrustBadge label="Passport" tone="target" />
      <SparkTrustBadge label="Starknet path" tone="beta" />
    </div>

    <div class="pass35-auth-points" aria-label="Yang bisa kamu lanjutkan setelah masuk">
      <article>
        <SparkIcon name="dashboard" size={17} />
        <div><strong>Dashboard</strong><small>Lihat fokus belajar hari ini.</small></div>
      </article>
      <article>
        <SparkIcon name="badge" size={17} />
        <div><strong>Passport</strong><small>Pantau tanda kesiapanmu.</small></div>
      </article>
      <article>
        <SparkIcon name="messages" size={17} />
        <div><strong>Pesan</strong><small>Simpan arahan penting.</small></div>
      </article>
    </div>
  </div>

  <SparkCard class="auth-form-card pass35-auth-card">
    <div class="auth-form-head pass35-auth-head">
      <span><SparkIcon name={mode === 'login' ? 'login' : 'key'} size={19} /></span>
      <div>
        <h2>{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
        <p>{mode === 'login' ? 'Gunakan email dan password kamu.' : 'Buat akses belajar baru.'}</p>
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
        <span>Password</span>
        <input bind:value={password} type="password" placeholder="Minimal 6 karakter" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} />
      </label>
    </div>

    <div class="pass35-mode-picker" aria-label="Pilih ritme belajar">
      {#each modeOptions as item}
        <button type="button" class:active={selectedMode === item.key} onclick={() => (selectedMode = item.key)}>
          <strong>{item.label}</strong>
          <small>{item.copy}</small>
        </button>
      {/each}
    </div>

    <div class="auth-actions pass35-auth-actions">
      <SparkButton onclick={submitForm}>{mode === 'login' ? 'Masuk' : 'Daftar'}</SparkButton>
      <SparkButton href={mode === 'login' ? `/register?next=${encodeURIComponent(nextHref)}` : `/login?next=${encodeURIComponent(nextHref)}`} variant="ghost">
        {mode === 'login' ? 'Buat ruang belajar' : 'Sudah punya akses?'}
      </SparkButton>
    </div>

    <p class="pass35-auth-note">Kamu bisa mengganti profil dan mode belajar kapan saja dari Ruang Saya.</p>
  </SparkCard>
</section>
