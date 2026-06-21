<script lang="ts">
  import { toast } from 'svelte-sonner';
  let { form } = $props();

  let visibleSecret = $state('');
  let toastKey = $state('');
  let hideSecretTimer: ReturnType<typeof setTimeout> | undefined;

  function revealSecret(name: string) {
    visibleSecret = visibleSecret === name ? '' : name;
    if (hideSecretTimer) clearTimeout(hideSecretTimer);
    if (visibleSecret) hideSecretTimer = setTimeout(() => (visibleSecret = ''), 5000);
  }

  $effect(() => {
    const message = form?.delegatedMessage;
    if (message && message !== toastKey) {
      toastKey = message;
      toast.error(message);
    }
  });
</script>

<svelte:head>
  <title>Karyra Spark Admin Panel</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Delegated administration</span>
    <h1>Karyra Spark Admin Panel</h1>
    <p>Masuk dengan email admin, sandi, dan kode 2FA yang sudah diaktifkan saat onboarding.</p>

    <form method="POST" action="?/delegated" class="admin-login__form">
      <label for="delegated-email">Email</label>
      <input id="delegated-email" name="email" type="email" autocomplete="email" required />

      <label for="delegated-password">Password</label>
      <input id="delegated-password" name="password" type={visibleSecret === 'delegated-password' ? 'text' : 'password'} autocomplete="current-password" minlength="8" required />
      <button type="button" class="admin-inline-action" onclick={() => revealSecret('delegated-password')}>{visibleSecret === 'delegated-password' ? 'Sembunyikan sandi' : 'Lihat sandi'}</button>

      <label for="delegated-totp">2FA code</label>
      <input
        id="delegated-totp"
        name="totp_code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="16"
        placeholder="Masukkan 6 digit kode 2FA"
        required
      />

      {#if form?.delegatedMessage}<p class="admin-form-error" role="alert">{form.delegatedMessage}</p>{/if}
      <button type="submit">Masuk ke Admin Panel</button>
    </form>

    <div class="admin-login__notice" role="status">
      <strong>Invite-only boundary</strong>
      <p>New admin/moderator access must start from an approved invitation. Free setup from this login screen is disabled.</p>
    </div>

    <a class="admin-login__back" href="/admin/onboarding">Gunakan invite code</a>
    <a class="admin-login__back" href="/admin/reset">Request access reset</a>
    <a class="admin-login__back" href="/">Return to public Spark</a>
  </section>
</div>
