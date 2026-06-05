<script lang="ts">
  import { page } from '$app/stores';
  import SparkBrand from './SparkBrand.svelte';

  const publicPaths = ['/', '/help', '/faq', '/about', '/docs', '/terms', '/login', '/register'];
  const year = new Date().getFullYear();
  const pathname = $derived($page.url.pathname);
  const visible = $derived(publicPaths.includes(pathname));
</script>

{#if visible}
  <footer class="spark-simple-footer pass35b-simple-footer karyra-footer-stable pass40b-footer" aria-label="Footer Karyra Spark">
    <div class="karyra-footer-brandline">
      <SparkBrand compact />
      <p>Belajar blockchain dan Starknet dengan ritme aman: paham dulu, praktik pelan-pelan, lalu jelajah ekosistem.</p>
    </div>

    <div class="karyra-footer-meta">
      <nav aria-label="Link bantuan">
        <a href="/about">Tentang</a>
        <a href="/help">Bantuan</a>
        <a href="/faq">FAQ</a>
        <a href="/docs">Panduan</a>
        <a href="/terms">Ketentuan</a>
      </nav>

      <small>© {year} Karyra Spark · Edukasi dan readiness, bukan saran finansial.</small>
    </div>
  </footer>
{/if}
