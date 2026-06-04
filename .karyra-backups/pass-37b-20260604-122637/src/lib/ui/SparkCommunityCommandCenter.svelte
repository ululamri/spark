<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { sparkWorkshops } from '$content/spark-content';
  import { gatewayState } from '$state/gateway-state.svelte';

  const totalCapacity = sparkWorkshops.reduce((total, workshop) => total + workshop.capacity, 0);
</script>

<section class="community-command-center">
  <div>
    <span class="spark-eyebrow">Community</span>
    <h1>Belajar tidak berhenti di layar.</h1>
    <p>Workshop, cohort, fasilitator, dan aktivasi lokal menjadi jembatan antara course online dan pemahaman nyata.</p>

    <div class="community-command-actions">
      <SparkButton href="#workshops">Lihat Workshop</SparkButton>
      <SparkButton href="#cohorts" variant="secondary">Lihat Cohort</SparkButton>
    </div>
  </div>

  <aside class="community-command-panel">
    <div class="community-command-badges">
      <SparkTrustBadge label="Local activation" tone="beta" />
      <SparkTrustBadge label="Target awal" tone="target" />
    </div>

    <SparkCard class="community-summary-card">
      <span><SparkIcon name="users" size={22} /></span>
      <div>
        <strong>{gatewayState.registeredWorkshopIds.length} workshop tersimpan</strong>
        <p>Total kapasitas contoh: {totalCapacity} peserta.</p>
      </div>
    </SparkCard>

    <div class="community-mini-stats">
      <div>
        <strong>{sparkWorkshops.length}</strong>
        <span>Workshop</span>
      </div>
      <div>
        <strong>3</strong>
        <span>Cohort</span>
      </div>
    </div>
  </aside>
</section>
