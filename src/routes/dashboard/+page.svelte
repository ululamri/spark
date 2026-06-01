<script lang="ts">
  import SparkAppFlowChecklist from '$ui/SparkAppFlowChecklist.svelte';
  import SparkDashboardOperatingBoard from '$ui/SparkDashboardOperatingBoard.svelte';
</script>

<svelte:head>
  <title>Dashboard — Karyra Spark</title>
</svelte:head>

<SparkDashboardOperatingBoard />

<section class="spark-section compact-flow-section">
  <SparkAppFlowChecklist />
</section>
