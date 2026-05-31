<script lang="ts">
  import SparkPreviewToggle from './SparkPreviewToggle.svelte';
  import SparkBrand from '$lib/ui/SparkBrand.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
  import { appState } from '$lib/state/app-state.svelte';
</script>

<header class="spark-topbar">
  <SparkBrand />

  <div class="spark-topbar-center">
    <SparkIcon name="search" size={17} />
    <span>Cari lesson, lab, workshop, atau resource Hub</span>
  </div>

  <div class="spark-topbar-actions">
    <SparkPreviewToggle />
    <a class="spark-icon-btn desktop-only" href="/settings" aria-label="Pengaturan">
      <SparkIcon name="settings" size={18} />
    </a>
    <button class="spark-icon-btn mobile-only" type="button" aria-label="Menu" onclick={() => (appState.mobileMenuOpen = !appState.mobileMenuOpen)}>
      <SparkIcon name={appState.mobileMenuOpen ? 'x' : 'menu'} size={20} />
    </button>
  </div>
</header>
