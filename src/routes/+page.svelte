<script lang="ts">
  import SparkButton from '$ui/SparkButton.svelte';
  import SparkGuestStartPanel from '$ui/SparkGuestStartPanel.svelte';
  import SparkGuidedTourLite from '$ui/SparkGuidedTourLite.svelte';
  import SparkHeroVisual from '$ui/SparkHeroVisual.svelte';
  import SparkHomeFeatureGrid from '$ui/SparkHomeFeatureGrid.svelte';
  import SparkHomeHubPreview from '$ui/SparkHomeHubPreview.svelte';
  import SparkHomeNextAction from '$ui/SparkHomeNextAction.svelte';
  import SparkHomePathGrid from '$ui/SparkHomePathGrid.svelte';
  import SparkHomeReadinessMap from '$ui/SparkHomeReadinessMap.svelte';
  import SparkLocalDataNotice from '$ui/SparkLocalDataNotice.svelte';
  import SparkOnboardingPanel from '$ui/SparkOnboardingPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import { getLearningProgressPercent, getReadinessScore } from '$state/learning-state.svelte';
</script>

<svelte:head>
  <title>Karyra Spark — Local Blockchain & Starknet Gateway</title>
</svelte:head>

<section class="spark-hero gateway">
  <div>
    <span class="spark-eyebrow">Karyra Spark</span>
    <h1>Percikan awal memahami blockchain dan Starknet.</h1>
    <p>Karyra Spark memandu komunitas lokal dari pemahaman dasar blockchain menuju praktik aman, readiness, dan eksplorasi Starknet secara bertahap.</p>
    <div class="spark-hero-actions">
      <SparkButton href="/login">Coba Akun Contoh</SparkButton>
      <SparkButton href="/core" variant="secondary">Lihat Core</SparkButton>
    </div>
  </div>
  <aside class="spark-hero-panel">
    <SparkHeroVisual mode="gateway" />
    <span>Readiness</span>
    <strong>{getReadinessScore()}%</strong>
    <p>{getLearningProgressPercent()}% progress belajar. Passport terhubung ke Profile.</p>
  </aside>
</section>

<section class="spark-section trust-compact-section">
  <SparkLocalDataNotice />
</section>

<section class="spark-section">
  <SparkGuestStartPanel />
</section>

<section class="spark-section">
  <SparkHomeNextAction />
</section>

<section class="spark-section">
  <SparkGuidedTourLite />
</section>

<section class="spark-section">
  <SparkHomeReadinessMap />
</section>

<SparkOnboardingPanel />

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Jalur awal"
    title="Pilih jalur yang paling aman untukmu."
    copy="Jalur membantu rekomendasi awal. Spark tetap menjaga satu alur utama agar pengguna tidak bingung."
  />
  <SparkHomePathGrid />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Ruang utama"
    title="Tempat utama untuk mulai siap."
    copy="Spark menggabungkan belajar, praktik, komunitas, Passport, dan Hub dalam satu ekosistem."
  />
  <SparkHomeFeatureGrid />
</section>

<section class="spark-section">
  <SparkHomeHubPreview />
</section>
