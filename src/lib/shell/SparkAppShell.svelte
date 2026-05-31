<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import SparkTopBar from './SparkTopBar.svelte';
  import SparkSidebar from './SparkSidebar.svelte';
  import SparkBottomNav from './SparkBottomNav.svelte';
  import SparkMobileDrawer from './SparkMobileDrawer.svelte';
  import SparkToast from './SparkToast.svelte';
  import { appState, markPersistenceReady } from '$lib/state/app-state.svelte';
  import { initTheme, themeState } from '$lib/state/theme-state.svelte';
  import { learningState, restoreLearningSnapshot, saveLearningSnapshot } from '$state/learning-state.svelte';
  import { gatewayState, restoreGatewaySnapshot, saveGatewaySnapshot } from '$state/gateway-state.svelte';

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();

  onMount(() => {
    initTheme();
    restoreLearningSnapshot();
    restoreGatewaySnapshot();
    markPersistenceReady();
  });

  $effect(() => {
    if (!appState.persistenceReady) return;

    learningState.onboardingComplete;
    learningState.experience;
    learningState.activeLessonSlug;
    learningState.completedLessonSlugs.length;
    learningState.completedLabIds.length;
    learningState.expandedModuleIds.length;
    learningState.bookmarkSlugs.length;
    Object.keys(learningState.checkpointAnswers).length;
    Object.keys(learningState.notes).length;
    learningState.walletStatus;
    saveLearningSnapshot();
  });

  $effect(() => {
    if (!appState.persistenceReady) return;

    gatewayState.registeredWorkshopIds.length;
    gatewayState.savedHubResourceIds.length;
    gatewayState.dismissedBridgeIds.length;
    saveGatewaySnapshot();
  });
</script>

<div class="spark-app" data-theme={themeState.resolved} data-theme-preference={themeState.preference} data-preview={appState.previewMode}>
  <SparkTopBar />

  <div class="spark-shell">
    <SparkSidebar />
    <main class="spark-main">
      {@render children()}
    </main>
  </div>

  <SparkBottomNav />
  <SparkMobileDrawer />
  <SparkToast />
</div>
