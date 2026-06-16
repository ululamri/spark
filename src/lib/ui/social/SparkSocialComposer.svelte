<script lang="ts">
  import SparkIcon from '$ui/SparkIcon.svelte';
  import { hydrateSocialFeedFromBackend, uploadSocialMediaFile } from '$lib/social/social-backend-gateway';
  import { createSocialPost } from '$lib/social/local-social-gateway';
  import { socialPostKindHints, socialPostKindLabels } from '$lib/social/social-model';
  import { evaluateSocialDraft } from '$lib/social/social-policy';
  import { socialState } from '$lib/social/social-state.svelte';
  import type { SocialMediaAttachment, SocialPostKind } from '$lib/social/social-types';

  const kinds: SocialPostKind[] = ['progress', 'question', 'resource', 'workshop', 'lab'];
  const MAX_FILES = 4;

  let draft = $state('');
  let kind = $state<SocialPostKind>('progress');
  let composerOpen = $state(false);
  let selectedFiles = $state<File[]>([]);
  let uploadedMedia = $state<SocialMediaAttachment[]>([]);
  let uploadError = $state('');
  let composerNotice = $state('');
  let submitting = $state(false);
  let submitPhase = $state<'idle' | 'uploading' | 'posting'>('idle');
  let fileInput = $state<HTMLInputElement | undefined>(undefined);
  const policy = $derived(evaluateSocialDraft(draft));
  const submitLabel = $derived(submitPhase === 'uploading' ? 'Mengunggah media...' : submitPhase === 'posting' ? 'Mengirim...' : 'Kirim');

  function feedRefreshLimit() {
    return Math.min(50, Math.max(20, socialState.posts.length || 20));
  }

  function openComposer(nextKind: SocialPostKind = kind) {
    kind = nextKind;
    composerOpen = true;
    composerNotice = '';
  }

  function resetComposer(clearNotice = true) {
    draft = '';
    kind = 'progress';
    composerOpen = false;
    selectedFiles = [];
    uploadedMedia = [];
    uploadError = '';
    submitting = false;
    submitPhase = 'idle';
    if (clearNotice) composerNotice = '';
    if (fileInput) fileInput.value = '';
  }

  function chooseFiles() {
    composerOpen = true;
    uploadError = '';
    composerNotice = '';
    fileInput?.click();
  }

  function handleFiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    selectedFiles = files.slice(0, MAX_FILES);
    uploadedMedia = [];
    composerNotice = '';
    uploadError = files.length > MAX_FILES ? `Maksimal ${MAX_FILES} file per post. File tambahan diabaikan.` : '';
  }

  function removeFile(index: number) {
    selectedFiles = selectedFiles.filter((_, itemIndex) => itemIndex !== index);
    uploadedMedia = [];
    uploadError = '';
    composerNotice = '';
    if (selectedFiles.length === 0 && fileInput) fileInput.value = '';
  }

  function fileSizeLabel(sizeBytes: number) {
    if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    if (sizeBytes >= 1024) return `${Math.round(sizeBytes / 1024)} KB`;
    return `${sizeBytes} B`;
  }

  async function uploadSelectedFiles() {
    if (selectedFiles.length === 0) return [];
    const uploaded: SocialMediaAttachment[] = [];
    for (const file of selectedFiles) {
      uploaded.push(await uploadSocialMediaFile(file));
    }
    uploadedMedia = uploaded;
    return uploaded;
  }

  async function submit() {
    if (!policy.canKirim || submitting) return;
    const refreshLimit = feedRefreshLimit();
    submitting = true;
    uploadError = '';
    composerNotice = '';

    try {
      submitPhase = selectedFiles.length > 0 && uploadedMedia.length === 0 ? 'uploading' : 'posting';
      const uploaded = uploadedMedia.length > 0 ? uploadedMedia : await uploadSelectedFiles();
      submitPhase = 'posting';
      await createSocialPost({
        body: draft,
        kind,
        mediaAssetIds: uploaded.map((item) => item.id)
      });
      await hydrateSocialFeedFromBackend({ force: true, limit: refreshLimit });
      resetComposer(false);
      composerNotice = 'Postingan masuk ke feed. Sinkronisasi berjalan otomatis.';
    } catch (error) {
      uploadError = error instanceof Error ? error.message : 'Media belum bisa diunggah. Coba lagi setelah koneksi stabil.';
      submitting = false;
      submitPhase = 'idle';
    }
  }
