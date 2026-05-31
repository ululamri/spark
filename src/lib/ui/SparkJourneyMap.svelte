<script lang="ts">
  const productSteps = [
    {
      label: '01',
      title: 'Learn',
      copy: 'Mulai dari Core: jalur belajar, lesson, checkpoint, glossary, notes, dan bookmark.',
      href: '/core',
      focus: 'learn'
    },
    {
      label: '02',
      title: 'Practice',
      copy: 'Masuk ke Lab: simulasi aman, bridge warning, loading state, dan proof of practice.',
      href: '/lab',
      focus: 'practice'
    },
    {
      label: '03',
      title: 'Community',
      copy: 'Ikut workshop, cohort, atau sesi lokal agar belajar tidak berhenti di layar.',
      href: '/community',
      focus: 'community'
    },
    {
      label: '04',
      title: 'Passport',
      copy: 'Lihat readiness, progress, checkpoint, praktik, workshop, dan resource tersimpan di Profile.',
      href: '/profile',
      focus: 'passport'
    },
    {
      label: '05',
      title: 'Hub',
      copy: 'Lanjutkan eksplorasi resource, apps, tools, komunitas, dan ekosistem setelah cukup siap.',
      href: '/hub',
      focus: 'hub'
    }
  ];
</script>

<section class="spark-journey-map">
  <div class="journey-head">
    <span class="spark-eyebrow">Perjalanan Spark</span>
    <h2>Satu alur natural dari belajar sampai eksplorasi ekosistem.</h2>
    <p>Pengguna tidak perlu masuk halaman demo. Spark diarahkan secara natural dari Core, Lab, Community, Passport, lalu Hub.</p>
  </div>

  <div class="journey-rail">
    {#each productSteps as step}
      <a href={step.href} class={`journey-step ${step.focus}`}>
        <span>{step.label}</span>
        <strong>{step.title}</strong>
        <small>{step.copy}</small>
      </a>
    {/each}
  </div>
</section>
