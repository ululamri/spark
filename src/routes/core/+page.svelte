<script lang="ts">
  import SparkCoreFocusedLearning from '$ui/SparkCoreFocusedLearning.svelte';
  import SparkCoreSupportPanel from '$ui/SparkCoreSupportPanel.svelte';
  import SparkModuleAccordion from '$ui/SparkModuleAccordion.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>

<svelte:head>
  <title>Spark Core — Karyra Spark</title>
</svelte:head>

<SparkCoreFocusedLearning />

<section class="spark-section">
  <SparkCoreSupportPanel />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Detail lesson"
    title="Buka modul lengkap jika ingin membaca semua jalur."
    copy="Board di atas memberi fokus cepat. Accordion tetap tersedia untuk detail kurikulum."
  />
  <SparkModuleAccordion />
</section>
