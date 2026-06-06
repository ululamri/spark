<script lang="ts">
  import { onMount } from 'svelte';
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkPassportGauge from './SparkPassportGauge.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { betaSession } from '$state/beta-session-state.svelte';
  import { gatewayState } from '$state/gateway-state.svelte';
  import {
    getCompletedLessonCount,
    getLearningProgressPercent,
    getReadinessScore,
    getRecommendedLessonSlug,
    getTotalLessonCount,
    learningState
  } from '$state/learning-state.svelte';
  import { profileState, restoreProfileState } from '$state/profile-state.svelte';

  onMount(() => {
    restoreProfileState();
  });

  const displayName = $derived(profileState.displayName || betaSession.user?.name || 'Pengguna Spark');
  const readiness = $derived(getReadinessScore());
  const learningProgress = $derived(getLearningProgressPercent());
  const completedLessons = $derived(getCompletedLessonCount());
  const totalLessons = $derived(getTotalLessonCount());
  const completedLabs = $derived(learningState.completedLabIds.length);
  const registeredWorkshops = $derived(gatewayState.registeredWorkshopIds.length);
  const savedResources = $derived(gatewayState.savedHubResourceIds.length);

  const passportLevel = $derived(
    readiness >= 80 && completedLabs >= 3
      ? 'Advanced'
      : readiness >= 50 && completedLabs >= 1
        ? 'Intermediate'
        : 'Beginner'
  );

  const assurance = $derived(
    registeredWorkshops > 0
      ? { label: 'Community verified', copy: 'Ada tanda partisipasi komunitas di perjalananmu.', tone: 'safe' as const }
      : { label: 'Self-attested', copy: 'Bukti awal berasal dari progres belajar dan latihanmu di Spark.', tone: 'target' as const }
  );

  const stage = $derived(
    readiness >= 75
      ? { title: 'Siap eksplorasi bertahap', copy: 'Fondasi dan latihanmu sudah cukup kuat untuk membuka rujukan lanjutan dengan tetap hati-hati.', href: '/hub', cta: 'Buka Hub' }
      : completedLabs === 0
        ? { title: 'Perkuat lewat Lab', copy: 'Latihan singkat membantu menguji cara mengambil keputusan aman sebelum menjelajah lebih jauh.', href: '/lab', cta: 'Coba Lab' }
        : { title: 'Lanjutkan belajar', copy: 'Satu materi berikutnya akan membuat Passport kamu makin lengkap.', href: `/lesson/${getRecommendedLessonSlug()}`, cta: 'Lanjutkan belajar' }
  );

  const signals = $derived([
    { label: 'Belajar', value: `${completedLessons}/${totalLessons}`, copy: 'Materi selesai', icon: 'book-open', href: '/core' },
    { label: 'Lab', value: `${completedLabs}`, copy: 'Latihan selesai', icon: 'flask-conical', href: '/lab' },
    { label: 'Komunitas', value: `${registeredWorkshops}`, copy: 'Workshop tersimpan', icon: 'users', href: '/community' },
    { label: 'Hub', value: `${savedResources}`, copy: 'Rujukan disimpan', icon: 'compass', href: '/hub' }
  ]);

  const requirements = $derived([
    { title: 'Fondasi belajar', done: completedLessons > 0, copy: 'Selesaikan materi dasar.', href: '/core' },
    { title: 'Latihan aman', done: completedLabs > 0, copy: 'Coba simulasi di Lab.', href: '/lab' },
    { title: 'Partisipasi komunitas', done: registeredWorkshops > 0, copy: 'Simpan atau ikuti workshop.', href: '/community?tab=workshop' },
    { title: 'Eksplorasi lanjut', done: readiness >= 75 || savedResources > 0, copy: 'Buka rujukan yang sesuai.', href: '/hub' }
  ]);
</script>

