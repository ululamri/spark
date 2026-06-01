<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
</script>

<section class="landing-cta-v26">
  <div>
    <span class="spark-eyebrow">Mulai dengan aman</span>
    <h2>Langkah terbaik: pahami fondasi dulu, lalu praktik bertahap.</h2>
    <p>Pengguna baru mulai dari Core. Pengguna yang ingin melihat aplikasi penuh bisa masuk Mode Coba.</p>
  </div>

  <div class="landing-cta-actions">
    <SparkButton href="/core"><SparkIcon name="book-open" size={16} />Mulai dari Core</SparkButton>
    <SparkButton href="/login" variant="secondary"><SparkIcon name="login" size={16} />Masuk Mode Coba</SparkButton>
  </div>
</section>
