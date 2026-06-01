<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { betaSession } from '$state/beta-session-state.svelte';
  const primaryHref = $derived(betaSession.user ? '/dashboard' : '/login');
  const primaryLabel = $derived(betaSession.user ? 'Buka Dashboard' : 'Coba Spark');
</script>

<section class="landing-hero-v26">
  <div class="landing-hero-copy">
    <div class="landing-kicker-row">
      <SparkTrustBadge label="Local Blockchain Readiness" tone="beta" />
      <span>Core · Lab · Passport · Community · Hub</span>
    </div>

    <h1>Belajar blockchain dari dasar, praktik aman, lalu siap menjelajah Starknet.</h1>

    <p>Karyra Spark adalah gateway belajar untuk komunitas lokal: membantu pengguna memahami blockchain, cryptocurrency, Web3, wallet safety, dan Starknet secara bertahap tanpa langsung dipaksa masuk transaksi.</p>

    <div class="landing-hero-actions">
      <SparkButton href={primaryHref}>{primaryLabel}</SparkButton>
      <SparkButton href="/core" variant="secondary">Mulai dari Core</SparkButton>
    </div>

    <div class="landing-hero-trust">
      <span><SparkIcon name="shield" size={15} /> No seed phrase</span>
      <span><SparkIcon name="flask-conical" size={15} /> Simulasi aman</span>
      <span><SparkIcon name="users" size={15} /> Komunitas lokal</span>
    </div>
  </div>

  <aside class="landing-journey-visual" aria-label="Alur utama Karyra Spark">
    <div class="journey-orbit">
      <div class="journey-center">
        <SparkIcon name="sparkles" size={28} />
        <strong>Spark</strong>
        <span>Readiness Gateway</span>
      </div>
      <a class="orbit-node core" href="/core"><SparkIcon name="book-open" size={18} /><span>Core</span></a>
      <a class="orbit-node lab" href="/lab"><SparkIcon name="flask-conical" size={18} /><span>Lab</span></a>
      <a class="orbit-node passport" href="/profile"><SparkIcon name="badge" size={18} /><span>Passport</span></a>
      <a class="orbit-node community" href="/community"><SparkIcon name="users" size={18} /><span>Community</span></a>
      <a class="orbit-node hub" href="/hub"><SparkIcon name="compass" size={18} /><span>Hub</span></a>
    </div>

    <div class="journey-caption">
      <strong>Belajar → Praktik → Terbukti → Jelajah</strong>
      <p>Satu alur produk, bukan dashboard pribadi di halaman depan.</p>
    </div>
  </aside>
</section>
