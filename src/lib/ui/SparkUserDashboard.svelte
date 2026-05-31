<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkPassportGauge from './SparkPassportGauge.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { dashboardActions, dashboardModes } from '$lib/dashboard/dashboard-model';
  import { getHubAccessCopy } from '$lib/profile/profile-model';
  import { betaSession, getModeLabel } from '$state/beta-session-state.svelte';
  import { gatewayState } from '$state/gateway-state.svelte';
  import {
    getCompletedLessonCount,
    getLearningProgressPercent,
    getReadinessScore,
    getRecommendedLessonSlug,
    getTotalLessonCount,
    learningState,
    setExperience
  } from '$state/learning-state.svelte';

  type SafeExperienceMode = 'beginner' | 'guided' | 'explorer';

  function toSafeExperienceMode(value: unknown): SafeExperienceMode {
    return value === 'beginner' || value === 'guided' || value === 'explorer' ? value : 'beginner';
  }

  const userName = $derived(betaSession.user?.name ?? 'Karyra Learner');
  const userHandle = $derived(betaSession.user?.handle ?? '@spark-learner');
  const safeMode = $derived(toSafeExperienceMode(betaSession.user?.mode ?? learningState.experience));
  const modeLabel = $derived(getModeLabel(safeMode));
  const readiness = $derived(getReadinessScore());
  const hubAccess = $derived(getHubAccessCopy(readiness));

  const nextAction = $derived.by(() => {
    if (getCompletedLessonCount() === 0) {
      return {
        href: '/core',
        title: 'Mulai lesson pertama',
        copy: 'Bangun fondasi blockchain sebelum masuk Practice Lab.',
        cta: 'Mulai Core'
      };
    }

    if (learningState.completedLabIds.length === 0) {
      return {
        href: '/lab',
        title: 'Lanjut ke Practice Lab',
        copy: 'Ubah pemahaman menjadi simulasi dan proof-of-practice.',
        cta: 'Buka Lab'
      };
    }

    if (readiness < 75) {
      return {
        href: '/profile',
        title: 'Lengkapi Passport',
        copy: 'Naikkan readiness lewat lesson, lab, dan komunitas.',
        cta: 'Lihat Passport'
      };
    }

    return {
      href: '/hub',
      title: 'Jelajahi Hub',
      copy: 'Readiness cukup untuk masuk gateway resource dan ekosistem.',
      cta: 'Buka Hub'
    };
  });
</script>

<section class="spark-dashboard-hero">
  <div class="dashboard-identity">
    <div class="dashboard-avatar">{userName.slice(0, 1)}</div>
    <div>
      <span class="spark-eyebrow">Dashboard</span>
      <h1>Halo, {userName}</h1>
      <p>{userHandle} · {modeLabel} · progress lokal tersimpan di perangkat ini</p>
      <div class="dashboard-badges">
        <SparkTrustBadge label="Beta tertutup" tone="beta" />
        <SparkTrustBadge label="Data lokal" tone="local" />
        <SparkTrustBadge label={hubAccess.unlocked ? 'Hub siap' : 'Hub bertahap'} tone={hubAccess.unlocked ? 'safe' : 'target'} />
      </div>
    </div>
  </div>

  <aside class="dashboard-passport-preview">
    <SparkPassportGauge value={readiness} label="Passport" copy="Readiness" />
    <div>
      <strong>{readiness}% readiness</strong>
      <small>{getLearningProgressPercent()}% belajar · {getCompletedLessonCount()}/{getTotalLessonCount()} lesson</small>
    </div>
  </aside>
</section>

<section class="spark-dashboard-next">
  <SparkCard class="dashboard-next-card">
    <div>
      <span class="spark-eyebrow">Langkah berikutnya</span>
      <h2>{nextAction.title}</h2>
      <p>{nextAction.copy}</p>
    </div>
    <div class="dashboard-next-actions">
      <SparkButton href={nextAction.href}>{nextAction.cta}</SparkButton>
      <SparkButton href={`/lesson/${getRecommendedLessonSlug()}`} variant="secondary">Lesson Rekomendasi</SparkButton>
    </div>
  </SparkCard>
</section>

<section class="spark-dashboard-grid">
  {#each dashboardActions as action}
    <a href={action.href}>
      <SparkCard tone={action.tone}>
        <span class="dashboard-action-icon"><SparkIcon name={action.icon} size={19} /></span>
        <h3>{action.title}</h3>
        <p>{action.copy}</p>
        <em>›</em>
      </SparkCard>
    </a>
  {/each}
</section>

<section class="spark-dashboard-activity">
  <SparkCard class="dashboard-activity-card">
    <span class="spark-eyebrow">Aktivitas belajar</span>
    <h2>Ringkasan perjalananmu.</h2>

    <div class="dashboard-stat-grid">
      <div>
        <strong>{getCompletedLessonCount()}</strong>
        <span>Lesson selesai</span>
      </div>
      <div>
        <strong>{learningState.completedLabIds.length}</strong>
        <span>Lab selesai</span>
      </div>
      <div>
        <strong>{gatewayState.registeredWorkshopIds.length}</strong>
        <span>Workshop tersimpan</span>
      </div>
      <div>
        <strong>{gatewayState.savedHubResourceIds.length}</strong>
        <span>Resource Hub</span>
      </div>
    </div>
  </SparkCard>

  <SparkCard class="dashboard-mode-card">
    <span class="spark-eyebrow">Mode belajar</span>
    <h2>Sesuaikan jalur tanpa membuat pengguna tersesat.</h2>

    <div class="dashboard-mode-list">
      {#each dashboardModes as mode}
        <button type="button" class:active={learningState.experience === mode.key} onclick={() => setExperience(mode.key)}>
          <SparkIcon name={mode.icon} size={17} />
          <span>
            <strong>{mode.title}</strong>
            <small>{mode.copy}</small>
          </span>
        </button>
      {/each}
    </div>
  </SparkCard>
</section>
