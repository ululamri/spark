<script lang="ts">
  import SparkPreferencePanel from '$ui/SparkPreferencePanel.svelte';
</script>

<svelte:head>
  <title>Settings — Karyra Spark</title>
</svelte:head>

<section class="spark-section settings-hero">
  <span class="spark-eyebrow">Settings</span>
  <h1>Pengaturan Spark.</h1>
  <p class="spark-lead">
    Atur tampilan, tema, mode belajar, dan data lokal. Bagian ini hanya berisi pengaturan yang relevan untuk pengguna.
  </p>
</section>

<section class="spark-section">
  <SparkPreferencePanel />
</section>
