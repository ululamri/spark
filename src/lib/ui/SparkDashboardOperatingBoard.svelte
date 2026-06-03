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

  const userName = $derived(betaSession.user?.name ?? 'Karyra');
  const unreadMessages = $derived(sparkMessages.filter((message) => !messageState.readMessageIds.includes(message.id)).length);

  const daily = $derived.by(() => {
    if (getCompletedLessonCount() === 0) return { title: 'Mulai dari fondasi', copy: 'Ambil satu lesson pendek sebelum masuk ke Lab atau Hub.', href: '/core', cta: 'Buka Core', icon: 'book-open' };
    if (learningState.completedLabIds.length === 0) return { title: 'Coba latihan aman', copy: 'Ubah pemahaman menjadi praktik ringan tanpa risiko.', href: '/lab', cta: 'Buka Lab', icon: 'flask-conical' };
    if (gatewayState.registeredWorkshopIds.length === 0) return { title: 'Temukan komunitas', copy: 'Workshop dan cohort membantu belajar lebih terarah.', href: '/community', cta: 'Buka Komunitas', icon: 'users' };
    return { title: 'Jelajahi Hub', copy: 'Simpan resource ekosistem yang sesuai dengan kesiapanmu.', href: '/hub', cta: 'Buka Hub', icon: 'compass' };
  });

  const lanes = $derived([
    { title: 'Lesson', value: `${getCompletedLessonCount()}`, href: `/lesson/${getRecommendedLessonSlug()}`, icon: 'book-open' },
    { title: 'Lab', value: `${learningState.completedLabIds.length}`, href: '/lab', icon: 'flask-conical' },
    { title: 'Inbox', value: `${unreadMessages}`, href: '/inbox', icon: 'messages' },
    { title: 'Hub', value: `${gatewayState.savedHubResourceIds.length}`, href: '/hub', icon: 'compass' }
  ]);
</script>

<section class="ops-board pass35b-ops-board">
  <div class="ops-main-card">
    <div class="ops-user-line">
      <span>{userName.slice(0, 1)}</span>
      <div><strong>{userName}</strong><small>{getLearningProgressPercent()}% progress belajar</small></div>
      <SparkTrustBadge label={`${getReadinessScore()}%`} tone={getReadinessScore() >= 75 ? 'safe' : 'beta'} />
    </div>

    <div class="ops-focus">
      <span><SparkIcon name={daily.icon} size={22} /></span>
      <div><span class="spark-eyebrow">Fokus hari ini</span><h1>{daily.title}</h1><p>{daily.copy}</p></div>
    </div>

    <div class="ops-actions">
      <SparkButton href={daily.href} size="sm">{daily.cta}</SparkButton>
      <SparkButton href="/profile" variant="secondary" size="sm">Passport</SparkButton>
    </div>
  </div>

  <aside class="ops-right-rail">
    <div class="ops-readiness-card">
      <div class="ops-ring" style={`--value:${getReadinessScore()}`}><strong>{getReadinessScore()}%</strong><span>Passport</span></div>
      <p>Readiness dibaca dari belajar, Lab, komunitas, dan Hub.</p>
    </div>

    <div class="ops-lane-grid pass35b-metric-grid">
      {#each lanes as lane}
        <a href={lane.href}>
          <SparkIcon name={lane.icon} size={16} />
          <strong>{lane.value}</strong>
          <span>{lane.title}</span>
        </a>
      {/each}
    </div>
  </aside>
</section>

<section class="ops-action-strip pass35b-action-strip" aria-label="Jalur utama Spark">
  <a href="/core"><SparkIcon name="book-open" size={17} /><strong>Core</strong><span>Belajar</span></a>
  <a href="/lab"><SparkIcon name="flask-conical" size={17} /><strong>Lab</strong><span>Praktik</span></a>
  <a href="/community"><SparkIcon name="users" size={17} /><strong>Komunitas</strong><span>Bersama</span></a>
  <a href="/hub"><SparkIcon name="compass" size={17} /><strong>Hub</strong><span>Resource</span></a>
</section>
