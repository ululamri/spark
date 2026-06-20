<script lang="ts">
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Admin access - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Private administration</span>
    <h1>Karyra Spark Admin</h1>
    <p>Superadmin, admin, and moderator access are intentionally separated. Superadmin remains root-controlled; admin and moderator use delegated login with email verification and 2FA.</p>

    <form method="POST" action="?/delegated" class="admin-login__form">
      <span class="admin-eyebrow">Admin / Moderator</span>
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
      />
      <p class="admin-login__hint">Email must be verified and authenticator 2FA must be enabled before delegated login can create a session.</p>
      <a class="admin-login__back" href="/admin/setup">Set up email verification and 2FA</a>

      {#if form?.delegatedMessage}<p class="admin-form-error" role="alert">{form.delegatedMessage}</p>{/if}
      <button type="submit">Enter as admin/moderator</button>
    </form>

    <div class="admin-login__notice" role="status">
      <strong>Root boundary</strong>
      <p>Superadmin uses the private root credential and is not mixed with delegated admin or moderator sessions.</p>
    </div>

    {#if !data.adminConfigured}
      <div class="admin-login__notice" role="status">
        <strong>Superadmin access is disabled.</strong>
        <p>Configure the private superadmin environment values on the server. Delegated login can still be used after backend admin auth is active.</p>
      </div>
    {:else}
      <form method="POST" action="?/superadmin" class="admin-login__form">
        <span class="admin-eyebrow">Superadmin</span>
        <label for="admin-password">Root credential</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autocomplete="current-password"
          minlength="12"
          required
        />
        {#if form?.superadminMessage}<p class="admin-form-error" role="alert">{form.superadminMessage}</p>{/if}
        <button type="submit">Enter root console</button>
      </form>
    {/if}

    <a class="admin-login__back" href="/">Return to public Spark</a>
  </section>
</div>
