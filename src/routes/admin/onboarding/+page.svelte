<script lang="ts">
  import { browser } from '$app/environment';
  import { toast } from 'svelte-sonner';

  let { data, form }: { data?: any; form?: any } = $props();

  let qrDataUrl = $state('');
  let copyNotice = $state('');
  let visibleSecret = $state('');
  let toastKey = $state('');
  let hideSecretTimer: ReturnType<typeof setTimeout> | undefined;

  const steps = [
    { id: 'inspect', label: 'Invite', description: 'Masukkan invite code untuk memulai aktivasi akses.' },
    { id: 'requestEmail', label: 'Email', description: 'Pastikan email yang dipakai sama dengan email undangan.' },
    { id: 'confirmEmail', label: 'Verifikasi', description: 'Masukkan OTP yang dikirim ke email undangan.' },
    { id: 'password', label: 'Sandi', description: 'Buat sandi admin yang kuat dan hanya kamu yang tahu.' },
    { id: 'setupTotp', label: '2FA', description: 'Hubungkan authenticator untuk melindungi akses admin.' },
    { id: 'confirmTotp', label: 'Konfirmasi 2FA', description: 'Masukkan kode 6 digit dari authenticator.' },
    { id: 'accept', label: 'Aktivasi', description: 'Aktifkan role admin/moderator dari undangan ini.' },
    { id: 'done', label: 'Selesai', description: 'Akses delegated admin sudah aktif.' }
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

  async function buildQr(uri: string) {
    if (!browser || !uri) return;
    const QRCodeModule: any = await import('qrcode');
    const toDataURL = QRCodeModule.toDataURL ?? QRCodeModule.default?.toDataURL;
    if (!toDataURL) return;
    qrDataUrl = await toDataURL(uri, {
      width: 248,
      margin: 2,
      errorCorrectionLevel: 'M'
    });
  }

  $effect(() => {
    const uri = form?.totpSetup?.otpauth_uri ?? '';
    qrDataUrl = '';
    if (uri) void buildQr(uri);
  });

  async function copyText(text: string | undefined, label: string) {
    if (!browser || !text) return;
    await navigator.clipboard.writeText(text);
    copyNotice = `${label} berhasil disalin.`;
    toast.success(copyNotice);
  }

  function revealSecret(name: string) {
    visibleSecret = visibleSecret === name ? '' : name;
    if (hideSecretTimer) clearTimeout(hideSecretTimer);
    if (visibleSecret) hideSecretTimer = setTimeout(() => (visibleSecret = ''), 5000);
  }

  $effect(() => {
    const success = form?.onboardingMessage;
    const error = form?.onboardingError || form?.emailRequestError || form?.emailConfirmError || form?.passwordError || form?.totpSetupError || form?.totpConfirmError || form?.acceptError;
    const key = `${success ?? ''}|${error ?? ''}`;
    if (key && key !== toastKey) {
      toastKey = key;
      if (error) toast.error(error);
      else if (success) toast.success(success);
    }
  });
</script>

<svelte:head>
  <title>Admin onboarding - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card admin-login__card--wide">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Invite-only onboarding</span>
    <h1>Aktivasi Akses Admin</h1>
    <p>Ikuti proses aktivasi bertahap untuk memastikan invite code, email, sandi, dan 2FA semuanya valid sebelum akses admin diaktifkan.</p>

    <div class="admin-login__notice" role="status">
      <strong>Langkah {stepNumber(currentStep)} · {currentMeta.label}</strong>
      <p>{currentMeta.description}</p>
    </div>

    {#if copyNotice}
      <div class="admin-login__notice" role="status">
        <strong>Disalin</strong>
        <p>{copyNotice}</p>
      </div>
    {/if}

    {#if form?.onboardingMessage}
      <div class="admin-login__notice" role="status">
        <strong>Progres tersimpan</strong>
        <p>{form.onboardingMessage}</p>
      </div>
    {/if}

    {#if currentStep === 'inspect'}
      <form method="POST" action="?/inspect" class="admin-login__form">
        <label for="inspect-token">Invite code</label>
        <input id="inspect-token" name="token" type="text" autocomplete="off" value={form?.token ?? data?.inviteCode ?? ''} required />
        <p class="admin-help">Gunakan kode undangan dari email Karyra Spark. Jika kamu membuka link undangan, kode biasanya sudah terisi otomatis.</p>
        {#if form?.onboardingError}<p class="admin-form-error" role="alert">{form.onboardingError}</p>{/if}
        <button type="submit">Validasi invite code</button>
      </form>
    {:else if currentStep === 'requestEmail'}
      <form method="POST" action="?/requestEmail" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? data?.inviteCode ?? ''} />
        {#if form?.invite}
          <div class="admin-login__notice" role="status">
            <strong>Undangan {form.invite.role}</strong>
            <p>Email undangan: {form.invite.email}</p>
            <p>Kedaluwarsa: {form.invite.expires_at}</p>
          </div>
        {/if}
        <label for="request-email">Email undangan</label>
        <input id="request-email" name="email" type="email" autocomplete="email" value={form?.email ?? form?.invite?.email ?? ''} required />
        <p class="admin-help">Email harus sama dengan alamat yang menerima undangan.</p>
        {#if form?.emailRequestError}<p class="admin-form-error" role="alert">{form.emailRequestError}</p>{/if}
        <button type="submit">Kirim kode OTP</button>
      </form>
    {:else if currentStep === 'confirmEmail'}
      <form method="POST" action="?/confirmEmail" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.emailOtp?.email ?? ''} />
        {#if form?.emailOtp}
          <div class="admin-login__notice" role="status">
            <strong>Kode OTP sudah dikirim</strong>
            <p>Delivery: {form.emailOtp.delivery_mode}</p>
            <p>Kedaluwarsa: {form.emailOtp.expires_at}</p>
            {#if form.emailOtp.manual_otp}
              <p>Manual OTP:</p>
              <code>{form.emailOtp.manual_otp}</code>
            {/if}
          </div>
        {/if}
        <label for="confirm-otp">Kode OTP email</label>
        <input id="confirm-otp" name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="16" placeholder="Masukkan 6 digit kode OTP" required />
        <p class="admin-help">Kamu boleh menyalin kode langsung dari email. Spasi atau tanda hubung akan dibersihkan otomatis.</p>
        {#if form?.emailConfirmError}<p class="admin-form-error" role="alert">{form.emailConfirmError}</p>{/if}
        <button type="submit">Verifikasi email</button>
      </form>
    {:else if currentStep === 'password'}
      <form method="POST" action="?/setPassword" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.emailProof?.email ?? ''} />
        <label for="display-name">Nama tampilan</label>
        <input id="display-name" name="display_name" type="text" autocomplete="name" placeholder="Nama yang terlihat di Admin Panel" />
        <label for="password-value">Sandi admin</label>
        <input id="password-value" name="password" type={visibleSecret === 'password-value' ? 'text' : 'password'} autocomplete="new-password" minlength="8" required />
        <button type="button" class="admin-inline-action" onclick={() => revealSecret('password-value')}>{visibleSecret === 'password-value' ? 'Sembunyikan sandi' : 'Lihat sandi'}</button>
        <p class="admin-help">Gunakan sandi unik, minimal 8 karakter, dan jangan gunakan ulang dari layanan lain.</p>
        {#if form?.passwordError}<p class="admin-form-error" role="alert">{form.passwordError}</p>{/if}
        <button type="submit">Simpan sandi</button>
      </form>
    {:else if currentStep === 'setupTotp'}
      <form method="POST" action="?/setupTotp" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.passwordSet?.email ?? ''} />
        <label for="totp-password">Konfirmasi sandi</label>
        <input id="totp-password" name="password" type="password" autocomplete="current-password" required />
        <p class="admin-help">Setelah ini, sistem akan membuat QR dan kode manual untuk aplikasi authenticator.</p>
        {#if form?.totpSetupError}<p class="admin-form-error" role="alert">{form.totpSetupError}</p>{/if}
        <button type="submit">Buat QR 2FA</button>
      </form>
    {:else if currentStep === 'confirmTotp'}
      <form method="POST" action="?/confirmTotp" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? form?.totpSetup?.account_name ?? ''} />
        <input type="hidden" name="factor_id" value={form?.factorId ?? form?.totpSetup?.factor_id ?? ''} />
        {#if form?.totpSetup}
          <div class="admin-login__notice" role="status">
            <strong>Hubungkan authenticator</strong>
            <p>Pindai QR dengan Google Authenticator, 1Password, Bitwarden, Aegis, atau aplikasi TOTP lain.</p>
            {#if qrDataUrl}
              <img src={qrDataUrl} alt="QR code untuk setup 2FA admin" width="248" height="248" />
            {:else}
              <p>Membuat QR code...</p>
            {/if}
            <p>Kode manual:</p>
            <code>{form.totpSetup.manual_secret}</code>
            <button type="button" onclick={() => copyText(form?.totpSetup?.manual_secret, 'Kode manual 2FA')}>Salin kode manual</button>
            <details>
              <summary>Tampilkan URI otpauth</summary>
              <code>{form.totpSetup.otpauth_uri}</code>
              <button type="button" onclick={() => copyText(form?.totpSetup?.otpauth_uri, 'URI otpauth')}>Salin URI</button>
            </details>
          </div>
        {/if}
        <label for="enable-password">Konfirmasi sandi</label>
        <input id="enable-password" name="password" type={visibleSecret === 'enable-password' ? 'text' : 'password'} autocomplete="current-password" required />
        <button type="button" class="admin-inline-action" onclick={() => revealSecret('enable-password')}>{visibleSecret === 'enable-password' ? 'Sembunyikan sandi' : 'Lihat sandi'}</button>
        <label for="enable-code">Kode 2FA</label>
        <input id="enable-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="16" placeholder="Masukkan 6 digit kode 2FA" required />
        <p class="admin-help">Masukkan kode 6 digit dari aplikasi authenticator untuk mengaktifkan 2FA.</p>
        {#if form?.totpConfirmError}<p class="admin-form-error" role="alert">{form.totpConfirmError}</p>{/if}
        <button type="submit">Aktifkan 2FA</button>
      </form>
    {:else if currentStep === 'accept'}
      <form method="POST" action="?/accept" class="admin-login__form">
        <input type="hidden" name="token" value={form?.token ?? ''} />
        <input type="hidden" name="email_proof_token" value={form?.emailProofToken ?? form?.emailProof?.email_proof_token ?? ''} />
        <input type="hidden" name="email" value={form?.email ?? ''} />
        <div class="admin-login__notice" role="status">
          <strong>Aktivasi final</strong>
          <p>2FA sudah aktif. Konfirmasi sandi sekali lagi untuk mengaktifkan role dari undangan ini.</p>
        </div>
        <label for="accept-password">Sandi admin</label>
        <input id="accept-password" name="password" type={visibleSecret === 'accept-password' ? 'text' : 'password'} autocomplete="current-password" required />
        <button type="button" class="admin-inline-action" onclick={() => revealSecret('accept-password')}>{visibleSecret === 'accept-password' ? 'Sembunyikan sandi' : 'Lihat sandi'}</button>
        {#if form?.acceptError}<p class="admin-form-error" role="alert">{form.acceptError}</p>{/if}
        <button type="submit">Aktifkan akses admin</button>
      </form>
    {:else}
      <div class="admin-login__notice" role="status">
        <strong>Undangan diterima</strong>
        <p>{form?.accepted?.email} sekarang aktif sebagai {form?.accepted?.role}. Silakan masuk dari Admin Panel.</p>
      </div>
      <a class="admin-login__back" href="/admin/login">Masuk ke Admin Panel</a>
    {/if}

    {#if currentStep !== 'done'}
      <a class="admin-login__back" href="/admin/login">Kembali ke login admin</a>
    {/if}
  </section>
</div>
