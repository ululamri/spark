<script lang="ts">
  import SparkButton from '$ui/SparkButton.svelte';
  import SparkCard from '$ui/SparkCard.svelte';
  import SparkModuleAccordion from '$ui/SparkModuleAccordion.svelte';
  import SparkOnboardingPanel from '$ui/SparkOnboardingPanel.svelte';
  import { learningState, setExperience, getLearningProgressPercent, getReadinessScore, getRecommendedLessonSlug } from '$state/learning-state.svelte';
  import { getRecommendedModule, getModeLabel } from '$lib/learning/recommendation';

  const recommended = $derived(getRecommendedModule());

  const modes = [
    { key: 'beginner', title: 'Pemula', copy: 'Bahasa sederhana, banyak konteks, tidak langsung teknis.' },
    { key: 'guided', title: 'Terarah', copy: 'Lebih cepat, tetap ada checklist dan jembatan konsep.' },
    { key: 'explorer', title: 'Penjelajah', copy: 'Siap melihat Starknet, Cairo, testnet, dan detail teknis.' }
  ] as const;
</script>

<svelte:head>
  <title>Spark Core — Jalur Belajar Spark</title>
</svelte:head>

<section class="spark-hero learn">
  <div>
    <span class="spark-eyebrow">Spark Core</span>
    <h1>Jalur Belajar Spark.</h1>
    <p>Pusat pembelajaran blockchain, cryptocurrency, Web3, dan Starknet. Satu kurikulum utama dengan rekomendasi adaptif untuk pemula maupun pengguna yang sudah punya dasar.</p>
    <div class="spark-hero-actions">
      <SparkButton href={`/lesson/${getRecommendedLessonSlug()}`}>Lanjut Belajar</SparkButton>
      <SparkButton href="#modules" variant="secondary">Lihat Modul</SparkButton>
    </div>
  </div>

  <SparkCard class="continue-card">
    <span class="spark-eyebrow">Continue Learning</span>
    <h2>{recommended.title}</h2>
    <p>{recommended.description}</p>
    <div class="spark-stat-row">
      <span>{getLearningProgressPercent()}% belajar</span>
      <span>{getReadinessScore()}% readiness</span>
      <span>{getModeLabel()}</span>
    </div>
  </SparkCard>
</section>

<SparkOnboardingPanel />

<section class="spark-section">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Mode belajar</span>
      <h2>Mode membantu rekomendasi, bukan mengunci jalur.</h2>
    </div>
  </div>

  <div class="spark-mode-grid">
    {#each modes as mode}
      <button type="button" class:active={learningState.experience === mode.key} onclick={() => setExperience(mode.key)}>
        <strong>{mode.title}</strong>
        <small>{mode.copy}</small>
      </button>
    {/each}
  </div>
</section>

<section class="spark-section" id="modules">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Modul collapsible</span>
      <h2>Skalabel untuk 15–20 langkah tanpa membuat halaman melelahkan.</h2>
    </div>
  </div>

  <SparkModuleAccordion />
</section>
