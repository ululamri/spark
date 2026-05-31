<script lang="ts">
  import { page } from '$app/stores';
  import SparkButton from '$ui/SparkButton.svelte';
</script>

<section class="spark-section error">
  <span class="spark-eyebrow">Error</span>
  <h1>{$page.status}</h1>
  <p>{$page.error?.message ?? 'Halaman tidak tersedia.'}</p>
  <SparkButton href="/">Kembali ke Gateway</SparkButton>
</section>
