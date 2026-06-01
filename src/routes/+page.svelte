<script lang="ts">
  import SparkProductLaunchBoard from '$ui/SparkProductLaunchBoard.svelte';
  import SparkHomeReadinessMap from '$ui/SparkHomeReadinessMap.svelte';
  import SparkHomeHubPreview from '$ui/SparkHomeHubPreview.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>

<svelte:head>
  <title>Karyra Spark — Local Blockchain & Starknet Gateway</title>
</svelte:head>

<SparkProductLaunchBoard />

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Readiness map"
    title="Pengguna melihat jalur, bukan tumpukan halaman."
    copy="Spark menyatukan fondasi, praktik, komunitas, Passport, dan Hub sebagai satu perjalanan."
  />
  <SparkHomeReadinessMap />
</section>

<section class="spark-section">
  <SparkHomeHubPreview />
</section>
