<script lang="ts">
  import { onMount } from 'svelte';
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { resetLocalSparkData } from '$lib/sync/reset-local-data';
  import { restoreSyncQueue, syncQueueState, getSyncSummary, clearSyncQueue } from '$lib/sync/sync-event-queue.svelte';
  import { getServerSourceEntries, sparkStorageRegistry } from '$lib/sync/sync-storage-registry';
  import type { LocalResetMode } from '$lib/sync/sync-types';

  let confirmMode = $state<LocalResetMode | null>(null);

  onMount(() => {
    restoreSyncQueue();
  });

  const summary = $derived(getSyncSummary());
  const serverSourceCount = $derived(getServerSourceEntries().length);

  function runReset() {
    if (!confirmMode) return;
    resetLocalSparkData(confirmMode);
    confirmMode = null;
  }

  function clearQueueOnly() {
    clearSyncQueue();
  }
</script>

<section class="data-control-card" data-karyra-data-control="pass39">
  <div class="data-control-head">
    <span><SparkIcon name="shield" size={20} /></span>
    <div>
      <span class="spark-eyebrow">Data lokal</span>
      <h2>Siapkan Spark untuk sync backend.</h2>
      <p>
        Untuk sekarang, progress tersimpan di perangkat. Saat backend aktif, server menjadi sumber utama,
        sementara penyimpanan lokal berubah menjadi cache, draft, dan antrean offline.
      </p>
    </div>
  </div>

  <div class="data-status-grid" aria-label="Status data lokal">
    <div>
      <strong>{summary.queued}</strong>
      <span>event menunggu sync</span>
    </div>
    <div>
      <strong>{syncQueueState.events.length}</strong>
      <span>event lokal tercatat</span>
    </div>
    <div>
      <strong>{serverSourceCount}</strong>
      <span>area siap backend</span>
    </div>
  </div>

  <div class="data-policy-note">
    <strong>Prinsipnya sederhana:</strong>
    <p>Progress penting nanti disimpan di server. Browser hanya menyimpan cache, draft, dan event sementara.</p>
  </div>

  <details class="data-registry-details">
    <summary>Lihat registry penyimpanan</summary>
    <div class="data-registry-list">
      {#each sparkStorageRegistry as entry}
        <article>
          <strong>{entry.label}</strong>
          <small>{entry.key}</small>
          <p>{entry.futureBackendRole}</p>
        </article>
      {/each}
    </div>
  </details>

  <div class="data-actions">
    <SparkButton variant="secondary" onclick={() => (confirmMode = 'progress-only')}>Reset progres lokal</SparkButton>
    <SparkButton variant="ghost" onclick={clearQueueOnly}>Kosongkan antrean sync</SparkButton>
    <SparkButton variant="ghost" onclick={() => (confirmMode = 'all-local')}>Hapus semua data lokal</SparkButton>
  </div>
</section>

{#if confirmMode}
  <button class="data-reset-scrim" type="button" aria-label="Tutup dialog reset" onclick={() => (confirmMode = null)}></button>
  <div class="data-reset-dialog" role="dialog" aria-modal="true" aria-label="Konfirmasi reset data lokal">
    <span><SparkIcon name="shield-alert" size={22} /></span>
    <h2>{confirmMode === 'all-local' ? 'Hapus semua data lokal?' : 'Reset progres lokal?'}</h2>
    <p>
      {#if confirmMode === 'all-local'}
        Semua data Spark di perangkat ini akan dihapus, termasuk sesi lokal, tema, progress, diskusi, notifikasi,
        antrean sync, dan pilihan cookie. Tindakan ini tidak menghapus data server saat backend nanti aktif.
      {:else}
        Progress belajar, diskusi lokal, notifikasi, workshop tersimpan, resource tersimpan, dan antrean sync di
        perangkat ini akan dikosongkan. Sesi dan tema tetap dipertahankan.
      {/if}
    </p>
    <div>
      <SparkButton variant="ghost" onclick={() => (confirmMode = null)}>Batal</SparkButton>
      <SparkButton onclick={runReset}>{confirmMode === 'all-local' ? 'Hapus data lokal' : 'Reset progres'}</SparkButton>
    </div>
  </div>
{/if}

<style>
  .data-control-card {
    display: grid;
    gap: 14px;
    padding: clamp(16px, 3vw, 22px);
    border: 1px solid var(--spark-line);
    border-radius: 24px;
    background: var(--spark-card);
    box-shadow: 0 12px 30px rgba(5, 9, 78, 0.07);
  }

  .data-control-head {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .data-control-head > span,
  .data-reset-dialog > span {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 16px;
    color: var(--spark-blue-strong);
    background: rgba(31,117,255,.1);
  }

  .data-control-head h2 {
    margin: 4px 0 0;
    color: var(--spark-navy);
    font-size: clamp(20px, 4.5vw, 28px);
    line-height: 1.08;
    letter-spacing: -.035em;
  }

  :global([data-theme='dark']) .data-control-head h2,
  :global([data-theme='dark']) .data-policy-note strong,
  :global([data-theme='dark']) .data-registry-list strong,
  :global([data-theme='dark']) .data-reset-dialog h2 { color: #fff; }

  .data-control-head p,
  .data-policy-note p,
  .data-registry-list p,
  .data-reset-dialog p {
    margin: 6px 0 0;
    color: var(--spark-muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .data-status-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .data-status-grid div {
    display: grid;
    gap: 3px;
    min-height: 72px;
    align-content: center;
    padding: 10px;
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    background: rgba(255,255,255,.48);
  }

  :global([data-theme='dark']) .data-status-grid div,
  :global([data-theme='dark']) .data-policy-note,
  :global([data-theme='dark']) .data-registry-list article { background: rgba(255,255,255,.045); }

  .data-status-grid strong {
    color: var(--spark-blue-strong);
    font-size: 24px;
    line-height: 1;
    letter-spacing: -.05em;
  }

  .data-status-grid span,
  .data-registry-list small {
    color: var(--spark-muted);
    font-size: 11.5px;
    line-height: 1.25;
    font-weight: 620;
  }

  .data-policy-note {
    padding: 12px;
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    background: rgba(248,251,255,.72);
  }

  .data-policy-note strong,
  .data-registry-list strong {
    display: block;
    color: var(--spark-navy);
    font-size: 13.5px;
  }

  .data-registry-details summary {
    cursor: pointer;
    color: var(--spark-blue-strong);
    font-size: 12.5px;
    font-weight: 720;
  }

  .data-registry-list {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }

  .data-registry-list article {
    padding: 10px;
    border: 1px solid var(--spark-line);
    border-radius: 16px;
    background: rgba(255,255,255,.48);
  }

  .data-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .data-reset-scrim {
    position: fixed;
    inset: 0;
    z-index: 78;
    border: 0;
    border-radius: 0;
    background: rgba(2,6,23,.46);
  }

  .data-reset-dialog {
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 80;
    width: min(390px, calc(100vw - 28px));
    transform: translate(-50%, -50%);
    display: grid;
    gap: 12px;
    padding: 18px;
    border: 1px solid var(--spark-line);
    border-radius: 24px;
    background: var(--spark-card);
    box-shadow: 0 26px 82px rgba(5,9,78,.26);
  }

  .data-reset-dialog h2 {
    margin: 0;
    color: var(--spark-navy);
    font-size: 23px;
    letter-spacing: -.04em;
  }

  .data-reset-dialog > div {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  @media (max-width: 560px) {
    .data-status-grid { grid-template-columns: 1fr; }
    .data-actions { display: grid; }
    .data-reset-dialog > div { display: grid; }
  }
</style>
