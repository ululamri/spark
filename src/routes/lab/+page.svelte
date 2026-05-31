<script lang="ts">
  import SparkLabConsole from '$ui/SparkLabConsole.svelte';
  import SparkLabPositionCard from '$ui/SparkLabPositionCard.svelte';
  import SparkLabPrinciples from '$ui/SparkLabPrinciples.svelte';
  import SparkLabProgressCard from '$ui/SparkLabProgressCard.svelte';
  import SparkPageHeader from '$ui/SparkPageHeader.svelte';
  import SparkPracticeProofRoadmap from '$ui/SparkPracticeProofRoadmap.svelte';
  import SparkReadinessPanel from '$ui/SparkReadinessPanel.svelte';
  import SparkSectionHeader from '$ui/SparkSectionHeader.svelte';
  import SparkWeeklyPracticeTargets from '$ui/SparkWeeklyPracticeTargets.svelte';
  import { sparkLabs } from '$content/spark-content';
</script>

<svelte:head>
  <title>Practice Lab — Karyra Spark</title>
</svelte:head>

<SparkPageHeader
  eyebrow="Practice Lab"
  title="Ruang latihan aman setelah Core."
  copy="Pengguna mencoba simulasi wallet, membaca transaksi, mengenali risiko, dan menyiapkan praktik testnet-first tanpa aset sungguhan."
  mode="practice"
/>

<section class="spark-section">
  <SparkLabPositionCard />
</section>

<section class="spark-section">
  <SparkLabProgressCard />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Formula Lab"
    title="Eksperimen harus punya konteks, guardrail, dan outcome."
    copy="Lab bukan playground kosong. Setiap latihan dirancang untuk membuktikan pemahaman secara bertahap."
  />
  <SparkLabPrinciples />
</section>

<section class="spark-section" id="lab-modules">
  <SparkSectionHeader
    eyebrow="Modul eksperimen terarah"
    title="Simulasi, readiness, dan teknis dalam satu jalur."
    copy="Lab dibuat bertahap agar pengguna belajar praktik tanpa langsung masuk ke risiko teknis."
  />

  <div class="spark-lab-grid surface-grid">
    {#each sparkLabs as lab}
      <SparkLabConsole {lab} />
    {/each}
  </div>
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Zona aman"
    title="Tidak memakai aset sungguhan."
    copy="Aktivitas lab dirancang sebagai simulasi dan latihan readiness. Belum masuk reward sungguhan dan belum masuk claim onchain."
  />
  <SparkReadinessPanel />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Proof roadmap"
    title="Bukti belajar berkembang bertahap."
    copy="Spark memandang bukti belajar sebagai proses: paham, praktik, ikut komunitas, lalu siap menjelajah."
  />
  <SparkPracticeProofRoadmap />
</section>

<section class="spark-section">
  <SparkSectionHeader
    eyebrow="Target praktik"
    title="Target praktik minggu ini."
    copy="Target ringan membuat pengguna tahu langkah berikutnya tanpa merasa tersesat."
  />
  <SparkWeeklyPracticeTargets />
</section>
