<script lang="ts">
  import SparkAvatarPicker from './SparkAvatarPicker.svelte';
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { getHubAccessCopy, getLearnerStage, profileQuickLinks } from '$lib/profile/profile-model';
  import { gatewayState } from '$state/gateway-state.svelte';
  import {
    getCompletedLessonCount,
    getLearningProgressPercent,
    getReadinessScore,
    learningState,
    resetOnboarding
  } from '$state/learning-state.svelte';

  const modeLabel = $derived(
    learningState.experience === 'beginner'
      ? 'Baru mulai'
      : learningState.experience === 'guided'
        ? 'Sudah ada dasar'
        : learningState.experience === 'explorer'
          ? 'Siap teknis'
          : 'Belum dipilih'
  );

  const readiness = $derived(getReadinessScore());
  const stage = $derived(getLearnerStage(readiness));
  const hubAccess = $derived(getHubAccessCopy(readiness));
</script>

<section class="spark-profile-hero">
  <aside class="profile-photo-panel">
    <SparkAvatarPicker />

    <a class="profile-friend-mini" href="/community">
      <span><SparkIcon name="users" size={18} /></span>
      <div>
        <strong>Komunitas</strong>
        <small>{gatewayState.registeredWorkshopIds.length} workshop tersimpan</small>
      </div>
      <em>›</em>
    </a>
  </aside>

  <div class="profile-identity-panel">
    <div class="profile-title-row">
      <div>
        <span class="spark-eyebrow">Profil Learner</span>
        <h1>Karyra Learner</h1>
      </div>
      <span class="profile-stage-chip">{stage}</span>
    </div>

    <p class="profile-subtitle">
      Profil lokal · {modeLabel} · {getCompletedLessonCount()} lesson selesai · {gatewayState.savedHubResourceIds.length} resource Hub tersimpan
    </p>

    <div class="profile-progress-row">
      <div class="profile-progress-bar"><span style={`width: ${Math.max(6, readiness)}%`}></span></div>
      <strong>{readiness}%</strong>
    </div>

    <div class="profile-action-row">
      <SparkButton href="/core">Lanjut Belajar</SparkButton>
      <SparkButton href="/settings" variant="secondary">Edit Preferensi</SparkButton>
      <button class="text-action" type="button" onclick={resetOnboarding}>Ulangi onboarding</button>
    </div>

    <div class="profile-meta-grid">
      <div>
        <span>Mode</span>
        <strong>{modeLabel}</strong>
      </div>
      <div>
        <span>Belajar</span>
        <strong>{getLearningProgressPercent()}%</strong>
      </div>
      <div>
        <span>Lab</span>
        <strong>{learningState.completedLabIds.length} selesai</strong>
      </div>
      <div>
        <span>Hub</span>
        <strong>{hubAccess.unlocked ? 'Terbuka' : 'Bertahap'}</strong>
      </div>
    </div>

    <div class="profile-quick-links">
      {#each profileQuickLinks as item}
        <a href={item.href}>
          <SparkIcon name={item.icon} size={17} />
          <span>
            <strong>{item.label}</strong>
            <small>{item.copy}</small>
          </span>
        </a>
      {/each}
    </div>
  </div>
</section>
