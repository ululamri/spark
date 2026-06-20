<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>Admin onboarding - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card admin-login__card--wide">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Invite-only onboarding</span>
    <h1>Admin onboarding</h1>
    <p>Use this page only with an approved admin/moderator invite token. The role is activated only after token validation, email OTP, password setup, authenticator 2FA, and final invite acceptance.</p>

    {#if form?.onboardingMessage}
      <div class="admin-login__notice admin-login__notice--success" role="status">
        <strong>Progress saved</strong>
        <p>{form.onboardingMessage}</p>
      </div>
    {/if}

    <form method="POST" action="?/inspect" class="admin-login__form">
      <span class="admin-eyebrow">Step 1</span>
      <h2>Inspect invite</h2>
      <label for="inspect-token">Invite token</label>
      <input id="inspect-token" name="token" type="text" autocomplete="off" value={form?.token ?? ''} required />
      {#if form?.onboardingError}<p class="admin-form-error" role="alert">{form.onboardingError}</p>{/if}
      {#if form?.invite}
        <div class="admin-login__notice" role="status">
          <strong>{form.invite.role} invite</strong>
          <p>Email: {form.invite.email}</p>
          <p>Expires at: {form.invite.expires_at}</p>
        </div>
      {/if}
      <button type="submit">Validate invite</button>
    </form>

    <form method="POST" action="?/requestEmail" class="admin-login__form">
      <span class="admin-eyebrow">Step 2</span>
      <h2>Request email OTP</h2>
      <label for="request-token">Invite token</label>
      <input id="request-token" name="token" type="text" autocomplete="off" value={form?.token ?? ''} required />
      <label for="request-email">Invited email</label>
      <input id="request-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.invite?.email ?? ''} required />
      {#if form?.emailRequestError}<p class="admin-form-error" role="alert">{form.emailRequestError}</p>{/if}
      {#if form?.emailOtp}
        <div class="admin-login__notice" role="status">
          <strong>Email OTP requested</strong>
          <p>Delivery: {form.emailOtp.delivery_mode}</p>
          <p>Expires at: {form.emailOtp.expires_at}</p>
          {#if form.emailOtp.manual_otp}
            <p>Manual OTP:</p>
            <code>{form.emailOtp.manual_otp}</code>
          {/if}
        </div>
      {/if}
      <button type="submit">Request OTP</button>
    </form>

    <form method="POST" action="?/confirmEmail" class="admin-login__form">
      <span class="admin-eyebrow">Step 3</span>
      <h2>Confirm email</h2>
      <label for="confirm-token">Invite token</label>
      <input id="confirm-token" name="token" type="text" autocomplete="off" value={form?.token ?? ''} required />
      <label for="confirm-email">Invited email</label>
      <input id="confirm-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.invite?.email ?? form?.emailOtp?.email ?? ''} required />
      <label for="confirm-otp">Email OTP</label>
      <input id="confirm-otp" name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required />
      {#if form?.emailConfirmError}<p class="admin-form-error" role="alert">{form.emailConfirmError}</p>{/if}
      {#if form?.emailProof}
        <div class="admin-login__notice admin-login__notice--success" role="status">
          <strong>Email verified</strong>
          <p>Proof expires at: {form.emailProof.proof_expires_at}</p>
        </div>
      {/if}
      <button type="submit">Confirm email</button>
    </form>

    <form method="POST" action="?/setPassword" class="admin-login__form">
      <span class="admin-eyebrow">Step 4</span>
      <h2>Set password</h2>
      <input type="hidden" name="token" value={form?.token ?? ''} />
      <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
      <label for="password-email">Invited email</label>
      <input id="password-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.emailProof?.email ?? ''} required />
      <label for="display-name">Display name</label>
      <input id="display-name" name="display_name" type="text" autocomplete="name" />
      <label for="password-value">Password</label>
      <input id="password-value" name="password" type="password" autocomplete="new-password" minlength="8" required />
      {#if form?.passwordError}<p class="admin-form-error" role="alert">{form.passwordError}</p>{/if}
      {#if form?.passwordSet}
        <div class="admin-login__notice admin-login__notice--success" role="status">
          <strong>Password set</strong>
          <p>{form.passwordSet.email} updated at {form.passwordSet.password_set_at}</p>
        </div>
      {/if}
      <button type="submit">Set password</button>
    </form>

    <form method="POST" action="?/setupTotp" class="admin-login__form">
      <span class="admin-eyebrow">Step 5</span>
      <h2>Create authenticator factor</h2>
      <input type="hidden" name="token" value={form?.token ?? ''} />
      <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
      <label for="totp-email">Invited email</label>
      <input id="totp-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.passwordSet?.email ?? ''} required />
      <label for="totp-password">Password</label>
      <input id="totp-password" name="password" type="password" autocomplete="current-password" required />
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
      <span class="admin-eyebrow">Step 6</span>
      <h2>Confirm authenticator code</h2>
      <input type="hidden" name="token" value={form?.token ?? ''} />
      <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
      <label for="enable-email">Invited email</label>
      <input id="enable-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.totpSetup?.account_name ?? ''} required />
      <label for="enable-password">Password</label>
      <input id="enable-password" name="password" type="password" autocomplete="current-password" required />
      <label for="enable-factor">Factor ID</label>
      <input id="enable-factor" name="factor_id" type="text" value={form?.factorId ?? form?.totpSetup?.factor_id ?? ''} required />
      <label for="enable-code">2FA code</label>
      <input id="enable-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required />
      {#if form?.totpConfirmError}<p class="admin-form-error" role="alert">{form.totpConfirmError}</p>{/if}
      {#if form?.totpConfirmed}
        <div class="admin-login__notice admin-login__notice--success" role="status">
          <strong>2FA enabled</strong>
          <p>Factor {form.totpConfirmed.factor_id} enabled at {form.totpConfirmed.enabled_at}</p>
        </div>
      {/if}
      <button type="submit">Enable 2FA</button>
    </form>

    <form method="POST" action="?/accept" class="admin-login__form">
      <span class="admin-eyebrow">Step 7</span>
      <h2>Accept invite</h2>
      <input type="hidden" name="token" value={form?.token ?? ''} />
      <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
      <label for="accept-email">Invited email</label>
      <input id="accept-email" name="email" type="email" autocomplete="email" value={form?.email ?? ''} required />
      <label for="accept-password">Password</label>
      <input id="accept-password" name="password" type="password" autocomplete="current-password" required />
      <label for="accept-totp">2FA code</label>
      <input id="accept-totp" name="totp_code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required />
      {#if form?.acceptError}<p class="admin-form-error" role="alert">{form.acceptError}</p>{/if}
      {#if form?.accepted}
        <div class="admin-login__notice admin-login__notice--success" role="status">
          <strong>Invite accepted</strong>
          <p>{form.accepted.email} is now active as {form.accepted.role}.</p>
        </div>
      {/if}
      <button type="submit">Activate admin role</button>
    </form>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
