<script lang="ts">
  import SparkProfileAccountCenter from '$ui/SparkProfileAccountCenter.svelte';
  import SparkProtectedRoute from '$ui/SparkProtectedRoute.svelte';
</script>

<svelte:head>
  <title>Ruang Saya — Karyra Spark</title>
  <meta name="description" content="Ruang Saya Karyra Spark: profil, Passport, tanda kesiapan, aktivitas belajar, dan koneksi komunitas." />
</svelte:head>

<SparkProtectedRoute title="Masuk untuk membuka Ruang Saya" copy="Profil dan Passport hanya bisa dilihat setelah kamu masuk.">
  <SparkProfileAccountCenter />
</SparkProtectedRoute>
