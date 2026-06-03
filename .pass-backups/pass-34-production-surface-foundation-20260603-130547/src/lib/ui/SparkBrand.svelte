<script lang="ts">
  import { getSparkAsset } from '$lib/assets/spark-assets';
  import { betaSession } from '$state/beta-session-state.svelte';
  import { themeState } from '$lib/state/theme-state.svelte';

  type Props = {
    compact?: boolean;
  };

  let { compact = false }: Props = $props();

  const asset = $derived(getSparkAsset(themeState.resolved === 'dark' ? 'logo-main-dark' : 'logo-main-light'));
  const homeHref = $derived(betaSession.user ? '/dashboard' : '/');

  let imageFailed = $state(false);
</script>

<a class={`spark-brand ${compact ? 'compact' : ''}`} href={homeHref} aria-label="Karyra Spark" data-spark-brand>
  {#if asset && !imageFailed}
    <span class="spark-brand-logo">
      <img src={asset.src} alt={asset.alt} onerror={() => (imageFailed = true)} />
    </span>
  {:else}
    <span class="spark-mark">✦</span>
    <span class="spark-brand-wordmark">KARYRA<br />SPARK</span>
  {/if}
</a>
