<script lang="ts">
  import { getSparkAsset } from '$lib/assets/spark-assets';
  import { themeState } from '$lib/state/theme-state.svelte';

  type Props = {
    compact?: boolean;
  };

  let { compact = false }: Props = $props();

  const asset = $derived(
    getSparkAsset(themeState.resolved === 'dark' ? 'logo-main-dark' : 'logo-main-light')
  );

  let imageFailed = $state(false);
</script>

<a class={`spark-brand ${compact ? 'compact' : ''}`} href="/" aria-label="Karyra Spark">
  {#if asset && !imageFailed}
    <img src={asset.src} alt={asset.alt} onerror={() => (imageFailed = true)} />
  {:else}
    <span class="spark-mark">✦</span>
    <span>KARYRA<br />SPARK</span>
  {/if}
</a>
