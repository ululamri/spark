<script lang="ts">
  import SparkAppFlowChecklist from '$ui/SparkAppFlowChecklist.svelte';
  import SparkUserDashboard from '$ui/SparkUserDashboard.svelte';
</script>

<svelte:head>
  <title>Dashboard — Karyra Spark</title>
</svelte:head>

<SparkUserDashboard />

<section class="spark-section">
  <SparkAppFlowChecklist />
</section>