</script>

<div class="social-composer" class:collapsed={!composerOpen && draft.trim().length === 0 && selectedFiles.length === 0}>
  <div class="composer-head">
    <span><SparkIcon name="messages" size={18} /></span>
    <div>
      <strong>Tanya atau bagikan perkembangan</strong>
      <small>{composerOpen ? socialPostKindHints[kind] : 'Tulis pertanyaan, koordinasi workshop, progress belajar, atau lampirkan media kecil.'}</small>
    </div>
  </div>

  <input
    bind:this={fileInput}
    class="file-input"
    type="file"
    accept="image/*,application/pdf,text/*"
    multiple
    onchange={handleFiles}
    aria-label="Pilih media untuk post"
  />

  {#if composerNotice && !composerOpen}
    <p class="composer-notice"><SparkIcon name="check" size={14} /> {composerNotice}</p>
  {/if}

  {#if !composerOpen && draft.trim().length === 0 && selectedFiles.length === 0}
    <div class="composer-open-actions" aria-label="Mulai diskusi">
      <button type="button" onclick={() => openComposer('question')}>
        <SparkIcon name="help" size={15} /> Tanya
      </button>
      <button type="button" onclick={() => openComposer('progress')}>
        <SparkIcon name="check" size={15} /> Perkembangan
      </button>
      <button type="button" onclick={() => openComposer('workshop')}>
        <SparkIcon name="calendar" size={15} /> Workshop
      </button>
      <button type="button" onclick={chooseFiles}>
        <SparkIcon name="camera" size={15} /> Media
      </button>
    </div>
  {:else}
    <div class="composer-kind-row" aria-label="Jenis diskusi">
      {#each kinds as item}
        <button class:active={kind === item} type="button" onclick={() => (kind = item)}>
          {socialPostKindLabels[item]}
        </button>
      {/each}
    </div>

    <textarea
      bind:value={draft}
      maxlength="640"
      placeholder="Tulis pertanyaan, ajakan hadir di workshop, catatan belajar, rujukan aman, atau perkembangan dari Lab."
      aria-label="Tulis diskusi komunitas"
      disabled={submitting}
    ></textarea>

    <div class="media-tools">
      <button type="button" onclick={chooseFiles} disabled={submitting}>
        <SparkIcon name="camera" size={14} /> {selectedFiles.length > 0 ? 'Ganti media' : 'Tambah media'}
      </button>
      <small>Gambar, PDF, atau teks · maksimal 8 MB/file · maksimal {MAX_FILES} file.</small>
    </div>

    {#if selectedFiles.length > 0}
      <div class="selected-media-list" aria-label="Media yang dipilih">
        {#each selectedFiles as file, index (`${file.name}-${file.size}-${index}`)}
          <div class="selected-media-item">
            <span><SparkIcon name={file.type.startsWith('image/') ? 'camera' : 'document'} size={14} /></span>
            <div>
              <strong>{file.name}</strong>
              <small>{file.type || 'unknown'} · {fileSizeLabel(file.size)}</small>
            </div>
            <button type="button" onclick={() => removeFile(index)} disabled={submitting} aria-label={`Hapus ${file.name}`}>Hapus</button>
          </div>
        {/each}
      </div>
    {/if}

    {#if uploadError}
      <p class="composer-error"><SparkIcon name="shield-alert" size={14} /> {uploadError}</p>
    {/if}

    {#if policy.warnings.length > 0}
      <p class="composer-warning"><SparkIcon name="shield" size={14} /> {policy.warnings[0]}</p>
    {/if}

    {#if policy.errors.length > 0 && draft.trim().length > 0}
      <p class="composer-error"><SparkIcon name="shield-alert" size={14} /> {policy.errors[0]}</p>
    {/if}

    <div class="composer-actions">
      <small>
        {policy.normalized.length}/640 · {selectedFiles.length > 0 ? `${selectedFiles.length} media siap diunggah` : 'siap dibagikan'}
      </small>
      <div>
        <button type="button" class="composer-cancel" disabled={submitting} onclick={resetComposer}>Batal</button>
        <button type="button" class="spark-btn primary" disabled={!policy.canKirim || submitting} onclick={submit}>
          <SparkIcon name={submitting ? 'clock' : 'send'} size={15} /> {submitLabel}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .social-composer {
    display: grid;
    gap: 12px;
    padding: 14px;
    border: 1px solid var(--spark-line);
    border-radius: 24px;
    background: var(--spark-card);
    box-shadow: 0 12px 30px rgba(5, 9, 78, 0.07);
  }

  .social-composer.collapsed { gap: 10px; }

  .file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .composer-head {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  .composer-head > span {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 15px;
    color: var(--spark-blue-strong);
    background: rgba(31, 117, 255, 0.1);
  }

  .composer-head strong,
  .composer-head small { display: block; }

  .composer-head strong {
    color: var(--spark-navy);
    font-size: 15px;
    line-height: 1.15;
  }

  :global([data-theme='dark']) .composer-head strong { color: #fff; }

  .composer-head small,
  .composer-actions small,
  .media-tools small {
    color: var(--spark-muted);
    font-size: 11.5px;
    line-height: 1.3;
  }

  .composer-open-actions,
  .composer-kind-row {
    display: flex;
    gap: 7px;
    overflow-x: auto;
    padding-bottom: 1px;
  }

  .composer-open-actions button,
  .composer-kind-row button,
  .composer-cancel,
  .media-tools button,
  .selected-media-item button {
    flex: 0 0 auto;
    min-height: 32px;
    padding: 0 10px;
    border: 1px solid var(--spark-line);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.52);
    color: var(--spark-muted);
    font-size: 11.5px;
    font-weight: 680;
  }

  .composer-open-actions button,
  .media-tools button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  :global([data-theme='dark']) .composer-open-actions button,
  :global([data-theme='dark']) .composer-kind-row button,
  :global([data-theme='dark']) .composer-cancel,
  :global([data-theme='dark']) .media-tools button,
  :global([data-theme='dark']) .selected-media-item button { background: rgba(255,255,255,.055); }

  .composer-kind-row button.active {
    border-color: rgba(31, 117, 255, 0.34);
    background: rgba(31, 117, 255, 0.1);
    color: var(--spark-blue-strong);
  }

  textarea {
    width: 100%;
    min-height: 112px;
    padding: 12px;
    border: 1px solid var(--spark-line);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.64);
    color: var(--spark-ink);
    outline: none;
    resize: vertical;
    font-size: 13px;
    line-height: 1.5;
  }

  :global([data-theme='dark']) textarea { background: rgba(255,255,255,.055); }

  textarea:focus {
    border-color: rgba(31, 117, 255, 0.44);
    box-shadow: 0 0 0 4px rgba(31, 117, 255, 0.1);
  }

  .media-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .media-tools button { color: var(--spark-blue-strong); }

  .selected-media-list { display: grid; gap: 8px; }

  .selected-media-item {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
    padding: 9px;
    border: 1px solid var(--spark-line);
    border-radius: 16px;
    background: rgba(248, 251, 255, 0.66);
  }

  :global([data-theme='dark']) .selected-media-item { background: rgba(255,255,255,.04); }

  .selected-media-item > span {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 12px;
    color: var(--spark-blue-strong);
    background: rgba(31, 117, 255, 0.1);
  }

  .selected-media-item strong,
  .selected-media-item small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected-media-item strong {
    color: var(--spark-navy);
    font-size: 12.5px;
  }

  :global([data-theme='dark']) .selected-media-item strong { color: #fff; }

  .selected-media-item small {
    color: var(--spark-muted);
    font-size: 11px;
  }

  .composer-notice,
  .composer-warning,
  .composer-error {
    display: flex;
    gap: 7px;
    align-items: center;
    margin: 0;
    font-size: 12px;
    line-height: 1.35;
  }

  .composer-notice { color: var(--spark-green); }
  .composer-warning { color: #a15a00; }
  .composer-error { color: #b42318; }
  :global([data-theme='dark']) .composer-warning { color: #ffd08a; }
  :global([data-theme='dark']) .composer-error { color: #ffb4a8; }

  .composer-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .composer-actions > div {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .composer-actions button { min-height: 38px; }

  button:disabled,
  textarea:disabled {
    cursor: not-allowed;
    opacity: .58;
  }

  @media (max-width: 520px) {
    .social-composer { padding: 12px; border-radius: 20px; }
    .composer-actions { align-items: stretch; }
    .composer-actions > div { justify-content: flex-end; }
    .selected-media-item { grid-template-columns: 34px minmax(0, 1fr); }
    .selected-media-item button { grid-column: 2; width: fit-content; }
  }
</style>
