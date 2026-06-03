<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { betaSession } from '$state/beta-session-state.svelte';

  const primaryHref = $derived(betaSession.user ? '/dashboard' : '/login');
  const primaryLabel = $derived(betaSession.user ? 'Buka dashboard' : 'Masuk dan mulai');
</script>

<section class="landing-cta-v26 landing-cta-v35b1">
  <div>
    <span class="spark-eyebrow">Mulai bertahap</span>
    <h2>Ambil satu langkah kecil: pahami dasar, lalu praktik aman.</h2>
    <p>Spark dibuat untuk belajar pelan-pelan. Kamu bisa melihat materi awal dulu atau masuk untuk menyimpan perjalanan.</p>
  </div>

  <div class="landing-cta-actions landing-cta-actions-v35b1">
    <SparkButton href={primaryHref}><SparkIcon name="login" size={16} />{primaryLabel}</SparkButton>
    <SparkButton href="/core" variant="secondary"><SparkIcon name="book-open" size={16} />Lihat Core</SparkButton>
  </div>
</section>