<section class="passport-hero">
  <div class="passport-hero-copy">
    <div class="passport-badge-row">
      <SparkTrustBadge label="Passport Spark" tone="beta" />
      <SparkTrustBadge label={passportLevel} tone="safe" />
      <SparkTrustBadge label={assurance.label} tone={assurance.tone} />
    </div>

    <h1>Bukti perjalanan dan kesiapanmu di Spark.</h1>
    <p>
      Passport merangkum progres belajar, latihan aman, partisipasi komunitas, dan kesiapan awal untuk menjelajahi blockchain serta Starknet.
    </p>

    <div class="passport-hero-actions">
      <SparkButton href={stage.href}>{stage.cta}</SparkButton>
      <SparkButton href="/profile" variant="secondary">Buka Profil</SparkButton>
    </div>
  </div>

  <aside class="passport-gauge-card">
    <SparkPassportGauge value={readiness} label="Passport" copy="Kesiapan" />
    <div>
      <span class="spark-eyebrow">{displayName}</span>
      <strong>{readiness}% kesiapan</strong>
      <p>{stage.copy}</p>
      <small>{learningProgress}% progres belajar · {assurance.copy}</small>
    </div>
  </aside>
</section>

<section class="passport-next-card">
  <div>
    <span class="spark-eyebrow">Langkah berikutnya</span>
    <h2>{stage.title}</h2>
    <p>{stage.copy}</p>
  </div>
  <SparkButton href={stage.href}>{stage.cta}</SparkButton>
</section>

