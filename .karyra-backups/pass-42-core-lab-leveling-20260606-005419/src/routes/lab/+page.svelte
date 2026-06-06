<script lang="ts">
  import SparkExplorerPlaceholder from '$ui/SparkExplorerPlaceholder.svelte';
  import SparkLabInteractiveSimulator from '$ui/SparkLabInteractiveSimulator.svelte';
  import SparkLabProofRoadmapRich from '$ui/SparkLabProofRoadmapRich.svelte';
  import SparkLabRichGrid from '$ui/SparkLabRichGrid.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>

<svelte:head>
  <title>Practice Lab — Karyra Spark</title>
</svelte:head>

<SparkLabInteractiveSimulator />

<section class="spark-section" id="lab-modules">
  <SparkSectionHeader
    eyebrow="Modul praktik"
    title="Latihan tetap tersedia sebagai proof-of-practice."
    copy="Simulasi di atas memberi interaksi cepat. Kartu di bawah memberi jalur praktik lebih lengkap."
  />
  <SparkLabRichGrid />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Advanced workspace"
    title="Mode teknis tetap disiapkan bertahap."
    copy="CodeMirror dan StarknetKit masih placeholder aman sampai backend dan grant lebih pasti."
  />
  <SparkExplorerPlaceholder />
</section>

<section class="spark-section">
  <SparkLabProofRoadmapRich />
</section>
