<script lang="ts">
  import SparkButton from '$ui/SparkButton.svelte';
  import SparkHeroVisual from '$ui/SparkHeroVisual.svelte';
  import SparkHubDirectory from '$ui/SparkHubDirectory.svelte';
  import { getHubUrl } from '$lib/config/spark-topology';
</script>

<svelte:head>
  <title>Hub Gateway — Karyra Spark</title>
</svelte:head>

<section class="spark-hero hub">
  <div>
    <span class="spark-eyebrow">Spark Hub</span>
    <h1>Gateway eksplorasi ekosistem.</h1>
    <p>Hub menghubungkan learner yang sudah siap ke resource, aplikasi, tools, games, komunitas, dan misi blockchain/Web3/Starknet.</p>
    <div class="spark-hero-actions">
      <SparkButton href={getHubUrl('/')} variant="secondary">Buka Frontend Hub</SparkButton>
    </div>
  </div>
  <aside class="spark-hero-panel">
    <SparkHeroVisual mode="hub" />
  </aside>
</section>

<section class="spark-section">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Resource directory</span>
      <h2>Eksplorasi diberi label risiko dan readiness gate.</h2>
    </div>
  </div>

  <SparkHubDirectory />
</section>
