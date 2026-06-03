<script lang="ts">
  import SparkGuestLandingRedirect from '$ui/SparkGuestLandingRedirect.svelte';
  import SparkLandingAudience from '$ui/SparkLandingAudience.svelte';
  import SparkLandingCTA from '$ui/SparkLandingCTA.svelte';
  import SparkLandingDifference from '$ui/SparkLandingDifference.svelte';
  import SparkLandingFeaturePreview from '$ui/SparkLandingFeaturePreview.svelte';
  import SparkLandingFlow from '$ui/SparkLandingFlow.svelte';
  import SparkLandingFooter from '$ui/SparkLandingFooter.svelte';
  import SparkLandingHero from '$ui/SparkLandingHero.svelte';
  import SparkLandingProblem from '$ui/SparkLandingProblem.svelte';
</script>

<svelte:head>
  <title>Karyra Spark — Belajar blockchain dan Starknet dengan aman</title>
  <meta
    name="description"
    content="Karyra Spark membantu komunitas lokal belajar blockchain, praktik aman, membangun Passport, dan menjelajahi Starknet secara bertahap."
  />
</svelte:head>

<SparkGuestLandingRedirect />

<div class="landing-page-v26 pass35-public-home">
  <SparkLandingHero />
  <SparkLandingProblem />
  <SparkLandingFlow />
  <SparkLandingAudience />
  <SparkLandingDifference />
  <SparkLandingFeaturePreview />
  <SparkLandingCTA />
  <SparkLandingFooter />
</div>
