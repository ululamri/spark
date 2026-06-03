<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { sparkMessages } from '$lib/messaging/spark-messaging-model';
  import { betaSession } from '$state/beta-session-state.svelte';
  import { gatewayState } from '$state/gateway-state.svelte';
  import { messageState } from '$state/message-state.svelte';
  import {
    getCompletedLessonCount,
    getLearningProgressPercent,
    getReadinessScore,
    getRecommendedLessonSlug,
    learningState
  } from '$state/learning-state.svelte';

  const userName = $derived(betaSession.user?.name ?? 'Spark Learner');
  const unreadMessages = $derived(sparkMessages.filter((message) => !messageState.readMessageIds.includes(message.id)).length);

  const daily = $derived.by(() => {
    if (getCompletedLessonCount() === 0) return { title: 'Mulai lesson pertama', copy: 'Fondasi blockchain harus terlihat sebelum pengguna masuk Lab atau Hub.', href: '/core', cta: 'Buka Core', icon: 'book-open' };
    if (learningState.completedLabIds.length === 0) return { title: 'Coba Lab interaktif', copy: 'Ubah pemahaman menjadi checklist dan simulasi aman.', href: '/lab', cta: 'Buka Lab', icon: 'flask-conical' };
    if (gatewayState.registeredWorkshopIds.length === 0) return { title: 'Sambungkan ke komunitas', copy: 'Workshop dan cohort membuat Spark terasa dekat dengan pengguna nyata.', href: '/community', cta: 'Buka Community', icon: 'users' };
    return { title: 'Jelajahi Hub', copy: 'Readiness cukup untuk mulai menyimpan resource ekosistem.', href: '/hub', cta: 'Buka Hub', icon: 'compass' };
  });

  const lanes = $derived([
    { title: 'Lesson', value: `${getCompletedLessonCount()}`, href: `/lesson/${getRecommendedLessonSlug()}`, icon: 'book-open' },
    { title: 'Lab', value: `${learningState.completedLabIds.length}`, href: '/lab', icon: 'flask-conical' },
    { title: 'Inbox', value: `${unreadMessages}`, href: '/inbox', icon: 'messages' },
    { title: 'Hub', value: `${gatewayState.savedHubResourceIds.length}`, href: '/hub', icon: 'compass' }
  ]);
</script>

<section class="ops-board">
  <div class="ops-main-card">
    <div class="ops-user-line">
      <span>{userName.slice(0, 1)}</span>
      <div><strong>{userName}</strong><small>Dashboard harian · {getLearningProgressPercent()}% progress belajar</small></div>
      <SparkTrustBadge label={`${getReadinessScore()}% readiness`} tone={getReadinessScore() >= 75 ? 'safe' : 'beta'} />
    </div>

    <div class="ops-focus">
      <span><SparkIcon name={daily.icon} size={26} /></span>
      <div><span class="spark-eyebrow">Fokus hari ini</span><h1>{daily.title}</h1><p>{daily.copy}</p></div>
    </div>

    <div class="ops-actions">
      <SparkButton href={daily.href}>{daily.cta}</SparkButton>
      <SparkButton href="/profile" variant="secondary">Cek Passport</SparkButton>
    </div>
  </div>

  <aside class="ops-right-rail">
    <div class="ops-readiness-card">
      <div class="ops-ring" style={`--value:${getReadinessScore()}`}><strong>{getReadinessScore()}%</strong><span>Passport</span></div>
      <p>Readiness dibaca dari lesson, Lab, workshop, dan Hub resource.</p>
    </div>

    <div class="ops-lane-grid">
      {#each lanes as lane}
        <a href={lane.href}>
          <SparkIcon name={lane.icon} size={17} />
          <strong>{lane.value}</strong>
          <span>{lane.title}</span>
        </a>
      {/each}
    </div>
  </aside>
</section>

<section class="ops-action-strip">
  <a href="/core"><SparkIcon name="book-open" size={18} /><strong>Core</strong><span>Kurikulum utama</span></a>
  <a href="/lab"><SparkIcon name="flask-conical" size={18} /><strong>Lab</strong><span>Simulasi aman</span></a>
  <a href="/community"><SparkIcon name="users" size={18} /><strong>Community</strong><span>Workshop & cohort</span></a>
  <a href="/hub"><SparkIcon name="compass" size={18} /><strong>Hub</strong><span>Gateway resource</span></a>
</section>
