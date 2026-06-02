<script lang="ts">
  import { onMount } from 'svelte';
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { pushToast } from '$state/app-state.svelte';
  import { learningState, setExperience, type ExperienceLevel } from '$state/learning-state.svelte';
  import { setThemePreference, themeState, type ThemePreference } from '$state/theme-state.svelte';
  import { contentStudioState, getManagedCopy, restoreManagedContent } from '$state/content-studio-state.svelte';

  const fallbackSettingsCopy = {
    eyebrow: 'Pengaturan',
    title: 'Atur Spark agar nyaman dipakai.',
    description:
      'Pilih tampilan, ritme belajar, dan bantuan kecil yang membuat proses belajar terasa lebih tenang.',
    primaryCtaLabel: 'Mulai belajar',
    primaryCtaHref: '/core',
    secondaryCtaLabel: 'Buka Passport',
    secondaryCtaHref: '/profile',
    note: 'Pengaturan ini membantu Spark menyesuaikan rasa belajar tanpa mengubah jalur utamamu.'
  };

  const themes: { key: ThemePreference; title: string; copy: string; icon: string }[] = [
    { key: 'system', title: 'Ikuti perangkat', copy: 'Spark mengikuti tampilan layar yang kamu pakai.', icon: 'settings' },
    { key: 'light', title: 'Terang', copy: 'Nyaman untuk belajar di ruang terang.', icon: 'sun' },
    { key: 'dark', title: 'Gelap', copy: 'Lebih lembut untuk belajar malam.', icon: 'moon' }
  ];

  const learningModes: { key: ExperienceLevel; title: string; copy: string; icon: string }[] = [
    { key: 'beginner', title: 'Pemula', copy: 'Penjelasan pelan dan istilah dibuka bertahap.', icon: 'sparkles' },
    { key: 'guided', title: 'Terarah', copy: 'Langkah belajar lebih rapi dan berurutan.', icon: 'target' },
    { key: 'explorer', title: 'Penjelajah', copy: 'Lebih bebas membuka Lab, Hub, dan resource.', icon: 'compass' }
  ];

  let guidanceEnabled = $state(true);
  let remindersEnabled = $state(true);
  let safetyTipsEnabled = $state(true);
  let confirmResetOpen = $state(false);

  const settingsCopy = $derived(getManagedCopy('settings-hero') ?? fallbackSettingsCopy);
  const activeTheme = $derived(themes.find((theme) => theme.key === themeState.preference)?.title ?? 'Ikuti perangkat');
  const activeMode = $derived(learningModes.find((mode) => mode.key === learningState.experience)?.title ?? 'Pemula');

  onMount(() => {
    if (!contentStudioState.restored) restoreManagedContent();
  });

  function chooseTheme(theme: ThemePreference) {
    setThemePreference(theme);
    pushToast({
      title: 'Tampilan disimpan',
      copy: theme === 'system' ? 'Spark mengikuti tampilan perangkatmu.' : `Spark memakai mode ${theme === 'dark' ? 'gelap' : 'terang'}.`,
      tone: 'success'
    });
  }

  function chooseMode(mode: ExperienceLevel) {
    setExperience(mode);
    pushToast({
      title: 'Cara belajar disimpan',
      copy: mode === 'beginner' ? 'Spark akan memberi arahan lebih pelan.' : mode === 'guided' ? 'Spark menjaga urutan belajar tetap rapi.' : 'Spark membuka ruang eksplorasi lebih luas.',
      tone: 'success'
    });
  }

  function toggleGuidance(key: 'guidance' | 'reminders' | 'safety') {
    if (key === 'guidance') guidanceEnabled = !guidanceEnabled;
    if (key === 'reminders') remindersEnabled = !remindersEnabled;
    if (key === 'safety') safetyTipsEnabled = !safetyTipsEnabled;
    pushToast({ title: 'Pilihan disimpan', copy: 'Spark menyesuaikan bantuan belajarmu.', tone: 'success' });
  }

  function resetPreferences() {
    setThemePreference('system');
    setExperience('beginner');
    guidanceEnabled = true;
    remindersEnabled = true;
    safetyTipsEnabled = true;
    confirmResetOpen = false;
    pushToast({ title: 'Pengaturan dipulihkan', copy: 'Spark kembali ke pilihan awal yang aman untuk pemula.', tone: 'success' });
  }
</script>

<section class="settings-simple-hero">
  <div>
    <span class="spark-eyebrow">{settingsCopy.eyebrow}</span>
    <h1>{settingsCopy.title}</h1>
    <p>{settingsCopy.description}</p>
    <div class="settings-hero-actions">
      <SparkButton href={settingsCopy.primaryCtaHref}>{settingsCopy.primaryCtaLabel}</SparkButton>
      <SparkButton href={settingsCopy.secondaryCtaHref} variant="secondary">{settingsCopy.secondaryCtaLabel}</SparkButton>
    </div>
  </div>

  <aside class="settings-current-card">
    <span><SparkIcon name="settings" size={22} /></span>
    <div>
      <strong>Pengaturan aktif</strong>
      <small>{activeTheme} · {activeMode}</small>
      <p>{settingsCopy.note}</p>
    </div>
  </aside>