<section class="passport-signal-grid" aria-label="Sinyal Passport">
  {#each signals as signal}
    <a href={signal.href}>
      <span><SparkIcon name={signal.icon} size={18} /></span>
      <div>
        <strong>{signal.value}</strong>
        <small>{signal.label}</small>
        <p>{signal.copy}</p>
      </div>
    </a>
  {/each}
</section>

<section class="passport-readiness-layout">
  <div class="passport-requirement-card">
    <div class="passport-section-head">
      <span class="spark-eyebrow">Readiness path</span>
      <h2>Bangun Passport dari langkah yang bisa dibuktikan.</h2>
      <p>Setiap tanda selesai membantu Spark membaca kesiapanmu dengan lebih jelas.</p>
    </div>

    <div class="passport-requirement-list">
      {#each requirements as item}
        <a href={item.href} class:done={item.done}>
          <span>{item.done ? '✓' : '•'}</span>
          <div>
            <strong>{item.title}</strong>
            <small>{item.copy}</small>
          </div>
          <SparkIcon name="chevron-right" size={14} />
        </a>
      {/each}
    </div>
  </div>

  <aside class="passport-privacy-card">
    <span><SparkIcon name="shield" size={22} /></span>
    <div>
      <h2>Privasi tetap dijaga.</h2>
      <p>
        Passport membuktikan perjalanan belajar dan latihanmu. Verifikasi identitas yang lebih kuat bisa ditambahkan nanti hanya jika benar-benar diperlukan.
      </p>
      <SparkButton href="/terms" variant="secondary">Baca ketentuan</SparkButton>
    </div>
  </aside>
</section>

<style>
  .passport-hero,
  .passport-next-card,
  .passport-readiness-layout {
    display: grid;
    gap: 14px;
  }

  .passport-hero {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.42fr);
    align-items: stretch;
    padding: clamp(18px, 4vw, 34px);
    border: 1px solid var(--spark-line);
    border-radius: 30px;
    background:
      radial-gradient(circle at 8% 8%, rgba(31,117,255,.10), transparent 32%),
      radial-gradient(circle at 92% 18%, rgba(255,128,0,.12), transparent 30%),
      var(--spark-card);
    box-shadow: 0 16px 44px rgba(5, 9, 78, 0.08);
  }

  .passport-hero-copy,
  .passport-gauge-card,
  .passport-requirement-card,
  .passport-privacy-card {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .passport-hero-copy {
    align-content: center;
  }

  .passport-badge-row,
  .passport-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .passport-hero h1 {
    max-width: 760px;
    margin: 0;
    color: var(--spark-navy);
    font-size: clamp(30px, 5vw, 56px);
    line-height: 1.02;
    letter-spacing: -.055em;
  }

  :global([data-theme='dark']) .passport-hero h1,
  :global([data-theme='dark']) .passport-next-card h2,
  :global([data-theme='dark']) .passport-section-head h2,
  :global([data-theme='dark']) .passport-privacy-card h2,
  :global([data-theme='dark']) .passport-gauge-card strong,
  :global([data-theme='dark']) .passport-signal-grid strong,
  :global([data-theme='dark']) .passport-requirement-list strong {
    color: #fff;
  }

  .passport-hero p,
  .passport-next-card p,
  .passport-section-head p,
  .passport-privacy-card p,
  .passport-signal-grid p,
  .passport-requirement-list small,
  .passport-gauge-card p,
  .passport-gauge-card small {
    margin: 0;
    color: var(--spark-muted);
    line-height: 1.55;
  }

  .passport-gauge-card,
  .passport-next-card,
  .passport-requirement-card,
  .passport-privacy-card,
  .passport-signal-grid a {
    border: 1px solid var(--spark-line);
    border-radius: 24px;
    background: rgba(255,255,255,.66);
    box-shadow: 0 12px 30px rgba(5, 9, 78, 0.06);
  }

  :global([data-theme='dark']) .passport-gauge-card,
  :global([data-theme='dark']) .passport-next-card,
  :global([data-theme='dark']) .passport-requirement-card,
  :global([data-theme='dark']) .passport-privacy-card,
  :global([data-theme='dark']) .passport-signal-grid a {
    background: rgba(255,255,255,.055);
  }

  .passport-gauge-card {
    align-content: center;
    padding: 16px;
  }

  .passport-next-card {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 16px;
  }

  .passport-next-card h2,
  .passport-section-head h2,
  .passport-privacy-card h2 {
    margin: 0;
    color: var(--spark-navy);
    line-height: 1.12;
  }

  .passport-signal-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .passport-signal-grid a {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
    padding: 14px;
    text-decoration: none;
    color: inherit;
  }

  .passport-signal-grid a > span,
  .passport-privacy-card > span {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    color: var(--spark-blue-strong);
    background: rgba(31,117,255,.1);
  }

  .passport-signal-grid strong,
  .passport-signal-grid small {
    display: block;
  }

  .passport-signal-grid strong {
    color: var(--spark-navy);
    font-size: 20px;
    line-height: 1;
  }

  .passport-signal-grid small {
    margin-top: 3px;
    color: var(--spark-muted);
    font-weight: 760;
  }

  .passport-readiness-layout {
    grid-template-columns: minmax(0, 1fr) minmax(260px, .38fr);
    align-items: start;
  }

  .passport-requirement-card,
  .passport-privacy-card {
    padding: 16px;
  }

  .passport-requirement-list {
    display: grid;
    gap: 9px;
  }

  .passport-requirement-list a {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) 18px;
    gap: 10px;
    align-items: center;
    padding: 11px;
    border: 1px solid var(--spark-line);
    border-radius: 17px;
    color: inherit;
    text-decoration: none;
    background: rgba(255,255,255,.52);
  }

  .passport-requirement-list a > span {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: var(--spark-muted);
    background: rgba(15,23,42,.06);
  }

  .passport-requirement-list a.done > span {
    color: #0f7a4f;
    background: rgba(34,197,94,.14);
  }

  @media (max-width: 760px) {
    .passport-hero,
    .passport-readiness-layout,
    .passport-next-card {
      grid-template-columns: 1fr;
    }

    .passport-hero {
      padding: 16px;
      border-radius: 24px;
    }

    .passport-signal-grid {
      grid-template-columns: 1fr 1fr;
    }

    .passport-hero h1 {
      font-size: clamp(30px, 9vw, 40px);
    }
  }

  @media (max-width: 480px) {
    .passport-signal-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
