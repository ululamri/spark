<script lang="ts">
  import SparkPassportReadinessCenter from '$ui/SparkPassportReadinessCenter.svelte';
  import SparkPassportBackendPanel from '$ui/SparkPassportBackendPanel.svelte';
  import SparkProtectedRoute from '$ui/SparkProtectedRoute.svelte';
</script>

<svelte:head>
  <title>Passport — Karyra Spark</title>
  <meta
    name="description"
    content="Passport Spark adalah bukti perjalanan belajar, latihan aman, dan kesiapan pengguna untuk menjelajahi blockchain dan Starknet secara bertahap."
  />
</svelte:head>

<SparkProtectedRoute title="Masuk untuk melihat Passport" copy="Passport menampilkan bukti perjalanan belajar dan latihanmu di Spark.">
  <SparkPassportReadinessCenter />
  <SparkPassportBackendPanel />
</SparkProtectedRoute>
