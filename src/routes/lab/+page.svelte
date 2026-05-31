<script lang="ts">
  import SparkLabConsole from '$ui/SparkLabConsole.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import { sparkLabs } from '$content/spark-content';
</script>

<svelte:head>
  <title>Practice Lab — Karyra Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Practice Lab"
  title="Praktik aman sebelum masuk Web3 sungguhan."
  copy="Setiap aksi punya loading state, feedback, dan jembatan agar pengguna pemula tidak panik saat berinteraksi dengan proses jaringan."
  mode="practice"
/>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Safe practice"
    title="Simulasi, readiness, dan teknis dalam satu jalur."
    copy="Lab dibuat bertahap agar pengguna belajar praktik tanpa langsung masuk ke risiko teknis."
  />

  <div class="spark-lab-grid surface-grid">
    {#each sparkLabs as lab}
      <SparkLabConsole {lab} />
    {/each}
  </div>
</section>

<section class="spark-section">
  <SparkReadinessPanel />
</section>
