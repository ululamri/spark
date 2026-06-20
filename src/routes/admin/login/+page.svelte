<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>Karyra Spark Admin Panel</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Delegated administration</span>
    <h1>Karyra Spark Admin Panel</h1>
    <p>Admin and moderator access is invite-only. Use the email, password, and authenticator code attached to your delegated admin account.</p>

    <form method="POST" action="?/delegated" class="admin-login__form">
      <label for="delegated-email">Email</label>
      <input id="delegated-email" name="email" type="email" autocomplete="email" required />

      <label for="delegated-password">Password</label>
      <input id="delegated-password" name="password" type="password" autocomplete="current-password" minlength="8" required />

      <label for="delegated-totp">2FA code</label>
      <input
        id="delegated-totp"
        name="totp_code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        pattern="[0-9]{6}"
        placeholder="123456"
        required
      />

      {#if form?.delegatedMessage}<p class="admin-form-error" role="alert">{form.delegatedMessage}</p>{/if}
      <button type="submit">Login</button>
    </form>

    <div class="admin-login__notice" role="status">
      <strong>Invite-only boundary</strong>
      <p>New admin/moderator access must start from an approved invitation. Free setup from this login screen is disabled.</p>
    </div>

    <a class="admin-login__back" href="/admin/onboarding">Use invite token</a>
    <a class="admin-login__back" href="/admin/reset">Request access reset</a>
    <a class="admin-login__back" href="/">Return to public Spark</a>
  </section>
</div>
