<script lang="ts">
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
  <SparkSectionHeader
    eyebrow="Workshop board"
    title="Komunitas adalah bukti bahwa Spark menyentuh pengguna nyata."
    copy="Setiap workshop disusun sebagai jembatan antara materi, praktik, dan partisipasi lokal."
  />

  <SparkWorkshopBoard />
</section>
