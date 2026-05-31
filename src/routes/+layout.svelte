<script lang="ts">
  import '../app.css';
  import '$lib/styles/pass-2-integration-theme-assets.css';
  import '$lib/styles/pass-3-learning-experience.css';
  import '$lib/styles/pass-4-gateway-surfaces.css';
  import '$lib/styles/pass-5-starknet-theme.css';
  import '$lib/styles/pass-6-natural-production-flow.css';
  import '$lib/styles/pass-7-mobile-ux-production-cleanup.css';
  import '$lib/styles/pass-8-asset-nav-surface-unification.css';
  import '$lib/styles/pass-9-core-lesson-experience.css';
  import SparkAppShell from '$shell/SparkAppShell.svelte';

  let { children } = $props();
</script>

<SparkAppShell>
  {@render children()}
</SparkAppShell>
