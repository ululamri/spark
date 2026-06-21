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
    <p>Enter the recovery artifact token and admin email. Password recovery requires a fresh password and the current 2FA code.</p>

    {#if form?.success}
      <div class="admin-login__notice" role="status">
        <strong>{form.success}</strong>
        {#if form.artifact}
          <p>Type: {typeLabel(form.artifact.request_type)}</p>
          <p>Target role: {form.artifact.target_role ?? 'unknown'}</p>
          <p>Expires: {form.artifact.expires_at}</p>
          <p>Credential mutation: {form.artifact.credential_mutation ? 'enabled' : 'disabled until submitted'}</p>
        {:else if form.passwordRecovered}
          <p>Changed at: {form.passwordRecovered.password_changed_at}</p>
          <p>Sessions revoked: {form.passwordRecovered.sessions_revoked ? 'yes' : 'no'}</p>
        {/if}
      </div>
    {:else if form?.error}
      <p class="admin-form-error" role="alert">{form.error}</p>
    {/if}

    {#if !form?.passwordRecovered}
      <form method="POST" action="?/inspect" class="admin-login__form">
        <label for="recovery-email">Admin email</label>
        <input id="recovery-email" name="email" type="email" autocomplete="email" value={form?.email ?? ''} required />

        <label for="recovery-token">Recovery artifact token</label>
        <input id="recovery-token" name="token" type="text" autocomplete="one-time-code" value={form?.token ?? ''} spellcheck="false" required />

        <button type="submit">Verify artifact</button>
      </form>
    {/if}

    {#if form?.artifact?.request_type === 'password'}
      <form method="POST" action="?/recoverPassword" class="admin-login__form">
        <input type="hidden" name="email" value={form.email ?? form.artifact.email} />
        <input type="hidden" name="token" value={form.token ?? ''} />

        <label for="new-password">Fresh password</label>
        <input id="new-password" name="new_password" type="password" autocomplete="new-password" minlength="8" maxlength="128" required />

        <label for="totp-code">Current 2FA code</label>
        <input id="totp-code" name="totp_code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required />

        <button type="submit">Recover password</button>
      </form>
    {/if}

    <div class="admin-login__notice" role="status">
      <strong>Recovery boundary</strong>
      <p>Password recovery consumes the artifact once and revokes existing admin sessions. Email and 2FA recovery are not enabled here yet.</p>
    </div>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
