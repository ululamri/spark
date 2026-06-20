<script lang="ts">
  let { form }: { form?: any } = $props();
</script>

<svelte:head>
  <title>Admin setup - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Delegated admin setup</span>
    <h1>Email verification & 2FA</h1>
    <p>Use this page only for admin/moderator accounts. Superadmin remains on the separate root boundary.</p>

    <div class="admin-login__notice" role="status">
      <strong>Setup order</strong>
      <p>1) Request email token. 2) Confirm email. 3) Create authenticator factor. 4) Confirm the 6-digit code. 5) Return to login.</p>
    </div>

    <form method="POST" action="?/requestEmail" class="admin-login__form">
      <span class="admin-eyebrow">Step 1</span>
      <h2>Request email verification</h2>
      <label for="request-email">Email</label>
      <input id="request-email" name="email" type="email" autocomplete="email" required />
      <label for="request-credential">Account credential</label>
      <input id="request-credential" name="credential" type="password" autocomplete="current-password" required />
      {#if form?.emailRequestError}<p class="admin-form-error" role="alert">{form.emailRequestError}</p>{/if}
      {#if form?.emailRequest}
        <div class="admin-login__notice" role="status">
          <strong>Token created</strong>
          <p>Expires at: {form.emailRequest.expires_at}</p>
          <p>Delivery: {form.emailRequest.delivery_mode}</p>
          {#if form.emailRequest.manual_token}
            <code>{form.emailRequest.manual_token}</code>
          {/if}
        </div>
      {/if}
      <button type="submit">Request verification</button>
    </form>

    <form method="POST" action="?/confirmEmail" class="admin-login__form">
      <span class="admin-eyebrow">Step 2</span>
      <h2>Confirm email</h2>
      <label for="confirm-email">Email</label>
      <input id="confirm-email" name="email" type="email" autocomplete="email" required />
      <label for="confirm-credential">Account credential</label>
      <input id="confirm-credential" name="credential" type="password" autocomplete="current-password" required />
      <label for="confirm-token">Verification token</label>
      <input id="confirm-token" name="token" type="text" autocomplete="one-time-code" required />
      {#if form?.emailConfirmError}<p class="admin-form-error" role="alert">{form.emailConfirmError}</p>{/if}
      {#if form?.emailConfirm}
        <div class="admin-login__notice" role="status">
          <strong>Email verified</strong>
          <p>{form.emailConfirm.email} verified at {form.emailConfirm.verified_at}</p>
        </div>
      {/if}
      <button type="submit">Confirm email</button>
    </form>

    <form method="POST" action="?/setupTotp" class="admin-login__form">
      <span class="admin-eyebrow">Step 3</span>
      <h2>Create authenticator factor</h2>
      <label for="totp-email">Email</label>
      <input id="totp-email" name="email" type="email" autocomplete="email" required />
      <label for="totp-credential">Account credential</label>
      <input id="totp-credential" name="credential" type="password" autocomplete="current-password" required />
      {#if form?.totpSetupError}<p class="admin-form-error" role="alert">{form.totpSetupError}</p>{/if}
      {#if form?.totpSetup}
        <div class="admin-login__notice" role="status">
          <strong>Authenticator setup</strong>
          <p>Factor ID:</p>
          <code>{form.totpSetup.factor_id}</code>
          <p>Manual secret:</p>
          <code>{form.totpSetup.manual_secret}</code>
          <p>otpauth URI:</p>
          <code>{form.totpSetup.otpauth_uri}</code>
        </div>
      {/if}
      <button type="submit">Create 2FA factor</button>
    </form>

    <form method="POST" action="?/confirmTotp" class="admin-login__form">
      <span class="admin-eyebrow">Step 4</span>
      <h2>Confirm authenticator code</h2>
      <label for="enable-email">Email</label>
      <input id="enable-email" name="email" type="email" autocomplete="email" required />
      <label for="enable-credential">Account credential</label>
      <input id="enable-credential" name="credential" type="password" autocomplete="current-password" required />
      <label for="enable-factor">Factor ID</label>
      <input id="enable-factor" name="factor_id" type="text" required />
      <label for="enable-code">2FA code</label>
      <input id="enable-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required />
      {#if form?.totpConfirmError}<p class="admin-form-error" role="alert">{form.totpConfirmError}</p>{/if}
      {#if form?.totpConfirm}
        <div class="admin-login__notice" role="status">
          <strong>2FA enabled</strong>
          <p>Factor {form.totpConfirm.factor_id} enabled at {form.totpConfirm.enabled_at}</p>
        </div>
      {/if}
      <button type="submit">Enable 2FA</button>
    </form>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
