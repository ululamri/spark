<script lang="ts">
  import SparkCohortBoardRich from '$ui/SparkCohortBoardRich.svelte';
  import SparkCommunityCommandCenter from '$ui/SparkCommunityCommandCenter.svelte';
  import SparkLocalDataNotice from '$ui/SparkLocalDataNotice.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkWorkshopEventBoardRich from '$ui/SparkWorkshopEventBoardRich.svelte';
  import SparkSocialLayer from '$ui/social/SparkSocialLayer.svelte';
</script>

<svelte:head>
  <title>Community & Workshop — Karyra Spark</title>
</svelte:head>

<SparkCommunityCommandCenter />

<section class="spark-section trust-compact-section">
  <SparkLocalDataNotice />
</section>

<section class="spark-section" id="social-layer">
  <SparkSocialLayer />
</section>

<section class="spark-section" id="workshops">
  <SparkSectionHeader
    eyebrow="Workshop board"
    title="Workshop dibuat terasa seperti event nyata."
    copy="Setiap workshop punya format, lokasi, fasilitator, kapasitas, progress bar, dan aksi simpan."
  />

  <SparkWorkshopEventBoardRich />
</section>

<section class="spark-section" id="cohorts">
  <SparkSectionHeader
    eyebrow="Cohort & impact"
    title="Komunitas menjadi jembatan dari belajar ke praktik nyata."
    copy="Cohort membantu pengguna bergerak bersama dari pemula, praktik, sampai eksplorasi ekosistem."
  />

  <SparkCohortBoardRich />
</section>
