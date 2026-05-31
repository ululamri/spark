<script lang="ts">
  import SparkCoreOverview from '$ui/SparkCoreOverview.svelte';
  import SparkLearningModeStrip from '$ui/SparkLearningModeStrip.svelte';
  import SparkModuleAccordion from '$ui/SparkModuleAccordion.svelte';
  import SparkOnboardingPanel from '$ui/SparkOnboardingPanel.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkButton from '$ui/SparkButton.svelte';
  import { getRecommendedLessonSlug } from '$state/learning-state.svelte';
</script>

<svelte:head>
  <title>Spark Core — Jalur Belajar Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Spark Core"
  title="Pusat pembelajaran Karyra Spark."
  copy="Core adalah tempat pengguna mulai memahami blockchain, cryptocurrency, Web3, dan Starknet melalui jalur yang sederhana, bertahap, dan aman untuk pemula."
  mode="learn"
>
  <SparkButton href={`/lesson/${getRecommendedLessonSlug()}`}>Lanjut Belajar</SparkButton>
  <SparkButton href="#modules" variant="secondary">Lihat Modul</SparkButton>
</SparkPageHeader>

<SparkOnboardingPanel />

<section class="spark-section">
  <SparkCoreOverview />
</section>

<section class="spark-section">
  <SparkLearningModeStrip />
</section>

<section class="spark-section" id="modules">
  <SparkSectionHeader
    eyebrow="Learning path"
    title="Modul belajar dibuat collapsible dan bertahap."
    copy="Jalur ini dapat tumbuh menjadi banyak lesson tanpa membuat halaman Core terlalu panjang atau melelahkan."
  />

  <SparkModuleAccordion />
</section>
