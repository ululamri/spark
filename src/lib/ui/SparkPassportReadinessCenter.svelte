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

  type PassportLevel = 'Beginner' | 'Intermediate' | 'Advanced';

  onMount(() => {
    restoreProfileState();
  });

  const displayName = $derived(profileState.displayName || betaSession.user?.name || 'Pengguna Spark');
  const handle = $derived(profileState.handle || betaSession.user?.handle || '@spark-learner');
  const readiness = $derived(getReadinessScore());
  const learningProgress = $derived(getLearningProgressPercent());
  const completedLessons = $derived(getCompletedLessonCount());
  const totalLessons = $derived(getTotalLessonCount());
  const completedLabs = $derived(learningState.completedLabIds.length);
  const registeredWorkshops = $derived(gatewayState.registeredWorkshopIds.length);
  const savedResources = $derived(gatewayState.savedHubResourceIds.length);
  const credentialSeed = $derived((betaSession.user?.id ?? 'local-passport').replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase() || 'SPARK');

  const passportLevel = $derived<PassportLevel>(
    readiness >= 80 && completedLabs >= 3
      ? 'Advanced'
      : readiness >= 50 && completedLabs >= 1
        ? 'Intermediate'
        : 'Beginner'
  );

  const assurance = $derived(
    registeredWorkshops > 0
      ? {
          label: 'Diverifikasi komunitas',
          short: 'Komunitas',
          copy: 'Ada tanda partisipasi komunitas di perjalananmu.',
          tone: 'safe' as const
        }
      : {
          label: 'Bukti awal',
          short: 'Mandiri',
          copy: 'Passport ini disusun dari progres belajar dan latihanmu di Spark.',
          tone: 'target' as const
        }
  );

  const stage = $derived(
    readiness >= 75
      ? {
          title: 'Siap menjelajah bertahap',
          copy: 'Fondasi dan latihanmu sudah cukup kuat untuk membuka rujukan lanjutan dengan tetap hati-hati.',
          href: '/hub',
          cta: 'Buka Hub'
        }
      : completedLabs === 0
        ? {
            title: 'Perkuat lewat Lab',
            copy: 'Latihan singkat membantu menguji cara mengambil keputusan aman sebelum menjelajah lebih jauh.',
            href: '/lab',
            cta: 'Coba Lab'
          }
        : {
            title: 'Lanjutkan belajar',
            copy: 'Satu materi berikutnya akan membuat Passport kamu makin lengkap.',
            href: `/lesson/${getRecommendedLessonSlug()}`,
            cta: 'Lanjutkan belajar'
          }
  );

  const levelSteps = $derived([
    {
      level: 'Beginner' as PassportLevel,
      title: 'Fondasi aman',
      copy: 'Paham istilah dasar, risiko wallet, dan kebiasaan awal yang aman.',
      done: completedLessons >= 1 && completedLabs >= 1,
      active: passportLevel === 'Beginner',
      href: completedLessons < 1 ? '/core' : '/lab'
    },
    {
      level: 'Intermediate' as PassportLevel,
      title: 'Siap praktik',
      copy: 'Mulai terbiasa membaca skenario, latihan Lab, dan mengikuti konteks komunitas.',
      done: readiness >= 50 && completedLabs >= 1,
      active: passportLevel === 'Intermediate',
      href: completedLabs < 1 ? '/lab' : '/community'
    },
    {
      level: 'Advanced' as PassportLevel,
      title: 'Siap eksplorasi',
      copy: 'Punya fondasi cukup untuk masuk ke Hub, testnet, dan Starknet secara bertahap.',
      done: readiness >= 80 && completedLabs >= 3,
      active: passportLevel === 'Advanced',
      href: '/hub'
    }
  ]);

  const evidence = $derived([
    {
      label: 'Belajar',
      value: `${completedLessons}/${totalLessons}`,
      copy: 'Materi selesai',
      icon: 'book-open',
      href: '/core',
      progress: learningProgress
    },
    {
      label: 'Lab',
      value: `${completedLabs}`,
      copy: 'Latihan selesai',
      icon: 'flask-conical',
      href: '/lab',
      progress: Math.min(100, completedLabs * 34)
    },
    {
      label: 'Komunitas',
      value: `${registeredWorkshops}`,
      copy: 'Workshop tersimpan',
      icon: 'users',
      href: '/community',
      progress: registeredWorkshops > 0 ? 100 : 0
    },
    {
      label: 'Hub',
      value: `${savedResources}`,
      copy: 'Rujukan disimpan',
      icon: 'compass',
      href: '/hub',
      progress: savedResources > 0 ? 100 : readiness >= 75 ? 50 : 0
    }
  ]);

  const requirements = $derived([
    { title: 'Selesaikan fondasi belajar', done: completedLessons > 0, copy: 'Mulai dari materi dasar di Core.', href: '/core' },
    { title: 'Coba latihan aman', done: completedLabs > 0, copy: 'Latihan Lab membantu membuktikan kesiapan praktik.', href: '/lab' },
    { title: 'Ikuti konteks komunitas', done: registeredWorkshops > 0, copy: 'Simpan atau ikuti workshop agar perjalananmu lebih terarah.', href: '/community?tab=workshop' },
    { title: 'Buka rujukan lanjutan', done: readiness >= 75 || savedResources > 0, copy: 'Gunakan Hub saat fondasi sudah lebih kuat.', href: '/hub' }
  ]);
