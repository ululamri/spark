<script lang="ts">
  import SparkCoreCommandCenter from '$ui/SparkCoreCommandCenter.svelte';
  import SparkCoreCurriculumGrid from '$ui/SparkCoreCurriculumGrid.svelte';
  import SparkCoreSupportPanel from '$ui/SparkCoreSupportPanel.svelte';
  import SparkLearningModeStrip from '$ui/SparkLearningModeStrip.svelte';
  import SparkModuleAccordion from '$ui/SparkModuleAccordion.svelte';
  import SparkOnboardingPanel from '$ui/SparkOnboardingPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
</script>
<svelte:head><title>Spark Core — Karyra Spark</title></svelte:head>
<SparkCoreCommandCenter />
<section class="spark-section"><SparkOnboardingPanel /></section>
<section class="spark-section"><SparkLearningModeStrip /></section>
<section class="spark-section" id="curriculum"><SparkSectionHeader eyebrow="Kurikulum utama" title="7 level menuju readiness blockchain dan Starknet." copy="Core kembali menjadi pusat kurikulum besar: fondasi, cryptocurrency, wallet safety, Web3, Starknet, Practice Lab, dan Passport." /><SparkCoreCurriculumGrid /></section>
<section class="spark-section"><SparkCoreSupportPanel /></section>
<section class="spark-section"><SparkSectionHeader eyebrow="Accordion detail" title="Buka detail lesson sesuai kebutuhan." copy="Grid memberi gambaran besar. Accordion tetap tersedia untuk membaca lesson secara terstruktur." /><SparkModuleAccordion /></section>
