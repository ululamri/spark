<script lang="ts">
  import SparkCoreLearnCenter from '$ui/SparkCoreLearnCenter.svelte';
  import SparkModuleAccordion from '$ui/SparkModuleAccordion.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>

<svelte:head>
  <title>Learn / Core — Karyra Spark</title>
  <meta
    name="description"
    content="Pusat belajar Karyra Spark untuk memahami blockchain, cryptocurrency, Web3, wallet safety, dan Starknet secara bertahap."
  />
</svelte:head>

<SparkCoreLearnCenter />

<section class="spark-section learn-detail-section">
  <SparkSectionHeader
    eyebrow="Detail modul"
    title="Buka modul lengkap jika ingin melihat semua materi."
    copy="Bagian atas memberi jalur belajar yang ringkas. Detail modul tetap tersedia untuk pengguna yang ingin melihat seluruh isi kurikulum."
  />
  <SparkModuleAccordion />
</section>
