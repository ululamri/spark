<script lang="ts">
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { communityMetrics } from '$lib/community/community-model';
</script>

<div class="spark-community-impact">
  {#each communityMetrics as metric}
    <SparkCard>
      <span class="community-metric-icon"><SparkIcon name={metric.icon} size={18} /></span>
      <strong>{metric.value}</strong>
      <h3>{metric.label}</h3>
      <p>{metric.copy}</p>
    </SparkCard>
  {/each}
</div>
