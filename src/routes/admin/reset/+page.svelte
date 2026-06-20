<script lang="ts">
  let { form }: { form?: Record<string, any> } = $props();
</script>

<svelte:head>
  <title>Admin reset request - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Access recovery</span>
    <h1>Request reset</h1>
    <p>Password, email, and 2FA recovery are request-only. This page never confirms whether an admin account exists.</p>

    <div class="admin-login__notice" role="status">
      <strong>Superadmin/admin approval required</strong>
      <p>Submit the request here, then continue through the approved internal channel. Sensitive recovery actions are reviewed before anything changes.</p>
    </div>

    {#if form?.success}
      <div class="admin-login__notice" role="status">
        <strong>Request received</strong>
        <p>{form.success}</p>
      </div>
    {:else if form?.error}
      <p class="admin-form-error" role="alert">{form.error}</p>
    {/if}

    <form method="POST" class="admin-login__form">
      <label for="reset-email">Admin email</label>
      <input id="reset-email" name="email" type="email" autocomplete="email" value={form?.email ?? ''} required />

      <label for="reset-type">What do you need to reset?</label>
      <select id="reset-type" name="request_type" required>
        <option value="password" selected={(form?.requestType ?? 'password') === 'password'}>Password</option>
        <option value="email" selected={form?.requestType === 'email'}>Email address</option>
        <option value="totp" selected={form?.requestType === 'totp'}>2FA / authenticator</option>
      </select>

      <label for="reset-note">Context for reviewer</label>
      <textarea id="reset-note" name="note" maxlength="500" placeholder="Short internal context. Do not include passwords, seed phrases, private keys, or 2FA backup codes.">{form?.note ?? ''}</textarea>

      <button type="submit">Submit reset request</button>
    </form>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
