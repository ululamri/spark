<script lang="ts">
  import SparkCohortBoard from '$ui/SparkCohortBoard.svelte';
  import SparkCommunityActivationGrid from '$ui/SparkCommunityActivationGrid.svelte';
  import SparkCommunityBridgePanel from '$ui/SparkCommunityBridgePanel.svelte';
  import SparkCommunityImpact from '$ui/SparkCommunityImpact.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkWorkshopBoard from '$ui/SparkWorkshopBoard.svelte';
</script>

<svelte:head>
  <title>Community & Workshop — Karyra Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Community"
  title="Belajar tidak berhenti di layar."
  copy="Workshop, cohort, fasilitator, dan komunitas lokal menjadi jembatan antara kursus online dan pemahaman nyata."
  mode="community"
/>

<section class="spark-section">
  <SparkCommunityBridgePanel />
</section>

<section class="spark-section" id="workshops">
  <SparkSectionHeader
    eyebrow="Workshop board"
    title="Workshop mendatang."
    copy="Setiap workshop disusun sebagai jembatan antara materi, praktik, dan partisipasi lokal."
  />

  <SparkWorkshopBoard />
</section>

<section class="spark-section" id="cohorts">
  <SparkSectionHeader
    eyebrow="Cohort aktif"
    title="Ruang belajar komunitas yang lebih terarah."
    copy="Cohort membantu pengguna bergerak bersama dari pemula, praktik, sampai eksplorasi ekosistem."
  />

  <SparkCohortBoard />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Dampak komunitas"
    title="Sinyal awal aktivasi lokal."
    copy="Angka ini masih bersifat preview lokal sampai backend dan sistem impact tracking aktif."
  />

  <SparkCommunityImpact />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Aktivasi komunitas"
    title="Cara Spark masuk ke komunitas nyata."
    copy="Spark dirancang untuk pengguna nyata, proses nyata, dan komunitas nyata."
  />

  <SparkCommunityActivationGrid />
</section>
