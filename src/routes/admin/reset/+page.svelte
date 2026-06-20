<svelte:head>
  <title>Admin reset request - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Access recovery</span>
    <h1>Request reset</h1>
    <p>Password, email, and 2FA recovery are request-only. The system does not confirm whether an admin account exists from this page.</p>

    <div class="admin-login__notice" role="status">
      <strong>Superadmin approval required</strong>
      <p>Send your reset request through the approved internal channel. Sensitive recovery actions are approved by superadmin only in this phase.</p>
    </div>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
