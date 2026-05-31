<script lang="ts">
  import SparkPreviewToggle from './SparkPreviewToggle.svelte';
  import SparkBrand from '$lib/ui/SparkBrand.svelte';
  import { appState } from '$lib/state/app-state.svelte';
</script>

<header class="spark-topbar">
  <SparkBrand />

  <div class="spark-topbar-center">
    <span>⌕</span>
    <span>Cari lesson, lab, workshop, atau resource Hub</span>
  </div>

  <div class="spark-topbar-actions">
    <SparkPreviewToggle />
    <button class="spark-icon-btn desktop-only" type="button" aria-label="Pemberitahuan">●</button>
    <button class="spark-icon-btn mobile-only" type="button" aria-label="Menu" onclick={() => (appState.mobileMenuOpen = !appState.mobileMenuOpen)}>
      {appState.mobileMenuOpen ? '×' : '☰'}
    </button>
  </div>
</header>
