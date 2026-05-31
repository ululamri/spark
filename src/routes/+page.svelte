<script lang="ts">
  import SparkButton from '$ui/SparkButton.svelte';
  import SparkCard from '$ui/SparkCard.svelte';
  import SparkHeroVisual from '$ui/SparkHeroVisual.svelte';
  import SparkJourneyMap from '$ui/SparkJourneyMap.svelte';
  import SparkOnboardingPanel from '$ui/SparkOnboardingPanel.svelte';
  import { getLearningProgressPercent, getReadinessScore } from '$state/learning-state.svelte';

  const pillars = [
    { title: 'Learn', copy: 'Kursus dan lesson dari blockchain dasar sampai Starknet.', href: '/core' },
    { title: 'Practice', copy: 'Lab aman, simulasi, dan jembatan sebelum aksi Web3.', href: '/lab' },
    { title: 'Community', copy: 'Workshop, cohort, dan fasilitator untuk komunitas lokal.', href: '/community' },
    { title: 'Passport', copy: 'Profil readiness, progress, dan bukti perjalanan belajar.', href: '/profile' },
    { title: 'Hub', copy: 'Gateway resource, apps, tools, games, komunitas, dan misi ekosistem.', href: '/hub' }
  ];
</script>

<svelte:head>
  <title>Karyra Spark — Local Blockchain & Starknet Gateway</title>
</svelte:head>

<section class="spark-hero gateway">
  <div>
    <span class="spark-eyebrow">Karyra Spark</span>
    <h1>Gateway lokal menuju blockchain, Web3, dan Starknet.</h1>
    <p>Satu wadah untuk belajar, praktik, workshop, membangun Passport, lalu menjelajahi ekosistem melalui Hub.</p>
    <div class="spark-hero-actions">
      <SparkButton href="/core">Mulai Belajar</SparkButton>
      <SparkButton href="/hub" variant="secondary">Lihat Hub</SparkButton>
    </div>
  </div>
  <aside class="spark-hero-panel">
    <SparkHeroVisual mode="gateway" />
    <span>Readiness</span>
    <strong>{getReadinessScore()}%</strong>
    <p>{getLearningProgressPercent()}% progress belajar. Passport terhubung ke Profile.</p>
  </aside>
</section>

<SparkOnboardingPanel />

<section class="spark-section">
  <SparkJourneyMap />
</section>

<section class="spark-section">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Ekosistem Spark</span>
      <h2>Belajar, praktik, komunitas, dan eksplorasi dalam satu alur.</h2>
    </div>
  </div>

  <div class="spark-pillar-grid">
    {#each pillars as pillar}
      <a href={pillar.href}>
        <SparkCard>
          <h3>{pillar.title}</h3>
          <p>{pillar.copy}</p>
        </SparkCard>
      </a>
    {/each}
  </div>
</section>
