<script lang="ts">
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { landingFlowSteps } from '$lib/landing/landing-model';
</script>

<section class="landing-flow-v26" id="alur">
  <div class="landing-section-intro split">
    <div>
      <span class="spark-eyebrow">Alur Spark</span>
      <h2>Satu perjalanan dari pemahaman ke readiness.</h2>
    </div>
    <p>Home hanya memperkenalkan jalur. Progress personal tetap berada di Dashboard dan Profile.</p>
  </div>

  <div class="landing-flow-track">
    {#each landingFlowSteps as step, index}
      <a href={step.href}>
        <SparkCard tone={step.tone}>
          <div class="flow-step-top">
            <span class={`flow-number ${step.tone}`}>{index + 1}</span>
            <SparkTrustBadge label={step.label} tone={step.id === 'passport' ? 'safe' : step.id === 'hub' ? 'target' : 'beta'} />
          </div>
          <SparkIcon name={step.icon} size={22} />
          <h3>{step.title}</h3>
          <p>{step.copy}</p>
        </SparkCard>
      </a>
    {/each}
  </div>
</section>
