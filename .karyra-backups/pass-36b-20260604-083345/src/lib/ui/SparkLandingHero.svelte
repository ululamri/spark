<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { betaSession } from '$state/beta-session-state.svelte';

  const primaryHref = $derived(betaSession.user ? '/dashboard' : '/login');
  const primaryLabel = $derived(betaSession.user ? 'Buka dashboard' : 'Mulai belajar');
</script>

<section class="landing-hero-v26 spark-home-hero" aria-labelledby="spark-home-title">
  <div class="spark-home-hero-copy">
    <span class="spark-home-kicker">Karyra Spark · Starknet readiness gateway</span>

    <h1 id="spark-home-title">Belajar Web3 dan Starknet lewat jalur yang aman.</h1>

    <p>
      Mulai dari konsep blockchain, latihan aman, Passport kesiapan, lalu jelajahi Starknet saat fondasi sudah cukup — tanpa seed phrase, tanpa tekanan transaksi.
    </p>

    <div class="spark-home-actions" aria-label="Aksi utama">
      <SparkButton href={primaryHref}>{primaryLabel}</SparkButton>
      <SparkButton href="/core" variant="secondary">Lihat alur</SparkButton>
    </div>

    <div class="spark-home-proof-row" aria-label="Keamanan dan ritme belajar">
      <span><SparkIcon name="shield" size={13} /> Tanpa seed phrase</span>
      <span><SparkIcon name="flask-conical" size={13} /> Simulasi aman</span>
      <span><SparkIcon name="users" size={13} /> Komunitas lokal</span>
    </div>
  </div>

  <aside class="spark-home-preview" aria-label="Preview produk Spark">
    <div class="spark-home-preview-head">
      <span><SparkIcon name="sparkles" size={23} /></span>
      <div>
        <small>Jalur utama</small>
        <strong>Core → Lab → Passport → Hub</strong>
      </div>
    </div>

    <div class="spark-home-preview-grid">
      <a href="/core"><SparkIcon name="book-open" size={16} /><strong>Core</strong><small>Fondasi</small></a>
      <a href="/lab"><SparkIcon name="flask-conical" size={16} /><strong>Lab</strong><small>Praktik</small></a>
      <a href="/profile"><SparkIcon name="badge" size={16} /><strong>Passport</strong><small>Kesiapan</small></a>
      <a href="/hub"><SparkIcon name="compass" size={16} /><strong>Hub</strong><small>Jelajah</small></a>
    </div>

    <div class="spark-home-preview-note">
      <strong>Mulai sederhana. Naik bertahap.</strong>
      <p>Spark membantu pengguna memahami risiko sebelum masuk wallet, kontrak, atau transaksi.</p>
    </div>
  </aside>
</section>
