<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkCard from './SparkCard.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { sparkWorkshops } from '$content/spark-content';
  import { gatewayState } from '$state/gateway-state.svelte';

  const totalCapacity = sparkWorkshops.reduce((total, workshop) => total + workshop.capacity, 0);
</script>

<section class="community-command-center pass37b-community-command">
  <div>
    <span class="spark-eyebrow">Community</span>
    <h1>Belajar tidak berhenti di layar.</h1>
    <p>Workshop, cohort, fasilitator, diskusi, dan aktivasi lokal menjadi jembatan antara course online dan pemahaman nyata.</p>

    <div class="community-command-actions pass37b-community-actions">
      <SparkButton href="/community?tab=workshop#community-tabs">Workshop</SparkButton>
      <SparkButton href="/community?tab=cohort#community-tabs" variant="secondary">Cohort</SparkButton>
      <SparkButton href="/community?tab=diskusi#community-tabs" variant="ghost">Diskusi</SparkButton>
    </div>
  </div>

  <aside class="community-command-panel">
    <div class="community-command-badges">
      <SparkTrustBadge label="Local activation" tone="beta" />
      <SparkTrustBadge label="Diskusi aman" tone="safe" />
    </div>

    <SparkCard class="community-summary-card">
      <span><SparkIcon name="users" size={22} /></span>
      <div>
        <strong>{gatewayState.registeredWorkshopIds.length} workshop tersimpan</strong>
        <p>Total kapasitas contoh: {totalCapacity} peserta.</p>
      </div>
    </SparkCard>

    <div class="community-mini-stats pass37b-community-mini-stats">
      <div>
        <strong>{sparkWorkshops.length}</strong>
        <span>Workshop</span>
      </div>
      <div>
        <strong>3</strong>
        <span>Cohort</span>
      </div>
      <div>
        <strong>Diskusi</strong>
        <span>Ruang tanya</span>
      </div>
    </div>
  </aside>
</section>

<style>
  .pass37b-community-actions {
    align-items: center;
  }

  .pass37b-community-mini-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    .pass37b-community-actions {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
    }

    .pass37b-community-actions :global(a:last-child) {
      grid-column: 1 / -1;
    }

    .pass37b-community-mini-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
