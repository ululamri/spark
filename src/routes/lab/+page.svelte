<script lang="ts">
  import SparkHeroVisual from '$ui/SparkHeroVisual.svelte';
  import SparkLabConsole from '$ui/SparkLabConsole.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import { sparkLabs } from '$content/spark-content';
</script>

<svelte:head>
  <title>Practice Lab — Karyra Spark</title>
</svelte:head>

<section class="spark-hero practice">
  <div>
    <span class="spark-eyebrow">Practice Lab</span>
    <h1>Praktik aman sebelum masuk Web3 sungguhan.</h1>
    <p>Setiap aksi punya loading state, feedback, dan jembatan agar pengguna pemula tidak panik saat berinteraksi dengan proses jaringan.</p>
  </div>
  <aside class="spark-hero-panel">
    <SparkHeroVisual mode="practice" />
  </aside>
</section>

<section class="spark-section">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Safe practice</span>
      <h2>Lab dibuat bertahap: simulasi → readiness → teknis.</h2>
    </div>
  </div>

  <div class="spark-lab-grid">
    {#each sparkLabs as lab}
      <SparkLabConsole {lab} />
    {/each}
  </div>
</section>

<section class="spark-section">
  <SparkReadinessPanel />
</section>
