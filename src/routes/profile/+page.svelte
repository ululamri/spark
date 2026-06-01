<script lang="ts">
  import SparkLocalDataNotice from '$ui/SparkLocalDataNotice.svelte';
  import SparkProfilePassportRich from '$ui/SparkProfilePassportRich.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>

<svelte:head>
  <title>Profile & Passport — Karyra Spark</title>
</svelte:head>

<SparkProfilePassportRich />

<section class="spark-section trust-compact-section">
  <SparkLocalDataNotice />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Readiness detail"
    title="Passport membaca beberapa sinyal, bukan hanya angka."
    copy="Lesson, checkpoint, Lab, workshop, Hub resource, dan status wallet placeholder membentuk readiness bertahap."
  />
  <SparkReadinessPanel />
</section>
