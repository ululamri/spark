<script lang="ts">
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkPreferencePanel from '$ui/SparkPreferencePanel.svelte';
</script>

<svelte:head>
  <title>Settings — Karyra Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Settings"
  title="Pengaturan Spark."
  copy="Atur tampilan, tema, mode belajar, dan data lokal. Bagian ini hanya berisi pengaturan yang relevan untuk pengguna."
  mode="profile"
  compact
/>

<section class="spark-section">
  <SparkPreferencePanel />
</section>
