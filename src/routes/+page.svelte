<script lang="ts">
  import SparkGuestStartPanel from '$ui/SparkGuestStartPanel.svelte';
  import SparkGuidedTourLite from '$ui/SparkGuidedTourLite.svelte';
  import SparkHomeFeatureGrid from '$ui/SparkHomeFeatureGrid.svelte';
  import SparkHomeHubPreview from '$ui/SparkHomeHubPreview.svelte';
  import SparkHomeNextAction from '$ui/SparkHomeNextAction.svelte';
  import SparkHomePathGrid from '$ui/SparkHomePathGrid.svelte';
  import SparkHomeProductStage from '$ui/SparkHomeProductStage.svelte';
  import SparkHomeReadinessMap from '$ui/SparkHomeReadinessMap.svelte';
  import SparkLocalDataNotice from '$ui/SparkLocalDataNotice.svelte';
  import SparkOnboardingPanel from '$ui/SparkOnboardingPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>
<svelte:head><title>Karyra Spark — Local Blockchain & Starknet Gateway</title></svelte:head>
<SparkHomeProductStage />
<section class="spark-section trust-compact-section"><SparkLocalDataNotice /></section>
<section class="spark-section"><SparkGuestStartPanel /></section>
<section class="spark-section"><SparkHomeNextAction /></section>
<section class="spark-section"><SparkGuidedTourLite /></section>
<section class="spark-section"><SparkHomeReadinessMap /></section>
<SparkOnboardingPanel />
<section class="spark-section"><SparkSectionHeader eyebrow="Jalur awal" title="Pilih jalur yang paling aman untukmu." copy="Jalur membantu rekomendasi awal. Spark tetap menjaga satu alur utama agar pengguna tidak bingung." /><SparkHomePathGrid /></section>
<section class="spark-section"><SparkSectionHeader eyebrow="Ruang utama" title="Tempat utama untuk mulai siap." copy="Spark menggabungkan belajar, praktik, komunitas, Passport, dan Hub dalam satu ekosistem." /><SparkHomeFeatureGrid /></section>
<section class="spark-section"><SparkHomeHubPreview /></section>
