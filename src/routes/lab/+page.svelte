<script lang="ts">
  import SparkExplorerPlaceholder from '$ui/SparkExplorerPlaceholder.svelte';
  import SparkLabCommandCenter from '$ui/SparkLabCommandCenter.svelte';
  import SparkLabProofRoadmapRich from '$ui/SparkLabProofRoadmapRich.svelte';
  import SparkLabRichGrid from '$ui/SparkLabRichGrid.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkWalletPlaceholder from '$ui/SparkWalletPlaceholder.svelte';
</script>

<svelte:head>
  <title>Practice Lab — Karyra Spark</title>
</svelte:head>

<SparkLabCommandCenter />

<section class="spark-section">
  <SparkWalletPlaceholder />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Advanced workspace"
    title="Mode Penjelajah tetap punya ruang kerja teknis."
    copy="CodeMirror dan StarknetKit disimpan untuk tahap setelah grant/backend lebih pasti, tetapi arah teknisnya sudah terlihat."
  />
  <SparkExplorerPlaceholder />
</section>

<section class="spark-section" id="lab-modules">
  <SparkSectionHeader
    eyebrow="Modul praktik"
    title="Latihan dibuat seperti flow produk, bukan kartu statis."
    copy="Setiap lab punya outcome, guardrail, step, status, dan aksi yang masuk ke Passport."
  />

  <SparkLabRichGrid />
</section>

<section class="spark-section">
  <SparkLabProofRoadmapRich />
</section>
