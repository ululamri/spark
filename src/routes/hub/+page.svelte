<script lang="ts">
  import SparkButton from '$ui/SparkButton.svelte';
  import SparkHubDirectory from '$ui/SparkHubDirectory.svelte';
  import SparkHubGatewayOverview from '$ui/SparkHubGatewayOverview.svelte';
  import SparkHubMissionBoard from '$ui/SparkHubMissionBoard.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import { getHubUrl } from '$lib/config/spark-topology';
</script>

<svelte:head>
  <title>Hub Gateway — Karyra Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Spark Hub"
  title="Gateway eksplorasi ekosistem."
  copy="Hub menghubungkan learner yang sudah siap ke resource, aplikasi, tools, games, komunitas, dan misi blockchain/Web3/Starknet."
  mode="hub"
>
  <SparkButton href={getHubUrl('/')} variant="secondary">Buka Frontend Hub</SparkButton>
</SparkPageHeader>

<section class="spark-section">
  <SparkHubGatewayOverview />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Hub missions"
    title="Misi ringan sebelum eksplorasi lebih jauh."
    copy="Misi Hub membantu pengguna tetap terarah setelah menyelesaikan fondasi awal."
  />

  <SparkHubMissionBoard />
</section>

<section class="spark-section" id="directory">
  <SparkSectionHeader
    eyebrow="Resource directory"
    title="Eksplorasi diberi label risiko dan readiness gate."
    copy="Resource tetap bisa dilihat, tetapi Spark memberi jembatan agar pengguna pemula tidak langsung masuk bagian teknis."
  />

  <SparkHubDirectory />
</section>