</section>

<section class="settings-simple-layout">
  <SparkCard class="settings-simple-card">
    <div class="settings-section-head">
      <span class="spark-eyebrow">Tampilan</span>
      <h2>Pilih rasa layar.</h2>
      <p>Gunakan mode yang paling nyaman untuk membaca dan belajar.</p>
    </div>

    <div class="settings-choice-row">
      {#each themes as theme}
        <button type="button" class:active={themeState.preference === theme.key} onclick={() => chooseTheme(theme.key)}>
          <span><SparkIcon name={theme.icon} size={18} /></span>
          <strong>{theme.title}</strong>
          <small>{theme.copy}</small>
        </button>
      {/each}
    </div>
  </SparkCard>

  <SparkCard class="settings-simple-card">
    <div class="settings-section-head">
      <span class="spark-eyebrow">Cara belajar</span>
      <h2>Sesuaikan ritmemu.</h2>
      <p>Mode ini membantu Spark memberi arahan yang pas untuk tahapmu.</p>
    </div>

    <div class="settings-mode-list">
      {#each learningModes as mode}
        <button type="button" class:active={learningState.experience === mode.key} onclick={() => chooseMode(mode.key)}>
          <span><SparkIcon name={mode.icon} size={18} /></span>
          <div>
            <strong>{mode.title}</strong>
            <small>{mode.copy}</small>
          </div>
        </button>
      {/each}
    </div>
  </SparkCard>

  <SparkCard class="settings-simple-card">
    <div class="settings-section-head">
      <span class="spark-eyebrow">Bantuan kecil</span>
      <h2>Atur arahan Spark.</h2>
      <p>Pilih bantuan yang ingin kamu lihat saat belajar atau praktik.</p>
    </div>

    <div class="settings-toggle-list">
      <button type="button" onclick={() => toggleGuidance('guidance')} class:active={guidanceEnabled}>
        <span><SparkIcon name="sparkles" size={17} /></span>
        <div><strong>Saran langkah berikutnya</strong><small>{guidanceEnabled ? 'Aktif' : 'Mati'}</small></div>
      </button>
      <button type="button" onclick={() => toggleGuidance('reminders')} class:active={remindersEnabled}>
        <span><SparkIcon name="bell" size={17} /></span>
        <div><strong>Pengingat belajar</strong><small>{remindersEnabled ? 'Aktif' : 'Mati'}</small></div>
      </button>
      <button type="button" onclick={() => toggleGuidance('safety')} class:active={safetyTipsEnabled}>
        <span><SparkIcon name="shield" size={17} /></span>
        <div><strong>Tips keamanan</strong><small>{safetyTipsEnabled ? 'Aktif' : 'Mati'}</small></div>
      </button>
    </div>
  </SparkCard>

  <SparkCard class="settings-simple-card settings-link-card">
    <div class="settings-section-head">
      <span class="spark-eyebrow">Tempat penting</span>
      <h2>Lanjut dari sini.</h2>
    </div>

    <div class="settings-link-list">
      <a href="/core"><SparkIcon name="book-open" size={16} /> Mulai belajar</a>
      <a href="/inbox"><SparkIcon name="messages" size={16} /> Pesan dari Spark</a>
      <a href="/profile"><SparkIcon name="user-round" size={16} /> Buka Passport</a>
      <a href="/dashboard"><SparkIcon name="dashboard" size={16} /> Buka Dashboard</a>
    </div>

    <div class="settings-reset-box">
      <div>
        <strong>Ingin kembali sederhana?</strong>
        <p>Pulihkan tampilan, ritme belajar, dan bantuan ke pilihan awal.</p>
      </div>
      <SparkButton variant="secondary" onclick={() => (confirmResetOpen = true)}>Pulihkan</SparkButton>
    </div>
  </SparkCard>
</section>

{#if confirmResetOpen}
  <button class="settings-modal-scrim" type="button" aria-label="Tutup dialog" onclick={() => (confirmResetOpen = false)}></button>
  <div class="settings-confirm-dialog" role="dialog" aria-modal="true" aria-label="Pulihkan pengaturan">
    <span><SparkIcon name="shield" size={22} /></span>
    <h2>Pulihkan pengaturan?</h2>
    <p>Spark akan kembali ke tampilan perangkat, mode pemula, dan bantuan belajar yang aman.</p>
    <div>
      <SparkButton variant="ghost" onclick={() => (confirmResetOpen = false)}>Batal</SparkButton>
      <SparkButton onclick={resetPreferences}>Pulihkan</SparkButton>
    </div>
  </div>
{/if}
