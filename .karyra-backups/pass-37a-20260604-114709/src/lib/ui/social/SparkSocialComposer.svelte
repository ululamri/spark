<script lang="ts">
  import SparkIcon from '$ui/SparkIcon.svelte';
  import { createSocialPost } from '$lib/social/local-social-gateway';
  import { socialPostKindHints, socialPostKindLabels } from '$lib/social/social-model';
  import { evaluateSocialDraft } from '$lib/social/social-policy';
  import type { SocialPostKind } from '$lib/social/social-types';

  const kinds: SocialPostKind[] = ['progress', 'question', 'resource', 'workshop', 'lab'];

  let draft = $state('');
  let kind = $state<SocialPostKind>('progress');
  const policy = $derived(evaluateSocialDraft(draft));

  function submit() {
    if (!policy.canSubmit) return;
    createSocialPost({ body: draft, kind });
    draft = '';
    kind = 'progress';
  }
</script>

<div class="social-composer">
  <div class="composer-head">
    <span><SparkIcon name="messages" size={18} /></span>
    <div>
      <strong>Bagikan progress kecil</strong>
      <small>{socialPostKindHints[kind]}</small>
    </div>
  </div>

  <div class="composer-kind-row" aria-label="Jenis post">
    {#each kinds as item}
      <button class:active={kind === item} type="button" onclick={() => (kind = item)}>
        {socialPostKindLabels[item]}
      </button>
    {/each}
  </div>

  <textarea
    bind:value={draft}
    maxlength="720"
    placeholder="Apa yang kamu pelajari hari ini? Tulis pertanyaan, catatan workshop, resource aman, atau progress dari Lab."
    aria-label="Tulis post komunitas"
  ></textarea>

  {#if policy.warnings.length > 0}
    <p class="composer-warning"><SparkIcon name="shield" size={14} /> {policy.warnings[0]}</p>
  {/if}

  {#if policy.errors.length > 0 && draft.trim().length > 0}
    <p class="composer-error"><SparkIcon name="shield-alert" size={14} /> {policy.errors[0]}</p>
  {/if}

  <div class="composer-actions">
    <small>{policy.normalized.length}/640 · tersimpan lokal dulu</small>
    <button type="button" class="spark-btn primary" disabled={!policy.canSubmit} onclick={submit}>
      <SparkIcon name="send" size={15} /> Kirim
    </button>
  </div>
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
  .composer-head small {
    display: block;
  }

  .composer-head strong {
    color: var(--spark-navy);
    font-size: 15px;
    line-height: 1.15;
  }

  [data-theme='dark'] .composer-head strong { color: #fff; }

  .composer-head small,
  .composer-actions small {
    color: var(--spark-muted);
    font-size: 11.5px;
    line-height: 1.3;
  }

  .composer-kind-row {
    display: flex;
    gap: 7px;
    overflow-x: auto;
    padding-bottom: 1px;
  }

  .composer-kind-row button {
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

  [data-theme='dark'] .composer-kind-row button { background: rgba(255,255,255,.055); }

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

  [data-theme='dark'] textarea { background: rgba(255,255,255,.055); }

  textarea:focus {
    border-color: rgba(31, 117, 255, 0.44);
    box-shadow: 0 0 0 4px rgba(31, 117, 255, 0.1);
  }

  .composer-warning,
  .composer-error {
    display: flex;
    gap: 7px;
    align-items: center;
    margin: 0;
    font-size: 12px;
    line-height: 1.35;
  }

  .composer-warning { color: #a15a00; }
  .composer-error { color: #b42318; }
  [data-theme='dark'] .composer-warning { color: #ffd08a; }
  [data-theme='dark'] .composer-error { color: #ffb4a8; }

  .composer-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .composer-actions button {
    min-height: 38px;
  }

  @media (max-width: 520px) {
    .social-composer { padding: 12px; border-radius: 20px; }
    .composer-actions { align-items: stretch; }
    .composer-actions button { flex: 0 0 auto; }
  }
</style>
