<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import { resetLocalSparkData } from '$lib/sync/reset-local-data';
  import type { LocalResetMode } from '$lib/sync/sync-types';

  let confirmMode = $state<LocalResetMode | null>(null);

  const resetOptions: {
    mode: LocalResetMode;
    eyebrow: string;
    title: string;
    copy: string;
    icon: string;
    action: string;
    tone: 'normal' | 'danger';
  }[] = [
    {
      mode: 'progress-only',
      eyebrow: 'Mulai ulang',
      title: 'Mulai ulang perjalanan belajar',
      copy:
        'Gunakan pilihan ini jika ingin mengulang progress belajar dari awal. Akun, tampilan, dan pengaturan utama tetap dipertahankan.',
      icon: 'book-open',
      action: 'Mulai ulang',
      tone: 'normal'
    },
    {
      mode: 'all-local',
      eyebrow: 'Bersihkan perangkat',
      title: 'Hapus data Spark dari perangkat ini',
      copy:
        'Gunakan jika perangkat akan dipakai orang lain, atau ingin keluar dan membersihkan semua data Spark dari browser ini.',
      icon: 'shield-alert',
      action: 'Hapus data',
      tone: 'danger'
    }
  ];

  const selectedOption = $derived(resetOptions.find((option) => option.mode === confirmMode));

  function runReset() {
    if (!confirmMode) return;
    resetLocalSparkData(confirmMode);
    confirmMode = null;
  }
</script>

<section class="data-control-card" data-karyra-data-control="pass40-public">
  <div class="data-control-head">
    <span><SparkIcon name="shield" size={20} /></span>
    <div>
      <span class="spark-eyebrow">Data & privasi</span>
      <h2>Kendalikan data Spark di perangkat ini.</h2>
      <p>
        Spark memberi pilihan untuk mulai ulang progress belajar atau membersihkan data dari perangkat yang sedang dipakai.
      </p>
    </div>
  </div>

  <div class="data-option-list">
    {#each resetOptions as option}
      <article class:danger={option.tone === 'danger'}>
        <span><SparkIcon name={option.icon} size={18} /></span>
        <div>
          <small>{option.eyebrow}</small>
          <strong>{option.title}</strong>
          <p>{option.copy}</p>
        </div>
        <SparkButton
          variant={option.tone === 'danger' ? 'ghost' : 'secondary'}
          onclick={() => (confirmMode = option.mode)}
        >
          {option.action}
        </SparkButton>
      </article>
    {/each}
  </div>
</section>

{#if confirmMode && selectedOption}
  <button class="data-reset-scrim" type="button" aria-label="Tutup dialog" onclick={() => (confirmMode = null)}></button>
  <div class="data-reset-dialog" role="dialog" aria-modal="true" aria-label="Konfirmasi data Spark">
    <span><SparkIcon name={selectedOption.icon} size={22} /></span>
    <h2>{selectedOption.title}?</h2>
    <p>
      {#if confirmMode === 'all-local'}
        Semua data Spark di perangkat ini akan dihapus, termasuk sesi masuk, pilihan tampilan, progress belajar,
        diskusi, pesan, dan data yang tersimpan di browser ini. Tindakan ini tidak bisa dibatalkan di perangkat ini.
      {:else}
        Progress belajar, diskusi, pesan, workshop tersimpan, dan resource tersimpan akan dikosongkan.
        Akun dan pilihan tampilan tetap dipertahankan.
      {/if}
    </p>
    <div>
      <SparkButton variant="ghost" onclick={() => (confirmMode = null)}>Batal</SparkButton>
      <SparkButton onclick={runReset}>{selectedOption.action}</SparkButton>
    </div>
  </div>
{/if}

<style>
  .data-control-card { display: grid; gap: 14px; padding: clamp(16px, 3vw, 22px); border: 1px solid var(--spark-line); border-radius: 24px; background: var(--spark-card); box-shadow: 0 12px 30px rgba(5, 9, 78, 0.07); }
  .data-control-head { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 12px; align-items: start; }
  .data-control-head > span, .data-option-list article > span, .data-reset-dialog > span { display: grid; place-items: center; color: var(--spark-blue-strong); background: rgba(31, 117, 255, 0.1); }
  .data-control-head > span, .data-reset-dialog > span { width: 42px; height: 42px; border-radius: 16px; }
  .data-control-head h2 { margin: 4px 0 0; color: var(--spark-navy); font-size: clamp(20px, 4.5vw, 28px); line-height: 1.08; letter-spacing: -0.035em; }
  :global([data-theme='dark']) .data-control-head h2, :global([data-theme='dark']) .data-option-list strong, :global([data-theme='dark']) .data-reset-dialog h2 { color: #fff; }
  .data-control-head p, .data-option-list p, .data-reset-dialog p { margin: 6px 0 0; color: var(--spark-muted); font-size: 13px; line-height: 1.55; }
  .data-option-list { display: grid; gap: 10px; }
  .data-option-list article { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px; border: 1px solid var(--spark-line); border-radius: 20px; background: rgba(255, 255, 255, 0.48); }
  :global([data-theme='dark']) .data-option-list article { background: rgba(255, 255, 255, 0.045); }
  .data-option-list article.danger { border-color: rgba(180, 35, 24, 0.22); }
  .data-option-list article > span { width: 38px; height: 38px; border-radius: 15px; }
  .data-option-list article.danger > span { color: #b42318; background: rgba(180, 35, 24, 0.09); }
  .data-option-list small, .data-option-list strong { display: block; }
  .data-option-list small { color: var(--spark-muted); font-size: 11px; font-weight: 760; letter-spacing: 0.04em; text-transform: uppercase; }
  .data-option-list strong { margin-top: 2px; color: var(--spark-navy); font-size: 14px; line-height: 1.18; }
  .data-reset-scrim { position: fixed; inset: 0; z-index: 78; border: 0; border-radius: 0; background: rgba(2, 6, 23, 0.46); }
  .data-reset-dialog { position: fixed; left: 50%; top: 50%; z-index: 80; width: min(390px, calc(100vw - 28px)); transform: translate(-50%, -50%); display: grid; gap: 12px; padding: 18px; border: 1px solid var(--spark-line); border-radius: 24px; background: var(--spark-card); box-shadow: 0 26px 82px rgba(5, 9, 78, 0.26); }
  .data-reset-dialog h2 { margin: 0; color: var(--spark-navy); font-size: 23px; letter-spacing: -0.04em; }
  .data-reset-dialog > div { display: flex; justify-content: flex-end; gap: 8px; }
  @media (max-width: 560px) { .data-option-list article { grid-template-columns: 38px minmax(0, 1fr); } .data-option-list article :global([data-spark-button]) { grid-column: 2; width: fit-content; } .data-reset-dialog > div { display: grid; } }
</style>
