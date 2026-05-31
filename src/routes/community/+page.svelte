<script lang="ts">
  import SparkHeroVisual from '$ui/SparkHeroVisual.svelte';
  import SparkWorkshopBoard from '$ui/SparkWorkshopBoard.svelte';
</script>

<svelte:head>
  <title>Community & Workshop — Karyra Spark</title>
</svelte:head>

<section class="spark-hero community">
  <div>
    <span class="spark-eyebrow">Community</span>
    <h1>Belajar tidak berhenti di layar.</h1>
    <p>Workshop, cohort, fasilitator, dan komunitas lokal menjadi jembatan antara kursus online dan pemahaman nyata.</p>
  </div>
  <aside class="spark-hero-panel">
    <SparkHeroVisual mode="community" />
  </aside>
</section>

<section class="spark-section">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Workshop board</span>
      <h2>Community adalah bukti bahwa Spark menyentuh pengguna nyata.</h2>
    </div>
  </div>

  <SparkWorkshopBoard />
</section>
