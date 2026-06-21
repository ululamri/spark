<script lang="ts">
  let { data, form }: { data?: any; form?: any } = $props();

  const steps = [
    { id: 'inspect', label: 'Invite', description: 'Validate the invite code.' },
    { id: 'requestEmail', label: 'Email', description: 'Send OTP to the invited email.' },
    { id: 'confirmEmail', label: 'Verify', description: 'Confirm email ownership.' },
    { id: 'password', label: 'Password', description: 'Set account password.' },
    { id: 'setupTotp', label: '2FA setup', description: 'Create authenticator factor.' },
    { id: 'confirmTotp', label: '2FA verify', description: 'Confirm authenticator code.' },
    { id: 'accept', label: 'Activate', description: 'Accept invite and activate role.' },
    { id: 'done', label: 'Done', description: 'Delegated role is active.' }
  ];

  function activeStep(current: any) {
    if (current?.accepted) return 'done';
    if (current?.acceptError) return 'accept';
    if (current?.totpConfirmed) return 'accept';
    if (current?.totpConfirmError) return 'confirmTotp';
    if (current?.totpSetup || current?.factorId) return 'confirmTotp';
    if (current?.totpSetupError) return 'setupTotp';
    if (current?.passwordSet) return 'setupTotp';
    if (current?.passwordError) return 'password';
    if (current?.emailProof || current?.emailProofToken) return 'password';
    if (current?.emailConfirmError) return 'confirmEmail';
    if (current?.emailOtp) return 'confirmEmail';
    if (current?.emailRequestError) return 'requestEmail';
    if (current?.invite || current?.email) return 'requestEmail';
    return 'inspect';
  }

  function stepNumber(id: string) {
    return Math.max(1, steps.findIndex((step) => step.id === id) + 1);
  }

  function stepMeta(id: string) {
    return steps.find((step) => step.id === id) ?? steps[0];
  }

  const currentStep = $derived(activeStep(form));
  const currentMeta = $derived(stepMeta(currentStep));

</script>

<svelte:head>
  <title>Admin onboarding - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card admin-login__card--wide">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Invite-only onboarding</span>
    <h1>Admin onboarding</h1>
    <p>Complete one secure step at a time. The system verifies invite code, email, password, and 2FA gates in order.</p>


    <div class="admin-login__notice" role="status">
      <strong>Step {stepNumber(currentStep)} · {currentMeta.label}</strong>
      <p>{currentMeta.description}</p>
    </div>

    {#if form?.onboardingMessage}
      <div class="admin-login__notice" role="status">
        <strong>Progress saved</strong>
        <p>{form.onboardingMessage}</p>
      </div>
    {/if}

    {#if currentStep === 'inspect'}
      <form method="POST" action="?/inspect" class="admin-login__form">
        <label for="inspect-token">Invite code</label>
        <input id="inspect-token" name="token" type="text" autocomplete="off" value={form?.token ?? data?.inviteCode ?? ''} required />
        {#if form?.onboardingError}<p class="admin-form-error" role="alert">{form.onboardingError}</p>{/if}
        <button type="submit">Validate invite code</button>
      </form>
    {:else if currentStep === 'requestEmail'}
      <form method="POST" action="?/requestEmail" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        {#if form?.invite}
          <div class="admin-login__notice" role="status">
            <strong>{form.invite.role} invite</strong>
            <p>Email: {form.invite.email}</p>
            <p>Expires at: {form.invite.expires_at}</p>
          </div>
        {/if}
        <label for="request-email">Invited email</label>
        <input id="request-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.invite?.email ?? ''} required />
        {#if form?.emailRequestError}<p class="admin-form-error" role="alert">{form.emailRequestError}</p>{/if}
        <button type="submit">Send OTP</button>
      </form>
    {:else if currentStep === 'confirmEmail'}
      <form method="POST" action="?/confirmEmail" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.emailOtp?.email ?? ''} />
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
        <label for="confirm-otp">Email OTP</label>
        <input id="confirm-otp" name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="16" placeholder="Masukkan 6 digit kode OTP" required />
        {#if form?.emailConfirmError}<p class="admin-form-error" role="alert">{form.emailConfirmError}</p>{/if}
        <button type="submit">Verify email</button>
      </form>
    {:else if currentStep === 'password'}
      <form method="POST" action="?/setPassword" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.emailProof?.email ?? ''} />
        <label for="display-name">Display name</label>
        <input id="display-name" name="display_name" type="text" autocomplete="name" />
        <label for="password-value">Password</label>
        <input id="password-value" name="password" type="password" autocomplete="new-password" minlength="8" required />
        {#if form?.passwordError}<p class="admin-form-error" role="alert">{form.passwordError}</p>{/if}
        <button type="submit">Set password</button>
      </form>
    {:else if currentStep === 'setupTotp'}
      <form method="POST" action="?/setupTotp" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.passwordSet?.email ?? ''} />
        <label for="totp-password">Password</label>
        <input id="totp-password" name="password" type="password" autocomplete="current-password" required />
        {#if form?.totpSetupError}<p class="admin-form-error" role="alert">{form.totpSetupError}</p>{/if}
        <button type="submit">Create authenticator factor</button>
      </form>
    {:else if currentStep === 'confirmTotp'}
      <form method="POST" action="?/confirmTotp" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.totpSetup?.account_name ?? ''} />
        <input type="hidden" name="factor_id" value={form?.factorId ?? form?.totpSetup?.factor_id ?? ''} />
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
        <label for="enable-password">Password</label>
        <input id="enable-password" name="password" type="password" autocomplete="current-password" required />
        <label for="enable-code">2FA code</label>
        <input id="enable-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="16" placeholder="Masukkan 6 digit kode 2FA" required />
        {#if form?.totpConfirmError}<p class="admin-form-error" role="alert">{form.totpConfirmError}</p>{/if}
        <button type="submit">Enable 2FA</button>
      </form>
    {:else if currentStep === 'accept'}
      <form method="POST" action="?/accept" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? ''} />
        <div class="admin-login__notice" role="status">
          <strong>Final activation</strong>
          <p>Your authenticator factor is already verified. Confirm your password to activate the role.</p>
        </div>
        <label for="accept-password">Password</label>
        <input id="accept-password" name="password" type="password" autocomplete="current-password" required />
        {#if form?.acceptError}<p class="admin-form-error" role="alert">{form.acceptError}</p>{/if}
        <button type="submit">Activate admin role</button>
      </form>
    {:else}
      <div class="admin-login__notice" role="status">
        <strong>Invite accepted</strong>
        <p>{form?.accepted?.email} is now active as {form?.accepted?.role}. You can log in from the admin panel.</p>
      </div>
      <a class="admin-login__back" href="/admin/login">Go to admin login</a>
    {/if}

    {#if currentStep !== 'done'}
      <a class="admin-login__back" href="/admin/login">Return to admin login</a>
    {/if}
  </section>
</div>
