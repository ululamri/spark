<script lang="ts">
  import SparkCohortBoard from '$ui/SparkCohortBoard.svelte';
  import SparkCommunityActivationGrid from '$ui/SparkCommunityActivationGrid.svelte';
  import SparkCommunityBridgePanel from '$ui/SparkCommunityBridgePanel.svelte';
  import SparkCommunityImpact from '$ui/SparkCommunityImpact.svelte';
  import SparkLocalDataNotice from '$ui/SparkLocalDataNotice.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkTrustNotice from '$ui/SparkTrustNotice.svelte';
  import SparkWorkshopBoard from '$ui/SparkWorkshopBoard.svelte';
</script>

<svelte:head>
  <title>Community & Workshop — Karyra Spark</title>
</svelte:head>

<SparkPageHeader eyebrow="Community" title="Belajar tidak berhenti di layar." copy="Workshop, cohort, fasilitator, dan komunitas lokal menjadi jembatan antara kursus online dan pemahaman nyata." mode="community" />

<section class="spark-section trust-compact-section"><SparkLocalDataNotice /></section>
<section class="spark-section"><SparkCommunityBridgePanel /></section>

<section class="spark-section" id="workshops">
  <SparkSectionHeader eyebrow="Workshop board" title="Workshop mendatang." copy="Setiap workshop disusun sebagai jembatan antara materi, praktik, dan partisipasi lokal." />
  <SparkWorkshopBoard />
</section>

<section class="spark-section" id="cohorts">
  <SparkSectionHeader eyebrow="Cohort aktif" title="Ruang belajar komunitas yang lebih terarah." copy="Cohort membantu pengguna bergerak bersama dari pemula, praktik, sampai eksplorasi ekosistem." />
  <SparkCohortBoard />
</section>

<section class="spark-section">
  <SparkSectionHeader eyebrow="Dampak komunitas" title="Target awal aktivasi lokal." copy="Angka berikut dipakai sebagai arah/target beta, bukan klaim traction final." />
  <SparkTrustNotice type="targetMetric" title="Label target dipasang untuk menjaga transparansi." copy="Spark belum mengklaim traction publik. Angka community dipakai untuk menunjukkan rencana kapasitas dan desain aktivasi." />
  <div class="trust-notice-spacer"></div>
  <SparkCommunityImpact />
</section>

<section class="spark-section">
  <SparkSectionHeader eyebrow="Aktivasi komunitas" title="Cara Spark masuk ke komunitas nyata." copy="Spark dirancang untuk pengguna nyata, proses nyata, dan komunitas nyata." />
  <SparkCommunityActivationGrid />
</section>
