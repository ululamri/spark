<script lang="ts">
  let { form }: { form?: Record<string, any> } = $props();

  function typeLabel(type: string) {
    if (type === 'totp') return '2FA / authenticator';
    if (type === 'email') return 'Email address';
    if (type === 'password') return 'Password';
    return type;
  }
</script>

<svelte:head>
  <title>Admin recovery - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Recovery artifact</span>
    <h1>Admin recovery</h1>
    <p>Enter the recovery artifact token and invited admin email. This page verifies the artifact only; credential changes are not executed here yet.</p>

    {#if form?.success}
      <div class="admin-login__notice" role="status">
        <strong>{form.success}</strong>
        {#if form.artifact}
          <p>Type: {typeLabel(form.artifact.request_type)}</p>
          <p>Target role: {form.artifact.target_role ?? 'unknown'}</p>
          <p>Expires: {form.artifact.expires_at}</p>
          <p>Credential mutation: {form.artifact.credential_mutation ? 'enabled' : 'disabled'}</p>
        {/if}
      </div>
    {:else if form?.error}
      <p class="admin-form-error" role="alert">{form.error}</p>
    {/if}

    <form method="POST" action="?/inspect" class="admin-login__form">
      <label for="recovery-email">Admin email</label>
      <input id="recovery-email" name="email" type="email" autocomplete="email" value={form?.email ?? ''} required />

      <label for="recovery-token">Recovery artifact token</label>
      <input id="recovery-token" name="token" type="text" autocomplete="one-time-code" value={form?.token ?? ''} spellcheck="false" required />

      <button type="submit">Verify artifact</button>
    </form>

    <div class="admin-login__notice" role="status">
      <strong>No credential change in this step</strong>
      <p>The artifact must be valid before a future recovery execution flow can set a fresh password, email, or 2FA.</p>
    </div>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
