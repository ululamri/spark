<script lang="ts">
  import SparkCard from '$ui/SparkCard.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkSyncStatus from '$ui/SparkSyncStatus.svelte';
  import { learningState, resetOnboarding } from '$state/learning-state.svelte';
  import { gatewayState } from '$state/gateway-state.svelte';

  const modeLabel = $derived(
    learningState.experience === 'beginner'
      ? 'Baru mulai'
      : learningState.experience === 'guided'
        ? 'Sudah ada dasar'
        : learningState.experience === 'explorer'
          ? 'Siap teknis'
          : 'Belum dipilih'
  );

  const onboardingCopy = $derived(
    learningState.onboardingComplete
      ? 'Onboarding awal selesai. Mode bisa diubah kapan saja dari Settings.'
      : 'Mulai dari Home atau Core untuk memilih mode belajar awal.'
  );
</script>

<svelte:head>
  <title>Profile & Passport — Karyra Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Profile + Passport"
  title="Identitas belajar dan bukti readiness."
  copy="Passport merangkum progress belajar, checkpoint, praktik, partisipasi workshop, dan resource Hub tersimpan."
  mode="profile"
>
  <button class="text-action" type="button" onclick={resetOnboarding}>Ulangi onboarding</button>
</SparkPageHeader>

<section class="spark-section profile-mode-surface">
  <SparkCard class="profile-mode-card">
    <span class="spark-eyebrow">Mode belajar</span>
    <strong>{modeLabel}</strong>
    <p>{onboardingCopy}</p>
  </SparkCard>
</section>

<section class="spark-section">
  <SparkReadinessPanel />
</section>

<section class="spark-section">
  <SparkSyncStatus />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Saved gateway"
    title="Workshop dan Hub tersimpan."
    copy="Sinyal partisipasi komunitas dan eksplorasi ekosistem ditampilkan sebagai bagian dari Passport."
  />

  <div class="spark-profile-grid surface-grid">
    <SparkCard>
      <span>Workshop tersimpan</span>
      <strong class="big">{gatewayState.registeredWorkshopIds.length}</strong>
      <p>Menunjukkan partisipasi komunitas.</p>
    </SparkCard>
    <SparkCard>
      <span>Resource Hub</span>
      <strong class="big">{gatewayState.savedHubResourceIds.length}</strong>
      <p>Resource yang disimpan untuk eksplorasi lanjutan.</p>
    </SparkCard>
    <SparkCard>
      <span>Bridge teknis</span>
      <strong class="big">{gatewayState.dismissedBridgeIds.length}</strong>
      <p>Catatan interaksi dengan bagian teknis.</p>
    </SparkCard>
  </div>
</section>