</script>

<section class="passport-shell" data-karyra-passport="credential-refinement">
  <section class="passport-hero-card">
    <div class="passport-copy">
      <div class="passport-badge-row">
        <SparkTrustBadge label="Passport Spark" tone="beta" />
        <SparkTrustBadge label={passportLevel} tone="safe" />
        <SparkTrustBadge label={assurance.short} tone={assurance.tone} />
      </div>

      <h1>Passport kesiapanmu.</h1>
      <p>
        Bukti perjalanan belajar, latihan aman, dan partisipasi di Spark. Passport membantu kamu melihat level saat ini dan langkah berikutnya.
      </p>

      <div class="passport-actions">
        <SparkButton href={stage.href}>{stage.cta}</SparkButton>
        <SparkButton href="/profile" variant="secondary">Kelola Profil</SparkButton>
      </div>
    </div>

    <aside class="passport-credential-card" aria-label="Kartu Passport Spark">
      <div class="credential-topline">
        <span><SparkIcon name="passport" size={18} /></span>
        <small>Issued by Karyra Spark</small>
      </div>

      <div class="credential-person">
        <strong>{displayName}</strong>
        <small>{handle}</small>
      </div>

      <div class="credential-meta-grid">
        <div>
          <small>Level</small>
          <strong>{passportLevel}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong>Aktif</strong>
        </div>
        <div>
          <small>Verifikasi</small>
          <strong>{assurance.label}</strong>
        </div>
        <div>
          <small>ID</small>
          <strong>SPK-{credentialSeed}</strong>
        </div>
      </div>
    </aside>
  </section>

  <section class="passport-score-layout">
    <aside class="passport-score-card">
      <SparkPassportGauge value={readiness} label="Passport" copy="Kesiapan" />
      <div>
        <span class="spark-eyebrow">Readiness</span>
        <strong>{readiness}% kesiapan</strong>
        <p>{stage.copy}</p>
      </div>
    </aside>

    <div class="passport-next-card">
      <div>
        <span class="spark-eyebrow">Langkah berikutnya</span>
        <h2>{stage.title}</h2>
        <p>{stage.copy}</p>
      </div>
      <SparkButton href={stage.href}>{stage.cta}</SparkButton>
    </div>
  </section>

  <section class="passport-level-card">
    <div class="passport-section-head">
      <span class="spark-eyebrow">Level Passport</span>
      <h2>Beginner, Intermediate, Advanced.</h2>
      <p>Setiap level dibangun dari pemahaman, latihan, dan partisipasi. Ujian level akan menjadi gate resmi saat modul leveling siap.</p>
    </div>

    <div class="passport-level-list">
      {#each levelSteps as step}
        <a href={step.href} class:done={step.done} class:active={step.active}>
          <span>{step.done ? '✓' : step.level.slice(0, 1)}</span>
          <div>
            <strong>{step.level}</strong>
            <small>{step.title}</small>
            <p>{step.copy}</p>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="passport-evidence-grid" aria-label="Bukti kesiapan Passport">
    {#each evidence as item}
      <a href={item.href}>
        <span><SparkIcon name={item.icon} size={18} /></span>
        <div>
          <div class="evidence-row">
            <strong>{item.label}</strong>
            <em>{item.value}</em>
          </div>
          <small>{item.copy}</small>
          <div class="evidence-progress" aria-hidden="true"><b style={`width: ${Math.max(4, item.progress)}%`}></b></div>
        </div>
      </a>
    {/each}
  </section>

  <section class="passport-detail-layout">
    <div class="passport-requirement-card">
      <div class="passport-section-head compact">
        <span class="spark-eyebrow">Yang membangun Passport</span>
        <h2>Lengkapi bukti kesiapan satu per satu.</h2>
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
        <h2>Privasi tetap jadi dasar.</h2>
        <p>
          Passport membuktikan perjalanan belajar dan latihan. Verifikasi identitas yang lebih kuat bersifat opsional dan hanya diperlukan untuk kebutuhan tertentu.
        </p>
        <SparkButton href="/terms" variant="secondary">Baca ketentuan</SparkButton>
      </div>
    </aside>
  </section>
</section>

<style>
  .passport-shell,
  .passport-copy,
  .passport-score-card,
  .passport-next-card,
  .passport-level-card,
  .passport-requirement-card,
  .passport-privacy-card,
  .passport-section-head,
  .passport-credential-card,
  .credential-person {
    display: grid;
    gap: 14px;
  }

  .passport-shell {
    padding-bottom: 4px;
  }

  .passport-hero-card,
  .passport-score-layout,
  .passport-detail-layout {
    display: grid;
    gap: 14px;
  }

  .passport-hero-card {
    grid-template-columns: minmax(0, 1fr) minmax(260px, .42fr);
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

  .passport-copy {
    align-content: center;
    min-width: 0;
  }

  .passport-badge-row,
  .passport-actions,
  .credential-topline,
  .evidence-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .passport-copy h1 {
    max-width: 680px;
    margin: 0;
    color: var(--spark-navy);
    font-size: clamp(32px, 7vw, 64px);
    line-height: .98;
    letter-spacing: -.06em;
  }

  .passport-copy p,
  .passport-score-card p,
  .passport-next-card p,
  .passport-section-head p,
  .passport-level-list p,
  .passport-privacy-card p,
  .passport-requirement-list small,
  .passport-evidence-grid small,
  .credential-person small,
  .credential-meta-grid small,
  .credential-topline small {
    margin: 0;
    color: var(--spark-muted);
    line-height: 1.52;
  }

  .passport-credential-card,
  .passport-score-card,
  .passport-next-card,
  .passport-level-card,
  .passport-requirement-card,
  .passport-privacy-card,
  .passport-evidence-grid a {
    border: 1px solid var(--spark-line);
    border-radius: 24px;
    background: rgba(255,255,255,.68);
    box-shadow: 0 12px 30px rgba(5, 9, 78, 0.06);
  }

  :global([data-theme='dark']) .passport-credential-card,
  :global([data-theme='dark']) .passport-score-card,
  :global([data-theme='dark']) .passport-next-card,
  :global([data-theme='dark']) .passport-level-card,
  :global([data-theme='dark']) .passport-requirement-card,
  :global([data-theme='dark']) .passport-privacy-card,
  :global([data-theme='dark']) .passport-evidence-grid a {
    background: rgba(255,255,255,.055);
  }

  .passport-credential-card {
    align-content: space-between;
    min-height: 300px;
    padding: 18px;
    background:
      linear-gradient(135deg, rgba(91,64,255,.12), rgba(255,128,0,.08)),
      rgba(255,255,255,.7);
  }

  .credential-topline {
    justify-content: space-between;
  }

  .credential-topline > span,
  .passport-evidence-grid a > span,
  .passport-privacy-card > span,
  .passport-requirement-list a > span,
  .passport-level-list a > span {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    color: var(--spark-blue-strong);
    background: rgba(31,117,255,.1);
  }

  .credential-person strong {
    color: var(--spark-navy);
    font-size: clamp(24px, 5vw, 36px);
    line-height: 1;
    letter-spacing: -.04em;
  }

  .credential-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .credential-meta-grid > div {
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--spark-line);
    border-radius: 16px;
    background: rgba(255,255,255,.42);
  }

  :global([data-theme='dark']) .credential-meta-grid > div {
    background: rgba(255,255,255,.045);
  }

  .credential-meta-grid strong,
  .credential-meta-grid small,
  .credential-person strong,
  .credential-person small {
    display: block;
  }

  .credential-meta-grid strong {
    overflow: hidden;
    color: var(--spark-navy);
    font-size: 13px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .passport-score-layout {
    grid-template-columns: minmax(240px, .35fr) minmax(0, 1fr);
    align-items: stretch;
  }

  .passport-score-card {
    grid-template-columns: 108px minmax(0, 1fr);
    align-items: center;
    padding: 16px;
  }

  .passport-score-card strong,
  .passport-next-card h2,
  .passport-section-head h2,
  .passport-privacy-card h2,
  .passport-level-list strong,
  .passport-requirement-list strong,
  .passport-evidence-grid strong {
    margin: 0;
    color: var(--spark-navy);
    line-height: 1.12;
  }

  .passport-next-card {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 16px;
  }

  .passport-level-card,
  .passport-requirement-card,
  .passport-privacy-card {
    padding: 16px;
  }

  .passport-section-head.compact {
    gap: 6px;
  }

  .passport-level-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .passport-level-list a {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--spark-line);
    border-radius: 20px;
    color: inherit;
    text-decoration: none;
    background: rgba(255,255,255,.42);
  }

  .passport-level-list a.done {
    border-color: rgba(27, 171, 92, .32);
    background: rgba(27, 171, 92, .08);
  }

  .passport-level-list a.active {
    border-color: rgba(31,117,255,.34);
    box-shadow: 0 0 0 4px rgba(31,117,255,.08);
  }

  .passport-level-list small,
  .passport-requirement-list small {
    display: block;
    margin-top: 3px;
  }

  .passport-evidence-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .passport-evidence-grid a {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
    padding: 14px;
    color: inherit;
    text-decoration: none;
  }

  .evidence-row {
    justify-content: space-between;
  }

  .evidence-row em {
    color: var(--spark-muted);
    font-size: 12px;
    font-style: normal;
    font-weight: 780;
  }

  .evidence-progress {
    height: 7px;
    margin-top: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(5, 9, 78, .08);
  }

  .evidence-progress b {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--spark-blue-strong), var(--spark-orange));
  }

  .passport-detail-layout {
    grid-template-columns: minmax(0, 1fr) minmax(260px, .36fr);
    align-items: start;
  }

  .passport-requirement-list {
    display: grid;
    gap: 9px;
  }

  .passport-requirement-list a {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 18px;
    gap: 10px;
    align-items: center;
    padding: 10px;
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    color: inherit;
    text-decoration: none;
    background: rgba(255,255,255,.42);
  }

  .passport-requirement-list a.done {
    border-color: rgba(27, 171, 92, .32);
    background: rgba(27, 171, 92, .08);
  }

  .passport-privacy-card {
    align-content: start;
    grid-template-columns: 44px minmax(0, 1fr);
  }

  :global([data-theme='dark']) .passport-copy h1,
  :global([data-theme='dark']) .passport-score-card strong,
  :global([data-theme='dark']) .passport-next-card h2,
  :global([data-theme='dark']) .passport-section-head h2,
  :global([data-theme='dark']) .passport-privacy-card h2,
  :global([data-theme='dark']) .passport-level-list strong,
  :global([data-theme='dark']) .passport-requirement-list strong,
  :global([data-theme='dark']) .passport-evidence-grid strong,
  :global([data-theme='dark']) .credential-person strong,
  :global([data-theme='dark']) .credential-meta-grid strong {
    color: #fff;
  }

  @media (max-width: 860px) {
    .passport-hero-card,
    .passport-score-layout,
    .passport-detail-layout,
    .passport-level-list,
    .passport-evidence-grid {
      grid-template-columns: 1fr;
    }

    .passport-hero-card {
      padding: 18px;
      border-radius: 26px;
    }

    .passport-credential-card {
      min-height: 240px;
    }

    .passport-score-card {
      grid-template-columns: 96px minmax(0, 1fr);
    }

    .passport-next-card {
      grid-template-columns: 1fr;
      align-items: stretch;
    }
  }

  @media (max-width: 520px) {
    .passport-copy h1 {
      font-size: clamp(34px, 13vw, 52px);
    }

    .passport-actions :global(a),
    .passport-next-card :global(a) {
      width: 100%;
      justify-content: center;
    }

    .credential-meta-grid {
      grid-template-columns: 1fr;
    }

    .passport-score-card,
    .passport-privacy-card {
      grid-template-columns: 1fr;
    }
  }
</style>
