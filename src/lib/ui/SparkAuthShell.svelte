<script lang="ts">
  import { goto } from '$app/navigation';
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { exampleUsers, getModeLabel, loginAsExample } from '$state/beta-session-state.svelte';
  import { setExperience } from '$state/learning-state.svelte';
  import { pushToast } from '$state/app-state.svelte';

  type Props = {
    mode: 'login' | 'register';
  };

  let { mode }: Props = $props();

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let selectedExample = $state(exampleUsers[0].id);

  const title = $derived(mode === 'login' ? 'Masuk ke Karyra Spark' : 'Daftar Beta Karyra Spark');
  const copy = $derived(
    mode === 'login'
      ? 'Gunakan akun contoh lokal untuk mencoba flow aplikasi sampai backend auth siap.'
      : 'Form beta ini menyiapkan struktur registrasi. Penyimpanan akun produksi akan masuk saat backend siap.'
  );

  async function useExampleAccount() {
    const user = loginAsExample(selectedExample);
    setExperience(user.mode);

    pushToast({
      title: 'Akun contoh aktif',
      copy: `${user.name} masuk secara lokal di perangkat ini.`,
      tone: 'success'
    });

    await goto('/dashboard');
  }

  async function submitLocalForm() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || password.length < 6) {
      pushToast({
        title: 'Lengkapi form beta',
        copy: 'Nama, email, dan password minimal 6 karakter diperlukan untuk simulasi frontend.',
        tone: 'warning'
      });
      return;
    }

    const user = loginAsExample('spark-local-learner');
    user.name = trimmedName;
    user.handle = `@${trimmedEmail.split('@')[0] || 'spark-user'}`;

    pushToast({
      title: mode === 'login' ? 'Masuk lokal berhasil' : 'Pendaftaran beta tersimpan lokal',
      copy: 'Ini belum membuat akun backend. Session frontend disiapkan untuk alur aplikasi.',
      tone: 'success'
    });

    await goto('/dashboard');
  }
</script>

<section class="spark-auth-shell">
  <div class="auth-hero-panel">
    <span class="spark-eyebrow">Beta Access</span>
    <h1>{title}</h1>
    <p>{copy}</p>

    <div class="auth-trust-row">
      <SparkTrustBadge label="Beta tertutup" tone="beta" />
      <SparkTrustBadge label="Akun contoh lokal" tone="local" />
      <SparkTrustBadge label="Backend-ready" tone="safe" />
    </div>

    <div class="auth-path-list">
      <article>
        <SparkIcon name="dashboard" size={18} />
        <div>
          <strong>Dashboard</strong>
          <small>Setelah masuk, pengguna diarahkan ke ringkasan aktivitas.</small>
        </div>
      </article>
      <article>
        <SparkIcon name="book-open" size={18} />
        <div>
          <strong>Belajar</strong>
          <small>Core dan lesson path tetap bisa dicoba tanpa backend.</small>
        </div>
      </article>
      <article>
        <SparkIcon name="badge" size={18} />
        <div>
          <strong>Passport</strong>
          <small>Progress lokal memberi gambaran readiness user.</small>
        </div>
      </article>
      <article>
        <SparkIcon name="compass" size={18} />
        <div>
          <strong>Hub</strong>
          <small>Gateway disiapkan untuk resource dan eksplorasi setelah siap.</small>
        </div>
      </article>
    </div>
  </div>

  <SparkCard class="auth-form-card">
    <div class="auth-form-head">
      <span><SparkIcon name={mode === 'login' ? 'login' : 'key'} size={20} /></span>
      <div>
        <h2>{mode === 'login' ? 'Akses akun' : 'Buat akses beta'}</h2>
        <p>{mode === 'login' ? 'Masuk sebagai akun contoh atau isi form lokal.' : 'Form ini masih frontend-only untuk mematangkan UX.'}</p>
      </div>
    </div>

    <div class="auth-input-grid">
      <label>
        <span>Nama</span>
        <input bind:value={name} type="text" placeholder="Karyra Learner" autocomplete="name" />
      </label>

      <label>
        <span>Email</span>
        <input bind:value={email} type="email" placeholder="learner@karyra.local" autocomplete="email" />
      </label>

      <label>
        <span>Password</span>
        <input bind:value={password} type="password" placeholder="Minimal 6 karakter" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} />
      </label>
    </div>

    <div class="auth-actions">
      <SparkButton onclick={submitLocalForm}>{mode === 'login' ? 'Masuk Lokal' : 'Daftar Beta'}</SparkButton>
      <SparkButton href={mode === 'login' ? '/register' : '/login'} variant="ghost">
        {mode === 'login' ? 'Belum punya akses?' : 'Sudah punya akses?'}
      </SparkButton>
    </div>

    <div class="auth-divider"><span>atau gunakan akun contoh</span></div>

    <div class="example-account-grid">
      {#each exampleUsers as user}
        <button type="button" class:selected={selectedExample === user.id} onclick={() => (selectedExample = user.id)}>
          <strong>{user.name}</strong>
          <span>{user.handle}</span>
          <small>{getModeLabel(user.mode)}</small>
        </button>
      {/each}
    </div>

    <SparkButton onclick={useExampleAccount} variant="secondary">Masuk sebagai akun contoh</SparkButton>
  </SparkCard>
</section>
