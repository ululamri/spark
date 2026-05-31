<script lang="ts">
  import SparkLocalDataNotice from '$ui/SparkLocalDataNotice.svelte';
  import SparkPassportAccessCard from '$ui/SparkPassportAccessCard.svelte';
  import SparkProfileHero from '$ui/SparkProfileHero.svelte';
  import SparkProfileMenu from '$ui/SparkProfileMenu.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkSyncStatus from '$ui/SparkSyncStatus.svelte';
</script>

<svelte:head>
  <title>Profile & Passport — Karyra Spark</title>
</svelte:head>

<SparkProfileHero />
<section class="spark-section trust-compact-section"><SparkLocalDataNotice /></section>
<section class="spark-section"><SparkPassportAccessCard /></section>

<section class="spark-section">
  <SparkSectionHeader eyebrow="Ringkasan readiness" title="Progress yang tersimpan di perangkat ini." copy="Saat backend siap, bagian ini bisa dihubungkan ke API tanpa mengubah struktur utama halaman." />
  <SparkReadinessPanel />
</section>

<section class="spark-section"><SparkSyncStatus /></section>

<section class="spark-section">
  <SparkSectionHeader eyebrow="Menu profil" title="Akses cepat ke aktivitas pengguna." copy="Profile menjadi pusat identitas, progress, komunitas, preferensi, dan akses menuju Hub." />
  <SparkProfileMenu />
</section>
