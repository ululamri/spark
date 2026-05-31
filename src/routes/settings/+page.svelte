<script lang="ts">
  import SparkPreviewToggle from '$shell/SparkPreviewToggle.svelte';
  import SparkPalettePreview from '$ui/SparkPalettePreview.svelte';
</script>

<svelte:head>
  <title>Settings — Karyra Spark</title>
</svelte:head>

<section class="spark-section">
  <span class="spark-eyebrow">Settings</span>
  <h1>Pengaturan tampilan dan mode preview.</h1>
  <p class="spark-lead">Gunakan toggle untuk menguji desktop/mobile, light/dark/system, dan arah visual Spark yang terinspirasi dari nuansa Starknet.</p>
  <SparkPreviewToggle />
</section>

<section class="spark-section">
  <SparkPalettePreview />
</section>
