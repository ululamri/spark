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
    <p>Enter the recovery artifact token and admin email. Password and 2FA recovery can execute here; email recovery only creates proof and does not change the account email yet.</p>

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
        {:else if form.totpRecovered}
          <p>Enabled at: {form.totpRecovered.enabled_at}</p>
          <p>Old authenticators revoked: {form.totpRecovered.old_factors_revoked ? 'yes' : 'no'}</p>
          <p>Sessions revoked: {form.totpRecovered.sessions_revoked ? 'yes' : 'no'}</p>
        {:else if form.emailOtp}
          <p>New email: {form.emailOtp.new_email}</p>
          <p>Delivery mode: {form.emailOtp.delivery_mode}</p>
          <p>Expires: {form.emailOtp.expires_at}</p>
          {#if form.emailOtp.manual_otp}
            <p>Manual OTP: <code>{form.emailOtp.manual_otp}</code></p>
          {/if}
        {:else if form.emailProof}
          <p>New email proof confirmed for: {form.emailProof.new_email}</p>
          <p>Proof expires: {form.emailProof.proof_expires_at}</p>
          <p>Credential mutation: {form.emailProof.credential_mutation ? 'yes' : 'no'}</p>
        {/if}
      </div>
    {:else if form?.error}
      <p class="admin-form-error" role="alert">{form.error}</p>
    {/if}

    {#if !form?.passwordRecovered && !form?.totpRecovered}
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

    {#if form?.artifact?.request_type === 'totp'}
      <form method="POST" action="?/setupTotpRecovery" class="admin-login__form">
        <input type="hidden" name="email" value={form.email ?? form.artifact.email} />
        <input type="hidden" name="token" value={form.token ?? ''} />

        <label for="recovery-password">Account password</label>
        <input id="recovery-password" name="password" type="password" autocomplete="current-password" required />

        <button type="submit">Start fresh 2FA setup</button>
      </form>
    {/if}

    {#if form?.totpSetup}
      <div class="admin-login__notice" role="status">
        <strong>Fresh 2FA secret</strong>
        <p>Account: {form.totpSetup.account_name}</p>
        <p>Manual secret: <code>{form.totpSetup.manual_secret}</code></p>
        <p>Old authenticators revoked: {form.totpSetup.old_factor_revoked ? 'yes' : 'no, not until confirmation'}</p>
      </div>

      <form method="POST" action="?/confirmTotpRecovery" class="admin-login__form">
        <input type="hidden" name="email" value={form.email ?? ''} />
        <input type="hidden" name="token" value={form.token ?? ''} />
        <input type="hidden" name="factor_id" value={form.totpSetup.factor_id} />

        <label for="confirm-password">Account password</label>
        <input id="confirm-password" name="password" type="password" autocomplete="current-password" required />

        <label for="new-totp-code">New 2FA code</label>
        <input id="new-totp-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required />

        <button type="submit">Confirm fresh 2FA</button>
      </form>
    {/if}

    {#if form?.artifact?.request_type === 'email'}
      <form method="POST" action="?/requestEmailProof" class="admin-login__form">
        <input type="hidden" name="email" value={form.email ?? form.artifact.email} />
        <input type="hidden" name="token" value={form.token ?? ''} />

        <label for="email-password">Account password</label>
        <input id="email-password" name="password" type="password" autocomplete="current-password" required />

        <label for="email-totp">Current 2FA code</label>
        <input id="email-totp" name="totp_code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required />

        <label for="new-email">New email</label>
        <input id="new-email" name="new_email" type="email" autocomplete="email" required />

        <button type="submit">Request new-email proof</button>
      </form>
    {/if}

    {#if form?.emailOtp}
      <form method="POST" action="?/confirmEmailProof" class="admin-login__form">
        <input type="hidden" name="email" value={form.email ?? form.emailOtp.old_email} />
        <input type="hidden" name="token" value={form.token ?? ''} />
        <input type="hidden" name="new_email" value={form.emailOtp.new_email} />

        <label for="email-otp">New-email OTP</label>
        <input id="email-otp" name="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required />

        <button type="submit">Confirm new-email proof</button>
      </form>
    {/if}

    <div class="admin-login__notice" role="status">
      <strong>Recovery boundary</strong>
      <p>Password and 2FA recovery consume the artifact once. Email recovery currently proves the new email only; final account email mutation is still locked for the next pass.</p>
    </div>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
