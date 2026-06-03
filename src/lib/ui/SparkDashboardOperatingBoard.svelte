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
  const readiness = $derived(getReadinessScore());
  const progress = $derived(getLearningProgressPercent());

  const daily = $derived.by(() => {
    if (getCompletedLessonCount() === 0) {
      return {
        title: 'Mulai dari fondasi',
        copy: 'Ambil satu lesson pendek untuk membangun dasar sebelum masuk Lab atau Hub.',
        href: '/core',
        cta: 'Buka Core',
        icon: 'book-open'
      };
    }
    if (learningState.completedLabIds.length === 0) {
      return {
        title: 'Coba latihan aman',
        copy: 'Ubah pemahaman menjadi praktik ringan tanpa risiko transaksi nyata.',
        href: '/lab',
        cta: 'Buka Lab',
        icon: 'flask-conical'
      };
    }
    if (gatewayState.registeredWorkshopIds.length === 0) {
      return {
        title: 'Temukan komunitas',
        copy: 'Workshop dan cohort membantu belajar lebih terarah bersama orang lain.',
        href: '/community',
        cta: 'Komunitas',
        icon: 'users'
      };
    }
    return {
      title: 'Jelajahi Hub',
      copy: 'Simpan resource ekosistem yang sesuai dengan kesiapanmu.',
      href: '/hub',
      cta: 'Buka Hub',
      icon: 'compass'
    };
  });

  const stats = $derived([
    { label: 'Belajar', value: `${getCompletedLessonCount()}`, href: `/lesson/${getRecommendedLessonSlug()}`, icon: 'book-open' },
    { label: 'Lab', value: `${learningState.completedLabIds.length}`, href: '/lab', icon: 'flask-conical' },
    { label: 'Pesan', value: `${unreadMessages}`, href: '/inbox', icon: 'messages' },
    { label: 'Hub', value: `${gatewayState.savedHubResourceIds.length}`, href: '/hub', icon: 'compass' }
  ]);

  const routes = [
    { title: 'Core', copy: 'Lesson utama', href: '/core', icon: 'book-open' },
    { title: 'Lab', copy: 'Simulasi aman', href: '/lab', icon: 'flask-conical' },
    { title: 'Komunitas', copy: 'Workshop lokal', href: '/community', icon: 'users' },
    { title: 'Hub', copy: 'Resource pilihan', href: '/hub', icon: 'compass' }
  ];
</script>

<section class="dashboard-surface-v35b1" aria-label="Dashboard harian Spark">
  <div class="dashboard-summary-v35b1">
    <div class="dashboard-user-v35b1">
      <span>{userName.slice(0, 1)}</span>
      <div>
        <small>Hari ini</small>
        <strong>{userName}</strong>
      </div>
    </div>

    <div class="dashboard-focus-v35b1">
      <span><SparkIcon name={daily.icon} size={18} /></span>
      <div>
        <small>Fokus berikutnya</small>
        <h1>{daily.title}</h1>
        <p>{daily.copy}</p>
      </div>
    </div>

    <div class="dashboard-status-v35b1" aria-label="Status belajar">
      <div>
        <strong>{readiness}%</strong>
        <span>Passport</span>
      </div>
      <div>
        <strong>{progress}%</strong>
        <span>Belajar</span>
      </div>
      <SparkTrustBadge label={readiness >= 75 ? 'Siap jelajah' : 'Bertahap'} tone={readiness >= 75 ? 'safe' : 'beta'} />
    </div>

    <div class="dashboard-actions-v35b1">
      <SparkButton href={daily.href} size="sm">{daily.cta}</SparkButton>
      <SparkButton href="/profile" variant="secondary" size="sm">Passport</SparkButton>
    </div>
  </div>

  <nav class="dashboard-stat-strip-v35b1" aria-label="Ringkasan cepat">
    {#each stats as item}
      <a href={item.href}>
        <SparkIcon name={item.icon} size={15} />
        <strong>{item.value}</strong>
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <nav class="dashboard-route-strip-v35b1" aria-label="Jalur utama Spark">
    {#each routes as route}
      <a href={route.href}>
        <span><SparkIcon name={route.icon} size={16} /></span>
        <div>
          <strong>{route.title}</strong>
          <small>{route.copy}</small>
        </div>
      </a>
    {/each}
  </nav>
</section>
