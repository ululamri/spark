<script lang="ts">
  import SparkCard from '$ui/SparkCard.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import SparkSyncStatus from '$ui/SparkSyncStatus.svelte';
  import { learningState, resetOnboarding } from '$state/learning-state.svelte';
  import { gatewayState } from '$state/gateway-state.svelte';
</script>

<svelte:head>
  <title>Profile & Passport — Karyra Spark</title>
</svelte:head>

<section class="spark-hero profile">
  <div>
    <span class="spark-eyebrow">Profile + Passport</span>
    <h1>Identitas belajar dan bukti readiness.</h1>
    <p>Passport menjadi bagian dari profil learner: progress, checkpoint, bookmark, praktik, partisipasi workshop, dan resource Hub tersimpan.</p>
    <div class="spark-hero-actions">
      <button class="text-action" type="button" onclick={resetOnboarding}>Ulangi onboarding</button>
    </div>
  </div>
  <aside class="spark-hero-panel profile-summary">
    <span>Mode</span>
    <strong>{learningState.experience}</strong>
    <p>{learningState.onboardingComplete ? 'Onboarding selesai' : 'Onboarding belum selesai'}</p>
  </aside>
</section>

<section class="spark-section">
  <SparkReadinessPanel />
</section>

<section class="spark-section">
  <SparkSyncStatus />
</section>

<section class="spark-section">
  <div class="spark-section-head">
    <div>
      <span class="spark-eyebrow">Saved gateway</span>
      <h2>Workshop dan Hub tersimpan.</h2>
    </div>
  </div>

  <div class="spark-profile-grid">
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
      <span>Bridge dismissed</span>
      <strong class="big">{gatewayState.dismissedBridgeIds.length}</strong>
      <p>Catatan interaksi dengan bagian teknis.</p>
    </SparkCard>
  </div>
</section>
