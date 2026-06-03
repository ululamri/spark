<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { betaSession } from '$state/beta-session-state.svelte';

  const primaryHref = $derived(betaSession.user ? '/dashboard' : '/login');
  const primaryLabel = $derived(betaSession.user ? 'Lanjutkan belajar' : 'Masuk dan mulai belajar');
</script>

<section class="landing-hero-v26 landing-hero-v35b1">
  <div class="landing-hero-copy landing-hero-copy-v35b1">
    <div class="landing-kicker-row landing-kicker-v35b1">
      <SparkTrustBadge label="Safety-first Starknet readiness" tone="beta" />
      <span>Fondasi · Simulasi · Passport · Hub</span>
    </div>

    <h1>Belajar blockchain tanpa langsung masuk transaksi.</h1>

    <p>
      Karyra Spark memandu pemula dari konsep dasar, latihan aman, lalu menuju Starknet saat fondasinya sudah cukup.
      Tidak meminta seed phrase dan tidak mendorong spekulasi.
    </p>

    <div class="landing-hero-actions landing-hero-actions-v35b1">
      <SparkButton href={primaryHref}>{primaryLabel}</SparkButton>
      <SparkButton href="/core" variant="secondary">Lihat jalur belajar</SparkButton>
    </div>

    <div class="landing-trust-chips-v35b1" aria-label="Keamanan Spark">
      <span><SparkIcon name="shield" size={14} /> Tanpa seed phrase</span>
      <span><SparkIcon name="flask-conical" size={14} /> Simulasi aman</span>
      <span><SparkIcon name="users" size={14} /> Komunitas lokal</span>
    </div>
  </div>

  <aside class="landing-proof-panel-v35b1" aria-label="Preview pengalaman belajar Spark">
    <div class="proof-card-v35b1 primary">
      <span><SparkIcon name="book-open" size={18} /></span>
      <div>
        <small>Lesson pertama</small>
        <strong>Apa itu blockchain?</strong>
        <p>Mulai dari bahasa sederhana sebelum wallet, transaksi, atau coding.</p>
      </div>
    </div>

    <div class="proof-steps-v35b1">
      <a href="/core"><SparkIcon name="book-open" size={16} /><span>Belajar dasar</span></a>
      <a href="/lab"><SparkIcon name="flask-conical" size={16} /><span>Latihan aman</span></a>
      <a href="/profile"><SparkIcon name="badge" size={16} /><span>Cek Passport</span></a>
      <a href="/hub"><SparkIcon name="compass" size={16} /><span>Jelajah Hub</span></a>
    </div>

    <div class="proof-footer-v35b1">
      <strong>Fondasi → Praktik → Siap jelajah</strong>
      <p>Satu jalur bertahap untuk pengguna lokal yang baru mengenal Web3 dan Starknet.</p>
    </div>
  </aside>
</section>
