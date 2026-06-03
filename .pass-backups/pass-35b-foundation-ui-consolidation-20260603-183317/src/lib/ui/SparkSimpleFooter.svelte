<script lang="ts">
  import { page } from '$app/stores';
  import SparkBrand from './SparkBrand.svelte';

  const publicPaths = ['/', '/help', '/faq', '/about', '/docs', '/terms', '/login', '/register'];
  const pathname = $derived($page.url.pathname);
  const visible = $derived(publicPaths.includes(pathname));
</script>

{#if visible}
  <footer class="spark-simple-footer" aria-label="Footer Karyra Spark">
    <div>
      <SparkBrand compact />
      <p>Jalur belajar blockchain dan Starknet yang dibuat lebih ramah untuk pemula, komunitas lokal, dan eksplorasi bertahap.</p>
    </div>
    <nav aria-label="Link bantuan">
      <a href="/about">About</a>
      <a href="/help">Help</a>
      <a href="/faq">FAQ</a>
      <a href="/docs">Docs</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>
{/if}
