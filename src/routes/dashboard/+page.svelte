<script lang="ts">
  import SparkAppFlowChecklist from '$ui/SparkAppFlowChecklist.svelte';
  import SparkDashboardCommandDeck from '$ui/SparkDashboardCommandDeck.svelte';
  import SparkUserDashboard from '$ui/SparkUserDashboard.svelte';
</script>

<svelte:head>
  <title>Dashboard — Karyra Spark</title>
</svelte:head>

<SparkDashboardCommandDeck />

<section class="spark-section dashboard-user-summary-section">
  <SparkUserDashboard />
</section>

<section class="spark-section">
  <SparkAppFlowChecklist />
</section>
